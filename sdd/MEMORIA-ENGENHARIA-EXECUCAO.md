# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-045 — Reorganização Ergonômica da Árvore Dev Tools (Controles Principais e Ações SDD)](implementation/batch-045.md)
>
> **Lote atual:** [BATCH-046 — Identificação Obrigatória de Repositório Alvo e Raiz nos Prompts de Agentes](implementation/batch-046.md) — `ready-for-review`, aguardando auditoria do Revisor Técnico.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-044:** implementado HubTaskWatcher na extensão, timeline de sessão compartilhada em `sdd/sessions/`, feedback visual de loading e botão 'Salvar e Executar Release'. Homologado com 53/53 testes.
- **2026-08-31 — REQ-043 / BATCH-045:** reorganização ergonômica da árvore no VS Code com emojis visuais coloridos, centralização de Controles Principais e ações de IA em SDD. Homologado com 54/54 testes em `review-045.md`.
- **2026-09-01 — REQ-044 / BATCH-046:** identificação obrigatória de repositório alvo nos prompts da extensão. Novo módulo puro `agentPromptPolicy.ts`, `AgentBridgeManager` com `{repo, root, sddRoot, currentPath, reqPath}` e link `[{request}]({currentPath})`. 66/66 testes verdes; `ready-for-review`.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Particularidades do ambiente

- **Testes da extensão não conseguem exigir (`require`) providers que importam `vscode`.** O padrão consolidado é extrair a lógica para um módulo puro em `vscode-extension/src/*Policy.ts` (testado sobre `out/`) e cobrir o provider por asserção de regex no fonte `.ts`, como em `hubTaskWatcher.test.cjs`.
- **`package.nls.json` / `package.nls.pt-br.json` são catálogos de manifesto**, não de runtime: só chaves referenciadas como `%chave%` no `package.json` têm efeito no VS Code. Strings de runtime vivem em `src/localizationCatalog.ts`. A partir da REQ-044, os dois templates de prompt de agente estão espelhados nos três arquivos, com teste de sincronismo byte a byte.

## Pendência imediata

- Lotes BATCH-043, BATCH-044 e BATCH-045 100% homologados e concluídos. BATCH-046 implementado e aguardando revisão técnica (`review-046.md`).






