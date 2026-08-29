import * as vscode from 'vscode';
import { LocalizationManager } from './localizationManager';

export type SddViewMode = 'both' | 'preview' | 'code';

export class SddViewModeManager {
  private static _mode: SddViewMode = 'preview';
  private static storage: vscode.Memento | undefined;
  private static readonly storageKey = 'conn2flow.sdd.viewMode';

  public static initialize(context: vscode.ExtensionContext): void {
    this.storage = context.workspaceState;
    this._mode = this.storage.get<SddViewMode>(this.storageKey, 'preview');
  }

  public static get mode(): SddViewMode {
    return this._mode;
  }

  public static get label(): string {
    switch (this._mode) {
      case 'both':
        return LocalizationManager.t('view.both');
      case 'preview':
        return LocalizationManager.t('view.preview');
      case 'code':
        return LocalizationManager.t('view.code');
    }
  }

  public static toggle(onChanged?: () => void): SddViewMode {
    if (this._mode === 'both') {
      this._mode = 'preview';
    } else if (this._mode === 'preview') {
      this._mode = 'code';
    } else {
      this._mode = 'both';
    }

    void this.storage?.update(this.storageKey, this._mode);

    vscode.window.setStatusBarMessage(LocalizationManager.t('sdd.viewMode', { mode: this.label }), 2500);
    if (onChanged) {
      onChanged();
    }
    return this._mode;
  }
}
