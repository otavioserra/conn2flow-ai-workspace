---
verified_at: 2afd000
sources:
  - ../../.gemini/skills/c2f-ai-features/SKILL.md
  - ../../scripts/skills/sync-skills.cjs
---

# Catálogo de 44 skills canônicas

[English](../en/SKILLS-CATALOG.md) · [Índice da documentação](README.md)

A fonte canônica é .gemini/skills/. Os kits .claude/, .cursor/, .codex/ e .github/ recebem os espelhos pelo sincronizador oficial. Carregue somente as skills pertinentes à tarefa e leia o SKILL.md completo antes da operação correspondente. Nomes legados sdd-* são preservados como identificadores; a matriz usa memory/.

## Papéis da tríade — 3 skills

| Skill | Quando usar |
| --- | --- |
| [`c2f-architect-master`](../../.gemini/skills/c2f-architect-master/SKILL.md) | Especificações aprovadas, decisões, briefings e homologação. |
| [`c2f-executor-agent`](../../.gemini/skills/c2f-executor-agent/SKILL.md) | Implementação aprovada, Live Todo List, verificações e recibos. |
| [`c2f-reviewer-agent`](../../.gemini/skills/c2f-reviewer-agent/SKILL.md) | Auditoria independente findings-first e conferência de evidências. |

## Core, módulos e infraestrutura — 34 skills

| Skill | Quando usar |
| --- | --- |
| [`c2f-ai-features`](../../.gemini/skills/c2f-ai-features/SKILL.md) | Integração de IA do Conn2Flow Pro pelos oito pilares abaixo. |
| [`c2f-agent-visual-inspection`](../../.gemini/skills/c2f-agent-visual-inspection/SKILL.md) | Inspeção autônoma de telas, console, animações e rotas autenticadas. |
| [`c2f-database-operations`](../../.gemini/skills/c2f-database-operations/SKILL.md) | SQL, CRUD via banco.php e migrações Phinx. |
| [`c2f-database-testing`](../../.gemini/skills/c2f-database-testing/SKILL.md) | Testes isolados SQLite/MySQL e fixtures realistas de banco. |
| [`c2f-dev-scripts`](../../.gemini/skills/c2f-dev-scripts/SKILL.md) | Scripts do projeto, caminhos CLI e ambientes de execução. |
| [`c2f-docker-environment`](../../.gemini/skills/c2f-docker-environment/SKILL.md) | Operações em containers, portas e dados locais sincronizados. |
| [`c2f-documentation`](../../.gemini/skills/c2f-documentation/SKILL.md) | Docs bilíngues derivadas do código, metadados e pipeline de publicação. |
| [`c2f-documentation-governance`](../../.gemini/skills/c2f-documentation-governance/SKILL.md) | Conferir documentação técnica na fonte autoritativa. |
| [`c2f-environment-configuration`](../../.gemini/skills/c2f-environment-configuration/SKILL.md) | Credenciais, variáveis de ambiente e configuração central. |
| [`c2f-gd-image-safety`](../../.gemini/skills/c2f-gd-image-safety/SKILL.md) | Suporte a formatos, memória e integridade de imagens no PHP GD. |
| [`c2f-gestor-functions`](../../.gemini/skills/c2f-gestor-functions/SKILL.md) | Layouts, sessões, redirecionamentos e funções de gestor.php. |
| [`c2f-global-variables`](../../.gemini/skills/c2f-global-variables/SKILL.md) | Acesso seguro às globais de roteamento, configuração e banco. |
| [`c2f-hooks-system`](../../.gemini/skills/c2f-hooks-system/SKILL.md) | Actions, filters registrados e parâmetros de extensibilidade. |
| [`c2f-html-css-pages-and-components`](../../.gemini/skills/c2f-html-css-pages-and-components/SKILL.md) | Autoria de telas e componentes no sistema de recursos. |
| [`c2f-interface-v2-architecture`](../../.gemini/skills/c2f-interface-v2-architecture/SKILL.md) | Modais administrativos, cards, breadcrumbs e layout responsivo. |
| [`c2f-javascript-ajax`](../../.gemini/skills/c2f-javascript-ajax/SKILL.md) | AJAX com CSRF, fetch, multipart e envelopes JSON. |
| [`c2f-json-resources-sync`](../../.gemini/skills/c2f-json-resources-sync/SKILL.md) | Compilação Data.json, checksums e sincronização de recursos. |
| [`c2f-modelo-templates`](../../.gemini/skills/c2f-modelo-templates/SKILL.md) | Templates modelo e suas convenções de renderização. |
| [`c2f-module-crud-scaffolding`](../../.gemini/skills/c2f-module-crud-scaffolding/SKILL.md) | Módulos administrativos canônicos, CRUD e histórico de auditoria. |
| [`c2f-module-visual-assets`](../../.gemini/skills/c2f-module-visual-assets/SKILL.md) | Capas, thumbnails de módulos e prompts visuais canônicos. |
| [`c2f-multilingual-system`](../../.gemini/skills/c2f-multilingual-system/SKILL.md) | Isolamento de idiomas, rotas internacionais e consultas. |
| [`c2f-mysql-utf8-emoji-encoding`](../../.gemini/skills/c2f-mysql-utf8-emoji-encoding/SKILL.md) | Persistência MySQL de emojis e caracteres Unicode especiais. |
| [`c2f-payment-gateways`](../../.gemini/skills/c2f-payment-gateways/SKILL.md) | Autoridade de pagamentos, webhooks idempotentes e testes sem credenciais. |
| [`c2f-plugin-architecture`](../../.gemini/skills/c2f-plugin-architecture/SKILL.md) | Empacotamento, instalação, tabelas e remoção limpa de plugins. |
| [`c2f-preview-modals-system`](../../.gemini/skills/c2f-preview-modals-system/SKILL.md) | Prévias ao vivo no editor, isolamento de iframe e CSP. |
| [`c2f-project-pipeline-and-tasks`](../../.gemini/skills/c2f-project-pipeline-and-tasks/SKILL.md) | Pipelines sequenciais de sincronização, builds, testes e deploy. |
| [`c2f-projects-system`](../../.gemini/skills/c2f-projects-system/SKILL.md) | Sobreposições de projeto, isolamento de tenants e deploy. |
| [`c2f-resources-system`](../../.gemini/skills/c2f-resources-system/SKILL.md) | Tipos de recursos nativos, vínculos, builds e invalidação de cache. |
| [`c2f-shell-and-windows-traps`](../../.gemini/skills/c2f-shell-and-windows-traps/SKILL.md) | Escapes PowerShell/Git Bash, MSYS, junctions e binários de ferramentas. |
| [`c2f-system-tasks`](../../.gemini/skills/c2f-system-tasks/SKILL.md) | Jobs de background, tarefas agendadas, workers e prevenção de loops. |
| [`c2f-tailwind-css-architecture`](../../.gemini/skills/c2f-tailwind-css-architecture/SKILL.md) | Cascata Tailwind v4, CSS derivado do banco e integridade de build. |
| [`c2f-tailwind-module-migration`](../../.gemini/skills/c2f-tailwind-module-migration/SKILL.md) | Migração de módulos Fomantic para Tailwind e compatibilidade do JS legado. |
| [`c2f-variables-system`](../../.gemini/skills/c2f-variables-system/SKILL.md) | Rótulos, mensagens e textos de interface localizados e configuráveis. |
| [`c2f-widget-development`](../../.gemini/skills/c2f-widget-development/SKILL.md) | Renderizadores de widgets, isolamento de escopo e grids modulares. |

