# BATCH-062 — Incorporação Canônica dos Aprendizados de E-commerce nas Skills e Criação da Skill c2f-payment-gateways

* **Requisição**: [req-060.md](../human-requests/req-060.md)
* **Status**: `READY_FOR_REVIEW`
* **Data de Início**: 2026-09-29
* **Data de Conclusão**: 2026-09-29
* **Executor**: Antigravity (c2f-executor-agent)
* **Topologia**: Dupla (Macro-Arquiteto + Micro-Executor)
* **Autonomia**: Supervisionado

---

## 📋 Live Todo List

- [x] Ler `sdd/human-requests/CURRENT.md` e `sdd/human-requests/req-060.md`
- [x] Criar a nova skill canônica `c2f-payment-gateways/SKILL.md` com 8 princípios de segurança de pagamento
- [x] Atualizar `c2f-gestor-functions/SKILL.md` (§12 Sessão em páginas públicas `without_permission: true` e `isset($_COOKIE)`)
- [x] Atualizar `c2f-javascript-ajax/SKILL.md` (§5 Armadilha de injeção de scripts no `<head>`, `DOMContentLoaded` e delegação)
- [x] Atualizar `c2f-interface-v2-architecture/SKILL.md` (§4 Variantes Tailwind no painel administrativo e restrição BL-026)
- [x] Atualizar `c2f-tailwind-css-architecture/SKILL.md` (Registro de `tailwind_sources` e `tailwind_sources_reason`)
- [x] Atualizar `c2f-database-operations/SKILL.md` (§4 Limpeza de migrações Phinx renumeradas e desempate)
- [x] Atualizar `c2f-project-pipeline-and-tasks/SKILL.md` (§6 Expurgo de registros órfãos via `deletar` e §7 Diagnóstico de memória no deploy via API)
- [x] Atualizar `c2f-json-resources-sync/SKILL.md` (Preservação de barras escapadas `\/`, `ensure_ascii=False` e line endings em JSON)
- [x] Atualizar `c2f-shell-and-windows-traps/SKILL.md` (Armadilha 12 — Colapso de escapes `\/` por Python `json.dumps()`)
- [x] Atualizar `c2f-projects-system/SKILL.md` (§5 Regras de indexação do sitemap e exclusão de rotas de checkout)
- [x] Atualizar `c2f-documentation-governance/SKILL.md` (§4 Fluxo mandatório pós-alteração de código `docs:audit`)
- [x] Atualizar `c2f-agent-visual-inspection/SKILL.md` (Roteiro de validação E2E em ambientes com acesso remoto restrito / 8 etapas)
- [x] Atualizar `c2f-reviewer-agent/SKILL.md` (Checklist de auditoria para integração de módulos concorrentes)
- [x] Espelhar a nova skill e atualizações nos 4 kits centrais (`.claude`, `.codex`, `.cursor`, `.github`) e 14 templates bilíngues
- [x] Propagar as skills para os 20 kits dos 4 repositórios satélites (`conn2flow`, `lumix`, `conn2flow-site`, `transformamp`)
- [x] Executar auditoria criptográfica MD5 comprovando **zero divergências** (1.025 arquivos verificados nos 25 kits)
- [x] Executar suíte de testes `npm test`: **114/114 passed** (0 fail, 184ms)
- [x] Criar `sdd/implementation/batch-062.md`, atualizar checklist e emitir recibo `BATCH-062-executor-receipt.json`

---

## 📊 Entregas e Resultados

### 1. Criação da Nova Skill Canônica: `c2f-payment-gateways`

A skill canônica `c2f-payment-gateways/SKILL.md` consolida os 8 padrões arquiteturais de segurança para gateways de pagamento (Stripe, PayPal, etc.):
1. **Autoridade Estrita do Servidor**: Preço unitário, moeda, descontos e taxas calculados exclusivamente no backend; frontend trafega apenas IDs e quantidades.
2. **Tokens de Pedido Criptográficos HMAC**: Acesso público protegido por `hash_hmac('sha256', numero|salt, OPENSSL_PASSWORD)`, com salt único persistido no banco e validação timing-safe via `hash_equals()`.
3. **Prova de Posse em Verificações de Estado**: Tripla validação contra API oficial do gateway (`order_id` nos metadados, valor cobrado e moeda).
4. **Captura Mandatória no Backend**: Para gateways como PayPal, o cliente apenas autoriza a ordem no navegador; a captura financeira efetiva ocorre exclusivamente no servidor.
5. **Webhooks Minimalistas e Idempotentes**: Webhook opera como sinalizador disparando ressincronização via API; desduplicação mandatória por `gateway_event_id`.
6. **Carregamento Condicional de SDKs**: SDKs pesados de terceiros (Stripe.js, PayPal SDK) só são baixados quando o comprador seleciona o respectivo gateway.
7. **Gateway Padrão (Fallback Seguro)**: Na ausência de seleção explícita, o sistema assume o gateway padrão do lojista com validação rigorosa.
8. **Testes Unitários sem Credenciais**: Dublês/mocks das funções da biblioteca do gateway para automação CI sem credenciais reais; isolamento de ambiente com cartões de teste e webhooks simulados.

O ecossistema expande oficialmente de **40 para 41 skills canônicas**.

