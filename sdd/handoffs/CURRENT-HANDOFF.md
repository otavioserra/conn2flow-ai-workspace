# Handoff do Macro-Arquiteto — REQ-045 / BATCH-047

* **Status**: `READY_FOR_REVIEW`
* **Emissor**: Macro-Arquiteto & Revisor (Antigravity)
* **Destinatário**: Agente Executor (OpenAI Codex / Claude Code)
* **Data**: 2026-09-01
* **Projeto Alvo**: `conn2flow-ai-workspace` (`c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`)
* **Requisição Ativa**: [req-045.md](../human-requests/req-045.md)
* **Topologia**: `dupla` (Duplo Agente)
* **Autonomia**: `supervisionado`

---

## 🎯 Instruções para o Agente Executor

Olá Executor! A **REQ-045** resolve o preflight de release do `gestor-instalador` e formaliza a governança de sondas HTTP e comandos CLI:

### 1. Na Extensão VS Code (`vscode-extension/src/providers/releaseManager.ts`)
- Na definição do produto `installer`:
  * Alterar `versionFile` para apontar para `path.join('gestor-instalador', 'src', 'InstallerGuard.php')` (ou suportar leitura resiliente de `InstallerGuard.php` com fallback para `index.php`).
  * Atualizar o regex `versionPattern` para capturar `const VERSION = '(\d+\.\d+\.\d+)';` (ex: `/(?:const\s+VERSION|\$_GESTOR_INSTALADOR\[['"]versao['"]\])\s*=\s*['"]?(\d+\.\d+\.\d+)['"]?/`).
  * Assegurar que `ReleaseManager.prepare('installer')` e o diagnóstico executem sem erro de preflight.

### 2. No Script do Core (`conn2flow/ai-workspace/en/scripts/releases/version-installer.php`)
- Atualizar a localização do arquivo alvo para `gestor-instalador/src/InstallerGuard.php` e substituir a linha `const VERSION = '...'`.
- Se aplicável, atualizar o comentário em `gestor-instalador/index.php`.

### 3. Nas Skills Oficiais (`c2f-dev-scripts` e `c2f-html-css-pages-and-components`)
- Em `.gemini/skills/c2f-dev-scripts/SKILL.md` (e espelhos):
  * Formalizar que novos comandos do CLI implementam `Conn2Flow\Cli\Contracts\CommandInterface` ou estendem `Conn2Flow\Cli\Commands\BaseProcessCommand`.
- Em `.gemini/skills/c2f-html-css-pages-and-components/SKILL.md` (e espelhos):
  * Formalizar a regra anti-deadlock: toda sonda HTTP (como Rewrite Probe) deve partir do front-end/navegador para prevenir auto-bloqueio no PHP-FPM em ambiente single-worker.

### 4. Testes Automatizados
- Adicionar teste unitário em `vscode-extension/test/` validando o parser de versão para `installer` contra `InstallerGuard.php`.
- Rodar `npm test` em `vscode-extension/` garantindo 100% verde.
- Ao concluir, emita o recibo no MCP Hub e atualize para `READY_FOR_REVIEW`.