## Governança e workflow — 7 skills

| Skill | Quando usar |
| --- | --- |
| [`sdd-workflow`](../../.gemini/skills/sdd-workflow/SKILL.md) | Classificar mudanças e seguir governança e autoridade da memória. |
| [`start-sdd-slice`](../../.gemini/skills/start-sdd-slice/SKILL.md) | Iniciar requisição aprovada delimitada com critérios de aceite. |
| [`continue-sdd-batch`](../../.gemini/skills/continue-sdd-batch/SKILL.md) | Retomar o lote atual sem repetir etapas concluídas. |
| [`raise-spec-change`](../../.gemini/skills/raise-spec-change/SKILL.md) | Propor alterações normativas por change requests aprovadas. |
| [`review-current-batch`](../../.gemini/skills/review-current-batch/SKILL.md) | Revisar evidências e diffs antes de aprovação humana ou PR. |
| [`project-validation`](../../.gemini/skills/project-validation/SKILL.md) | Executar verificações capazes de detectar regressões reais e declarar limites. |
| [`sdd-memory-gardening`](../../.gemini/skills/sdd-memory-gardening/SKILL.md) | Manutenção por limiares, preservação de memória e reparo de links. |

## c2f-ai-features: oito pilares de IA do Conn2Flow Pro

1. **Provedor unificado** — Use a camada compartilhada de provedores; módulos não duplicam adaptadores HTTP.
2. **Créditos pelos hooks** — Autorize e contabilize por hooks registrados; não debite duas vezes nem presuma cobrança por hooks ausentes.
3. **Modos editáveis, segurança fixa** — Mantenha instruções de escrita configuráveis e permissões, limites e sanitização fixos.
4. **Isolamento de dados** — Envolva contexto mínimo autorizado em delimitadores de dados, trate injeção de delimitadores e valide a saída.
5. **Renderização segura** — Use nós de texto ou whitelist testada; nunca renderize resposta não sanitizada como HTML cru.
6. **Telemetria sem conteúdo bruto** — Registre metadados permitidos, tokens e status, sem prompts, texto gerado ou segredos.
7. **Degradação graciosa** — Exercite ausência de provedor, créditos insuficientes, recusa, timeout e falhas mantendo ações independentes utilizáveis.
8. **Dados sensíveis e banco** — Exclua senhas/hashes, masque identidades e libere a conexão MySQL antes de espera HTTP longa.

Estes são procedimentos da skill canônica, não uma certificação de cada módulo do Pro. Confira a biblioteca e os módulos reais antes de integrar; valide pedido mascarado, resposta, permissões e falhas. Sem provedor acessível, declare testes com dublês e não atribua homologação de resposta real.

## Sincronização e preservação

```sh
node scripts/skills/sync-skills.cjs
node scripts/skills/sync-skills.cjs --apply c2f-ai-features
```

Execute na raiz da matriz. O primeiro comando audita sem escrever; o segundo propaga a skill nomeada para os alvos configurados. O script preserva skills locais exclusivas e traduções declaradas de templates; --apply --all é reservado à propagação de todo o catálogo. mdd sync é o equivalente previsto no Client Python, ainda sem implementação neste checkout.

O total foi conferido nas 44 pastas canônicas com SKILL.md. Contagens e alvos de sincronização vêm do script, não de números históricos nos guias. Consulte o [guia CLI/MCP](GUIA-RAPIDO-CLI-E-MCP.md).
