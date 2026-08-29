import * as vscode from 'vscode';

export class TerminalModeManager {
  private static _reuseTerminal: boolean = true;

  public static get isReuse(): boolean {
    return this._reuseTerminal;
  }

  public static toggle(onChanged?: () => void): boolean {
    this._reuseTerminal = !this._reuseTerminal;
    vscode.window.setStatusBarMessage(
      this._reuseTerminal ? '🔄 Modo de Terminal: Reutilizando terminal ativo' : '➕ Modo de Terminal: Abrindo novo terminal para cada comando',
      2500
    );
    if (onChanged) {
      onChanged();
    }
    return this._reuseTerminal;
  }
}
