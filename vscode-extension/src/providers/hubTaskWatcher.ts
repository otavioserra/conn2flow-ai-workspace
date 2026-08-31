import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { LocalizationManager } from './localizationManager';
import {
  evaluateTaskEvent,
  evaluateCompletionEvent,
  parseHubPayload,
  HubTaskPayload,
  HubCompletionPayload
} from '../hubTaskWatcherPolicy';

export class HubTaskWatcher {
  private static _enabled: boolean = true;
  private static storage: vscode.Memento | undefined;
  private static readonly storageKey = 'conn2flow.hub.watcherEnabled';
  private static taskWatcher: vscode.FileSystemWatcher | undefined;
  private static completionWatcher: vscode.FileSystemWatcher | undefined;

  public static initialize(context: vscode.ExtensionContext, refreshAll?: () => void): vscode.Disposable {
    this.storage = context.workspaceState;
    this._enabled = this.storage.get<boolean>(this.storageKey, true);

    const disposables: vscode.Disposable[] = [];

    try {
      this.taskWatcher = vscode.workspace.createFileSystemWatcher('**/tasks/*.json');
      this.taskWatcher.onDidCreate(uri => this.handleTaskUri(uri), null, disposables);
      this.taskWatcher.onDidChange(uri => this.handleTaskUri(uri), null, disposables);
      disposables.push(this.taskWatcher);
    } catch {
      // workspace sem suporte a watcher
    }

    try {
      this.completionWatcher = vscode.workspace.createFileSystemWatcher('**/completions/*.json');
      this.completionWatcher.onDidCreate(uri => this.handleCompletionUri(uri), null, disposables);
      this.completionWatcher.onDidChange(uri => this.handleCompletionUri(uri), null, disposables);
      disposables.push(this.completionWatcher);
    } catch {
      // workspace sem suporte a watcher
    }

    return {
      dispose: () => {
        disposables.forEach(d => d.dispose());
      }
    };
  }

  public static isEnabled(): boolean {
    return this._enabled;
  }

  public static toggle(onChanged?: () => void): boolean {
    this._enabled = !this._enabled;
    void this.storage?.update(this.storageKey, this._enabled);
    const msgKey = this._enabled ? 'hub.watcherStarted' : 'hub.watcherPaused';
    vscode.window.setStatusBarMessage(LocalizationManager.t(msgKey), 2500);
    onChanged?.();
    return this._enabled;
  }

  public static setEnabled(enabled: boolean, onChanged?: () => void): void {
    this._enabled = enabled;
    void this.storage?.update(this.storageKey, this._enabled);
    onChanged?.();
  }

  private static handleTaskUri(uri: vscode.Uri): void {
    if (!this._enabled) return;
    try {
      if (fs.existsSync(uri.fsPath)) {
        const raw = fs.readFileSync(uri.fsPath, 'utf8');
        const payload = parseHubPayload<HubTaskPayload>(raw);
        const evalResult = evaluateTaskEvent(this._enabled, payload);
        if (evalResult.shouldHandle) {
          const reqId = evalResult.reqId || path.basename(uri.fsPath, '.json');
          const message = LocalizationManager.t('hub.taskDispatched', { req: reqId });
          vscode.window.setStatusBarMessage(`$(sync~spin) ${message}`, 4000);
        }
      }
    } catch {
      // leitura silenciosa
    }
  }

  private static handleCompletionUri(uri: vscode.Uri): void {
    if (!this._enabled) return;
    try {
      if (fs.existsSync(uri.fsPath)) {
        const raw = fs.readFileSync(uri.fsPath, 'utf8');
        const payload = parseHubPayload<HubCompletionPayload>(raw);
        const evalResult = evaluateCompletionEvent(this._enabled, payload);
        if (evalResult.shouldHandle) {
          const batchId = evalResult.batchId || path.basename(uri.fsPath, '-executor-receipt.json');
          const message = LocalizationManager.t('hub.executorCompleted', { batch: batchId });
          vscode.window.setStatusBarMessage(`$(check) ${message}`, 4000);
        }
      }
    } catch {
      // leitura silenciosa
    }
  }
}
