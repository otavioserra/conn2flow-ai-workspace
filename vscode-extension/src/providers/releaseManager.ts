import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ActionFormPanel } from './actionFormPanel';
import { CommandRunner } from './commandRunner';
import { LocalizationManager } from './localizationManager';
import { ShellHelper } from './shellHelper';
import { WorkspaceLocator } from './workspaceLocator';
import {
  bumpSemver,
  classifyViewerPermission,
  githubRepositoryUrl,
  quoteShellArg,
  ReleaseIncrement,
  ReleasePermission
} from '../releasePolicy';

const execFileAsync = promisify(execFile);

type ReleaseProduct = 'manager' | 'installer';

interface ReleaseDefinition {
  product: ReleaseProduct;
  label: string;
  command: string;
  versionFile: string;
  versionPattern: RegExp;
  tagPrefix: string;
  workflow: string;
}

export class ReleaseManager {
  private static permission: ReleasePermission = 'unknown';
  private static viewerPermission = '';
  private static repositoryUrl: string | undefined;

  public static get permissionState(): ReleasePermission {
    return this.permission;
  }

  public static get permissionLabel(): string {
    return this.viewerPermission || LocalizationManager.t('common.unknown');
  }

  public static async verifyPermission(onChanged?: () => void): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    if (!root) {
      this.permission = 'unknown';
      vscode.window.showWarningMessage(LocalizationManager.t('release.permissionUnknown', { reason: 'Core repository not found' }));
      onChanged?.();
      return;
    }

