# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-049 — Modernização dos Tetos de Memory Gardening](implementation/batch-049.md)
>
> **Lotes atuais:** [BATCH-050](implementation/batch-050.md), [BATCH-051](implementation/batch-051.md) e [BATCH-052](implementation/batch-052.md) `ready-for-review`; aguardam revisão do Humano-no-Loop.

>
> **Política**: manter somente fatos recentes e acionáveis; é proibido podar abaixo de 50 KB / 200 linhas. Emitir alerta preventivo nesse patamar, podar obrigatoriamente apenas ao atingir 75 KB / 300 linhas e mirar ~25 KB, preservando 20 a 25 tarefas e aprendizados recentes. Detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-09-02 — REQ-048 a REQ-050 / BATCH-050 a BATCH-052:** entregues em sequencia no mesmo turno. (1) Novo comando `c2f ai:archive-sdd` no Core aplica a Regra dos 10 Ativos e reescreve links; faxina nos 5 repositorios arquivou 295 arquivos, reescreveu 321 links e derrubou os orfaos de 218 para 7. (2) Extensao passou a persistir escopo, projeto alvo, topologia e autonomia em `settings.json`, com o prompt do executor refletindo a topologia ativa. (3) Core ganhou `SshRemoteTransport`, `assets:publish --project` com rsync para a VM e `css:rebuild` remoto. Validacao: extensao 98/98, PHPUnit 1113/1113, Vitest 408/408, `ai:sync` 36/36. Nenhum commit, push, deploy, release ou comando remoto.

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

- **O vocabulario dos artefatos SDD e o dos tipos internos divergem, e isso quebra parser em silencio.** `CURRENT.md` e os `req-XXX.md` escrevem `` `dupla` ``; o tipo TypeScript da extensao e `'duplo' | 'triade'`. Ate a REQ-049 o `ModesManager` so aceitava a forma interna, entao TODA leitura de topologia caia no padrao `triade` e a selecao do painel era ignorada mesmo dentro da mesma sessao. Ao normalizar valor vindo de documento humano, aceite aliases e escreva de volta no vocabulario do documento.
- **`CURRENT.md` nao e um ponteiro em todos os repositorios.** No Core ele carrega uma lista de 79 intakes ativos/planejados. Qualquer heuristica que trate "referenciado no CURRENT.md" como "protegido" torna a pasta inteira inarquivavel; a leitura util e so das linhas de ponteiro (`Ponteiro Ativo`, `Lote Relacionado`, `Lote Anterior`).
- **Arquivar SDD a mao deixa rastro de link quebrado.** Havia 218 links relativos orfaos somados nos 5 repositorios, quase todos de arquivos movidos para `archive/` sem ajustar o caminho. Use `c2f ai:archive-sdd --repair-links`; ele reancora por irmao em `archive/`, por pasta ancestral e removendo `../` sobrando, e reporta o que nao conseguiu resolver em vez de adivinhar.
- **A etapa 8/8 do `project:update-all` rodava sem o id do projeto.** Ela lia o `PUBLIC_PATH` do `.env` do CORE e publicaria o `dist/` de um projeto no DocumentRoot de outro site. Corrigido na REQ-050; ao adicionar etapa ao pipeline, confira se o alvo e declarado explicitamente — repassar o `$input` do comando pai faz a opcao cair no default.
- **Existe biblioteca de transporte SSH endurecida em `ai-workspace/en/scripts/lib/project-transport.sh`.** A contraparte PHP e `cli/src/Support/SshRemoteTransport.php`. Ambas recusam caminho remoto relativo ou `/`, citam o comando remoto argumento a argumento e usam BatchMode. Nao escreva `ssh`/`rsync` a mao em comando novo.

- **A versão canônica do `gestor-instalador` vive em `gestor-instalador/src/InstallerGuard.php` (`const VERSION`).** O `index.php` apenas referencia `InstallerGuard::VERSION` e carrega a versão num comentário; qualquer leitor ou bump que procure literal no `index.php` falha silenciosamente. O literal só existe em instaladores v1, mantido como fallback.
- **`php cli/c2f.php ai:sync` valida contratos, não copia arquivos.** A propagação de skills entre os kits (`.claude`, `.cursor`, `.gemini`, `.github`, `.codex`, templates) é cópia de arquivo; o `ai:sync` só audita depois. No Core, `.claude/skills/*` é gitignored e não aparece no diff mesmo quando atualizado.
- **Testes da extensão não conseguem exigir (`require`) providers que importam `vscode`.** O padrão consolidado é extrair a lógica para um módulo puro em `vscode-extension/src/*Policy.ts` (testado sobre `out/`) e cobrir o provider por asserção de regex no fonte `.ts`, como em `hubTaskWatcher.test.cjs`.
- **`package.nls.json` / `package.nls.pt-br.json` são catálogos de manifesto**, não de runtime: só chaves referenciadas como `%chave%` no `package.json` têm efeito no VS Code. Strings de runtime vivem em `src/localizationCatalog.ts`. A partir da REQ-044, os dois templates de prompt de agente estão espelhados nos três arquivos, com teste de sincronismo byte a byte.

## Pendência imediata

- BATCH-050 a BATCH-052 `ready-for-review`. Faltam do lado humano: homologação visual da persistência em `settings.json` (janela aberta, recarregar, conferir), preenchimento de `ssh_public_path` nos projetos `deploy_mode: "ssh"` e decisão sobre os 7 links órfãos que apontam para arquivos que nunca existiram.
- A Regra dos 10 Ativos já está aplicada nas raízes de `human-requests/` e `implementation/` dos 5 repositórios. `VALIDATION-CHECKLIST.md` e `BATCH-INDEX.md` seguem com histórico consolidado por tabela.





