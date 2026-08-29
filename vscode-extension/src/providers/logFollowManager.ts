import * as vscode from 'vscode';

export class LogFollowManager {
  public static isApacheFollowing = false;
  public static isPhpFollowing = false;

  private static apacheTerminal?: vscode.Terminal;
  private static phpTerminal?: vscode.Terminal;

  public static toggleApacheLogs(onUpdated?: () => void): void {
    if (this.isApacheFollowing) {
      // Parar o follow enviando Ctrl+C (\u0003) para liberar o terminal
      if (this.apacheTerminal && this.apacheTerminal.exitStatus === undefined) {
        this.apacheTerminal.sendText('\u0003', false);
      }
      this.isApacheFollowing = false;
      vscode.window.setStatusBarMessage('⏹️ Logs Apache parados. Terminal liberado.', 2000);
    } else {
      // Iniciar o follow em terminal dedicado
      if (!this.apacheTerminal || this.apacheTerminal.exitStatus !== undefined) {
        this.apacheTerminal = vscode.window.createTerminal({ name: 'Conn2Flow: Logs Apache' });
      }
      this.apacheTerminal.show();
      this.apacheTerminal.sendText('docker logs conn2flow-app --tail 50 --follow');
      this.isApacheFollowing = true;
      vscode.window.setStatusBarMessage('🟢 Monitorando Logs Apache ao vivo.', 2000);
    }

    if (onUpdated) {
      onUpdated();
    }
  }

  public static togglePhpLogs(onUpdated?: () => void): void {
    if (this.isPhpFollowing) {
      // Parar o follow enviando Ctrl+C (\u0003) para liberar o terminal
      if (this.phpTerminal && this.phpTerminal.exitStatus === undefined) {
        this.phpTerminal.sendText('\u0003', false);
      }
      this.isPhpFollowing = false;
      vscode.window.setStatusBarMessage('⏹️ Logs PHP parados. Terminal liberado.', 2000);
    } else {
      // Iniciar o follow em terminal dedicado
      if (!this.phpTerminal || this.phpTerminal.exitStatus !== undefined) {
        this.phpTerminal = vscode.window.createTerminal({ name: 'Conn2Flow: Logs PHP' });
      }
      this.phpTerminal.show();
      this.phpTerminal.sendText('docker exec conn2flow-app bash -c "tail -f /var/log/php_errors.log"');
      this.isPhpFollowing = true;
      vscode.window.setStatusBarMessage('🟢 Monitorando Logs PHP ao vivo.', 2000);
    }

    if (onUpdated) {
      onUpdated();
    }
  }

  public static handleTerminalClosed(closedTerminal: vscode.Terminal, onUpdated?: () => void): void {
    let changed = false;
    if (this.apacheTerminal === closedTerminal) {
      this.isApacheFollowing = false;
      this.apacheTerminal = undefined;
      changed = true;
    }
    if (this.phpTerminal === closedTerminal) {
      this.isPhpFollowing = false;
      this.phpTerminal = undefined;
      changed = true;
    }

    if (changed && onUpdated) {
      onUpdated();
    }
  }
}
