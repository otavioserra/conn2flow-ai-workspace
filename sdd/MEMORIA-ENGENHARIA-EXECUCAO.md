# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-043 — Teste de Integração End-to-End da Tríade via MCP Hub](implementation/batch-043.md)
>
> **Lote atual:** nenhum lote ativo no momento; aguarda novo intake do Humano-no-Loop.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-042:** propagada a regra inviolável de identificação mandatória de repositório e caminho absoluto para o Core (`conn2flow`), skill `sdd-workflow` e boilerplates. Homologado com 47/47 testes.
- **2026-08-31 — REQ-041 / BATCH-043:** teste fim-a-fim da Tríade de Agentes conectada via MCP Hub (`dispatch_task` ➔ probe `mcpTriadProbe.test.cjs` ➔ `report_completion` ➔ auditoria independente em `review-043.md`). Homologado com 48/48 testes.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Pendência imediata

- Ciclo do BATCH-043 homologado com 100% de sucesso. Pronto para abertura da REQ-042 / BATCH-044 (Sessão Compartilhada & Identidade de Agentes no MCP Hub).






