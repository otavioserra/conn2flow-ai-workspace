# REGISTRO DE IMPLEMENTAÇÃO BATCH-037 / REQ-035

* **Status**: `COMPLETED`
* **Data de Início**: 2026-08-29
* **Executor**: OpenAI Codex
* **Revisor**: Humano-no-Loop / Arquiteto
* **Repositório Alvo**: `conn2flow-ai-workspace`

---

## Objetivo operacional

Recuperar a documentação das mudanças posteriores ao BATCH-036 e estabilizar a experiência de preview Markdown da extensão Conn2Flow Dev Tools.

## Live Todo List

- [x] Auditar `CURRENT.md`, BATCH-036, checklist, handoff e Git.
- [x] Identificar os 14 commits posteriores ao BATCH-036.
- [x] Confirmar que fonte, VSIX e extensão instalada continham o último patch.
- [x] Inspecionar o contrato real do MPE 0.8.30 e a implementação do Custom Editor.
- [x] Criar REQ-035 e abrir BATCH-037 em modo supervisionado.
- [x] Substituir o fechamento global de Markdown por uma política restrita e testável.
- [x] Criar testes automatizados para a política de abas.
- [x] Compilar TypeScript.
- [x] Empacotar o VSIX.
- [x] Atualizar a extensão no VS Code local com destino e hashes validados.
- [x] Validar sequência de três documentos, foco e preservação de abas alheias.
- [x] Atualizar checklist, handoff e memória de execução com evidências finais.
- [x] Submeter o diff à revisão humana.

## Evidências da recuperação inicial

- `HEAD` inicial: `50a76c6`, sincronizado com `origin/main` e working tree limpo.
- Intervalo não documentado: `5b4f482..50a76c6`.
- Delta acumulado após BATCH-036: 44 arquivos, 2.516 inserções e 379 remoções.
- Hash SHA-256 de `out/extension.js` idêntico entre repositório e extensão instalada antes desta correção.
- O patch anterior fechava qualquer `TabInputText` cujo caminho contivesse `sdd`, `docs` ou terminasse em `.md`, sem preservar foco.
- O MPE 0.8.30 oferece Custom Editor `markdown-preview-enhanced` e modo nativo `Single Preview`; sua API de preview define foco explicitamente por `preserveFocus`.
- `npm test`: 5 testes, 5 aprovados, 0 falhas.
- `npm run compile`: TypeScript compilado com código de saída 0.
- VSIX final: 35 arquivos, 106,16 KB; testes excluídos e módulo de política incluído.
- A reinstalação oficial foi bloqueada pelo VS Code aberto (`EPERM` ao renomear a pasta carregada). Foi aplicada atualização local restrita a `package.json` e `out/`, após validação do destino absoluto.
- Hashes SHA-256 de `extension.js`, `markdownPreviewPolicy.js` e `package.json` ficaram idênticos entre repositório e instalação local.
- Validação humana após `Developer: Reload Window`: fluxo encadeado corrigido e funcionamento confirmado em 2026-08-29.
- Revisão final removeu a adoção implícita de um preview MPE ativo; somente previews previamente abertos pela própria extensão entram no gerenciamento. Novo compile/teste/pacote passou e os quatro artefatos instalados ficaram com hashes idênticos.

## Arquivos previstos neste lote

- `vscode-extension/src/extension.ts`
- módulo testável de política de abas em `vscode-extension/src/`
- testes e configuração de teste em `vscode-extension/`
- artefatos compilados em `vscode-extension/out/`
- artefatos operacionais de `sdd/`
