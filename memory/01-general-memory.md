# Memory Mechanics & Lifecycle

MDD (Memory Driven Development) organiza memória persistente em quatro camadas. Uma especificação continua normativa; o contexto verificável permite aplicar o contrato vigente sem repetir toda a história.

| Camada | Conteúdo | Localização |
| --- | --- | --- |
| Episódica | Requisições, execução, validações, handoffs, homologações, sessões e relatos datados | human-requests/, human-reviews/, implementation/, validation/, handoffs/, sessions/, reports/ |
| Semântica / normativa | Arquitetura, SPEC, decisões, política e contratos aprovados | documentos raiz, decisions/, change-requests/ |
| Procedural | Procedimentos reutilizáveis e armadilhas operacionais | .gemini/skills/; process/ como runbooks |
| Raw | Notas de trabalho, observações intermediárias e artefatos livres de modelos | raw/active/; raw/archive/ |

## Ciclo de vida

Captação na sessão → retenção ativa → poda preventiva → arquivamento dual.
Registre origem, data, estado e ligação com requisição/lote. Promova fatos confirmados para episódios; regras recorrentes aprovadas para skills ou contratos. Observações raw nunca têm autoridade normativa por si mesmas.

Na retenção, mantenha a janela ativa e os tetos da [política](02-policy.md). Em 50 KB ou 200 linhas em memória de execução, emita alerta e planeje destilação; a manutenção preserva originais antes de reduzir o ativo. Nunca pode memória saudável só para fechar sessão. O limiar legado de 75 KB / 300 linhas não autoriza exceder o teto ativo MDD de 50 KB.

No arquivamento dual, preserve bytes do original em archive/original/ e escreva síntese em archive/compacted/, com vínculo ao original, procedência e lacunas explícitas. Atualize os índices e repare links na mesma operação. Históricos legados já arquivados permanecem no lugar, indexados, até migração autorizada; não são reescritos em massa.

## Navegação e uso de contexto

Leia index.md primeiro. Escolha por ID, resumo e status; use compacted/ para varredura histórica e original/ para comprovar detalhes. Carregue documentos densos só quando a decisão depender deles. Memória desatualizada é marcada e corrigida com referência ao código, nunca tratada como fato atual.

Raw armazena notas e resultados observáveis úteis ao trabalho, sem credenciais, dados pessoais desnecessários ou transcrição de raciocínio privado. Registre somente sínteses de decisões e evidências compartilháveis. Fechada a frente, promova o sinal útil e arquive os artefatos permitidos.

## Trava Tripla MDD — ARCH-015 / REQ-072, 2026-10-09

Novos artefatos de governança começam com YAML frontmatter: id, title, status, date (YYYY-MM-DD), author (architect/executor/reviewer/human), target_repo, summary_short (30–140 caracteres) e summary_medium (duas ou três linhas). Use strings, sem objetos/âncoras; o formato e os comandos estão na [skill canônica](../.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md).

Os índices são derivados dos documentos. No core use `php cli/c2f.php memory:index [pasta] --repo=RAIZ`; no Client `mdd index [pasta] --path RAIZ`. Sem pasta, ambos regeneram todos os índices existentes em memory/. Arquivos legados usam título e primeiro parágrafo como fallback, sem reescrita. Mutações usam `memory:set <alvo> --campo=valor` ou `mdd meta set <alvo> <campo> <valor>`, com reconstrução imediata do índice local; get retorna metadados ou campo, com --json. Índices são substituídos; conteúdo editorial pertence aos documentos fonte.

memory/human-reviews/ é a inbox oficial de homologação: até dez rev-XXX.md ativos, além de README/index; archive/original/ preserva fichas integrais e archive/compacted/ mantém sínteses rastreáveis. O parecer independente é distinto da assinatura humana. Lotes prontos para revisão permanecem nesse estado até o evento real de homologação. A autonomia e a topologia determinam o próximo papel conforme a [política](02-policy.md).
