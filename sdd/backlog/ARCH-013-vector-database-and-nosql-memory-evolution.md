# ARCH-013: Evolução para Banco de Dados Vetorial & NoSQL para Codebases de Hiperescala

- **Tipo**: Arquitetura / Pesquisa & Futuro
- **Status**: `ICEBOX` (estágio futuro após consolidação do MDD Client/Hub)
- **Origem**: Humano-no-Loop (Engenheiro Chefe)
- **Data de Criação**: 2026-10-09

---

## 🎯 Contexto & Motivação

O sistema de arquivos Markdown com particionamento em `index.md` e arquivamento dual atende com máxima eficácia a projetos de pequeno, médio e grande porte, com zero dependências externas e versionamento nativo via Git.

Para codebases de hiperescala (milhares de requisições, centenas de módulos e milhões de linhas de histórico), o sistema necessitará de um backend de recuperação semântica de alta velocidade baseado em embeddings e indexação vetorial.

---

## 📋 Diretrizes de Pesquisa

1. **Camada Vetorial Embutida**:
   - Avaliar `sqlite-vec`, `ChromaDB` ou `Qdrant Embedded` como mecanismo de indexação vetorial local sem exigir clusters externos pesados.
2. **Hibridismo Markdown + Vetores**:
   - Os arquivos Markdown continuam sendo a fonte canônica da verdade legível por humanos em disco.
   - O banco vetorial atua como cache e índice de busca semântica em tempo real para os agentes localizarem fragmentos exatos de memória com base no significado contextual do prompt.
3. **Busca Híbrida (Dense + Sparse / BM25)**:
   - Combinar busca por palavras-chave exatas (símbolos de código, nomes de classes, IDs de lotes) com busca semântica aproximada por embeddings.
