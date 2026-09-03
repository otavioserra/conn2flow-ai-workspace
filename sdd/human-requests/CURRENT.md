# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-052.md](req-052.md)
* **Status**: `READY_FOR_EXECUTION`
* **Lote Relacionado**: `BATCH-054`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-03
* **Lote Anterior Concluído**: [req-051.md](req-051.md) (`BATCH-053`)

## 🎯 Objetivo Operacional do Lote BATCH-054

Implementar o lote unificado de usabilidade avançada, polimorfismo VM e refinamentos:
1. SSH no comando `c2f css:audit` para projetos remotos (eliminar erro de `.env`).
2. Anexar `--confirmar-remoto` na extensão e no pipeline para projetos VM locais (`conn2flow-site-local`).
3. Saneamento do centro de notificações (substituir pop-ups de rotina por `setStatusBarMessage(..., 3000)`).
4. Version Bump automatizado do VSIX (`package.json` v1.1.0 e rotina de bump).
5. Barra de status dinâmica (Docker vs VM) com suporte a logs da VM via SSH.
6. Comando de busca rápida de documentações técnicas em `ai-workspace/pt-br/docs` e no índice.
7. Navegação contínua no preview Markdown sem abrir abas de código .md redundantes.
