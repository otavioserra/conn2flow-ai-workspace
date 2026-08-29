import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {
  BacklogItem,
  hasBacklogStatusDrift,
  parseBacklogFileStatus,
  parseBacklogIndex
} from '../backlogPolicy';
import { LocalizationManager } from './localizationManager';
import { SddScopeManager } from './sddScopeManager';

export class BacklogManager {
  public static async browse(openFile: (relativePath: string) => Promise<void>): Promise<void> {
    const root = SddScopeManager.getActiveSddRoot();
    const scope = SddScopeManager.getScopeLabel();
    if (!root) {
      vscode.window.showInformationMessage(LocalizationManager.t('sdd.folderMissing', { scope }));
      return;
    }

    const backlogRoot = path.join(root, 'backlog');
    const indexPath = path.join(backlogRoot, 'BACKLOG-INDEX.md');
    if (!fs.existsSync(indexPath)) {
      vscode.window.showInformationMessage(LocalizationManager.t('backlog.empty', { scope }));
      return;
    }

    const items = parseBacklogIndex(fs.readFileSync(indexPath, 'utf8')).map(item =>
      this.withFileStatus(backlogRoot, item)
    );
    if (items.length === 0) {
      await openFile('sdd/backlog/BACKLOG-INDEX.md');
      return;
    }

    const statuses = [...new Set(items.flatMap(item => [item.indexStatus, item.fileStatus].filter(Boolean) as string[]))].sort();
    const filter = await vscode.window.showQuickPick(
      [{ label: LocalizationManager.t('backlog.all'), value: '*' }, ...statuses.map(status => ({ label: status, value: status }))],
      { placeHolder: LocalizationManager.t('backlog.filterPrompt') }
    );
    if (!filter) return;

    const visible = filter.value === '*'
      ? items
      : items.filter(item => item.indexStatus === filter.value || item.fileStatus === filter.value);
    const selected = await vscode.window.showQuickPick(
      visible.map(item => ({
        label: `${hasBacklogStatusDrift(item) ? '$(warning) ' : ''}${item.id} — ${item.title}`,
        description: `${item.type} · ${item.indexStatus}`,
        detail: hasBacklogStatusDrift(item)
          ? LocalizationManager.t('backlog.drift', { index: item.indexStatus, file: item.fileStatus || '?' })
          : item.nextAction,
        item
      })),
      { placeHolder: LocalizationManager.t('backlog.itemPrompt', { scope }) }
    );
    if (!selected) return;

    const action = await vscode.window.showQuickPick([
      { label: `$(go-to-file) ${selected.item.id}`, value: 'open' },
      { label: `$(diff-added) ${LocalizationManager.t('backlog.promote')}`, value: 'promote' },
      { label: `$(list-unordered) ${LocalizationManager.t('backlog.openIndex')}`, value: 'index' }
    ]);
    if (action?.value === 'open') {
      await openFile(`sdd/backlog/${selected.item.fileName}`);
    } else if (action?.value === 'index') {
      await openFile('sdd/backlog/BACKLOG-INDEX.md');
    } else if (action?.value === 'promote') {
      await this.preparePromotion(selected.item, openFile);
    }
  }

  private static withFileStatus(root: string, item: BacklogItem): BacklogItem {
    const filePath = path.join(root, item.fileName);
    return {
      ...item,
      fileStatus: fs.existsSync(filePath)
        ? parseBacklogFileStatus(fs.readFileSync(filePath, 'utf8'))
        : undefined
    };
  }

  private static async preparePromotion(
    item: BacklogItem,
    openFile: (relativePath: string) => Promise<void>
  ): Promise<void> {
    const answer = await vscode.window.showWarningMessage(
      LocalizationManager.t('backlog.intakeGate'),
      { modal: true },
      LocalizationManager.t('backlog.promote')
    );
    if (!answer) return;

    const prompt = LocalizationManager.t('backlog.promotionPrompt', {
      id: item.id,
      type: item.type,
      status: item.fileStatus || item.indexStatus,
      title: item.title,
      action: item.nextAction,
      file: item.fileName
    });
    await vscode.env.clipboard.writeText(prompt);
    await openFile(`sdd/backlog/${item.fileName}`);
  }
}
