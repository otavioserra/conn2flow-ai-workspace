# CURRENT ACTIVE REQUEST

* **Ponteiro Ativo**: [req-074.md](req-074.md) (Servidor MCP Nativo no Daemon Python, Transição Visual SDD ➔ MDD na Extensão VS Code e Migração Estrutural do conn2flow-home)
* **Status**: `APPROVED` (aprovada pelo Engenheiro Chefe para execução imediata)
* **Lote Relacionado**: `BATCH-076`
* **Topologia de Agentes**: `triade` (Macro-Arquiteto planeja; Executor implementa; Revisor audita; Humano homologa)
* **Nível de Autonomia**: `autonomo_monitorado`
* **Data de Entrada**: 2026-10-09
* **Frentes Homologadas no Ciclo**:
  - [req-073.md](req-073.md) (`BATCH-075`, Consolidação Harmônica das Branches MDD na main, `HOMOLOGATED` em 2026-10-09 via [rev-075.md](../human-reviews/rev-075.md))
  - [req-072.md](req-072.md) (`BATCH-074`, Trava Tripla MDD, CLI de Mutação Atômica, 45ª Skill e Human Reviews, `HOMOLOGATED` em 2026-10-09 via [rev-074.md](../human-reviews/rev-074.md))
  - [req-071.md](req-071.md) (`BATCH-073`, Padronização das Memórias 03 e 04 em Inglês e Boilerplates, concluída nos 8 repositórios)
  - [req-069.md](req-069.md) (`BATCH-071`, Aplicações Python MDD Client CLI/Daemon e MDD Hub, concluída em tools/)
  - [req-070.md](req-070.md) (`BATCH-072`, Revamp da Documentação Pública e READMEs Raiz, `HOMOLOGATED` em 2026-10-09)
  - [req-068.md](req-068.md) (`BATCH-070`, Migração Estrutural MDD nos 7 Repositórios Satélites, `HOMOLOGATED` em 2026-10-09)
  - [req-067.md](req-067.md) (`BATCH-069`, Fundação Estrutural MDD na Matriz, `HOMOLOGATED` em 2026-10-09)
  - [req-062.md](archive/req-062.md) (`BATCH-064`, Testes locais e release v1.1.2 da extensão VS Code, arquivado em espera de testes)
* **Contrato de Handoff**: REQ-072 / ARCH-015. `solo`: auto-revisão do Executor; `dupla`: retorno ao Macro-Arquiteto; `triade`: recibo e Revisor Independente com ficha em `memory/human-reviews/`. `supervisionado` aguarda input humano em cada transição; `autonomo_monitorado` mantém Live Todo e aciona próximo papel autorizado; `autonomo_headless` persiste despacho e recibos. Nenhum modo simula homologação humana. Detalhes em [02-policy.md](../02-policy.md).

---

## 🎯 Objetivo Operacional da Frente Ativa (BATCH-076 / REQ-074)

1. **Servidor MCP no Daemon Python (`tools/mdd-client`)**: Implementar o servidor MCP nativo expondo ferramentas de status, init, sync, index, meta, compact, report e inbox humana, integrando ao comando `mdd daemon --mcp` e `mdd mcp`.
2. **Extensão VS Code como UI Bridge (`vscode-extension`)**: Renomear rótulos e comandos legados de SDD para MDD (`MDD Explorer`), priorizar descoberta de `memory/` e refinar o resolvedor de choques com opções de customização intencional.
3. **Migração Estrutural do `conn2flow-home`**: Migrar `sdd/` para `memory/`, renomear memórias raiz (03 e 04), criar `raw/` e `human-reviews/` e rodar `mdd index` preservando 100% dos contratos de rede e dual-GPU.
4. **Validação & Auditoria Independente**: Suítes de teste Python (>= 95% cobertura) e Extensão verdes, auditoria independente via `c2f-reviewer-agent` em `rev-076.md` e preparação para homologação humana final.
