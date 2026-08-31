import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SddScopeManager } from './sddScopeManager';
import { LocalizationManager } from './localizationManager';

export type TopologyMode = 'duplo' | 'triade';
export type AutonomyLevel = 'supervisionado' | 'autonomo_monitorado' | 'autonomo_headless';

export interface SDDModes {
  topology: TopologyMode;
  autonomy: AutonomyLevel;
}

export class ModesManager {
  private static cachedModes: SDDModes = {
    topology: 'triade',
    autonomy: 'supervisionado'
  };
  private static initialized = false;

  public static getCurrentModes(): SDDModes {
    if (!this.initialized) {
      this.initFromDisk();
      this.initialized = true;
    }
    return this.cachedModes;
  }

  public static async selectTopology(onUpdated?: () => void): Promise<void> {
    const selected = await vscode.window.showQuickPick(
      [
        { label: LocalizationManager.t('mode.triad'), value: 'triade' as TopologyMode },
        { label: LocalizationManager.t('mode.dual'), value: 'duplo' as TopologyMode }
      ],
      { placeHolder: LocalizationManager.t('modes.selectTopology') }
    );
    if (selected) await this.setTopology(selected.value, onUpdated);
  }

  public static async selectAutonomy(onUpdated?: () => void): Promise<void> {
    const selected = await vscode.window.showQuickPick(
      [
        { label: LocalizationManager.t('mode.supervised'), value: 'supervisionado' as AutonomyLevel },
        { label: LocalizationManager.t('mode.monitored'), value: 'autonomo_monitorado' as AutonomyLevel },
        { label: LocalizationManager.t('mode.headless'), value: 'autonomo_headless' as AutonomyLevel }
      ],
      { placeHolder: LocalizationManager.t('modes.selectAutonomy') }
    );
    if (selected) await this.setAutonomy(selected.value, onUpdated);
  }

  private static initFromDisk(): void {
    const currentPath = this.getCurrentFilePath();
    if (!currentPath || !fs.existsSync(currentPath)) return;

    try {
      const content = fs.readFileSync(currentPath, 'utf8');

      const topMatch = content.match(/\*\*Topologia de Agentes\*\*:\s*`?([a-zA-Z_-]+)`?/i);
      if (topMatch && (topMatch[1].toLowerCase() === 'duplo' || topMatch[1].toLowerCase() === 'triade')) {
        this.cachedModes.topology = topMatch[1].toLowerCase() as TopologyMode;
      }

      const autoMatch = content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([a-zA-Z_-]+)`?/i);
      if (autoMatch) {
        const val = autoMatch[1].toLowerCase();
        if (val === 'supervisionado' || val === 'autonomo_monitorado' || val === 'autonomo_headless') {
          this.cachedModes.autonomy = val as AutonomyLevel;
        }
      }
    } catch {
      // silencioso
    }
  }

  public static async setTopology(mode: TopologyMode, onUpdated?: () => void): Promise<void> {
    this.cachedModes.topology = mode;
    this.initialized = true;

    const currentPath = this.getCurrentFilePath();
    if (currentPath && fs.existsSync(currentPath)) {
      try {
        let content = fs.readFileSync(currentPath, 'utf8');
        if (content.match(/\*\*Topologia de Agentes\*\*:/i)) {
          content = content.replace(/\*\*Topologia de Agentes\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Topologia de Agentes**: \`${mode}\``);
        } else {
          content = content.replace(/(\*   \*\*Status\*\*:[^\n]*\n)/i, `$1*   **Topologia de Agentes**: \`${mode}\`\n`);
        }
        fs.writeFileSync(currentPath, content, 'utf8');
      } catch {
        // segue com cache em memoria
      }
    }

    const label = mode === 'triade' ? '🏛️ Tríade de Agentes' : '👥 Duplo Agente';
    vscode.window.setStatusBarMessage(`Topologia: ${label}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  public static async setAutonomy(level: AutonomyLevel, onUpdated?: () => void): Promise<void> {
    this.cachedModes.autonomy = level;
    this.initialized = true;

    const currentPath = this.getCurrentFilePath();
    if (currentPath && fs.existsSync(currentPath)) {
      try {
        let content = fs.readFileSync(currentPath, 'utf8');
        if (content.match(/\*\*N[íi]vel de Autonomia\*\*:/i)) {
          content = content.replace(/\*\*N[íi]vel de Autonomia\*\*:\s*`?[a-zA-Z_-]+`?/i, `**Nível de Autonomia**: \`${level}\``);
        } else {
          content = content.replace(/(\*   \*\*Topologia de Agentes\*\*:[^\n]*\n)/i, `$1*   **Nível de Autonomia**: \`${level}\`\n`);
        }
        fs.writeFileSync(currentPath, content, 'utf8');
      } catch {
        // segue com cache em memoria
      }
    }

    const labels: Record<AutonomyLevel, string> = {
      supervisionado: '🛡️ Nível 1: Supervisionado',
      autonomo_monitorado: '👁️ Nível 2: Autônomo Monitorado',
      autonomo_headless: '🤖 Nível 3: Autônomo Headless'
    };
    vscode.window.setStatusBarMessage(`Autonomia: ${labels[level]}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  private static getCurrentFilePath(): string | undefined {
    return SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
  }
}
