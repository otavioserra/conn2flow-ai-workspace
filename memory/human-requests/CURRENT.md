# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-080.md](req-080.md) (Saneamento Visual de Choques por Projeto, Editor Isolado de Dados do Projeto no `environment.json`, Exclusão e Cadastro Pré-Preenchido de Projetos e Release `v1.1.7` do VSIX)
* **Status**: `HOMOLOGATED` pelo Operador Humano em 2026-11-18 (extensão `conn2flow-tools@1.1.7`, `145/145` testes PASS, pronta para upload manual no VS Code Marketplace)
* **Lote Relacionado**: `BATCH-082` ([batch-082.md](../implementation/batch-082.md))
* **Topologia de Agentes**: `dupla` (Macro-Arquiteto planeja ➔ Executor implementa, instala o VSIX local e itera diretamente com o Humano ➔ Retorno ao Macro-Arquiteto para release final)
* **Nível de Autonomia**: `supervisionado` / iterativo com o operador
* **Data de Entrada**: 2026-11-18
* **Frentes Anteriores Concluídas Aguardando Homologação Final Unificada**:
  - [req-079.md](req-079.md) / [BATCH-081](../implementation/batch-081.md): Motor de Banco de Dados MDD (`SQLite3 + FTS5` Local e Multi-Driver SQL) no `mdd-client` (`ready-for-review`).
  - [req-078.md](req-078.md) / [BATCH-080](../implementation/batch-080.md): Internacionalização das 46 skills e detecção de drift por SHA-256; [REV-080](../human-reviews/rev-080.md) `RECOMMEND-APPROVAL`.
  - [req-077.md](req-077.md) / [BATCH-079](../implementation/batch-079.md): Governança de pipelines, worktrees e DEC-136; [REV-079](../human-reviews/rev-079.md) `RECOMMEND-APPROVAL`.
* **Entregas Anteriores com Homologação Visual Pendente na Fila Humana**:
  - [BATCH-077](../implementation/batch-077.md), revisão [REV-077](../human-reviews/rev-077.md) (`RECOMMEND-APPROVAL`).
  - [BATCH-076](../implementation/batch-076.md), revisão [REV-076](../human-reviews/rev-076.md) (`RECOMMEND-APPROVAL`).
* **Frentes Homologadas no Ciclo**:
  - [req-076.md](req-076.md) (`BATCH-078`, Limpeza Geral do Ecossistema, Memory Gardening Global, Poda de Worktrees e Sincronização Canônica de Todos os Repositórios)
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## Objetivo operacional — REQ-080 / BATCH-082

1. **Saneamento de "Choques de Entregas" na Aba Projetos e Ambientes de Testes**: Remover a listagem poluída de todos os projetos com ícone `warning` (`!`) em `conn2flowTreeProvider.ts`; exibir apenas 1 item para o `{target}` ativo (`Choques de entregas: {target}`, ícone neutro `diff` ou `git-compare`) e 1 item seletor (`Choques de entregas (Selecionar Projeto...)`).
2. **Novo Editor Isolado de Dados do Projeto (`Scoped Project Config Editor`)**: Criar as ações **Editar Dados do Projeto: {target}** e **Editar Dados de Projeto (Selecionar...)** na aba Projetos e Ambientes de Testes, abrindo um JSON provisório contendo exclusivamente o nó `devProjects[projectId]` do `environment.json` (sem expor outros projetos nem chaves globais) e sincronizando automaticamente de volta ao `environment.json` ao salvar (`Ctrl+S`).
3. **Compilação, Testes e Instalação Local Imediata do VSIX**: Compilar (`npm run compile`), validar testes (`npm test`), empacotar (`npx @vscode/vsce package`) e instalar diretamente no VS Code local (`code --install-extension <arquivo.vsix> --force`).
4. **Ciclo Iterativo com o Operador Humano**: Permanecer à disposição nesta mesma requisição para aplicar e reinstalar imediatamente quaisquer ajustes adicionais solicitados pelo operador durante os testes práticos.
