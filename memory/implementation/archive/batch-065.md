# BATCH-065 — Integração do Chrome DevTools MCP Server

- Projeto: `conn2flow-ai-workspace`
- Raiz: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- Requisição: [REQ-063](../human-requests/req-063.md)
- Status: `ready-for-review`
- Executor: OpenAI Codex
- Data: 2026-10-01
- Autonomia: `supervisionado`

## Live Todo List

- [x] Configurar MCP na matriz, templates e 25 kits, preservando servidores existentes.
- [x] Criar e validar lançador headless/visível com perfil TEMP isolado e CDP loopback.
- [x] Analisar as 41 skills e enriquecer primárias e candidatas aplicáveis.
- [x] Propagar skills e auditar MD5 de 1.025 cópias e preservação das skills locais.
- [x] Executar `npm test` da extensão VS Code.
- [x] Registrar evidências, checklist, índice e recibo do executor.

## Escopo e premissas verificadas

A configuração canônica mantém exatamente `npx -y chrome-devtools-mcp@latest --allow-unrestricted-paths`. O lançador é auxiliar: para conectar à instância sandbox, acrescentar `--browser-url=http://127.0.0.1:9222` aos argumentos da sessão MCP. Sem esse argumento, o MCP cria seu próprio navegador; não conecta automaticamente à porta 9222.

O catálogo possui 41 skills. `c2f-quill-editor`, candidata citada na REQ-063, não existe na matriz nem nos templates; a checagem de toolbar/editor/input fica na skill primária de inspeção visual, sem inventar uma 42ª skill.

O host tem Node 20.14.0. O pacote npm observado, `chrome-devtools-mcp@1.10.1`, requer `^20.19.0 || ^22.12.0 || >=23`; a invocação direta rejeita o Node instalado. A validação do MCP usa Node 22 temporário via `npm exec`, sem alterar a instalação global. O cliente precisa de Node compatível no PATH para usar a configuração canônica.

