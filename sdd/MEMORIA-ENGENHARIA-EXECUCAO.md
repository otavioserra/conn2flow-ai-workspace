# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-048 — Tooltips Ricos, Curadoria de Documentações e Manual Dev Tools v2](implementation/batch-048.md)
>
> **Lote atual:** [BATCH-049 — Modernização dos Tetos de Memory Gardening](implementation/batch-049.md) `ready-for-review`; aguarda revisão do Humano-no-Loop.

>
> **Política**: manter somente fatos recentes e acionáveis; é proibido podar abaixo de 50 KB / 200 linhas. Emitir alerta preventivo nesse patamar, podar obrigatoriamente apenas ao atingir 75 KB / 300 linhas e mirar ~25 KB, preservando 20 a 25 tarefas e aprendizados recentes. Detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-09-02 — REQ-047 / BATCH-049:** gardening modernizado para bloqueio abaixo de 50 KB / 200 linhas, alerta nesse patamar, poda obrigatoria em 75 KB / 300 linhas e alvo de ~25 KB com 20 a 25 itens recentes. Propagacao oficial dos kits locais concluida; paridade SHA-256 confirmada entre cinco repositorios. Extensao: 84/84 testes; Core `ai:sync`: 36/36 skills. Nenhuma memoria foi podada, commit, push ou deploy executado.
- **2026-08-31 — BATCH-044:** implementado HubTaskWatcher na extensão, timeline de sessão compartilhada em `sdd/sessions/`, feedback visual de loading e botão 'Salvar e Executar Release'. Homologado com 53/53 testes.
- **2026-08-31 — REQ-043 / BATCH-045:** reorganização ergonômica da árvore no VS Code com emojis visuais coloridos, centralização de Controles Principais e ações de IA em SDD. Homologado com 54/54 testes em `review-045.md`.
- **2026-09-01 — REQ-044 / BATCH-046:** identificação obrigatória de repositório alvo nos prompts da extensão. Novo módulo puro `agentPromptPolicy.ts`, `AgentBridgeManager` com `{repo, root, sddRoot, currentPath, reqPath}` e link `[{request}]({currentPath})`. 66/66 testes verdes; `ready-for-review`.
- **2026-09-01 — REQ-045 / BATCH-047:** preflight de release do instalador corrigido com fontes de versão ordenadas (`PRODUCT_VERSION_SOURCES` / `resolveProductVersion` em `releasePolicy.ts`); scripts de versão do Core migrados para `InstallerGuard::VERSION`; Regra Anti-Deadlock de Sonda HTTP e contrato `CommandInterface` formalizados nas skills. 76/76 testes verdes; `ready-for-review`.
- **2026-09-01 — REQ-046 / BATCH-048:** tooltips ricos foram centralizados em `treeTooltipPolicy.ts` e `localizationCatalog.ts`; providers que importam `vscode` permanecem cobertos por teste de fonte, enquanto a lista pura de chaves é testada sobre `out/`. `Conn2FlowTreeItem` usa `MarkdownString` não confiável. `docs.marketplace` e `agents.selectMode` saíram de `docsConfig`; Manual Dev Tools v2 atualizado em PT-BR e EN. O gerador NLS preserva tooltips e templates `agents.*`. 79/79 testes verdes e VSIX com 69 arquivos; `ready-for-review`.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Particularidades do ambiente

- **A versão canônica do `gestor-instalador` vive em `gestor-instalador/src/InstallerGuard.php` (`const VERSION`).** O `index.php` apenas referencia `InstallerGuard::VERSION` e carrega a versão num comentário; qualquer leitor ou bump que procure literal no `index.php` falha silenciosamente. O literal só existe em instaladores v1, mantido como fallback.
- **`php cli/c2f.php ai:sync` valida contratos, não copia arquivos.** A propagação de skills entre os kits (`.claude`, `.cursor`, `.gemini`, `.github`, `.codex`, templates) é cópia de arquivo; o `ai:sync` só audita depois. No Core, `.claude/skills/*` é gitignored e não aparece no diff mesmo quando atualizado.
- **Testes da extensão não conseguem exigir (`require`) providers que importam `vscode`.** O padrão consolidado é extrair a lógica para um módulo puro em `vscode-extension/src/*Policy.ts` (testado sobre `out/`) e cobrir o provider por asserção de regex no fonte `.ts`, como em `hubTaskWatcher.test.cjs`.
- **`package.nls.json` / `package.nls.pt-br.json` são catálogos de manifesto**, não de runtime: só chaves referenciadas como `%chave%` no `package.json` têm efeito no VS Code. Strings de runtime vivem em `src/localizationCatalog.ts`. A partir da REQ-044, os dois templates de prompt de agente estão espelhados nos três arquivos, com teste de sincronismo byte a byte.

## Pendência imediata

- Lotes BATCH-043 a BATCH-046 concluídos. BATCH-047 implementado e aguardando homologação visual do formulário de release do instalador (VSIX regenerado) e revisão técnica.
- `sdd/validation/VALIDATION-CHECKLIST.md` (~62 KB) e `BATCH-INDEX.md` (17 lotes ativos) estão acima do teto de 10 itens da `MEMORIA-ENGENHARIA-CHEFIA.md` §4. Arquivamento não solicitado até aqui; depende de tarefa explícita do Arquiteto.





