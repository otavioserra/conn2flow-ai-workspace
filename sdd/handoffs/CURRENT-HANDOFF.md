# Handoff do Agente Executor — REQ-036 / BATCH-038

* **Status**: `READY_FOR_REVIEW`
* **Executor**: OpenAI Codex
* **Data**: 2026-08-29
* **Requisição Ativa**: [req-036.md](../human-requests/req-036.md)

---

## Estado inicial

- REQ-036 aprovada integralmente pelo Humano-no-Loop.
- Execução supervisionada; sem commit, push, deploy ou release.
- Working tree do AI Workspace já contém a entrega revisável da REQ-035/BATCH-037.
- Defeito prioritário confirmado: a busca genérica de repositório aceita o `sdd` do workspace atual sem validar o nome do repositório, fazendo o escopo `ai-workspace` recair no Core.

## Resultado entregue

- Escopo `ai-workspace` corrigido e coberto por testes.
- Segurança, árvore progressiva, backlog, localização e releases guiados implementados.
- Scripts oficiais de release endurecidos sem staging amplo.
- `npm test`: 27/27; TypeScript, JSON, PowerShell, PHP e Bash validados.
- VSIX final: 59 arquivos, 139,49 KB.
- Instalação local atualizada após o CLI encontrar `EPERM` na extensão carregada; seis hashes principais conferidos como idênticos.

## Ação humana

Executar `Developer: Reload Window` e revisar: escopo AI Workspace, idioma, backlog, hierarquia da árvore e visibilidade de releases antes/depois de **Verificar Permissão de Release**. Nenhum botão de release deve ser confirmado durante esta revisão se não houver intenção real de publicar.

O humano autorizou commit e push dos arquivos do BATCH-037/BATCH-038 para preservar a árvore. Deploy e release continuam não autorizados.