Fontes verificadas: [servidor oficial](https://github.com/ChromeDevTools/chrome-devtools-mcp), [referência das ferramentas](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md), [configuração](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md) e CLI do pacote publicado. As ferramentas devem seguir o schema negociado pela versão instalada.

## Varredura crítica do catálogo (41/41)

Foram examinados os arquivos canônicos, seus gatilhos, seções e relação com inspeção de runtime. Sete skills receberam diretrizes; as 34 restantes mantêm seus contratos. A adição de escopo do Arquiteto à REQ-063 foi relida durante a execução e incorporada, sem alterar a SPEC.

| Skill analisada | Decisão e racional |
| --- | --- |
| `c2f-agent-visual-inspection` | Atualizada: navegação, snapshot de acessibilidade, screenshot, DOM/computed styles, modais, Quill, autenticação isolada e limites de avaliação JS. Corrigida afirmação antiga sobre leitura de HTML/CSS do disco: runtime usa SQL. |
| `c2f-architect-master` | Preservada: planejamento e fronteira normativa; não executa inspeção de telas. |
| `c2f-database-operations` | Preservada: SQL/migrações; rede do navegador não comprova persistência no banco. |
| `c2f-database-testing` | Preservada: isolamento de testes de banco permanece independente do MCP. |
| `c2f-dev-scripts` | Preservada: contratos CLI existentes; bootstrap específico fica no lançador e na skill de shell. |
| `c2f-docker-environment` | Preservada: MCP/Chrome rodam no host; não alteram contratos dos containers. |
| `c2f-documentation` | Preservada: compilação/publicação de docs; inspeção visual já encaminhada pela primária. |
| `c2f-documentation-governance` | Preservada: autoridade do código e auditoria documental continuam válidas. |
| `c2f-environment-configuration` | Preservada: sem novas credenciais, .env ou configuração PHP. |
| `c2f-executor-agent` | Preservada: transparência/execução SDD já cobrem registro de evidências. |
| `c2f-gd-image-safety` | Preservada: screenshots MCP não usam PHP GD. |
| `c2f-gestor-functions` | Preservada: contratos PHP; diagnóstico de browser não altera funções centrais. |
| `c2f-global-variables` | Preservada: estado PHP não é acessível diretamente pelo DOM. |
| `c2f-hooks-system` | Preservada: não registrar nem disparar novos hooks para inspeção. |
| `c2f-html-css-pages-and-components` | Preservada: autoria/pipeline; inspeção de layout fica na skill primária para evitar duplicação. |
| `c2f-interface-v2-architecture` | Atualizada: interação em dropdowns/abas/modais, foco, responsividade, Fomantic/Tailwind e rede. |
| `c2f-javascript-ajax` | Atualizada: console com detalhamento e traces, request IDs, headers/CSRF, status, envelope e liberação de loading. |
| `c2f-json-resources-sync` | Preservada: MCP não substitui compilação/checksums de recursos. |
| `c2f-modelo-templates` | Preservada: substituição/repetição no servidor; resultado inspecionado pela primária. |
| `c2f-module-crud-scaffolding` | Preservada: contratos CRUD não mudam com o novo instrumento. |
| `c2f-multilingual-system` | Preservada: inspeção não substitui segregação por idioma/rotas. |
| `c2f-mysql-utf8-emoji-encoding` | Preservada: encoding SQL não se resolve com inspeção do navegador. |
| `c2f-payment-gateways` | Preservada: preços, captura e idempotência do backend; AJAX novo proíbe replay financeiro incidental. |
| `c2f-plugin-architecture` | Preservada: integração MCP não é plugin instalável do Gestor. |
| `c2f-preview-modals-system` | Atualizada: overlay, clipping, reabertura, isolamento de iframe, CSP/cross-origin e rede. |
| `c2f-project-pipeline-and-tasks` | Preservada: compilação sequencial oficial continua obrigatória; MCP apenas observa o resultado. |
| `c2f-projects-system` | Preservada: configuração/deploy de tenants não muda. |
| `c2f-resources-system` | Preservada: Chrome não substitui autoria e sincronização SQL. |
| `c2f-reviewer-agent` | Atualizada: evidências de runtime sanitizadas, alcance do teste, esperado/observado e relatório de revisão. |
| `c2f-shell-and-windows-traps` | Atualizada: porta/perfil ocupados, PID proprietário, aspas, teardown e requisito de Node. |
| `c2f-system-tasks` | Preservada: lançador não configura cron/worker ou reinício automático. |
| `c2f-tailwind-css-architecture` | Atualizada: DOM/estilos computados, especificidade/contexto, diagnóstico de CSS inativo e correlação com css:audit/rebuild. |
| `c2f-variables-system` | Preservada: sem novos textos de produto; fixture de teste não pertence à interface do Gestor. |
| `c2f-widget-development` | Preservada: regras de múltiplas instâncias já existem; sua inspeção usa as duas primárias. |
| `continue-sdd-batch` | Preservada: releitura de delta aplicada neste lote. |
| `project-validation` | Preservada: exige evidências executadas; smoke MCP complementa testes existentes. |
| `raise-spec-change` | Preservada: sem mudança de contratos normativos. |
| `review-current-batch` | Preservada: revisão findings-first aplicada antes da entrega. |
| `sdd-memory-gardening` | Preservada: não acionada para encerrar lote. |
| `sdd-workflow` | Preservada: estados e fronteiras SDD existentes. |
| `start-sdd-slice` | Preservada: escopo autorizado mantido no BATCH-065. |

`c2f-quill-editor` foi procurada adicionalmente: ausente; suas verificações candidatas foram incorporadas à skill de inspeção visual. `get_css_styles` só deve ser usado quando exposto pelo servidor da sessão; a versão npm testada expõe 30 ferramentas, sem garantir todas as capacidades da documentação do branch main.

## Implementação e propagação

- `scripts/mcp/sync-devtools-kits.cjs`: propagação delimitada às sete skills e configuração do servidor, com pré-validação de JSON, mescla de servidores e auditoria MD5. Não usa instaladores globais que sobrescrevem outros contextos. Com `--apply` grava; sem a flag apenas audita e exige zero alterações planejadas.
- Gemini/Antigravity: `.gemini/mcp_config.json`; Claude: `.mcp.json`; Cursor: `.cursor/mcp.json`; Copilot/VS Code: `.vscode/mcp.json` (`servers`, `type: stdio`); Codex: `.codex/config.toml` (`mcp_servers.chrome-devtools`). A definição command/args é semanticamente idêntica nos 25 kits. Os servidores Hub existentes foram preservados.
- Templates PT-BR/EN: 14 diretórios de kit, incluindo os privados Claude/Copilot; 98 arquivos das skills atualizadas conferidos por MD5 e configurações MCP provisionadas conforme cada cliente.
- `.gitignore` da matriz recebeu exceções específicas para `.cursor/mcp.json` e `.vscode/mcp.json`, tornando as duas configurações revisáveis/versionáveis.
- A auditoria inicial revelou 15 divergências apenas de CRLF/LF nas três skills preservadas `c2f-database-operations`, `c2f-payment-gateways` e `c2f-project-pipeline-and-tasks` dos cinco kits do `conn2flow-site`. A igualdade textual após normalização foi comprovada antes de gravar os bytes canônicos; nenhuma instrução local foi descartada.
- Skills exclusivas dos satélites: **44 arquivos**, incluindo referências, preservados com SHA-256 antes/depois: `lumix=11`, `conn2flow-site=11`, `transformamp=22`. Zero arquivos locais alterados/removidos; zero diretórios excluídos.

## Evidências executadas

1. `node scripts/mcp/sync-devtools-kits.cjs --apply --report completions/BATCH-065-md5-audit.json`: **1.025/1.025 MD5**, 25 kits, 41 skills, 14 templates, zero divergências e zero mudanças locais.
2. `node scripts/mcp/sync-devtools-kits.cjs`: **PASS**, zero arquivos planejados; comprova idempotência e configuração coerente dos 25 kits/14 templates.
3. `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mcp/verify-devtools.ps1`: **exit 0**, Chrome **154.0.8037.58**, perfil TEMP isolado, CDP **127.0.0.1:9222**, recusa de porta ocupada e do mesmo perfil em outra porta. Sintaxe PowerShell validada; ramo `-Visible` testado por interceptação da criação de processo (Normal, sem headless), sem abrir janela para o operador. Chrome criado encerrado e porta liberada.
4. Smoke MCP real com **Node v22.23.3**, **chrome-devtools-mcp 1.10.1**, handshake e 30 ferramentas: página sintética HTTP loopback, navegação, snapshot, clique em UID, modal aberto, medição de DOM, screenshot, erro de console com stack trace e AJAX POST com HTTP **200**, CSRF de fixture e envelope JSON. Registro: [MCP smoke](../../completions/BATCH-065-mcp-smoke.json), [lançador](../../completions/BATCH-065-launcher-smoke.json), [screenshot](../../completions/BATCH-065-sandbox-smoke.png). Screenshot inspecionado: modal centralizado com overlay visível.
5. `npm test` em `vscode-extension/`: compilação TypeScript e **124/124 PASS**, 0 fail/skip/cancelled, exit **0**, 238.6059 ms na suíte. Os seis artefatos `out/` modificados pela normalização de EOL do build foram restaurados aos bytes anteriores; fontes da extensão não foram alteradas.
6. `node --check` dos scripts CJS e `git diff --check`: sem erros. Revisão do executor conforme `review-current-batch`: nenhuma falha funcional pendente no slice; requisito de Node do host identificado abaixo.

## Limite operacional e handoff

O teste de infraestrutura não homologa telas específicas nem rotas autenticadas do Gestor. Para ativar a configuração canônica no cliente, Node compatível precisa estar no PATH do processo MCP; **Node 20.14.0 atual não inicia o servidor**. A validação reproduzível usa Node 22 temporário; não houve atualização global de Node. Não foi alegada ativação/reload do cliente nesta sessão, cujo catálogo de ferramentas é fixo.

O MCP Hub não estava exposto como ferramenta nesta sessão; CLI local e recibo em disco foram usados. Não houve commit, push, deploy, publicação ou alteração de CURRENT/REQ/SPEC. O lote está implementado e validado para revisão independente; recibo: [BATCH-065-executor-receipt.json](../../completions/BATCH-065-executor-receipt.json).
