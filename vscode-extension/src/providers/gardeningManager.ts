import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SddScopeManager } from './sddScopeManager';
import { ShellHelper } from './shellHelper';

export interface MemoryHealth {
  sizeBytes: number;
  lineCount: number;
  status: 'healthy' | 'warning' | 'critical' | 'notFound';
  label: string;
  filePath?: string;
}

export class GardeningManager {
  private static _autoGardening: boolean = true;

  public static isAutoGardeningEnabled(): boolean {
    return this._autoGardening;
  }

  public static toggleAutoGardening(onChanged?: () => void): boolean {
    this._autoGardening = !this._autoGardening;
    const statusText = this._autoGardening ? 'ATIVADO' : 'DESATIVADO';
    vscode.window.setStatusBarMessage(`Auto-Gardening SDD: ${statusText}`, 2500);
    if (onChanged) {
      onChanged();
    }
    return this._autoGardening;
  }

  public static getMemoryHealth(): MemoryHealth {
    const sddRoot = SddScopeManager.getActiveSddRoot();
    if (!sddRoot) {
      return { sizeBytes: 0, lineCount: 0, status: 'notFound', label: 'Memória não encontrada' };
    }

    const memPath = path.join(sddRoot, 'MEMORIA-ENGENHARIA-EXECUCAO.md');
    if (!fs.existsSync(memPath)) {
      return { sizeBytes: 0, lineCount: 0, status: 'notFound', label: 'Memória não encontrada' };
    }

    try {
      const stats = fs.statSync(memPath);
      const content = fs.readFileSync(memPath, 'utf8');
      const lineCount = content.split('\n').length;
      const sizeBytes = stats.size;
      const sizeKb = (sizeBytes / 1024).toFixed(1);

      if (sizeBytes > 51200 || lineCount > 150) {
        return {
          sizeBytes,
          lineCount,
          status: 'critical',
          label: `🔴 Crítico: ${sizeKb} KB / ${lineCount} linhas (Teto: 50KB/150L)`,
          filePath: memPath
        };
      }

      if (sizeBytes > 35840 || lineCount > 100) {
        return {
          sizeBytes,
          lineCount,
          status: 'warning',
          label: `🟡 Atenção: ${sizeKb} KB / ${lineCount} linhas (Alerta: 35KB/100L)`,
          filePath: memPath
        };
      }

      return {
        sizeBytes,
        lineCount,
        status: 'healthy',
        label: `🟢 Saudável: ${sizeKb} KB (${lineCount} linhas)`,
        filePath: memPath
      };
    } catch {
      return { sizeBytes: 0, lineCount: 0, status: 'notFound', label: 'Erro ao ler memória' };
    }
  }

  public static async createGardeningRequest(
    openFile: (relPath: string) => Promise<void>,
    refreshAll?: () => void
  ): Promise<void> {
    const sddRoot = SddScopeManager.getActiveSddRoot();
    const scopeLabel = SddScopeManager.getScopeLabel();

    if (!sddRoot || !fs.existsSync(sddRoot)) {
      vscode.window.showErrorMessage(`Pasta SDD não encontrada para o escopo ${scopeLabel}.`);
      return;
    }

    const reqDir = path.join(sddRoot, 'human-requests');
    if (!fs.existsSync(reqDir)) {
      fs.mkdirSync(reqDir, { recursive: true });
    }

    // Calcula o próximo número de requisição
    let nextNum = 1;
    try {
      const files = fs.readdirSync(reqDir);
      for (const f of files) {
        const m = f.match(/^req-(\d+)/i);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num >= nextNum) {
            nextNum = num + 1;
          }
        }
      }
    } catch {
      nextNum = 1;
    }

    const padNum = String(nextNum).padStart(3, '0');
    const reqFileName = `req-${padNum}.md`;
    const targetFile = path.join(reqDir, reqFileName);

    const health = this.getMemoryHealth();
    const sizeKb = (health.sizeBytes / 1024).toFixed(1);

    const templateContent = `# Requisição Humana req-${padNum}: SDD Memory Gardening & Higienização

## 🎯 Objetivo
Executar poda, destilação e higienização periódica da memória de execução (\`sdd/MEMORIA-ENGENHARIA-EXECUCAO.md\`) conforme as diretrizes da skill oficial \`sdd-memory-gardening\`.
- **Escopo**: ${scopeLabel}
- **Status Atual da Memória**: ${health.sizeBytes} bytes (~${sizeKb} KB) / ${health.lineCount} linhas
- **Teto Normativo**: 50 KB / 150 linhas (alerta preventivo aos 35 KB / 100 linhas).
- **Meta de Poda**: Reduzir para ~15 KB preservando as 12 a 15 tarefas mais recentes.

## 📋 Checklist de Ações do Executor
- [ ] 1. Ler a memória de execução completa (\`sdd/MEMORIA-ENGENHARIA-EXECUCAO.md\`).
- [ ] 2. Preservar as 12 a 15 tarefas mais recentes e pendências ativas.
- [ ] 3. Destilar regras arquiteturais recorrentes para as skills Core ou documento normativo correspondente.
- [ ] 4. Nunca alterar ou remover diretrizes de governança da Chefia sem instrução humana explícita.
- [ ] 5. Reescrever a memória visando cerca de 15 KB.
- [ ] 6. Executar validação de conformidade com \`./c2f ai:prune-memories\`.
- [ ] 7. Registrar evidências no checklist do lote em \`sdd/validation/VALIDATION-CHECKLIST.md\`.

## 🛡️ Critérios de Aceite
- [ ] Memória de engenharia de execução reduzida para o intervalo de 10 KB a 20 KB.
- [ ] Comando \`./c2f ai:prune-memories\` executado com status verde (Healthy).
- [ ] Nenhuma diretriz operacional crítica ou tarefa pendente foi descartada.
`;

    fs.writeFileSync(targetFile, templateContent, 'utf8');

    // Pergunta se deseja apontar CURRENT.md
    const updateCurrent = await vscode.window.showQuickPick(
      [
        {
          label: `⭐ Sim, apontar CURRENT.md para [${reqFileName}] (Recomendado)`,
          description: `Atualiza a requisição ativa de ${scopeLabel} imediatamente`,
          value: true
        },
        {
          label: '📄 Apenas criar o arquivo (Sem alterar CURRENT.md)',
          description: 'Mantém o ponteiro de CURRENT.md como está',
          value: false
        }
      ],
      { placeHolder: `Requisição ${reqFileName} criada! Deseja ativá-la no CURRENT.md?` }
    );

    if (updateCurrent && updateCurrent.value) {
      const currentPath = path.join(reqDir, 'CURRENT.md');
      if (fs.existsSync(currentPath)) {
        let cur = fs.readFileSync(currentPath, 'utf8');
        if (/\[(req-[0-9a-zA-Z_-]+\.md)\]/.test(cur)) {
          cur = cur.replace(/\[(req-[0-9a-zA-Z_-]+\.md)\]/, `[${reqFileName}]`);
        } else {
          cur = `# Requisição Ativa\n\nPonteiro: [${reqFileName}]\n\n` + cur;
        }
        fs.writeFileSync(currentPath, cur, 'utf8');
      } else {
        fs.writeFileSync(currentPath, `# Requisição Ativa\n\nRequisição em andamento: [${reqFileName}]\n`, 'utf8');
      }
      vscode.window.setStatusBarMessage(`CURRENT.md atualizado para [${reqFileName}]`, 2500);
    }

    if (refreshAll) {
      refreshAll();
    }

    // Abre o arquivo recém-criado
    await openFile(`sdd/human-requests/${reqFileName}`);
  }
}