    vscode.window.setStatusBarMessage(LocalizationManager.t('release.permissionChecking'), 2500);
    try {
      await execFileAsync('gh', ['auth', 'status'], { cwd: root, windowsHide: true });
      const { stdout } = await execFileAsync(
        'gh',
        ['repo', 'view', '--json', 'viewerPermission,nameWithOwner,url'],
        { cwd: root, windowsHide: true }
      );
      const info = JSON.parse(stdout);
      this.viewerPermission = String(info.viewerPermission || '').toUpperCase();
      this.permission = classifyViewerPermission(this.viewerPermission);
      this.repositoryUrl = typeof info.url === 'string' ? info.url : undefined;
      if (this.permission === 'allowed') {
        vscode.window.showInformationMessage(LocalizationManager.t('release.permissionAllowed', { permission: this.viewerPermission }));
      } else {
        vscode.window.showWarningMessage(LocalizationManager.t('release.permissionDenied', { permission: this.viewerPermission || '?' }));
      }
    } catch (error: any) {
      this.permission = 'unknown';
      this.viewerPermission = '';
      vscode.window.showWarningMessage(LocalizationManager.t('release.permissionUnknown', { reason: error?.message || String(error) }));
    } finally {
      onChanged?.();
    }
  }

  public static async create(product: ReleaseProduct, runner: CommandRunner, onChanged?: () => void): Promise<void> {
    if (this.permission !== 'allowed') {
      await this.verifyPermission(onChanged);
      if (this.permissionState !== 'allowed') return;
    }

    const root = WorkspaceLocator.getCoreRoot();
    if (!root) return;
    const definition = this.definition(product);
    const preflight = await this.preflight(root, definition);
    if (!preflight.ok || !preflight.version) {
      vscode.window.showErrorMessage(LocalizationManager.t('release.preflightFailed', { reason: preflight.reason || '?' }));
      return;
    }

    const initialNext = bumpSemver(preflight.version, 'patch');
    const shell = ShellHelper.getActiveShellType();
    const commandTemplate = `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} {type} <tag-message> <commit-message> <mode>`;
    const values = await ActionFormPanel.show({
      id: `release-${product}`,
      title: LocalizationManager.t('release.formTitle', { product: definition.label }),
      description: `${LocalizationManager.t('release.formDescription')} ${LocalizationManager.t('release.workflow', { workflow: definition.workflow })}`,
      impactSummary: LocalizationManager.t('release.impact'),
      submitLabel: LocalizationManager.t('common.submit'),
      cancelLabel: LocalizationManager.t('common.cancel'),
      validationErrorLabel: LocalizationManager.t('common.invalidForm'),
      language: LocalizationManager.currentLocale,
      fields: [
        { id: 'currentVersion', label: LocalizationManager.t('release.currentVersion'), type: 'readonly', value: preflight.version },
        { id: 'releaseType', label: LocalizationManager.t('release.type'), type: 'select', required: true, value: 'patch', options: ['patch', 'minor', 'major'].map(value => ({ label: value, value })) },
        { id: 'nextVersion', label: LocalizationManager.t('release.nextVersion'), type: 'readonly', value: initialNext },
        { id: 'tag', label: LocalizationManager.t('release.tag'), type: 'readonly', value: definition.tagPrefix + initialNext },
        { id: 'tagMessage', label: LocalizationManager.t('release.tagMessage'), type: 'text', required: true },
        { id: 'commitMessage', label: LocalizationManager.t('release.commitMessage'), type: 'textarea', required: true },
        { id: 'mode', label: LocalizationManager.t('release.mode'), type: 'select', required: true, value: 'automatic', options: [
          { label: LocalizationManager.t('release.modeAutomatic'), value: 'automatic' },
          { label: LocalizationManager.t('release.modeManual'), value: 'manual' }
        ] },
        { id: 'command', label: LocalizationManager.t('release.command'), type: 'readonly', value: commandTemplate.replace('{type}', 'patch') }
      ],
      semverPreview: {
        currentVersion: preflight.version,
        typeFieldId: 'releaseType',
        nextFieldId: 'nextVersion',
        tagFieldId: 'tag',
        commandFieldId: 'command',
        tagPrefix: definition.tagPrefix,
        commandTemplate
      }
    });
    if (!values) return;

    const increment = values.releaseType as ReleaseIncrement;
    const next = bumpSemver(preflight.version, increment);
    const tag = definition.tagPrefix + next;
    const collision = await this.git(root, ['tag', '--list', tag]);
    let remoteCollision = '';
    try {
      remoteCollision = await this.git(root, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
    } catch (error: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('release.preflightFailed', { reason: error?.message || String(error) }));
      return;
    }
    if (collision.trim() || remoteCollision.trim()) {
      vscode.window.showErrorMessage(LocalizationManager.t('release.tagExists', { tag }));
      return;
    }

    const finalConfirmation = await vscode.window.showWarningMessage(
      LocalizationManager.t('release.confirm', {
        product: definition.label,
        current: preflight.version,
        next,
        tag,
        mode: String(values.mode)
      }),
      { modal: true },
      LocalizationManager.t('command.confirmButton')
    );
    if (!finalConfirmation) return;

    const args = [increment, String(values.tagMessage), String(values.commitMessage), String(values.mode)]
      .map(value => quoteShellArg(value, shell)).join(' ');
    const result = await runner.run({
      command: `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} ${args}`,
      cwd: root,
      label: LocalizationManager.t(product === 'manager' ? 'release.manager' : 'release.installer'),
      impact: 'remote',
      target: tag,
      exclusive: true,
      confirmationSatisfied: true,
      notifySuccess: false
    });
    if (result.succeeded && values.mode === 'automatic') {
      const runId = await this.findWorkflowRun(root, definition.workflow, tag);
      if (!runId) {
        vscode.window.showErrorMessage(LocalizationManager.t('release.preflightFailed', { reason: 'GitHub Actions run was not found after tag push' }));
        return;
      }
      const workflow = await runner.run({
        command: `gh run watch ${runId} --exit-status`,
        cwd: root,
        label: `${definition.label} · GitHub Actions`,
        impact: 'read-only',
        target: tag,
        exclusive: true
      });
      if (!workflow.succeeded) return;
    }
    if (result.succeeded) {
      const open = await vscode.window.showInformationMessage(LocalizationManager.t('release.openActions'), LocalizationManager.t('release.openActions'));
      if (open) await this.openActions();
    }
  }

  public static async openActions(): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    let base = this.repositoryUrl;
    if (!base && root) {
      try { base = githubRepositoryUrl(await this.git(root, ['remote', 'get-url', 'origin'])); } catch { /* no-op */ }
    }
    if (base) await vscode.env.openExternal(vscode.Uri.parse(`${base}/actions`));
  }

  private static definition(product: ReleaseProduct): ReleaseDefinition {
    return product === 'manager' ? {
      product,
      label: LocalizationManager.t('release.productManager'),
      command: 'manager:release',
      versionFile: path.join('gestor', 'config.php'),
      versionPattern: /\$_GESTOR\[['"]versao['"]\]\s*=\s*['"](\d+\.\d+\.\d+)['"]/,
      tagPrefix: 'gestor-v',
      workflow: '.github/workflows/release-gestor.yml'
    } : {
      product,
      label: LocalizationManager.t('release.productInstaller'),
      command: 'installer:release',
      versionFile: path.join('gestor-instalador', 'index.php'),
      versionPattern: /\$_GESTOR_INSTALADOR\[['"]versao['"]\]\s*=\s*['"](\d+\.\d+\.\d+)['"]/,
      tagPrefix: 'instalador-v',
      workflow: '.github/workflows/release-instalador.yml'
    };
  }

  private static async preflight(root: string, definition: ReleaseDefinition): Promise<{ ok: boolean; version?: string; reason?: string }> {
    if (!vscode.workspace.isTrusted) return { ok: false, reason: LocalizationManager.t('command.trustRequired') };
    const required = [definition.workflow, definition.versionFile, 'c2f'];
    for (const file of required) if (!fs.existsSync(path.join(root, file))) return { ok: false, reason: `${file} missing` };
    if ((await this.git(root, ['status', '--porcelain'])).trim()) return { ok: false, reason: LocalizationManager.t('release.cleanRequired') };
    const branch = (await this.git(root, ['symbolic-ref', '--short', '-q', 'HEAD'])).trim();
    if (!branch) return { ok: false, reason: 'detached HEAD' };
    const remote = (await this.git(root, ['remote', 'get-url', 'origin'])).trim();
    if (!githubRepositoryUrl(remote)) return { ok: false, reason: 'origin is not a GitHub repository' };
    try {
      for (const status of ['in_progress', 'queued']) {
        const { stdout } = await execFileAsync(
          'gh',
          ['run', 'list', '--workflow', path.basename(definition.workflow), '--status', status, '--json', 'databaseId', '--limit', '1'],
          { cwd: root, windowsHide: true }
        );
        if (JSON.parse(stdout).length > 0) return { ok: false, reason: `release workflow is ${status}` };
      }
    } catch (error: any) {
      return { ok: false, reason: error?.message || String(error) };
    }
    const content = fs.readFileSync(path.join(root, definition.versionFile), 'utf8');
    const version = content.match(definition.versionPattern)?.[1];
    return version ? { ok: true, version } : { ok: false, reason: `version not found in ${definition.versionFile}` };
  }

  private static async git(root: string, args: string[]): Promise<string> {
    const { stdout } = await execFileAsync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, '-C', root, ...args], { windowsHide: true });
    return stdout;
  }

  private static async findWorkflowRun(root: string, workflow: string, tag: string): Promise<number | undefined> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const { stdout } = await execFileAsync(
        'gh',
        ['run', 'list', '--workflow', path.basename(workflow), '--json', 'databaseId,headBranch', '--limit', '20'],
        { cwd: root, windowsHide: true }
      );
      const run = JSON.parse(stdout).find((item: any) => item.headBranch === tag);
      if (typeof run?.databaseId === 'number') return run.databaseId;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    return undefined;
  }
}