---

### 2. Atualização das 12 Skills Canônicas Existentes

| # | Skill | Diretrizes Incorporadas |
|---|---|---|
| 1 | `c2f-gestor-functions` | §12 Regra de Sessão em Páginas Públicas (`without_permission: true`): obrigatoriedade de checar `isset($_COOKIE[$_CONFIG['cookie-authname']])` antes de chamar `gestor_permissao_token()` para evitar redirecionamento forçado para `_gestor-cookie-verify`. |
| 2 | `c2f-javascript-ajax` | §5 Armadilha de Injeção de Scripts no `<head>`: scripts injetados via `gestor_pagina_javascript_incluir()` rodam antes do DOM; proibição de consultas diretas na raiz; obrigatoriedade de `DOMContentLoaded` e preferência por delegação de eventos. |
| 3 | `c2f-interface-v2-architecture` | §4 Variantes Tailwind no Painel: formulários de edição, inclusão, modais e botões com Lucide têm variantes Tailwind prontas; listagem de registros permanece em Fomantic (BL-026); inicialização defensiva de `tooltip`. |
| 4 | `c2f-tailwind-css-architecture` | Registro de `tailwind_sources` e `tailwind_sources_reason` obrigatório no `<id>.json` para classes geradas dinamicamente em PHP/JS; `<template>` inerte para componentes do core. |
| 5 | `c2f-database-operations` | §4 Limpeza de Migrações Phinx Renumeradas: remoção manual obrigatória no destino antes do deploy para prevenir `Duplicate migration`; regra de desempate por renumeração da própria migração. |
| 6 | `c2f-project-pipeline-and-tasks` | §6 Expurgo de Registros Órfãos no deploy via chave `deletar` em `project_tables_config.json`; remoção de `without_permission` em páginas semente; §7 Diagnóstico de estouro de memória no deploy via API com `api_memoria_minima('1024M')` e consulta a `php-error.log`. |
| 7 | `c2f-json-resources-sync` | Preservação de barras escapadas (`\/`) em JSON de módulos manipulados por Python (`s.replace('/', '\\/')`), `ensure_ascii=False` e preservação de quebras de linha nativas (LF/CRLF). |
| 8 | `c2f-shell-and-windows-traps` | Armadilha 12: `json.dumps()` do Python remove escapes de barra (`\/`) de JSON de módulos PHP, poluindo o Git diff; detecção e restauração pós-dump. |
| 9 | `c2f-projects-system` | §5 Regras de Indexação do Sitemap: exclusão de rotas de desfecho transacional (`success`, `error`, `cancel`), etapas (`.../checkout`, `.../payment`) e rotas do carrinho; validação pós-deploy via cURL. |
| 10 | `c2f-documentation-governance` | §4 Fluxo Mandatório Pós-Alteração de Código: rotina em 5 passos com `c2f docs:audit`, sincronização textual, bump de `verified_at`, `c2f docs:extract` e `c2f docs:build`. |
| 11 | `c2f-agent-visual-inspection` | Roteiro de Validação E2E sem Acesso de Escrita Remota (8 etapas): extração de cookies via `auth:cookie`, isolamento de contextos, preenchimento em iframes do Stripe, interceptação de diálogos, auditoria via interface administrativa, webhooks via injeção HTTP, inspeção de rede e sanitização de logs. |
| 12 | `c2f-reviewer-agent` | Checklist de Auditoria para Integração de Módulos Concorrentes: validação de endpoints públicos vs administrativos, rate limiting por IP, modelo de página única parametrizada, posse de e-mail e checagem de colisão de funções via `php -l` e `grep`. |

---

### 3. Propagação Universal e Auditoria Criptográfica MD5

- **Propagação**: 494 arquivos atualizados/criados:
  - 52 arquivos nos 4 kits centrais (`.claude`, `.codex`, `.cursor`, `.github`).
  - 182 arquivos nos 14 diretórios de templates bilíngues (`templates/pt-br/` e `templates/en/`).
  - 260 arquivos nos 20 diretórios de kit dos 4 satélites (`conn2flow`, `lumix`, `conn2flow-site`, `transformamp`).
- **Auditoria MD5**:
  - Total de arquivos canônicos verificados: **1.025 arquivos** (41 skills × 25 kits × 5 repositórios).
  - Total de correspondências com o hash canônico: **1.025 / 1.025**.
  - Total de divergências: **0**.
  - Total de arquivos canônicos faltantes: **0**.
  - Skills locais preservadas: 8 no `lumix`, 8 no `conn2flow-site`, 19 no `transformamp`.
  - Veredito: **PASSED (ZERO DIVERGENCES)**.

---

### 4. Validação da Extensão VS Code (`npm test`)

```
# tests 114
# suites 0
# pass 114
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 184.2106
```
Exit code: **0** (100% verde).

---

## 🔒 Conclusão

Todos os 6 critérios de aceite da REQ-060 foram rigorosamente atendidos. O catálogo de skills canônicas foi expandido para 41 skills, todos os 13 aprendizados de e-commerce foram formalizados, os 25 kits nos 5 repositórios mantêm paridade criptográfica absoluta (1.025/1.025) e as skills privadas dos satélites foram 100% preservadas. Lote pronto para revisão técnica.
