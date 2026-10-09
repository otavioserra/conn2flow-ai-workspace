# Governança SDD de [NOME-DO-PROJETO]

Este diretório define a governança local de Memory-Driven Development do projeto.

## Ordem normativa mínima

1. `memory/README.md`
2. `memory/00-baseline-architecture.md`
3. `memory/SPEC.md`
4. `memory/process/00-START-HERE.md`
5. `memory/process/01-WORKFLOW.md`
6. `memory/implementation/BATCH-INDEX.md`
7. `memory/validation/VALIDATION-CHECKLIST.md`
8. `memory/decisions/DECISION-LOG.md`

## Regras de ouro

- `memory/human-requests/` é intake humano não normativo.
- O executor pode atualizar artefatos operacionais como `implementation/` e `validation/`.
- Mudanças normativas devem ser consolidadas em `SPEC.md`, no baseline ou em outros SDD numerados só quando o requisito realmente mudar.
- Cada rodada deve perseguir o menor batch plausível e a menor validação capaz de falsificar o slice atual.

## Estado inicial

- `BATCH-000`: boilerplate SDD instalado.
- `BATCH-001`: primeiro batch funcional aguardando classificação.
- Ponteiro ativo: `memory/human-requests/CURRENT.md`.

## Cinco documentos raiz canônicos

| Arquivo | Finalidade |
| --- | --- |
| [00-baseline-architecture.md](00-baseline-architecture.md) | Arquitetura e roteamento de contexto |
| [01-general-memory.md](01-general-memory.md) | Mecânica e ciclo de vida da memória |
| [02-policy.md](02-policy.md) | Governança e política dos agentes |
| [03-memory-engineering-chief.md](03-memory-engineering-chief.md) | Diretrizes e diário estratégico da Chefia |
| [04-memory-engineering-execution.md](04-memory-engineering-execution.md) | Sessões de execução e aprendizados técnicos datados |

A numeração padroniza os nomes; o histórico pode permanecer multilíngue. SPEC.md e index.md são infraestrutura de apoio.

## Observações raw e arquivo da execução

Use [raw/active/](raw/active/index.md) para scratchpads temporários, logs observáveis e sínteses compartilháveis de decisões, sem segredos ou transcrições de raciocínio privado. Observações raw não têm autoridade normativa.

A memória de execução tem teto preventivo de 50 KiB e alerta crítico em 75 KiB. Planeje manutenção em 50 KiB; nunca pode memória saudável apenas para fechar sessão. Quando a manutenção autorizada for necessária, preserve o original integral em [raw/archive/original/](raw/archive/original/index.md) e uma síntese rastreável em [raw/archive/compacted/](raw/archive/compacted/index.md) antes de reduzir o ativo a cerca de 25 KiB, com os 20–25 registros mais recentes e todas as pendências. Repare links e atualize os índices hierárquicos na mesma operação.