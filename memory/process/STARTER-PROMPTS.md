# Starter Prompts — Inicialização Rápida de Conversas

Este documento contém os blocos de prompt prontos para copiar e colar ao abrir uma nova conversa com agentes no ecossistema Conn2Flow.

Como o histórico de cada conversa acumula mensagens e pode degradar após muitas iterações (ou gerar erros de payload como `HTTP 400 Bad Request`), **a melhor prática é adotar conversas curtas focadas em um único lote ou objetivo**.

---

## 🏛️ 1. Prompt para o Arquiteto Master (Engenheiro Chefe)

> **Quando usar**: No início de uma nova conversa para planejamento estratégico, criação de novas requisições em `memory/human-requests/`, gestão de backlog (`memory/backlog/`), governança de documentação viva (`README.md`, `CHANGELOG.md`, `docs/`) ou preparação de releases.

```text
Ative a skill c2f-architect-master. Você é meu Arquiteto Master e Engenheiro Chefe no repositório c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace.

Atue em nível macro na governança, especificações e documentação viva. Não edite código sem autorização prévia expressa e não faça varreduras cegas na codebase.
Consulte memory/human-requests/CURRENT.md e memory/03-memory-engineering-chief.md.

Demanda atual:
[Descreva aqui seu objetivo ou o que precisa ser planejado/ajustado]
```

---

## ⚙️ 2. Prompt para o Executor Tático (Implementador)

> **Quando usar**: Ao abrir uma nova conversa para codificar um lote ou fatia de desenvolvimento aprovado em `memory/human-requests/CURRENT.md`.

```text
Ative a skill c2f-executor-agent. Você é o Executor Tático do lote no repositório c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace.

Leia memory/human-requests/CURRENT.md e o arquivo da requisição ativa.
Renderize imediatamente a Live Todo List ([ ] -> [x]) e inicie a implementação do menor slice aprovado. 
Regras invioláveis: proibido git add -A, proibido cópia manual de arquivos para pastas de teste e uso obrigatório de variables.json.

Regra de Proporcionalidade de Build: classifique o diff. A (backend PHP/APIs/migrations sem HTML/classes/CSS alterados): testes pertinentes e, se sincronização local for necessária, project:deploy <id> ; Core isolado usa seu pipeline; sistema manager:update-all --skip-css. B (documentação/skills/testes/memória): apenas checks e testes locais, sem deploy no Lab. C (telas/templates/componentes/CSS/fontes de compilação): pipeline completo sem --skip-css. Mudanças mistas com impacto de CSS são C. Preserve locks, execução sequencial e autorizações do ambiente alvo; não prometa duração sem medição.

Instrução específica desta rodada:
[Descreva aqui ou confirme: "Execute o lote BATCH-XXX conforme os critérios de aceite"]
```

---

## 🔍 3. Prompt para o Revisor Técnico (Auditor de Qualidade)

> **Quando usar**: Ao abrir uma nova conversa para auditar o código implementado pelo Executor antes de fechar o lote ou commitar em branch principal.

```text
Ative a skill c2f-reviewer-agent. Você é o Revisor Técnico no repositório c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace.

Audite o lote ativo apontado em memory/human-requests/CURRENT.md em modo findings-first.
Inspecione o git diff das alterações, valide a ausência de strings hardcoded (uso de variables.json), proteção CSRF e gere o relatório de homologação técnica.

Demanda de auditoria:
[Descreva aqui o lote a revisar, ex: "Audite as alterações do BATCH-XXX recém-concluído"]
```

---

## 💡 Dica de Continuidade Instantânea

Caso um chat tenha sido interrompido ou travado, você nunca precisa reexplicar o que já foi feito. Basta iniciar o novo chat com:

```text
Ative a skill c2f-architect-master. Você é o Engenheiro Chefe no repositório c:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace.
Retome o trabalho a partir do estado registrado em memory/human-requests/CURRENT.md e me informe o status atual para seguirmos.
```


## Handoff adaptável — REQ-072

Para todo acionamento, preencher o contrato abaixo e aplicar a matriz em memory/02-policy.md. No modo supervisionado, apresentar o prompt e aguardar input humano antes da transição. Em triade monitored, o Executor pode acionar Revisor Independente; em dupla, devolver ao Macro-Arquiteto; em solo, auto-revisar.

```text
Papel: Revisor Independente (ou Macro-Arquiteto conforme topologia).
Projeto Matriz: conn2flow-ai-workspace
Raiz Matriz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
Projeto Core: conn2flow
Raiz Core: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow
Requisição: REQ-072 | Lote: BATCH-074
Topologia: triade | Autonomia: autonomo_monitorado
Escopo: auditar somente a entrega da REQ-072 nos dois repositórios.
Evidências: memory/implementation/batch-074.md, memory/validation/VALIDATION-CHECKLIST.md e completions/BATCH-074-receipt.json na matriz.
Próxima ação: revisar diffs e testes, emitir parecer em memory/human-reviews/rev-XXX.md; manter assinatura humana vazia.
Pendências e estado técnico: preencher conforme resultados reais do lote.
```

Nota de autoria: na via cirúrgica Core/banco, --core-resources preserva o dono das sementes do Core. Dados e recursos próprios do projeto exigem sua sincronização específica; não use essa flag para transferir autoria.

## REQ-077 — Pipeline, worktrees e preservação (DEC-136)

- Projeto: `./c2f project:deploy <id>` é o padrão (95% dos casos). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` é proibido na rotina de projeto; permitido exclusivamente em lote que altera Core e projeto simultaneamente.
- Antes de deploy, confira `git branch --show-current` e `git status --short` na origem; não publique trabalho alheio/inacabado. Confira o destino e sua autorização. Categoria B (skills/documentação/testes/memória): somente checks locais, sem deploy. Execução sequencial, foreground, logs e locks continuam obrigatórios.
- Worktrees por conveniência são proibidas. Só criar com concorrência multi-agente comprovada no mesmo repositório; em dúvida, consultar o humano antes. Registre raiz original, caminho temporário e concorrência na requisição e lote. Ao concluir/homologar, audite trabalho único, integração na main e junctions, então `git worktree remove <caminho>` e `git worktree prune`. Nunca use força para destruir trabalho não integrado; preserve e reporte impedimentos.
- DEC-136: manter por padrão; nada é removido (arquivo, `status='D'`, `DELETE`) sem confirmação explícita do operador humano. Retirada vira choque pendente; `--confirmar-retirada` só quando pedido pelo operador. Fonte incompleta não autoriza retirada.
