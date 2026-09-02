import * as vscode from 'vscode';
import * as fs from 'fs';
import { SddScopeManager } from './sddScopeManager';
import { LocalizationManager } from './localizationManager';
import type { TranslationKey } from '../localizationCatalog';
import {
  AutonomyLevel,
  DEFAULT_AUTONOMY,
  DEFAULT_TOPOLOGY,
  PREFERENCE_KEYS,
  PREFERENCE_SECTION,
  TopologyMode,
  applyModesToCurrentMarkdown,
  parseModesFromCurrentMarkdown,
  recognizeAutonomy,
  recognizeTopology,
  resolvePersistedPreference
} from '../workspacePreferencesPolicy';

export { TopologyMode, AutonomyLevel };

export interface SDDModes {
  topology: TopologyMode;
  autonomy: AutonomyLevel;
}

export class ModesManager {
  private static cachedModes: SDDModes = {
    topology: DEFAULT_TOPOLOGY,
    autonomy: DEFAULT_AUTONOMY
  };
  private static initialized = false;

  public static getCurrentModes(): SDDModes {
    if (!this.initialized) {
      this.initFromPersistedSources();
      this.initialized = true;
    }
    return this.cachedModes;
  }

  /** Relê as preferências persistidas (usado após troca de escopo SDD). */
  public static reload(): SDDModes {
    this.initFromPersistedSources();
    this.initialized = true;
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

  /**
   * Precedência: `settings.json` (escolha explícita do operador, sobrevive ao
   * reload da janela) e, na ausência dela, o metadado declarado em `CURRENT.md`.
   */
  private static initFromPersistedSources(): void {
    const config = vscode.workspace.getConfiguration(PREFERENCE_SECTION);
    const fromDisk = this.readModesFromCurrentFile();

    this.cachedModes = {
      topology: resolvePersistedPreference(
        {
          settings: config.get<string>(PREFERENCE_KEYS.topology),
          workspaceState: fromDisk.topology
        },
        recognizeTopology,
        DEFAULT_TOPOLOGY
      ),
      autonomy: resolvePersistedPreference(
        {
          settings: config.get<string>(PREFERENCE_KEYS.autonomy),
          workspaceState: fromDisk.autonomy
        },
        recognizeAutonomy,
        DEFAULT_AUTONOMY
      )
    };
  }

  private static readModesFromCurrentFile(): Partial<SDDModes> {
    const currentPath = this.getCurrentFilePath();
    if (!currentPath || !fs.existsSync(currentPath)) return {};

    try {
      return parseModesFromCurrentMarkdown(fs.readFileSync(currentPath, 'utf8'));
    } catch {
      return {};
    }
  }

  public static async setTopology(mode: TopologyMode, onUpdated?: () => void): Promise<void> {
    this.cachedModes.topology = mode;
    this.initialized = true;

    await this.persistSetting(PREFERENCE_KEYS.topology, mode);
    this.syncCurrentFile({ topology: mode });

    const label = LocalizationManager.t(mode === 'triade' ? 'mode.triad' : 'mode.dual');
    vscode.window.setStatusBarMessage(`${LocalizationManager.t('overview.topology', { mode: label })}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  public static async setAutonomy(level: AutonomyLevel, onUpdated?: () => void): Promise<void> {
    this.cachedModes.autonomy = level;
    this.initialized = true;

    await this.persistSetting(PREFERENCE_KEYS.autonomy, level);
    this.syncCurrentFile({ autonomy: level });

    const labelKeys: Record<AutonomyLevel, TranslationKey> = {
      supervisionado: 'mode.supervised',
      autonomo_monitorado: 'mode.monitored',
      autonomo_headless: 'mode.headless'
    };
    const label = LocalizationManager.t(labelKeys[level]);
    vscode.window.setStatusBarMessage(`${LocalizationManager.t('overview.autonomy', { mode: label })}`, 2000);
    if (onUpdated) {
      onUpdated();
    }
  }

  /**
   * Grava no escopo de workspace quando há pasta aberta; cai para o escopo
   * global apenas quando a extensão roda sem workspace.
   */
  private static async persistSetting(key: string, value: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(PREFERENCE_SECTION);
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace
      : vscode.ConfigurationTarget.Global;

    try {
      await config.update(key, value, target);
    } catch {
      try {
        await config.update(key, value, vscode.ConfigurationTarget.Global);
      } catch {
        // mantém apenas o cache em memória
      }
    }
  }

  private static syncCurrentFile(modes: Partial<SDDModes>): void {
    const currentPath = this.getCurrentFilePath();
    if (!currentPath || !fs.existsSync(currentPath)) return;

    try {
      const content = fs.readFileSync(currentPath, 'utf8');
      const updated = applyModesToCurrentMarkdown(content, modes);
      if (updated !== content) {
        fs.writeFileSync(currentPath, updated, 'utf8');
      }
    } catch {
      // segue com cache em memoria
    }
  }

  private static getCurrentFilePath(): string | undefined {
    return SddScopeManager.resolveSddFile('sdd/human-requests/CURRENT.md');
  }
}
