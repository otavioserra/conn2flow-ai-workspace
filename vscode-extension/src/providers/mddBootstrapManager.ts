import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  buildBootstrapArgs,
  buildDomainPickItems,
  buildListDomainsArgs,
  DomainCatalog,
  normalizeProjectDomain,
  parseBootstrapReport,
  parseDomainList
} from '../domainPolicy';
import { LocalizationManager } from './localizationManager';
import { MddHubManager } from './mddHubManager';
import { WorkspaceLocator } from './workspaceLocator';

/**
 * "Initialize MDD in this Project" (ARCH-019 Phase 1). The domain list and every write come from
 * `mdd bootstrap`; this class only picks the folder and the domain and reports the result.
 */
export class MddBootstrapManager {
  public static async initializeProject(): Promise<boolean> {
    if (!vscode.workspace.isTrusted) {
      vscode.window.showWarningMessage(LocalizationManager.t('command.trustRequired'));
      return false;
    }
    const folder = await this.pickFolder();
    if (!folder) return false;
    const matrix = WorkspaceLocator.getAiWorkspaceRoot();
    const name = path.basename(folder);

    let catalog: DomainCatalog;
    try {
      catalog = parseDomainList(await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: LocalizationManager.t('bootstrap.loadingDomains') },
        () => MddHubManager.runMdd(buildListDomainsArgs(folder, matrix), folder, 60000)));
    } catch (error) {
      vscode.window.showErrorMessage(LocalizationManager.t('bootstrap.failed', { message: this.message(error) }));
      return false;
    }
    if (catalog.errors.length) {
      vscode.window.showWarningMessage(LocalizationManager.t('bootstrap.invalidDomains', {
        count: String(catalog.errors.length), names: catalog.errors.map(item => item.domain).join(', ')
      }));
    }

    const config = vscode.workspace.getConfiguration('conn2flow', vscode.Uri.file(folder));
    const configured = normalizeProjectDomain(config.get<string>('projectDomain'));
    const items = buildDomainPickItems(catalog, configured, {
      auto: detected => LocalizationManager.t('bootstrap.auto', { domain: detected }),
      autoDetail: evidence => LocalizationManager.t('bootstrap.autoDetail', { evidence }),
      fallback: LocalizationManager.t('bootstrap.fallback'),
      current: LocalizationManager.t('bootstrap.current')
    });
    const quickPick = vscode.window.createQuickPick<typeof items[number]>();
    quickPick.items = items;
    quickPick.activeItems = items.filter(item => item.picked);
    quickPick.placeholder = LocalizationManager.t('bootstrap.pickDomain', { folder: name });
    quickPick.matchOnDescription = true;
    quickPick.matchOnDetail = true;
    const picked = await new Promise<typeof items[number] | undefined>(resolve => {
      quickPick.onDidAccept(() => { resolve(quickPick.selectedItems[0]); quickPick.hide(); });
      quickPick.onDidHide(() => resolve(undefined));
      quickPick.show();
    });
    quickPick.dispose();
    if (!picked) return false;

    const domain = picked.domainId;
    const effective = domain === 'auto' ? catalog.detected?.id || domain : domain;
    try {
      const summary = parseBootstrapReport(await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: LocalizationManager.t('bootstrap.running', { domain: effective, folder: name }) },
        () => MddHubManager.runMdd(buildBootstrapArgs(folder, domain, matrix), folder, 180000)));
      if (configured !== domain && vscode.workspace.workspaceFolders?.length) await config.update('projectDomain', domain, vscode.ConfigurationTarget.Workspace);
      vscode.window.setStatusBarMessage(LocalizationManager.t('bootstrap.done', {
        folder: name, domain: summary.domain, installed: String(summary.installed),
        preserved: String(summary.preserved), memory: String(summary.memoryCreated)
      }), 10000);
      // A freshly created memory tree opens its entry point; existing memory is left untouched and closed.
      const current = path.join(folder, 'memory', 'human-requests', 'CURRENT.md');
      if (!summary.memoryPreserved && summary.memoryCreated > 0 && fs.existsSync(current)) {
        await vscode.window.showTextDocument(vscode.Uri.file(current), { preview: true });
      }
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(LocalizationManager.t('bootstrap.failed', { message: this.message(error) }));
      return false;
    }
  }

  private static async pickFolder(): Promise<string | undefined> {
    const folders = vscode.workspace.workspaceFolders || [];
    if (folders.length === 1) return folders[0].uri.fsPath;
    if (folders.length > 1) {
      const picked = await vscode.window.showWorkspaceFolderPick({ placeHolder: LocalizationManager.t('bootstrap.pickFolder') });
      return picked?.uri.fsPath;
    }
    const chosen = await vscode.window.showOpenDialog({
      canSelectFolders: true, canSelectFiles: false, canSelectMany: false, openLabel: LocalizationManager.t('bootstrap.pickFolder')
    });
    return chosen?.[0]?.fsPath;
  }

  private static message(error: unknown): string { return error instanceof Error ? error.message.split(/\r?\n/)[0] : String(error); }
}
