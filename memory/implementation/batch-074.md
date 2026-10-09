---
id: BATCH-074
title: Implementação da Trava Tripla MDD, Auto-Cura de Índices, Handoffs Adaptáveis e Pasta Canônica memory/human-reviews/
status: ready-for-review
date: 2026-10-09
author: "executor"
target_repo: conn2flow-ai-workspace
summary_short: Live Todo List para implementação das 3 travas de governança do ARCH-015 / REQ-072
summary_medium: Rastreamento detalhado das etapas de scaffold de human-reviews/, skill c2f-mdd-indexing-and-handoffs, parsers de auto-cura de índices e políticas.
---

# BATCH-074 — Implementação da Trava Tripla MDD: Metadata Header com Auto-Cura de Índices, Handoffs Adaptáveis e Pasta Canônica `memory/human-reviews/`

- **Projeto**: Multi-Repositório: `conn2flow-ai-workspace` (Matriz / Ferramental Python) e `conn2flow` (Core Oficial / CLI PHP)
- **Raiz Matriz**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-ai-workspace`
- **Raiz Core**: `C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow`
- **Requisição**: [REQ-072](../human-requests/req-072.md)
- **Épico**: [ARCH-015](../backlog/ARCH-015-headless-triad-mechanics-and-human-reviews.md)
- **Status**: `ready-for-review`
- **Autonomia**: `autonomo_monitorado`
- **Data**: 2026-10-09

---

## 📋 Live Todo List

- [x] **1. Scaffolding da Pasta Canônica `memory/human-reviews/`**:
  - [x] 1.1 Provisionar diretório base `memory/human-reviews/` com `README.md` e `index.md`
  - [x] 1.2 Provisionar estrutura de arquivamento hierárquico `archive/`, `archive/compacted/` e `archive/original/`
  - [x] 1.3 Criar template de exemplo de ficha de homologação (`templates/rev-example.template.md`)
- [x] **2. Criação da 45ª Skill Canônica (`c2f-mdd-indexing-and-handoffs`)**:
  - [x] 2.1 Criar `.gemini/skills/c2f-mdd-indexing-and-handoffs/SKILL.md` com padrão de frontmatter, regras de indexação e handoffs
  - [x] 2.2 Espelhar a skill canônica em `.claude/skills/`, `.cursor/skills/`, `.codex/skills/` e `.github/skills/`
  - [x] 2.3 Atualizar a contagem oficial de skills no ecossistema (de 44 para **45 skills**)
- [x] **3. Ferramentas de Auto-Cura e Mutação via CLI (`c2f memory:index`, `c2f memory:set`, `mdd meta`)**:
  - [x] 3.1 Especificar e prototipar parser com extração YAML e fallback gracioso para arquivos antigos sem cabeçalho
  - [x] 3.2 Implementar comando de auto-cura `memory:index` no CLI Core (`conn2flow/cli`)
  - [x] 3.3 Implementar comandos de mutação atômica `memory:set` e `memory:get` no CLI Core com re-sincronização instantânea do `index.md`
  - [x] 3.4 Integrar rotinas de indexação e mutação de metadados (`mdd index` e `mdd meta set/get`) no Python MDD Client (`tools/mdd-client`)
- [x] **4. Governança, Políticas e Boilerplates**:
  - [x] 4.1 Atualizar `memory/01-general-memory.md` com a inclusão de `human-reviews/` e a Trava Tripla
  - [x] 4.2 Atualizar `memory/02-policy.md` com os protocolos formais de handoff (topologias `solo`, `dupla`, `triade` e autonomias)
  - [x] 4.3 Atualizar manuais de abertura rápida (`AGENTS.md`, `GEMINI.md`, `CLAUDE.md`, `memory/process/STARTER-PROMPTS.md`)
  - [x] 4.4 Atualizar boilerplates e skeletons em `templates/` (en e pt-br)
- [x] **5. Auditoria, Validação e Recibo**:
  - [x] 5.1 Testar execução do comando de auto-cura gerando índices de teste e conferir integridade de links
  - [x] 5.2 Conferir suíte de testes da extensão VS Code (124/124 testes)
  - [x] 5.3 Gerar recibo e entregar fechamento técnico para revisão/homologação

---

## 🛡️ Regras Invioláveis de Execução

1. **Fallback Gracioso Mandatório**: Nenhuma alteração pode quebrar ou descartar arquivos legados sem frontmatter. O parser deve extrair título e resumo inicial de forma tolerante.
2. **Proibição de `git add .` e `-A`**: Commits devem listar exclusivamente os arquivos modificados.
3. **Respeito aos Processos Concorrentes**: Não modificar a árvore `tools/` de forma que cause conflitos com a implementação de Python em andamento na branch `feat/req-069`.


## Relatório consolidado do Executor — 2026-10-09

Implementação técnica entregue na branch feat/req-072 dos dois repositórios, pronta para revisão e homologação humana. A assinatura humana não foi preenchida pelo Executor.

### Entrega

- Core: MemoryIndexCommand.php, MemorySetCommand.php, MemoryGetCommand.php registrados no console, com serviço Indexer independente de Composer; --repo seleciona a raiz. memory:set aceita múltiplos campos; memory:get aceita --json.
- Matriz: mdd index e mdd meta set/get, --path e --json; API reutilizável mdd_client.core.indexer. init também cria os índices de human-reviews; sync e testes atualizados para catálogo de 45 skills.
- Tabela e cabeçalhos novos idênticos em PHP/Python, títulos/status/resumos legados preservados por fallback. Corpo, BOM e CRLF preservados na mutação; Unicode/links/células escapados. Trava cooperativa única memory/.mdd.lock; substituição atômica por arquivo com rollback do documento se índice falhar.
- Skill #45 criada na matriz e propagada pelo scripts/skills/sync-skills.cjs aos cinco kits da matriz e do core (dez cópias idênticas). Catálogos EN/PT e manuais atuais atualizados para 45. Templates de kits mantêm seu subconjunto de skills e traduções; o sincronizador não injeta skill nova em templates que não a contêm.
- Inbox da matriz conferida; esqueleto de cinco arquivos em templates/en e templates/pt-br; três modelos de ficha de revisão. Os boilerplates existentes retêm sdd/ até migração autorizada pela frente REQ-071. Políticas, CURRENT e STARTER-PROMPTS incluem topologias/autonomias, raiz absoluta, dez ativos e assinatura humana.
- Coordenação de deltas registrada em req-069.md; Hub/daemon preservados. Nenhuma cópia manual para dev-environment/data/sites/.

### Evidências executadas

- **111/111 pytest**, zero falhas/erros/skips; **48 casos de paridade** executam PHP real e Python, com validação PyYAML, links, ambiguidades, rollback, lock compartilhado, junctions, Unicode e cabeçalhos inválidos. [JUnit](../../completions/BATCH-074-pytest.xml) e [resumo](../../completions/BATCH-074-test-summary.json).
- **124/124 testes VS Code**, zero falhas/skips; TypeScript compilado. npm test encontrou incompatibilidade do Node 24 com argumento de pasta test/; a execução com lista explícita de arquivos passou. Não foi necessário alterar código da extensão.
- Ruff, pip check, lint dos quatro arquivos PHP novos, git diff --check e quick_validate.py em UTF-8: PASS. c2f ai:sync: 45/45 contratos válidos nos cinco kits do core.
- [Auditoria de artefatos](../../completions/BATCH-074-artifact-audit.json): 45 skills, dez cópias SHA-256 idênticas, dois catálogos 45/45, dezoito arquivos estruturais/modelos, onze links de índices válidos.
- docs:audit: exit 0, zero erros, 253 warnings do acervo do produto; não houve build/publicação das docs.
- Revisão independente autorizada por REQ-072 triade: cinco defeitos de parsing/mutação identificados e corrigidos, mais a expansão de folding com parágrafo indentado; probes e 48 testes executados novamente pelo Revisor. [Ficha](../human-reviews/rev-074.md).

### Defeitos encontrados e corrigidos

1. CRLF no fallback de status causava diferença entre linguagens.
2. Contagem fixa de 44 em sync.py impedia operar catálogo de 45.
3. Mutação de bloco interrompida em linha vazia deixava YAML inválido; substituição agora percorre a entrada completa.
4. Plain scalar inválido com dois-pontos/espaço ou indicador reservado era aceito; mutação agora recusa sem escrita.
5. Folding/chomping de blocos, inclusive linhas vazias e trechos mais indentados, divergiam de YAML real; testes comparados com PyYAML.
6. Comentário indentado independente era removido pelo regex; scanner agora o preserva.
7. U+2028/U+2029 tinham bytes diferentes; escrita Python usa os mesmos escapes de PHP.

### Limites e preservação

- Dialeto YAML de mapeamento escalar/string com blocos; listas, objetos, âncoras e tags são tolerados por fallback em leitura e recusados para mutação. Vocabulários/limites editoriais não são validados pelas CLIs.
- Dois arquivos não formam transação de filesystem: crash entre substituições exige regenerar índice; cada substituição individual é atômica e falha ordinária de índice faz rollback. Lock órfão exige inspeção, não remoção automática.
- Auditoria global de skills permanece **FAIL com 52 divergências**, todas nas três skills canônicas que já tinham edições alheias na abertura: c2f-ai-features, c2f-modelo-templates e c2f-module-visual-assets. Bytes dessas skills e seus espelhos foram preservados. Nova skill tem PASS independente; não alegamos PASS global. [Relatório completo](../../completions/BATCH-074-skills-audit.json).
- MCP Hub não disponibilizado na sessão: recibo e despacho para Revisor local persistidos; sem report_completion/dispatch_task remotos.
- Windows/Python 3.12 e PHP 8.5 executados; não executados Linux, suíte PHP completa do produto, CI remoto, banco, UI, deploy, publicação, testes reais de watcher/IA nem integração VS Code dual. Não são parte do código alterado neste lote.
- Gerador legado de index.md em init/compact mantido, não integrado à API nova; após essas rotinas, mdd index restaura a tabela canônica. human-reviews pendentes não são arquivadas automaticamente.
- Arquivos normativos de conteúdo previamente existentes mantidos, salvo deltas explícitos da requisição; texto histórico não foi revalidado integralmente. Memória de Chefia não alterada, sem memory gardening.

### Commits e handoff

- Core conn2flow: `67e99d41834f55e7fc9ddf15d563b5977e16a91f`.
- Matriz conn2flow-ai-workspace: `1e26ae63402cb34fc0a5930b9bac2a760ec750ad`.
- Ambos com lista explícita de arquivos; espelhos ignorados foram adicionados por caminho exato com git add -f, sem arrastar outras skills. output/ do core e três skills alheias da matriz permanecem fora dos commits.
- Recibo: [BATCH-074-receipt.json](../../completions/BATCH-074-receipt.json). Topologia triade / autonomo_monitorado; Revisor Independente acionado em contexto de ambos os projetos e raízes absolutas.
- Próximo evento: homologação humana da ficha rev-074.md; o estado técnico ready-for-review não representa fechamento humano.

## Quality Gate humano

- [ ] Homologação humana identificada em memory/human-reviews/rev-074.md.
