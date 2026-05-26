# 00 Start Here

Use este arquivo como ponto de partida para qualquer alteração ou melhoria no repositório `conn2flow-ai-workspace`.

---

## Passo 1: Ler o Ponteiro Ativo
Antes de começar, verifique o arquivo [sdd/human-requests/CURRENT.md](file:///c:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/sdd/human-requests/CURRENT.md) para identificar qual é o arquivo de requisição ativo (ex: `req-001.md`) e seu respectivo status.

---

## Passo 2: Carregar Contexto Mínimo
Leia os arquivos normativos locais na seguinte ordem:
1. `sdd/README.md`
2. `sdd/00-baseline-architecture.md`
3. `sdd/SPEC.md`
4. `sdd/implementation/BATCH-INDEX.md`

---

## Passo 3: Classificar e Mapear a Demanda
Classifique a demanda entre:
- **Mudança Normativa**: Edições na especificação dos templates (`SPEC.md` ou regras do kit) devem ser registradas em `sdd/change-requests/` antes de alterar as especificações.
- **Implementação Incremental**: Correções de scripts ou movimentações físicas de templates que já foram especificadas em batches devem seguir pelo `sdd/implementation/BATCH-INDEX.md`.
- **Validação**: Execução de testes locais de cópia de arquivos e prefixos para alimentar o `sdd/validation/VALIDATION-CHECKLIST.md`.

---

## Passo 4: Ping-Pong com o Executor
1. O Arquiteto (Antigravity) escreve a especificação em `sdd/` e detalha a requisição de baixo nível em `sdd/human-requests/req-XXX.md`.
2. O usuário inicia o Executor (Claude Code ou Copilot) na raiz do repositório apontando para `CURRENT.md`.
3. O Executor altera os arquivos em `en/`, `pt-br/` ou `scripts/` e testa localmente.
4. O Executor atualiza o progresso em `sdd/implementation/` e logs em `sdd/validation/`.
5. O Arquiteto revisa as mudanças em alto nível.
