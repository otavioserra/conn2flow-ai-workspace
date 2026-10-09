# Memory Mechanics & Lifecycle

MDD (Memory Driven Development) organiza memória persistente em quatro camadas. Uma especificação continua normativa; o contexto verificável permite aplicar o contrato vigente sem repetir toda a história.

| Camada | Conteúdo | Localização |
| --- | --- | --- |
| Episódica | Requisições, execução, validações, handoffs, sessões e relatos datados | human-requests/, implementation/, validation/, handoffs/, sessions/, reports/ |
| Semântica / normativa | Arquitetura, SPEC, decisões, política e contratos aprovados | documentos raiz, decisions/, change-requests/ |
| Procedural | Procedimentos reutilizáveis e armadilhas operacionais | .gemini/skills/; process/ como runbooks |
| Raw | Notas de trabalho, observações intermediárias e artefatos livres de modelos | raw/active/; raw/archive/ |

## Ciclo de vida

Captação na sessão → retenção ativa → poda preventiva → arquivamento dual.
Registre origem, data, estado e ligação com requisição/lote. Promova fatos confirmados para episódios; regras recorrentes aprovadas para skills ou contratos. Observações raw nunca têm autoridade normativa por si mesmas.

Na retenção, mantenha a janela ativa e os tetos da [política](02-policy.md). Para a memória de execução, planeje manutenção ao atingir 50 KiB; 75 KiB é alerta crítico. Preserve originais em raw/archive/ antes de reduzir o ativo. Nunca pode memória saudável só para fechar sessão.

No arquivamento dual, preserve bytes do original em archive/original/ e escreva síntese em archive/compacted/, com vínculo ao original, procedência e lacunas explícitas. Atualize os índices e repare links na mesma operação. Históricos legados já arquivados permanecem no lugar, indexados, até migração autorizada; não são reescritos em massa.

## Navegação e uso de contexto

Leia index.md primeiro. Escolha por ID, resumo e status; use compacted/ para varredura histórica e original/ para comprovar detalhes. Carregue documentos densos só quando a decisão depender deles. Memória desatualizada é marcada e corrigida com referência ao código, nunca tratada como fato atual.

Raw armazena notas e resultados observáveis úteis ao trabalho, sem credenciais, dados pessoais desnecessários ou transcrição de raciocínio privado. Registre somente sínteses de decisões e evidências compartilháveis. Fechada a frente, promova o sinal útil e arquive os artefatos permitidos.

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
