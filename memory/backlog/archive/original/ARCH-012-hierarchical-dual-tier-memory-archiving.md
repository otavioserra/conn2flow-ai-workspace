# ARCH-012: Sistema Hierárquico de `index.md` e Compactação Dual de Memória (Compacted vs Original)

- **Tipo**: Arquitetura / Otimização de Contexto
- **Status**: `PROMOTED` (promovido para `REQ-067` / `BATCH-069` em 2026-10-09)
- **Origem**: Humano-no-Loop (Engenheiro Chefe)
- **Lote Relacionado**: `BATCH-069`
- **Data de Criação**: 2026-10-09

---

## 🎯 Contexto & Motivação

Conforme o histórico do projeto cresce, varrer pastas inteiras de governança satura rapidamente a janela de contexto (context window) dos modelos de IA, degradando raciocínio e aumentando o custo computacional.

Para resolver isso de forma perene em **todas** as pastas de `memory/`, este item estabelece a arquitetura de indexação rasa e arquivamento em camadas dual.

---

## 📋 Escopo da Mudança

1. **Padrão `index.md` por Pasta**:
   - Cada pasta de `memory/` (e cada nó de arquivo) possui um `index.md` contendo um resumo de uma única linha para cada artefato e seu link relativo direto.
   - Os agentes leem primeiro o índice (< 5 KB), localizam exatamente o que precisam e só puxam para o contexto o arquivo específico.
2. **Arquitetura Dual-Tier de Arquivamento**:
   - Dentro de cada `archive/`, divide-se em:
     - `compacted/`: resumos executivos consolidados para consulta rápida de agentes atuais.
     - `original/`: arquivos originais preservados na íntegra, sem perda de fidelidade, para auditoria forense por modelos futuros de maior capacidade.
3. **Estrutura em Árvore Hierárquica (`archive-1/`, `archive-2/`, etc.)**:
   - À medida que uma partição atinge centenas de itens, o sistema particiona hierarquicamente em subpastas numeradas com índices internos.
4. **Implantação Inicial (Fase Zero)**:
   - Na `REQ-067`, a infraestrutura de pastas e `index.md` é provisionada limpa na raiz de cada pasta de `memory/`, pronta para ingestão futura automatizada.
