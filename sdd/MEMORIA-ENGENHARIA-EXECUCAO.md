# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Lote concluído:** [BATCH-007 — Backlog de Ideias, Intake Gate e Gemini Kit](implementation/batch-007-backlog-governance.md)
>
> **Política**: manter 3 a 5 tarefas recentes, abaixo de 10 KB/50 linhas. A memória de Chefia é somente leitura.

## Atividades recentes

- **2026-07-30 — BATCH-007:** criados backlog bilíngue e Intake Gate; itens de `sdd/backlog/` são não executáveis até promoção humana para `human-requests`, atualização de `CURRENT.md` e associação a batch.
- **2026-07-30 — Gemini Kit:** adicionados `GEMINI.md`, `.gemini/settings.json`, `.geminiignore` e `.aiexclude`, com instaladores PowerShell/Bash e provisionamento não destrutivo do backlog.
- **2026-07-30 — Rollout:** Core, Lumix, Transforma MP e Site receberam Gemini Kit e backlog sem sobrescrita do SDD existente.
- **2026-07-30 — BATCH-006:** criado o protocolo de Memory Gardening, com gatilho preventivo em 10 KB/40 linhas, teto de 15 KB/50 linhas e poda para aproximadamente 5 KB.
- **2026-07-30 — Cursor Kit:** templates e instaladores PT-BR/EN validados com preservação, `Force`, prefixo, boilerplate e injeção não destrutiva dos archives. `.cursor/rules/sdd.mdc` é a regra principal; `.cursorrules` é compatibilidade legada.
- **2026-07-30 — Poda:** memórias finais ficaram entre 2,3 KB e 4,5 KB, preservando 4–5 tarefas recentes; detalhes antigos permanecem recuperáveis pelo Git.

## Aprendizados operacionais

- Git Bash sob o sandbox não conseguiu escrever em caminhos `/c/...`; a validação EN foi executada fora do sandbox, exclusivamente em `temp/batch-006-cursor-en`, e o diretório foi removido.
- Gemini CLI usa `.gemini/settings.json` para configuração de projeto e `.geminiignore` para filtrar contexto; `.aiexclude` foi mantido para compatibilidade com Gemini Code Assist.
- Ao designorar skills locais, reabra somente os diretórios novos necessários; `!.claude/skills/**` expõe configurações antigas que deveriam continuar locais.
- README/CURRENT/REQ-003/REQ-004 já continham alterações staged do usuário; as edições do executor foram mantidas no worktree sem alterar o staging existente.

## Pendências

- O aceite visual do acionamento automático da regra no Cursor deve ser confirmado pelo humano ao abrir um arquivo em `sdd/`; a estrutura e o frontmatter foram validados localmente.
