# BATCH-003 - Monitor Híbrido & Geração de Relatório de Chat Automático

## Escopo do Lote
Este lote implementa a ponte operacional entre o Arquiteto IA e os Executores locais. Ele cria um monitor de arquivos local (`sdd-watcher`) que notifica o sistema operacional do usuário sobre novas tarefas, e padroniza regras de escrita compulsória para que os executores salvem um dump/relatório de suas conversas e erros em `sdd/reviews/` antes de encerrarem seus turnos.

---

## Checklist de Implementação

### 1. Monitor de Arquivos Local (Watcher)
- [ ] Desenhar o script utilitário `scripts/sdd-watcher.ps1` (PowerShell) para Windows:
  - [ ] Monitorar eventos de escrita em `sdd/human-requests/CURRENT.md`.
  - [ ] Extrair o status e o caminho do request ativo.
  - [ ] Se o status for `READY-FOR-IMPLEMENTATION`, disparar uma notificação Toast no Windows com título e resumo da tarefa.
  - [ ] Exibir prompt interativo para abrir o VS Code no terminal e iniciar o executor correspondente.
- [ ] Desenhar a versão em Bash `scripts/sdd-watcher.sh` para Unix/macOS.

### 2. Regras de Relatório e Escrita Compulsória
- [ ] Adicionar regras de IA em `CLAUDE.md`, `.claude/rules/sdd.md` e `.github/copilot-instructions.md`:
  - [ ] Instruir o Executor a compilar um relatório executivo de progresso e log de chat.
  - [ ] Salvar este log no diretório `sdd/reviews/round-XXX-executor-log.md`.
  - [ ] Descrever os arquivos tocados, testes executados com saídas de console e decisões tomadas no chat.

### 3. Integração com Polling do Arquiteto
- [ ] Criar prompts de suporte para que o Arquiteto utilize a ferramenta `schedule` nativa do Antigravity para agendar checagens sequenciais no arquivo `CURRENT.md` e ler o relatório do executor automaticamente assim que estiver concluído.

---

## Validação Realizada
*(A ser preenchida pelo Executor IA após os testes de execução)*
