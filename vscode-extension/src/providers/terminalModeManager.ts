import * as vscode from 'vscode';

export class TerminalModeManager {
  private static _reuseTerminal: boolean = true;
  private static storage: vscode.Memento | undefined;
  private static readonly storageKey = 'conn2flow.terminal.reuse';

  public static initialize(context: vscode.ExtensionContext): void {
    this.storage = context.globalState;
    this._reuseTerminal = this.storage.get<boolean>(this.storageKey, true);
  }

  public static get isReuse(): boolean {
    return this._reuseTerminal;
  }

  public static toggle(onChanged?: () => void): boolean {
    this._reuseTerminal = !this._reuseTerminal;
    void this.storage?.update(this.storageKey, this._reuseTerminal);
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
