import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createHash } from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ActionFormPanel } from './actionFormPanel';
import { CommandRunner } from './commandRunner';
import { LocalizationManager } from './localizationManager';
import { ShellHelper } from './shellHelper';
import { WorkspaceLocator } from './workspaceLocator';
import { TranslationKey } from '../localizationCatalog';
import {
  bumpSemver,
  classifyViewerPermission,
  createReleaseDraftSuggestion,
  evaluateReleaseGate,
  githubRepositoryUrl,
  inspectReleaseDocumentContents,
  inspectReleaseDocumentPaths,
  quoteShellArg,
  selectWorkflowRun,
  ReleaseBlocker,
  ReleaseDraftSuggestion,
  ReleaseGateResult,
  ReleaseIncrement,
  ReleasePermission,
  ReleaseProduct
} from '../releasePolicy';

const execFileAsync = promisify(execFile);

interface ReleaseDefinition {
  product: ReleaseProduct;
  label: string;
  command: string;
  versionFile: string;
  versionPattern: RegExp;
  tagPrefix: string;
  workflow: string;
}

interface StoredReleaseDraft extends ReleaseDraftSuggestion {
  documentationFingerprint: string;
  preparedAt: string;
}

interface DocumentationDiagnostics {
  files: string[];
  missing: string[];
  issues: string[];
  fingerprint: string;
  ready: boolean;
}

interface ReleaseDiagnostics {
  version?: string;
  branch?: string;
  dirtyFiles: string[];
  githubRemote: boolean;
  tag: string;
  tagCollision: boolean;
  requiredFilesReady: boolean;
  workflowIdle: boolean;
  documentation: DocumentationDiagnostics;
  gate: ReleaseGateResult;
}

export class ReleaseManager {
  private static permission: ReleasePermission = 'unknown';
  private static viewerPermission = '';
  private static repositoryUrl: string | undefined;
  private static context: vscode.ExtensionContext | undefined;
  private static readonly executionGates = new Map<ReleaseProduct, ReleaseGateResult>();

  public static initialize(context: vscode.ExtensionContext): void {
    this.context = context;
    this.executionGates.clear();
  }

  public static get permissionState(): ReleasePermission {
    return this.permission;
  }

  public static get permissionLabel(): string {
    return this.viewerPermission || LocalizationManager.t('common.unknown');
  }

  public static canExecute(product: ReleaseProduct): boolean {
    return this.executionGates.get(product)?.canExecute === true;
  }

  public static executionBlockerLabel(product: ReleaseProduct): string {
    const blockers = this.executionGates.get(product)?.blockers;
    return blockers?.length
      ? blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
      : LocalizationManager.t('release.notPrepared');
  }

  public static async verifyPermission(onChanged?: () => void, silent = false): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    if (!root) {
      this.permission = 'unknown';
      if (!silent) {
        vscode.window.showWarningMessage(
          LocalizationManager.t('release.permissionUnknown', { reason: LocalizationManager.t('release.coreMissing') })
        );
      }
      onChanged?.();
      return;
    }

