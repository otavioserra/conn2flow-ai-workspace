# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Lote concluído:** [BATCH-006 — Memory Gardening e Cursor Kit](implementation/batch-006-memory-gardening-cursor-kit.md)
>
> **Política**: manter 3 a 5 tarefas recentes, abaixo de 10 KB/50 linhas. A memória de Chefia é somente leitura.

## Atividades recentes

- **2026-07-30 — BATCH-006:** criado o protocolo de Memory Gardening, com gatilho preventivo em 10 KB/40 linhas, teto de 15 KB/50 linhas e poda para aproximadamente 5 KB.
- **2026-07-30 — Cursor Kit:** templates e instaladores PT-BR/EN validados com preservação, `Force`, prefixo, boilerplate e injeção não destrutiva dos archives. `.cursor/rules/sdd.mdc` é a regra principal; `.cursorrules` é compatibilidade legada.
- **2026-07-30 — Rollout:** `conn2flow`, `lumix`, `transformamp` e `conn2flow-site` receberam regras do Cursor e skills duplicadas em `.claude/skills/` e `.cursor/skills/`.
- **2026-07-30 — Poda:** memórias finais ficaram entre 2,3 KB e 4,5 KB, preservando 4–5 tarefas recentes; detalhes antigos permanecem recuperáveis pelo Git.
- **2026-06-10 — BATCH-002:** criada a estrutura `archive/README.md`, política de 10 itens e sequência pública de batches.

## Aprendizados operacionais

- Git Bash sob o sandbox não conseguiu escrever em caminhos `/c/...`; a validação EN foi executada fora do sandbox, exclusivamente em `temp/batch-006-cursor-en`, e o diretório foi removido.
- Ao designorar skills locais, reabra somente os diretórios novos necessários; `!.claude/skills/**` expõe configurações antigas que deveriam continuar locais.
- README/CURRENT/REQ-003 já continham alterações staged do usuário; as edições do executor foram mantidas no worktree sem alterar o staging existente.

## Pendências

- O aceite visual do acionamento automático da regra no Cursor deve ser confirmado pelo humano ao abrir um arquivo em `sdd/`; a estrutura e o frontmatter foram validados localmente.
