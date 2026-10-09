# BATCH-002 - Memórias de Engenharia (Chefia e Execução)

## Escopo do Lote
Este lote implementa o sistema de persistência de contexto cross-session (Memórias de Engenharia) no `conn2flow-ai-workspace`. Serão criados dois templates de arquivos de memória (`Chefia` para diretrizes humanas e `Execução` para aprendizados da IA) em português e inglês nos boilerplates, os instaladores serão atualizados para distribuir estes arquivos, e as regras dos kits de IA serão atualizadas para forçar a leitura e a escrita/manutenção desses diários de bordo pelas IAs.

Além disso, os instaladores serão equipados com capacidade de detecção e migração automática de estruturas de governança SDD legadas (como `project/<frente>/`) para o novo padrão `/sdd` na raiz do destino.

---

## Checklist de Implementação

### 1. Templates de Memórias de Engenharia (Boilerplates)
- [x] Criar templates em Português sob `pt-br/sdd-boilerplate/sdd/`:
  - [x] `03-memory-engineering-chief.md`: Destinado ao Engenheiro Chefe Humano. Contém preferências de estilo, convenções de código, restrições e notas de negócio.
  - [x] `04-memory-engineering-execution.md`: Destinado ao Executor IA. Contém aprendizados do compilador, hacks de banco de dados locais, notas de bugs resolvidos e lições aprendidas em código.
- [x] Criar templates correspondentes em Inglês sob `en/sdd-boilerplate/sdd/`:
  - [x] `03-memory-engineering-chief.md`.
  - [x] `04-memory-engineering-execution.md`.

### 2. Atualização das Regras de IA nos Kits
- [x] Nos templates em Português (`pt-br/templates/spec-driven-*`):
  - [x] Atualizar `CLAUDE.md`, `.claude/rules/sdd.md`, `.github/copilot-instructions.md` e `.github/instructions/project-sdd.instructions.md`.
  - [x] Regra de Leitura: Incluir a leitura obrigatória de `sdd/03-memory-engineering-chief.md` e `sdd/04-memory-engineering-execution.md` na inicialização de qualquer sessão de IA.
  - [x] Regra de Escrita: Instruir o Executor IA a popular/atualizar a `sdd/04-memory-engineering-execution.md` com novos aprendizados e erros resolvidos ao término de cada tarefa para manter a persistência entre sessões.
- [x] Nos templates em Inglês (`en/templates/spec-driven-*`):
  - [x] Atualizar arquivos equivalentes para exigir a leitura e escrita de `sdd/03-memory-engineering-chief.md` e `sdd/04-memory-engineering-execution.md`.

### 3. Atualização dos Instaladores em `scripts/` (Com Migrador Automático)
- [x] Atualizar os scripts de instalação de kits SDD para:
  - [x] Varrer o repositório destino em busca de pastas de governança legadas (`project/<frente>/` contendo specs ou start runbooks).
  - [x] Mover/renomear fisicamente a pasta legada para a raiz `/sdd/` se ela for encontrada e a pasta `/sdd` estiver ausente.
  - [x] Limpar a pasta `project/` antiga se estiver vazia após a migração.
  - [x] Executar substituição de referências textuais nos arquivos de configuração do destino (de `project/<frente>/` para `/sdd/`).
  - [x] Copiar os arquivos de memórias de engenharia correspondentes ao idioma selecionado (`-Language` / `--language`), **sem nunca sobrescrever** arquivos de memória que o usuário porventura já tenha criado no local.

---

## Validação Realizada
*(A ser preenchida pelo Executor IA após os testes de execução)*
Todos os testes foram executados com sucesso em ambiente de simulação (`temp/test-batch-002.ps1`):
1. **Migração Legada**: Estrutura antiga `project/atlas-fotobiomodulacao/` foi detectada, migrada para `sdd/`, diretório vazio `project/` removido, memórias instaladas e referências atualizadas com sucesso.
2. **Repo Novo**: Instalação limpa criou `sdd/` contendo ambos os arquivos de memória.
3. **Não-Sobrescrita**: Instalação sobre `sdd/` existente preservou arquivo `03-memory-engineering-chief.md` que possuía conteúdo customizado e instalou a memória de execução que faltava.
4. **Idioma Inglês**: Flag `-Language en` instalou corretamente os arquivos `03-memory-engineering-chief.md` e `04-memory-engineering-execution.md`.
