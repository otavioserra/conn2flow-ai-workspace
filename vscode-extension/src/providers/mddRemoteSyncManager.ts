import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  buildRemoteSyncArgs, DEFAULT_REMOTE_MATRIX, parseRemoteSyncReport, remoteSyncDue
} from '../mddRemoteSyncPolicy';
import { LocalizationManager } from './localizationManager';
import { MddHubManager } from './mddHubManager';

const skillKits = ['.gemini', '.claude', '.cursor', '.codex', '.github'];
const configuration = ['autoSyncSkills', 'autoSyncIntervalHours', 'remoteMatrixUrl', 'projectDomain'];

export class MddRemoteSyncManager implements vscode.Disposable {
  private readonly running = new Set<string>();
  private readonly available = new Map<string, number>();
  private readonly subscriptions: vscode.Disposable[];
  private readonly timer: ReturnType<typeof setInterval>;
  private disposed = false;

  constructor(private readonly state: vscode.Memento, private readonly repaint: () => void) {
    this.subscriptions = [
      vscode.workspace.onDidGrantWorkspaceTrust(() => void this.tick()),
      vscode.workspace.onDidChangeWorkspaceFolders(() => {
        const open = new Set((vscode.workspace.workspaceFolders ?? []).map(folder => folder.uri.toString()));
        for (const key of this.available.keys()) if (!open.has(key)) this.available.delete(key);
        this.repaint();
        void this.tick();
      }),
      vscode.workspace.onDidChangeConfiguration(event => {
        if (!configuration.some(key => event.affectsConfiguration('conn2flow.' + key))) return;
        this.available.clear();
        this.repaint();
        void this.tick();
      })
    ];
    this.timer = setInterval(() => void this.tick(), 60_000);
    void this.tick();
  }

  dispose(): void {
    this.disposed = true;
    clearInterval(this.timer);
    for (const item of this.subscriptions) item.dispose();
  }

  pendingUpdates(): number {
    return [...this.available.values()].reduce((total, value) => total + value, 0);
  }

  async runManual(): Promise<void> {
    if (!vscode.workspace.isTrusted) {
      vscode.window.setStatusBarMessage(LocalizationManager.t('command.trustRequired'), 6000);
      return;
    }
    const folders = vscode.workspace.workspaceFolders ?? [];
    const folder = folders.length === 1 ? folders[0] : await vscode.window.showWorkspaceFolderPick();
    if (folder) await this.sync(folder, false, true);
  }

  private async tick(): Promise<void> {
    if (this.disposed || !vscode.workspace.isTrusted) return;
    for (const folder of vscode.workspace.workspaceFolders ?? []) {
      const settings = vscode.workspace.getConfiguration('conn2flow', folder.uri);
      const mode = settings.get<string>('autoSyncSkills', 'notify');
      if (this.disposed || !vscode.workspace.isTrusted || mode === 'off' || folder.uri.scheme !== 'file') continue;
      const key = this.attemptKey(folder, settings);
      const interval = settings.get<number>('autoSyncIntervalHours', 24);
      if (!remoteSyncDue(mode, interval, this.state.get<number>(key), Date.now())) continue;
      if (!skillKits.some(kit => fs.existsSync(path.join(folder.uri.fsPath, kit, 'skills')))) continue;
      await this.sync(folder, mode === 'notify', false);
    }
  }

  private attemptKey(folder: vscode.WorkspaceFolder, settings: vscode.WorkspaceConfiguration): string {
    return 'conn2flow.remoteSkills.lastAttempt.' + JSON.stringify([
      folder.uri.toString(), settings.get('remoteMatrixUrl', DEFAULT_REMOTE_MATRIX), settings.get('projectDomain', 'auto'),
      settings.get('autoSyncSkills', 'notify')
    ]);
  }

  private async sync(folder: vscode.WorkspaceFolder, checkOnly: boolean, manual: boolean): Promise<void> {
    const folderKey = folder.uri.toString();
    if (this.disposed || !vscode.workspace.isTrusted || folder.uri.scheme !== 'file' || this.running.has(folderKey)) return;
    this.running.add(folderKey);
    try {
      const settings = vscode.workspace.getConfiguration('conn2flow', folder.uri);
      const url = settings.get<string>('remoteMatrixUrl', DEFAULT_REMOTE_MATRIX);
      const args = buildRemoteSyncArgs(folder.uri.fsPath, settings.get<string>('projectDomain'), url, checkOnly);
      const attempt = this.attemptKey(folder, settings);
      await this.state.update(attempt, Date.now());
      if (this.disposed || !vscode.workspace.isTrusted) return;
      const run = () => MddHubManager.runMdd(args, folder.uri.fsPath, 300_000);
      const stdout = manual ? await vscode.window.withProgress({
        location: { viewId: 'conn2flow-mdd-hub' },
        title: LocalizationManager.t('mddHub.remoteSyncRunning')
      }, run) : await run();
      const report = parseRemoteSyncReport(stdout);
      MddHubManager.log(JSON.stringify({ remoteSkillSync: { folder: folder.name, checkOnly, ...report } }));
      if (this.disposed) return;
      const current = vscode.workspace.getConfiguration('conn2flow', folder.uri);
      if (this.attemptKey(folder, current) !== attempt ||
          !vscode.workspace.workspaceFolders?.some(value => value.uri.toString() === folderKey)) return;
      if (checkOnly && report.available.length) {
        this.available.set(folderKey, report.available.length);
        vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.remoteSyncAvailable', {
          count: report.available.length
        }), 10000);
      } else {
        this.available.delete(folderKey);
        if (manual) vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.remoteSyncResult', {
          count: report.updated.length, conflicts: report.conflicts.length
        }), 10000);
      }
      this.repaint();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      MddHubManager.log('Remote skill sync failed: ' + detail);
      if (manual && !this.disposed) vscode.window.setStatusBarMessage(
        LocalizationManager.t('mddHub.remoteSyncFailed'), 10000);
    } finally {
      this.running.delete(folderKey);
    }
  }
}