    if (!silent) vscode.window.setStatusBarMessage(LocalizationManager.t('release.permissionChecking'), 2500);
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
      if (!silent && this.permission === 'allowed') {
        vscode.window.showInformationMessage(
          LocalizationManager.t('release.permissionAllowed', { permission: this.viewerPermission })
        );
      } else if (!silent) {
        vscode.window.showWarningMessage(
          LocalizationManager.t('release.permissionDenied', { permission: this.viewerPermission || '?' })
        );
      }
    } catch (error: any) {
      this.permission = 'unknown';
      this.viewerPermission = '';
      if (!silent) {
        vscode.window.showWarningMessage(
          LocalizationManager.t('release.permissionUnknown', { reason: error?.message || String(error) })
        );
      }
    } finally {
      onChanged?.();
    }
  }

  public static async prepare(product: ReleaseProduct, onChanged?: () => void): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    if (!root || !this.context) {
      vscode.window.showWarningMessage(LocalizationManager.t('release.coreMissing'));
      return;
    }

    const definition = this.definition(product);
    vscode.window.setStatusBarMessage(
      `$(sync~spin) ${LocalizationManager.t('release.preparingFeedback', { product: definition.label })}`,
      3000
    );
    await this.verifyPermission(undefined, true);
    const currentVersion = this.readVersion(root, definition);
    if (!currentVersion) {
      vscode.window.showErrorMessage(
        LocalizationManager.t('release.preflightFailed', { reason: definition.versionFile })
      );
      return;
    }

    const existing = this.loadDraft(product);
    const generated = createReleaseDraftSuggestion(
      product,
      currentVersion,
      existing?.increment || 'patch',
      await this.recentCommits(root),
      this.activeBatch()
    );
    const initial: StoredReleaseDraft = {
      ...generated,
      ...(existing?.currentVersion === currentVersion ? existing : {}),
      documentationFingerprint: '',
      preparedAt: new Date().toISOString()
    };

    const initialDiagnostics = await this.diagnose(root, definition, initial.increment, false);
    initial.documentationFingerprint = initialDiagnostics.documentation.fingerprint;
    await this.saveDraft(initial);
    this.executionGates.set(product, initialDiagnostics.gate);
    onChanged?.();

    const shell = ShellHelper.getActiveShellType();
    const commandTemplate = `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} {type} <tag-message> <commit-message> <mode>`;
    const changedFiles = initialDiagnostics.dirtyFiles.length > 0
      ? initialDiagnostics.dirtyFiles.join(', ')
      : LocalizationManager.t('release.cleanTree');
    const documentationLabel = initialDiagnostics.documentation.ready
      ? LocalizationManager.t('release.docsReady', { count: initialDiagnostics.documentation.files.length })
      : LocalizationManager.t('release.docsBlocked', {
        issues: [...initialDiagnostics.documentation.missing, ...initialDiagnostics.documentation.issues].join(', ')
      });

    const submission = await ActionFormPanel.show({
      id: `release-prepare-${product}`,
      title: LocalizationManager.t('release.prepareTitle', { product: definition.label }),
      description: LocalizationManager.t('release.prepareDescription'),
      impactSummary: LocalizationManager.t('release.prepareImpact'),
      submitLabel: LocalizationManager.t('release.saveDraft'),
      saveAndExecuteLabel: LocalizationManager.t('release.saveAndExecute'),
      cancelLabel: LocalizationManager.t('common.cancel'),
      validationErrorLabel: LocalizationManager.t('common.invalidForm'),
      language: LocalizationManager.currentLocale,
      fields: [
        { id: 'currentVersion', label: LocalizationManager.t('release.currentVersion'), type: 'readonly', value: currentVersion },
        { id: 'branch', label: LocalizationManager.t('release.branch'), type: 'readonly', value: initialDiagnostics.branch || '-' },
        { id: 'permission', label: LocalizationManager.t('release.permission'), type: 'readonly', value: this.permissionLabel },
        { id: 'modifiedFiles', label: LocalizationManager.t('release.modifiedFiles'), type: 'readonly', value: changedFiles },
        { id: 'documentation', label: LocalizationManager.t('release.documentation'), type: 'readonly', value: documentationLabel },
        {
          id: 'releaseType',
          label: LocalizationManager.t('release.type'),
          type: 'select',
          required: true,
          value: initial.increment,
          options: ['patch', 'minor', 'major'].map(value => ({ label: value, value }))
        },
        { id: 'nextVersion', label: LocalizationManager.t('release.nextVersion'), type: 'readonly', value: initial.nextVersion },
        { id: 'tag', label: LocalizationManager.t('release.tag'), type: 'readonly', value: initial.tag },
        { id: 'tagMessage', label: LocalizationManager.t('release.tagMessage'), type: 'text', required: true, value: initial.tagMessage },
        { id: 'commitMessage', label: LocalizationManager.t('release.commitMessage'), type: 'textarea', required: true, value: initial.commitMessage },
        { id: 'releaseNotes', label: LocalizationManager.t('release.releaseNotes'), type: 'textarea', required: true, value: initial.releaseNotes },
        {
          id: 'mode',
          label: LocalizationManager.t('release.mode'),
          type: 'select',
          required: true,
          value: initial.mode,
          options: [
            { label: LocalizationManager.t('release.modeAutomatic'), value: 'automatic' },
            { label: LocalizationManager.t('release.modeManual'), value: 'manual' }
          ]
        },
        { id: 'command', label: LocalizationManager.t('release.command'), type: 'readonly', value: commandTemplate.replace('{type}', initial.increment) }
      ],
      semverPreview: {
        currentVersion,
        typeFieldId: 'releaseType',
        nextFieldId: 'nextVersion',
        tagFieldId: 'tag',
        commandFieldId: 'command',
        messageFieldIds: ['tagMessage', 'commitMessage', 'releaseNotes'],
        tagPrefix: definition.tagPrefix,
        commandTemplate
      }
    });
    if (!submission) return;

    const values = submission.values || submission;
    const increment = values.releaseType as ReleaseIncrement;
    const recalculated = createReleaseDraftSuggestion(product, currentVersion, increment);
    const draft: StoredReleaseDraft = {
      ...recalculated,
      tagMessage: String(values.tagMessage),
      commitMessage: String(values.commitMessage),
      releaseNotes: String(values.releaseNotes),
      mode: values.mode === 'manual' ? 'manual' : 'automatic',
      documentationFingerprint: initialDiagnostics.documentation.fingerprint,
      preparedAt: new Date().toISOString()
    };
    await this.saveDraft(draft);

    const diagnostics = await this.diagnose(
      root,
      definition,
      increment,
      true,
      draft.documentationFingerprint
    );
    this.executionGates.set(product, diagnostics.gate);
    onChanged?.();

    if (submission.action === 'save_and_execute') {
      if (!diagnostics.gate.canExecute) {
        await this.showBlockedActions(
          product,
          LocalizationManager.t('release.executionBlocked', {
            blockers: diagnostics.gate.blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
          })
        );
        return;
      }
      await this.execute(product, new CommandRunner(), onChanged);
      return;
    }

    const resultMessage = diagnostics.gate.canExecute
      ? LocalizationManager.t('release.executeReady')
      : LocalizationManager.t('release.executionBlocked', { blockers: diagnostics.gate.blockers.join(', ') });
    vscode.window.showInformationMessage(
      `${LocalizationManager.t('release.draftSaved')} ${resultMessage}`
    );

    if (diagnostics.dirtyFiles.length > 0) {
      await this.offerSourceControl();
    }
  }

  public static async execute(
    product: ReleaseProduct,
    runner: CommandRunner,
    onChanged?: () => void
  ): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    const draft = this.loadDraft(product);
    if (!root) {
      await this.showBlockedActions(product, LocalizationManager.t('release.coreMissing'));
      return;
    }
    if (!draft) {
      await this.showBlockedActions(
        product,
        LocalizationManager.t('release.executionBlocked', {
          blockers: this.blockerLabel('draft-missing')
        })
      );
      return;
    }

    await this.verifyPermission(undefined, true);
    const definition = this.definition(product);
    const diagnostics = await this.diagnose(
      root,
      definition,
      draft.increment,
      true,
      draft.documentationFingerprint
    );
    this.executionGates.set(product, diagnostics.gate);
    onChanged?.();

    if (!diagnostics.gate.canExecute || !diagnostics.version) {
      await this.showBlockedActions(
        product,
        LocalizationManager.t('release.executionBlocked', {
          blockers: diagnostics.gate.blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
        })
      );
      return;
    }

    const next = bumpSemver(diagnostics.version, draft.increment);
    const tag = definition.tagPrefix + next;
    const finalConfirmation = await vscode.window.showWarningMessage(
      LocalizationManager.t('release.confirm', {
        product: definition.label,
        current: diagnostics.version,
        next,
        tag,
        mode: draft.mode
      }),
      { modal: true },
      LocalizationManager.t('command.confirmButton')
    );
    if (!finalConfirmation) return;

    const shell = ShellHelper.getActiveShellType();
    const args = [draft.increment, draft.tagMessage, draft.commitMessage, draft.mode]
      .map(value => quoteShellArg(value, shell)).join(' ');
    const triggeredAfter = new Date();
    const result = await runner.run({
      command: `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} ${args}`,
      cwd: root,
      label: LocalizationManager.t(product === 'manager' ? 'release.executeManager' : 'release.executeInstaller'),
      impact: 'remote',
      target: tag,
      exclusive: true,
      confirmationSatisfied: true,
      notifySuccess: false
    });

    if (result.succeeded && draft.mode === 'automatic') {
      const workflowRun = await this.findWorkflowRun(root, definition.workflow, tag, triggeredAfter);
      if (!workflowRun) {
        vscode.window.showErrorMessage(
          LocalizationManager.t('release.preflightFailed', { reason: LocalizationManager.t('release.workflowMissing') })
        );
        return;
      }
      if (!(
        workflowRun.status.toLocaleLowerCase('en-US') === 'completed' &&
        workflowRun.conclusion?.toLocaleLowerCase('en-US') === 'success'
      )) {
        const workflow = await runner.run({
          command: `gh run watch ${workflowRun.databaseId} --exit-status`,
          cwd: root,
          label: `${definition.label} · GitHub Actions`,
          impact: 'read-only',
          target: tag,
          exclusive: true
        });
        if (!workflow.succeeded) return;
      }
    }

    if (result.succeeded) {
      await this.context?.workspaceState.update(this.draftKey(product), undefined);
      this.executionGates.delete(product);
      onChanged?.();
      const open = await vscode.window.showInformationMessage(
        LocalizationManager.t('release.completed', { product: definition.label }),
        LocalizationManager.t('release.openActions')
      );
      if (open) await this.openActions();
    }
  }

  public static async openActions(): Promise<void> {
    const root = WorkspaceLocator.getCoreRoot();
    let base = this.repositoryUrl;
    if (!base && root) {
      try {
        base = githubRepositoryUrl(await this.git(root, ['remote', 'get-url', 'origin']));
      } catch {
        // no-op
      }
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

  private static async diagnose(
    root: string,
    definition: ReleaseDefinition,
    increment: ReleaseIncrement,
    draftReady: boolean,
    expectedDocumentationFingerprint?: string
  ): Promise<ReleaseDiagnostics> {
    const required = [definition.workflow, definition.versionFile, 'c2f'];
    const requiredFilesReady = required.every(file => fs.existsSync(path.join(root, file)));
    const version = this.readVersion(root, definition);

    let dirtyFiles: string[] = [];
    let branch: string | undefined;
    let remote = '';
    try {
      dirtyFiles = (await this.git(root, ['status', '--porcelain', '--untracked-files=all']))
        .split(/\r?\n/)
        .filter(Boolean)
        .map(line => line.slice(3).trim());
      branch = (await this.git(root, ['symbolic-ref', '--short', '-q', 'HEAD'])).trim() || undefined;
      remote = (await this.git(root, ['remote', 'get-url', 'origin'])).trim();
    } catch {
      dirtyFiles = ['git-status'];
    }

    const tag = version ? definition.tagPrefix + bumpSemver(version, increment) : '';
    let tagCollision = !tag;
    if (tag) {
      try {
        const local = await this.git(root, ['tag', '--list', tag]);
        const remoteTag = await this.git(root, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
        tagCollision = Boolean(local.trim() || remoteTag.trim());
      } catch {
        tagCollision = true;
      }
    }

    let workflowIdle = false;
    if (this.permission === 'allowed') {
      try {
        workflowIdle = true;
        for (const status of ['in_progress', 'queued']) {
          const { stdout } = await execFileAsync(
            'gh',
            ['run', 'list', '--workflow', path.basename(definition.workflow), '--status', status, '--json', 'databaseId', '--limit', '1'],
            { cwd: root, windowsHide: true }
          );
          if (JSON.parse(stdout).length > 0) workflowIdle = false;
        }
      } catch {
        workflowIdle = false;
      }
    }

    const documentation = this.inspectDocumentation(root);
    const documentationReady = documentation.ready &&
      (!expectedDocumentationFingerprint || documentation.fingerprint === expectedDocumentationFingerprint);
    const gate = evaluateReleaseGate({
      workspaceTrusted: vscode.workspace.isTrusted,
      permission: this.permission,
      dirtyFiles,
      branch,
      githubRemote: Boolean(githubRepositoryUrl(remote)),
      tagCollision,
      documentationReady,
      draftReady,
      requiredFilesReady,
      workflowIdle
    });

    return {
      version,
      branch,
      dirtyFiles,
      githubRemote: Boolean(githubRepositoryUrl(remote)),
      tag,
      tagCollision,
      requiredFilesReady,
      workflowIdle,
      documentation,
      gate
    };
  }

  private static inspectDocumentation(root: string): DocumentationDiagnostics {
    const workflowsDir = path.join(root, '.github', 'workflows');
    const workflowFiles = fs.existsSync(workflowsDir)
      ? fs.readdirSync(workflowsDir)
        .filter(file => /\.ya?ml$/i.test(file))
        .map(file => path.posix.join('.github', 'workflows', file))
      : [];
    const candidateFiles = ['README.md', 'README-PT-BR.md', 'CHANGELOG.md', ...workflowFiles];
    const inventory = inspectReleaseDocumentPaths(
      candidateFiles.filter(file => fs.existsSync(path.join(root, file)))
    );
    const files = [...inventory.required, ...inventory.workflows].sort();
    const contents = new Map<string, string>();
    for (const file of files) contents.set(file, fs.readFileSync(path.join(root, file), 'utf8'));

    const managerVersion = this.readVersion(root, this.definition('manager'));
    const installerVersion = this.readVersion(root, this.definition('installer'));
    const issues = inspectReleaseDocumentContents(
      Object.fromEntries(contents),
      managerVersion,
      installerVersion
    );

    const hash = createHash('sha256');
    for (const file of files) {
      hash.update(file.replace(/\\/g, '/'));
      hash.update('\0');
      hash.update(contents.get(file) || '');
      hash.update('\0');
    }

    return {
      files,
      missing: inventory.missing,
      issues,
      fingerprint: hash.digest('hex'),
      ready: inventory.ready && issues.length === 0
    };
  }

  private static readVersion(root: string, definition: ReleaseDefinition): string | undefined {
    const fullPath = path.join(root, definition.versionFile);
    if (!fs.existsSync(fullPath)) return undefined;
    return fs.readFileSync(fullPath, 'utf8').match(definition.versionPattern)?.[1];
  }

  private static async recentCommits(root: string): Promise<string[]> {
    try {
      return (await this.git(root, ['log', '-5', '--pretty=format:%s']))
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  }

  private static activeBatch(): string {
    const aiRoot = WorkspaceLocator.getAiWorkspaceRoot();
    if (!aiRoot) return '';
    const current = path.join(aiRoot, 'sdd', 'human-requests', 'CURRENT.md');
    if (!fs.existsSync(current)) return '';
    return fs.readFileSync(current, 'utf8').match(/BATCH-\d+/i)?.[0].toUpperCase() || '';
  }

  private static draftKey(product: ReleaseProduct): string {
    return `conn2flow.release.draft.${product}`;
  }

  private static loadDraft(product: ReleaseProduct): StoredReleaseDraft | undefined {
    return this.context?.workspaceState.get<StoredReleaseDraft>(this.draftKey(product));
  }

  private static async saveDraft(draft: StoredReleaseDraft): Promise<void> {
    await this.context?.workspaceState.update(this.draftKey(draft.product), draft);
  }

  private static async offerSourceControl(): Promise<void> {
    const action = LocalizationManager.t('release.openScm');
    const selected = await vscode.window.showWarningMessage(
      LocalizationManager.t('release.cleanRequired'),
      action
    );
    if (selected === action) await vscode.commands.executeCommand('workbench.view.scm');
  }

  private static blockerLabel(blocker: ReleaseBlocker): string {
    return LocalizationManager.t(`release.blocker.${blocker}` as TranslationKey);
  }

  private static async showBlockedActions(product: ReleaseProduct, message: string): Promise<void> {
    const openPreparation = LocalizationManager.t('release.openPreparation');
    const openSourceControl = LocalizationManager.t('release.openScm');
    const selected = await vscode.window.showWarningMessage(
      message,
      openPreparation,
      openSourceControl
    );
    if (selected === openPreparation) {
      await vscode.commands.executeCommand(
        product === 'manager' ? 'conn2flow.release.manager' : 'conn2flow.release.installer'
      );
    } else if (selected === openSourceControl) {
      await vscode.commands.executeCommand('workbench.view.scm');
    }
  }

  private static async git(root: string, args: string[]): Promise<string> {
    const { stdout } = await execFileAsync(
      'git',
      ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, '-C', root, ...args],
      { windowsHide: true }
    );
    return stdout;
  }

  private static async findWorkflowRun(
    root: string,
    workflow: string,
    tag: string,
    triggeredAfter: Date
  ): Promise<ReturnType<typeof selectWorkflowRun>> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const { stdout } = await execFileAsync(
        'gh',
        [
          'run', 'list',
          '--workflow', path.basename(workflow),
          '--json', 'databaseId,headBranch,status,conclusion,createdAt',
          '--limit', '20'
        ],
        { cwd: root, windowsHide: true }
      );
      const run = selectWorkflowRun(JSON.parse(stdout), tag, triggeredAfter);
      if (run) return run;
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    return undefined;
  }
}
