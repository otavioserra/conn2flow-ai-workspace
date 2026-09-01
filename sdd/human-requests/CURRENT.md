# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-045.md](req-045.md)
* **Status**: `READY_FOR_EXECUTION`
* **Lote Relacionado**: `BATCH-047`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-01
* **Lote Anterior Concluído**: [req-044.md](req-044.md) (`BATCH-046`)

## Execução atual

REQ-045 aprovada pelo Humano-no-Loop para o BATCH-047 na topologia de Duplo Agente (Macro-Arquiteto/Revisor + Executor).

### Foco prioritário:
1. **Extensão VS Code (`releaseManager.ts`)**:
   - Ajustar a definição do produto `installer` para ler a versão em `gestor-instalador/src/InstallerGuard.php` (constante `InstallerGuard::VERSION` com valor `const VERSION = '2.1.0';`), com fallback para `gestor-instalador/index.php`.
   - Garantir que o preflight de release do instalador passe com sucesso no formulário sem travar no `readVersion`.
2. **Core Scripts (`version-installer.php`)**:
   - Atualizar `ai-workspace/en/scripts/releases/version-installer.php` (e similares) para incrementar a versão em `InstallerGuard.php` e atualizar o comentário de `index.php`.
3. **Governança de Sondas HTTP (Anti-Deadlock)**:
   - Formalizar nas skills `c2f-html-css-pages-and-components` e `c2f-dev-scripts` que testes de loopback/rewrite HTTP devem ser disparados pelo front-end/navegador.
4. **Contrato do Core CLI (`CommandInterface`)**:
   - Sincronizar em `c2f-dev-scripts/SKILL.md` o contrato canônico de `Conn2Flow\Cli\Contracts\CommandInterface` e `BaseProcessCommand`.
5. **Testes Automatizados**:
   - Adicionar teste unitário em `vscode-extension/test/` validando o `readVersion` contra `InstallerGuard.php` e rodar `npm test`.

Aguardando o Agente Executor renderizar a Live Todo List e iniciar a implementação.
