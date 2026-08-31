# Memória de Engenharia — Execução

> **Propósito**: contexto operacional recente do workspace. Regras estáveis vivem em skills sob demanda.
>
> **Último lote concluído:** [BATCH-045 — Reorganização Ergonômica da Árvore Dev Tools (Controles Principais e Ações SDD)](implementation/batch-045.md)
>
> **Lote atual:** nenhum lote ativo no momento; aguarda novo intake do Humano-no-Loop.
>
> **Política**: manter somente fatos recentes e acionáveis; detalhes históricos permanecem recuperáveis nos lotes, validações e Git.

## Atividades recentes

- **2026-08-31 — BATCH-044:** implementado HubTaskWatcher na extensão, timeline de sessão compartilhada em `sdd/sessions/`, feedback visual de loading e botão 'Salvar e Executar Release'. Homologado com 53/53 testes.
- **2026-08-31 — REQ-043 / BATCH-045:** reorganização ergonômica da árvore no VS Code com emojis visuais coloridos, centralização de Controles Principais e ações de IA em SDD. Homologado com 54/54 testes em `review-045.md`.

## Decisões operacionais vigentes

- O Intake Gate continua obrigatório: itens de `sdd/backlog/` não são executáveis até promoção humana para uma requisição e associação a um batch.
- **Diretriz de Comunicação Multi-Repositório**: Ao gerar instruções prontas para o Humano-no-Loop colar no prompt dos executores ou revisores, SEMPRE incluir explicitamente o identificador do projeto e o caminho absoluto da raiz do repositório alvo (ex: `conn2flow-ai-workspace` em `c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`) para evitar ambiguidades com múltiplos repositórios abertos simultaneamente.

## Pendência imediata

- Lotes BATCH-043, BATCH-044 e BATCH-045 100% homologados e concluídos. Pronto para nova requisição.






