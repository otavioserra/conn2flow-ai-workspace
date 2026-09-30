# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-061.md](req-061.md)
* **Status**: `READY` (delegada a agente executor; revisão pelo agente da req-198/199 do core)
* **Lote Relacionado**: `BATCH-063`
* **Topologia de Agentes**: `dupla`
* **Nível de Autonomia**: `supervisionado` (commit e push na branch `feat/req-061`)
* **Data de Entrada**: 2026-09-30
* **Lote Anterior Concluído**: [req-060.md](req-060.md) (`BATCH-062`, `HOMOLOGATED`)

## 🎯 Objetivo Operacional do Lote BATCH-063

Choques das entregas na extensão do VS Code: listar por projeto, abrir o diff lado a lado e enviar a decisão (sobrescrever, manter, mesclar), tudo pelo CLI do core (`c2f update:conflicts` / `update:resolve` com `--json`). Especificação no handoff do core citado na [req-061](req-061.md).

## 🎯 Objetivo do Lote Anterior (BATCH-062)

Incorporação canônica dos aprendizados de e-commerce nas skills e criação da skill `c2f-payment-gateways`:
1. **Criação da Skill Canônica `c2f-payment-gateways`**: Definir os 8 padrões arquiteturais de gateways de pagamento seguro (autoridade estrita do servidor, token HMAC, prova de posse na API, captura no backend, webhooks minimalistas e idempotentes, SDK condicional, fallback seguro e dublês de testes).
2. **Atualização de 11 Skills Existentes**: Incorporar diretrizes e armadilhas em `c2f-gestor-functions`, `c2f-javascript-ajax`, `c2f-interface-v2-architecture`, `c2f-tailwind-css-architecture`, `c2f-database-operations`, `c2f-project-pipeline-and-tasks`, `c2f-json-resources-sync`, `c2f-shell-and-windows-traps`, `c2f-projects-system`, `c2f-documentation-governance`, `c2f-agent-visual-inspection` e `c2f-reviewer-agent`.
3. **Propagação Global e Auditoria MD5**: Propagar a nova skill e as 11 skills atualizadas para todos os 25 kits dos 5 repositórios (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`), auditando 100% de paridade MD5 e validando a suíte `npm test` (114/114).
