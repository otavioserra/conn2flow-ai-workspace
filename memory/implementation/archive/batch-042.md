# REGISTRO DE IMPLEMENTAÇÃO BATCH-042 / REQ-040

* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-08-31
* **Executor**: OpenAI Codex / Antigravity Executor
* **Revisor**: Revisor Técnico / Humano-no-Loop
* **Repositórios Alvo**: `conn2flow-ai-workspace` + `conn2flow`
* **Autonomia**: `supervisionado`

---

## Objetivo operacional

Padronizar e propagar globalmente a regra inviolável de **Identificação Mandatória de Repositório e Caminho Absoluto nos Prompts de Handoffs de Agentes** em todo o ecossistema Conn2Flow: no repositório Core (`conn2flow`), nos arquivos normativos de governança (`AGENTS.md`, `GEMINI.md`), na skill canônica `sdd-workflow` (com sincronização via `c2f ai:sync` para todas as 36 skills nas pastas `.gemini/`, `.codex/`, `.claude/`, `.github/`, `.cursor/`) e nos templates de projetos satélites.

## Live Todo List

- [x] Ler briefing em `sdd/handoffs/CURRENT-HANDOFF.md` e `sdd/human-requests/req-040.md`.
- [x] Atualizar `conn2flow/AGENTS.md` adicionando a Regra Inviolável 7 de Identificação de Repositório.
- [x] Atualizar `conn2flow/GEMINI.md` adicionando a Regra Inviolável 6 de Identificação de Repositório.
- [x] Atualizar templates de `AGENTS.md` e `GEMINI.md` em `templates/pt-br/` e `templates/en/`.
- [x] Atualizar skill canônica `sdd-workflow/SKILL.md` adicionando a regra de identificação obrigatória de repositório nos handoffs.
- [x] Propagar `sdd-workflow/SKILL.md` para todos os diretórios de agentes no workspace e Core.
- [x] Executar `php cli/c2f.php ai:sync` no repositório Core para validar conformidade dos contratos das 36 skills.
- [x] Executar `npm test` em `vscode-extension/` garantindo 47/47 testes passando.
- [x] Atualizar `sdd/handoffs/CURRENT-HANDOFF.md` e `sdd/human-requests/CURRENT.md` para `READY_FOR_REVIEW`.

## Resultado implementado

1. **Repositório Core (`conn2flow`)**:
   - `conn2flow/AGENTS.md`: Adicionada Regra Inviolável 7 formalizando a identificação explícita de repositório e caminho raiz absoluto nos handoffs.
   - `conn2flow/GEMINI.md`: Adicionada Regra Inviolável 6 formalizando a inclusão do identificador e raiz absoluta em mensagens para executores/revisores.
2. **Skill Canônica `sdd-workflow`**:
   - `sdd-workflow/SKILL.md`: Incluída regra 3 sob Concorrência e Reserva Atômica estabelecendo o bloco canônico de cabeçalho nos handoffs (`Projeto`, `Caminho Raiz`, `Requisição | Batch`).
   - Sincronizada em todos os provedores suportados (`.claude/`, `.cursor/`, `.gemini/`, `.github/`, `.codex/`) em ambos os repositórios e em todos os templates (`pt-br` e `en`).
3. **Templates de Novos Projetos Satélites**:
   - `templates/pt-br/templates/spec-driven-project-codex-kit/AGENTS.md` e `templates/en/.../AGENTS.md` atualizados.
   - `templates/pt-br/templates/spec-driven-project-gemini-kit/GEMINI.md` e `templates/en/.../GEMINI.md` atualizados.
4. **Validação de Conformidade**:
   - `php cli/c2f.php ai:sync` validou 36/36 skills com contratos 100% íntegros em todos os kits.
   - `npm test` em `vscode-extension/` confirmou 47/47 testes passando com 0 regressões.

## Evidências

- `php cli/c2f.php ai:sync`: PASS, 36/36 skills validadas em todos os 5 toolkits.
- `npm test` (vscode-extension): PASS, 47/47 testes unitários.
