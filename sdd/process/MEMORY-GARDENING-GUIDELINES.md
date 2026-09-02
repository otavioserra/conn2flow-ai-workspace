# Memory Gardening — Diretrizes de Poda e Destilação

Estas diretrizes mantêm as memórias de engenharia organizadas e transformam conhecimento estável em skills carregadas sob demanda.

## 1. Limites e gatilhos

- 🚫 **PROIBIDO PODAR** se a memória de execução estiver abaixo de **50 KB e 200 linhas**. O fim da sessão ou do batch não aciona gardening.
- Emita apenas um alerta preventivo ao atingir **50 KB ou 200 linhas**.
- A poda é obrigatória quando a memória atingir **75 KB ou 300 linhas**.
- Após a poda, mire aproximadamente **25 KB** e preserve as **20 a 25 tarefas, aprendizados e pendências mais recentes**.
- Os índices ativos (`BATCH-INDEX.md`, `VALIDATION-CHECKLIST.md`, `DECISION-LOG.md`) mantêm no máximo **25 itens ativos**, arquivando excedentes em `archive/`.
- A memória de Chefia é somente leitura para executores. Nunca a pode, mova ou reescreva sem instrução humana explícita.

## 2. O que fica na memória

- estado operacional das 20 a 25 tarefas mais recentes;
- pendências reais que ainda condicionam a próxima sessão;
- particularidades temporárias de ambiente ainda necessárias;
- evidência curta de validação ou falha que ainda não foi consolidada em outro artefato SDD.

Não mantenha transcrições extensas, cronologias completas, diffs narrados, credenciais, comandos já documentados ou regras estáveis repetidas em várias tarefas.

## 3. Quando transformar uma lição em skill

Destile para uma skill quando o aprendizado for recorrente, estável, acionável e aplicável fora da tarefa que o originou. A skill deve:

1. ter diretório em kebab-case e arquivo `SKILL.md`;
2. declarar `name` e `description` no frontmatter com gatilho de ação observável e consequência do erro;
3. conter o bloco obrigatório `# ⚡ Gatilho Obrigatório` (`TRIGGER`, `SKIP APENAS SE`, `CONSEQUÊNCIA DE IGNORAR`);
4. explicar o gatilho de uso e o procedimento verificável;
5. incluir armadilhas e exemplos apenas quando reduzirem ambiguidade;
6. evitar histórico do incidente, nomes pessoais, segredos e detalhes transitórios;
7. ser colocada na camada mais estreita que ainda permita reutilização: core/global para contratos Conn2Flow, projeto para regras exclusivas do cliente.

Mantenha a mesma skill espelhada em `.claude/skills/`, `.cursor/skills/`, `.gemini/skills/`, `.github/skills/` e `.codex/skills/`.

## 4. Procedimento padronizado

1. Meça bytes e linhas das memórias de execução (ou execute `c2f ai:prune-memories`).
2. Leia a memória completa e classifique cada nota como recente, pendente, normativa recorrente ou histórica.
3. Converta regras normativas recorrentes em skills antes de removê-las.
4. Reescreva a memória com 20 a 25 tarefas recentes, links para skills destiladas e pendências vigentes (~25 KB).
5. Preserve a memória de Chefia.
6. Valide frontmatter, descoberta das skills, alvo aproximado de 25 KB e diff Git recuperável.
7. Registre a evidência no checklist do batch.

## 5. Rollback e rastreabilidade

O histórico removido permanece recuperável pelo Git. Não copie o texto podado para outro arquivo ativo, pois isso apenas desloca o consumo de contexto. Se uma regra destilada perder informação essencial, restaure o trecho pelo histórico Git, corrija a skill e repita a validação.
