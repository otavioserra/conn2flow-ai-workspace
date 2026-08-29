import * as vscode from 'vscode';

export type SddViewMode = 'both' | 'preview' | 'code';

export class SddViewModeManager {
  private static _mode: SddViewMode = 'both';

  public static get mode(): SddViewMode {
    return this._mode;
  }

  public static get label(): string {
    switch (this._mode) {
      case 'both':
        return 'Ambos Lado a Lado';
      case 'preview':
        return 'Apenas Renderizado (Preview)';
      case 'code':
        return 'Apenas Código-Fonte (Editor)';
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

    vscode.window.setStatusBarMessage(`Exibição SDD: ${this.label}`, 2500);
    if (onChanged) {
      onChanged();
    }
    return this._mode;
  }
}
