# FEAT-013 — Regra de Arquivamento Físico de Arquivos SDD (Teto de 10 Ativos) e Manutenção da Integridade de Links

* **Status**: `ICEBOX`
* **Tipo**: SDD Governance / Arquitetura / Limpeza de Contexto / CLI
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-02
* **Repositórios Alvo**: Todos os repositórios do ecossistema Conn2Flow (`conn2flow-ai-workspace`, `conn2flow`, `conn2flow-site`, `lumix`, `transformamp`) e CLI Core

---

## 🎯 Contexto e Motivação

Atualmente, ao acumular dezenas de requisições e lotes executados, os arquivos individuais (`req-XXX.md` em `sdd/human-requests/` e `BATCH-YYY.md` em `sdd/implementation/`) permanecem soltos na raiz das respetivas pastas.

Isso gera problemas críticos de atenção e performance das IAs:
1. **Poluição Cognitiva (Prompt Bloat)**: Ao listar o diretório, o agente recebe até 50-60 arquivos soltos antigos na raiz, aumentando o tempo e o consumo de tokens.
2. **Risco de Desorientação**: O agente pode acidentalmente inspecionar requisições/lotes antigos e irrelevantes de meses atrás.
3. **Links Quebrados ao Mover**: Ao mover um arquivo para a subpasta `/archive/`, os links de markdown presentes nos índices (`BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `DECISION-LOG.md`) precisam ser obrigatoriamente atualizados de `[file.md](file.md)` para `[file.md](archive/file.md)` para garantir que nenhum link fique quebrado.

---

## 📋 Escopo Proposto

### 1. Política dos 10 Itens Ativos na Raiz (`Rule of 10`)
- Manter na raiz de `sdd/human-requests/` e `sdd/implementation/` **apenas as 10 requisições e lotes mais recentes** (além dos arquivos de controle como `CURRENT.md` e `BATCH-INDEX.md`).
- Todos os arquivos individuais `req-XXX.md` e `BATCH-YYY.md` anteriores às 10 entregas mais recentes devem ser movidos para suas respectivas pastas `/archive/` (`human-requests/archive/` e `implementation/archive/`).

### 2. Atualização Mandatória dos Links de Markdown nos Índices
- Ao mover um arquivo `req-XXX.md` ou `BATCH-YYY.md` para a pasta `/archive/`, o processo deve varrer e atualizar automaticamente todos os links e referências relativas em:
  * `sdd/implementation/BATCH-INDEX.md`
  * `sdd/validation/VALIDATION-CHECKLIST.md`
  * `sdd/decisions/DECISION-LOG.md`
  * `sdd/human-requests/CURRENT.md`
- As referências relativas devem ser alteradas de `(BATCH-XXX.md)` para `(archive/BATCH-XXX.md)` ou `(../implementation/archive/BATCH-XXX.md)`, garantindo 100% de navegação funcional nos links.

### 3. Atualização das Skills de Governança
- Atualizar `c2f-architect-master`, `sdd-memory-gardening` e `sdd-workflow` incorporando a regra dos 10 arquivos soltos e o dever de atualizar as URLs relativas dos índices ao arquivar.

### 4. Automação no CLI (`c2f ai:archive-sdd`)
- Criar o comando CLI no Core `./c2f ai:archive-sdd` para realizar a varredura, movimentação de arquivos antigos e reescrita automática dos links em qualquer repositório do ecossistema.

---

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`.
