# MDD Policy — Governance, Folders & Agent SLAs

Vigência: 2026-10-09, REQ-067 / BATCH-069. Nomes novos de pastas e arquivos estruturais em inglês; conteúdo pode ser multilíngue. IDs, contratos e nomes históricos preservam rastreabilidade.

## Pastas canônicas

| Pasta | Finalidade e regra |
| --- | --- |
| backlog/ | Ideias e épicos; não executáveis até promoção humana |
| change-requests/ | Alterações de contrato, impacto e autorização |
| decisions/ | Decisões normativas datadas; até 10 itens ativos |
| handoffs/ | Transferência com projeto, raiz absoluta, REQ, BATCH, estado e próximo passo |
| human-requests/ | Intake aprovado e CURRENT.md; até 10 requisições ativas |
| implementation/ | Live Todo, entregas e evidências; até 10 lotes ativos |
| reports/ | Auditorias, spikes e diagnósticos; até 10 relatórios ativos |
| proxies/ | Referências de contexto externo com origem e autoridade explícitas |
| sessions/ | Resumos de sessão e pendências rastreáveis |
| validation/ | Checklist técnico, resultados e pareceres; janela de 10 lotes correntes |
| process/ | Runbooks e entrada da Tríade |
| raw/ | Artefatos intermediários; active/ e archive/, sem autoridade normativa |

Cada pasta ativa e nó de arquivo possui index.md com ID, Título, Resumo Executivo em uma linha, Link Relativo e Status. archive/compacted/ mantém sínteses; archive/original/ preserva conteúdo integral. Particione em archive-1/, archive-2/ quando centenas de itens dificultarem a navegação, mantendo índices em cada nó. Não mova arquivos antigos sem autorização e reparo de referências.

## Regra dos 10 e limites

human-requests/, implementation/, decisions/ e reports/ mantêm até 10 itens ativos; índices, README e ponteiros são infraestrutura, não itens. DECISION-LOG, BATCH-INDEX e VALIDATION-CHECKLIST mostram até 10 itens correntes, com história acessível por índice. Arquive o excedente mais antigo preservando documentos e links.

Documentos ativos têm teto preventivo de 50 KB (50 × 1024 bytes); o router 00-baseline-architecture.md fica abaixo de 30 KB. Ao atingir o teto, preserve original e destile ou divida o documento em nós indexados antes de ampliar. Memória de execução também alerta em 200 linhas. Nunca reduza documento saudável por fim de sessão nem altere memória de Chefia sem autorização explícita.

## SLAs da Tríade MDD

| Papel | Entrega e momento | Restrição |
| --- | --- | --- |
| Arquiteto | Antes da execução: contrato, aprovação, escopo, aceite e autonomia; depois do parecer: homologação | Não implementa nem commita código de core/módulos |
| Executor | Na abertura: lê CURRENT e mostra Live Todo; a cada etapa: progresso; antes da entrega: testes, checklist, lote e recibo | Não inventa homologação, altera contrato fora do briefing nem executa produção sem autorização |
| Revisor | Antes da consolidação: findings por gravidade, evidências e parecer independente | Não atribui PASS a verificações não executadas |

Os SLAs são eventos do ciclo, sem duração numérica inventada. Dúvidas de contrato voltam ao Arquiteto; evidências faltantes ficam explícitas. Comunicação contínua e dados verificáveis sustentam monitored.

| Modo MDD | Alias atual | Operação |
| --- | --- | --- |
| supervised | supervisionado | Humano aprova consolidação; execução e testes no escopo aprovado |
| monitored | autonomo_monitorado | Executor progride com Live Todo visível, valida e registra resultados |
| headless | autonomo_headless | Execução assíncrona autorizada, com recibos e condições de parada |

Modo de autonomia não amplia o escopo nem autoriza produção. git add exige caminhos específicos; skills só são propagadas pelo scripts/skills/sync-skills.cjs. Pipelines de recursos executam sequencialmente, com locks e logs. Skills privadas dos satélites são preservadas integralmente.

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

A memória de execução tem teto preventivo de 50 KiB e alerta crítico em 75 KiB. Planeje manutenção em 50 KiB; nunca pode memória saudável apenas para fechar sessão. Quando a manutenção autorizada for necessária, preserve o original integral em [raw/archive/original/](raw/archive/original/index.md) e uma síntese rastreável em [raw/archive/compacted/](raw/archive/compacted/index.md) antes de reduzir o ativo a cerca de 25 KiB, com os 20–25 registros mais recentes e todas as pendências. Repare links e atualize os índices hierárquicos na mesma operação. Este lote somente renomeia os históricos existentes, sem poda.
