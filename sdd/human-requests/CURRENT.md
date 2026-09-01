# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-045.md](req-045.md)
* **Status**: `HOMOLOGATED`
* **Lote Relacionado**: `BATCH-047`
* **Topologia de Agentes**: `duplo`
* **Nível de Autonomia**: `supervisionado`
* **Data de Entrada**: 2026-09-01
* **Lote Anterior Concluído**: [req-044.md](req-044.md) (`BATCH-046`)

## Execução atual

REQ-045 / BATCH-047 implementado com sucesso pelo Executor e homologado com parecer `APPROVED` pelo Macro-Arquiteto:
1. `releasePolicy.ts` e `releaseManager.ts` leem a versão canônica do instalador em `InstallerGuard.php` com 76/76 testes passando e preflight liberado;
2. `version-installer.php` e scripts de release do Core adequados;
3. Sonda HTTP anti-deadlock e contrato `CommandInterface` propagados em todas as skills (`ai:sync` 36/36).

Pronto para novo intake.
