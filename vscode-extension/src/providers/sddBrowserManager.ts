import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SddScopeManager } from './sddScopeManager';

export class SddBrowserManager {
  public static async browseDirectory(
    subDir: 'human-requests' | 'implementation' | 'decisions' | 'handoffs',
    title: string,
    openFile: (relPath: string) => Promise<void>
  ): Promise<void> {
    const sddRoot = SddScopeManager.getActiveSddRoot();
    const scopeLabel = SddScopeManager.getScopeLabel();

    if (!sddRoot || !fs.existsSync(sddRoot)) {
      vscode.window.showInformationMessage(`Pasta SDD não encontrada para o escopo ${scopeLabel}.`);
      return;
    }

    const targetDir = path.join(sddRoot, subDir);
    const foundFiles = new Map<string, string>(); // fileName -> relativePath

    if (fs.existsSync(targetDir)) {
      try {
        const files = fs.readdirSync(targetDir);
        for (const file of files) {
          if (file.endsWith('.md')) {
            foundFiles.set(file, path.join('sdd', subDir, file).replace(/\\/g, '/'));
          }
        }
      } catch {
        // silencioso
      }
    }

    if (foundFiles.size === 0) {
      vscode.window.showInformationMessage(`Nenhum arquivo encontrado em ${subDir}/ para ${scopeLabel}.`);
      return;
    }

    // Ordena os arquivos em ordem decrescente (ex: req-145 antes de req-144)
    const sortedNames = Array.from(foundFiles.keys()).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      if (numA !== numB) {
        return numB - numA;
      }
      return b.localeCompare(a);
    });

    const items: vscode.QuickPickItem[] = sortedNames.map(name => {
      const isCurrent = name.toLowerCase() === 'current.md';
      return {
        label: `${isCurrent ? '⭐ ' : '📄 '}${name}`,
        description: isCurrent ? `(Requisição Ativa - ${scopeLabel})` : `[${scopeLabel}] sdd/${subDir}/${name}`,
        detail: foundFiles.get(name)
      };
    });

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: `[${scopeLabel}] Selecione um arquivo de ${title}:`
    });

    if (selected && selected.detail) {
      await openFile(selected.detail);
    }
  }
}
