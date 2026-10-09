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
| human-reviews/ | Inbox de homologação humana; até 10 rev-XXX.md ativos, com parecer independente e assinatura humana |
| implementation/ | Live Todo, entregas e evidências; até 10 lotes ativos |
| reports/ | Auditorias, spikes e diagnósticos; até 10 relatórios ativos |
| proxies/ | Referências de contexto externo com origem e autoridade explícitas |
| sessions/ | Resumos de sessão e pendências rastreáveis |
| validation/ | Checklist técnico, resultados e pareceres; janela de 10 lotes correntes |
| process/ | Runbooks e entrada da Tríade |
| raw/ | Artefatos intermediários; active/ e archive/, sem autoridade normativa |

Cada pasta ativa e nó de arquivo possui index.md com ID, Título, Resumo Executivo em uma linha, Link Relativo e Status. archive/compacted/ mantém sínteses; archive/original/ preserva conteúdo integral. Particione em archive-1/, archive-2/ quando centenas de itens dificultarem a navegação, mantendo índices em cada nó. Não mova arquivos antigos sem autorização e reparo de referências.

## Regra dos 10 e limites

human-requests/, human-reviews/, implementation/, decisions/ e reports/ mantêm até 10 itens ativos; índices, README e ponteiros são infraestrutura, não itens. DECISION-LOG, BATCH-INDEX e VALIDATION-CHECKLIST mostram até 10 itens correntes, com história acessível por índice. Arquive o excedente mais antigo preservando documentos e links. Em human-reviews/, arquive fichas homologadas antigas em archive/original/ com síntese em archive/compacted/; não descarte revisões ainda pendentes para satisfazer o teto.

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

## Trava Tripla e handoffs — ARCH-015 / REQ-072, 2026-10-09

1. Artefatos novos têm frontmatter canônico com id, title, status, date, author, target_repo, summary_short e summary_medium. index.md é derivado, regenerável com fallback legado tolerante, e não fonte normativa. A [skill #45](../.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md) define o formato escalar e a API PHP/Python.
2. Handoffs são disparados por eventos verificáveis: testes concluídos, recibo emitido, parecer produzido. Todos incluem projeto, raiz absoluta, REQ, BATCH, topologia, autonomia, escopo, evidências, pendências e próximo comando.
3. O Revisor deposita rev-XXX.md em human-reviews/ com resumo executivo, auditoria de segurança/variáveis/regressão, testes, parecer RECOMMEND-APPROVAL ou RECOMMEND-REVISION e `[ ] Homologado por: _____`. Homologação é assinatura humana identificada; Executor e Revisor não a simulam.

| Topologia | Evento após implementação e validação |
| --- | --- |
| solo | Executor realiza auto-revisão contra checklist e entrega para revisão humana |
| dupla | Executor entrega resumo, lote e comando de continuidade diretamente ao Macro-Arquiteto |
| triade | Executor emite completions/<batch-id>-receipt.json e aciona Revisor Independente, que prepara a ficha em human-reviews/ |

| Autonomia | Aplicação a qualquer topologia |
| --- | --- |
| supervisionado | Aguarda input humano explícito antes de toda transição de papel; prepara prompt com próximo agente e raiz absoluta |
| autonomo_monitorado | Aciona o próximo papel autorizado, registra recibo/evidências e mantém Live Todo visível |
| autonomo_headless | Despacha pelo mecanismo disponível e persiste recibos; para diante de contrato ou autorização ausente |

Se o MCP Hub estiver indisponível, registre a limitação e use recibo persistente local, sem alegar despacho remoto. Os CLIs cooperam pelo lock memory/.mdd.lock e recusam caminhos externos ou links. Cada arquivo é substituído atomicamente; falha de índice restaura o documento. Crash entre substituições requer reconstrução do índice. Não remova lock de outro processo. Nenhuma combinação da matriz autoriza produção ou homologação fictícia.
