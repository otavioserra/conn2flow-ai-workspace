---
verified_at: 2afd000
sources:
  - ../../memory/00-baseline-architecture.md
  - ../../memory/01-general-memory.md
  - ../../memory/02-policy.md
---


# Especificação do framework MDD

[English](../en/MDD-FRAMEWORK-SPECIFICATION.md) · [Índice da documentação](README.md)

MDD acrescenta memória persistente e consultável de projeto à engenharia guiada por especificações. Este guia descreve a política de memória aprovada; não introduz novo contrato normativo. O [router da baseline](../../memory/00-baseline-architecture.md), a [mecânica](../../memory/01-general-memory.md) e a [política](../../memory/02-policy.md) governam a matriz.

## Quatro camadas de memória

| Camada | Finalidade | Localização | Autoridade |
| --- | --- | --- | --- |
| Episódica | Requisições, lotes, verificações, handoffs e relatos de sessão datados | human-requests/, implementation/, validation/, handoffs/, sessions/, reports/ | Evidência do ocorrido; não é requisito novo |
| Semântica / normativa | Arquitetura, especificações, decisões e políticas aprovadas | Documentos raiz, decisions/, change-requests/ | Requisitos aprovados; descrições técnicas seguem o código vigente |
| Procedural | Métodos reutilizáveis de engenharia e armadilhas operacionais | .gemini/skills/ e memory/process/ | Procedimentos de tarefa no escopo aprovado |
| Raw | Observações intermediárias, notas e artefatos compartilháveis | raw/active/ e raw/archive/ | Sem autoridade normativa |

Não armazene credenciais, dados pessoais desnecessários ou transcrições de raciocínio privado. Registre evidências compartilháveis e sínteses concisas de decisões. Uma observação raw vira episódio verificado somente após conferir a fonte; uma regra recorrente precisa de aprovação antes da promoção para skill ou contrato.

## Ciclo de vida e retenção

1. **Captação:** registre origem, data, estado e relação com requisição/lote.
2. **Retenção ativa:** mantenha o conjunto de trabalho pequeno e consulte por índices.
3. **Poda preventiva:** identifique limites antes de adicionar conteúdo; preserve originais antes de destilar ou dividir.
4. **Arquivamento dual:** armazene original e síntese, atualize índices e repare referências na mesma operação.

Encerrar uma sessão não justifica podar memória saudável. Código, schemas e configuração vigente prevalecem sobre descrições históricas de comportamento; especificações aprovadas governam os requisitos pretendidos. Relate contradições em vez de reescrever silenciosamente um contrato.

## Regra dos 10 Ativos

As raízes ativas de **human-requests/, implementation/, decisions/ e reports/** mantêm no máximo **10 itens cada**. Índices, READMEs e ponteiros são infraestrutura e não contam como itens. DECISION-LOG, BATCH-INDEX e VALIDATION-CHECKLIST apresentam até 10 entradas correntes; registros históricos continuam acessíveis por índices.

Arquive os itens elegíveis excedentes mais antigos mantendo suas referências. Não mova uma dependência ativa somente porque seu arquivo tem o menor número. Arquivos legados permanecem indexados até migração autorizada; a política não autoriza reescrita histórica em massa.

## Teto preventivo de 50 KB

Documentos ativos ficam abaixo de **50 × 1024 = 51.200 bytes**. O router da baseline fica abaixo de **30 KB**. A memória de execução também alerta em **200 linhas**. Ao atingir o teto, preserve o original e destile ou divida em nós indexados antes de ampliar o documento ativo.

O limiar histórico de gardening de 75 KB / 300 linhas não permite exceder o teto ativo MDD. Não reescreva memória saudável só para encerrar lote e não altere memória da Chefia sem autorização explícita.

## Árvore hierárquica de índices

```text
memory/
├── index.md
├── 00-baseline-architecture.md
├── 01-general-memory.md
├── 02-policy.md
├── implementation/
│   ├── index.md
│   ├── batch-YYY.md
│   └── archive/
│       ├── index.md
│       ├── compacted/index.md
│       └── original/index.md
└── raw/
    ├── index.md
    ├── active/index.md
    └── archive/
        ├── index.md
        ├── compacted/index.md
        └── original/index.md
```

Cada pasta ativa e nó de arquivo possui índice com **ID, Título, Resumo Executivo em uma linha, Link Relativo e Status**. Comece pelo [índice raiz](../../memory/index.md), depois leia o índice da área pertinente. Use sínteses para varredura histórica e originais para conferir detalhes. Particione arquivos grandes em archive-1/, archive-2/ com índice em cada nó quando centenas de entradas dificultarem a navegação.

## Arquivo dual e integridade de links

| Destino | Conteúdo obrigatório | Uso |
| --- | --- | --- |
| archive/original/ | Bytes originais e evidência integral | Verificação e rastreabilidade |
| archive/compacted/ | Síntese com procedência, link ao original e lacunas explícitas | Consulta econômica de contexto |

Compactação não é exclusão. Uma síntese distingue fatos confirmados, comportamentos obsoletos e questões abertas. Repare links do CURRENT, índices, registros de lote/checklist e decisões sempre que um arquivo mudar de lugar. História legada pode coexistir com arquivos duais; não indique que todo artefato histórico já foi convertido.

## Ciclo dos agentes e escopo

O Arquiteto prepara o contrato aprovado e o aceite; o Executor lê CURRENT, implementa, verifica e registra a Live Todo List; o Revisor emite findings independentes antes da consolidação. O humano direciona e aprova. Consulte o [guia da tríade](ARQUITETURA-AGENTE-DUPLO.md).

A matriz usa memory/. Boilerplates existentes e descoberta dos satélites ainda suportam sdd/; a frente separada de migração valida cada repositório. Uma implementação futura de mdd compact precisa ser conferida contra estes requisitos antes de ser descrita como conforme.
