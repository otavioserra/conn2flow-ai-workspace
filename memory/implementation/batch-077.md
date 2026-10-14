---
id: "BATCH-077"
title: "Skills MDD e proporcionalidade de build"
status: "ready-for-human-review"
date: "2026-10-14"
author: "executor"
target_repo: "conn2flow-ai-workspace, conn2flow, conn2flow-site, lumix, transformamp, conn2flow-home"
summary_short: "Canonização de quatro skills MDD, seleção proporcional de build e propagação segura dos kits."
summary_medium: "REQ-075 aprovada; triade, autonomo_monitorado. Homologações visuais ficam na fila humana para avaliação posterior."
---

# BATCH-077 — REQ-075

## Live Todo

- [x] 1.1 Renomear quatro skills canônicas.
- [x] 1.2 Atualizar caminhos, gatilhos, referências e poda dual.
- [x] 1.3 Guias raiz e templates bilíngues atualizados.
- [x] 1.4 Cinco superfícies espelhadas.
- [x] 1.5 Pastas legadas removidas por migração segura.
- [x] 2.1 Executor com proporcionalidade A/B/C.
- [x] 2.2 Pipeline e --skip-css documentados conforme código Core.
- [x] 2.3 Recursos com dispensa de CSS para backend.
- [x] 2.4 Starter prompt atualizado.
- [x] 3.1 Propagação e auditoria canônicas.
- [x] 3.2 Python e extensão verdes.
- [x] 3.3 Relatório e recibo preenchidos.
- [x] 3.4 Revisor Independente e rev-077.md.
- [ ] 3.5 Homologação humana (adiada pelo usuário).
- [x] Commit/push das alterações autorizadas; confirmar refs remotas (home local, sem remote configurado).

## Estado inicial e autorização

Raiz matriz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace. Core: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow. CURRENT ainda apontava REQ-074; nova REQ-075 aprovada pelo Arquiteto e explicitamente acionada pelo humano. Branch main, HEAD 68d09c3, alinhada com origin/main na abertura.

Entrega BATCH-076 permanece local e revisada; usuário autorizou commit/push/merge nesta sessão. Três skills canônicas anteriores (.gemini c2f-ai-features, c2f-modelo-templates, c2f-module-visual-assets) são alterações alheias e permanecem fora da consolidação, assim como suas cópias propagadas. Não usar staging amplo.

Arquivo de pendências localizado: memory/03-memory-engineering-chief.md, Fila de Pendências Ativas do Engenheiro Chefe. Usuário autorizou acrescentar passos de homologação; não marcar assinaturas nem alterar diretrizes anteriores.

Categoria B: skills, testes e memória. Sem deploy, CSS ou banco. Core REQ-269 verificada por leitura de ProjectUpdateAllCommand, ManagerUpdateAllCommand, ProjectSyncCoreCommand, ProjectSyncDbCommand e script sync-core-to-project.sh. --skip-css suportado; meta de <45s não será alegada como tempo medido neste lote.

## Evidências, defeitos e limites

- Propagador oficial: 44 alvos, 1.903 cópias exatas, 21 traduções preservadas, 60 skills locais intactas; auditoria posterior sem escrita/renomeação. Exatamente 45 skills canônicas, sem as quatro pastas legadas nos seis repos/cinco kits. Auditoria adicional: 1.350 cópias nos cinco kits dos seis repositórios.
- Migração usa rename de diretórios completos e preflight; recusa coexistência e junctions. Seis testes novos cobrem idempotência, auxiliares, ação parcial, proteção contra links pelo Python/Node e migração/conflito dos registros de customização intencional. Chaves seguem o caminho novo; hashes não são recalculados para fabricar um reconhecimento.
- Python: 131/131 PASS, zero skips; cobertura 97,17%. Extensão: 133/133 PASS, compilação TypeScript limpa. JUnit/log/cobertura/resumo em completions/BATCH-077-*.
- VSIX 1.1.4 gerado porque prompts de backlog da extensão ainda chamavam start-sdd-slice; agora usam start-mdd-slice. Pacote e hashes verificados; não instalado/publicado.
- Guias raiz, CODEX, agentes Claude e templates bilíngues usam nomes atuais; traduções inglesas de gardening foram migradas em inglês, sem sobrescrita pelo português. Árvores físicas de boilerplates SDD históricos preservadas; suas referências de skills são MDD.
- Categoria B: sem deploy, banco, Docker, Tailwind ou limpeza de ambientes. [Core REQ-269/BATCH-278](../../../conn2flow/memory/implementation/BATCH-278.md) registra medição de 36s com flag vs 40s completo/cache quente; evidência herdada lida, não repetida. Picos de 10–15min não são atribuídos universalmente ao Tailwind. Manager limitado por ausência de Docker no host daquela medição, igualmente sem a flag.
- Ruff, sintaxe Node e diff check da matriz PASS. Home: o check tradicional de whitespace sinalizou 25 novas cópias de cinco skills com espaços finais/linha vazia já presentes no commit canônico 68d09c3; comparação dos blobs confirma conteúdo herdado sem alteração. Preservada a paridade em vez de reformatar skills fora do escopo; prova em [BATCH-077-home-whitespace.json](../../completions/BATCH-077-home-whitespace.json). Avisos Starlette/AnyIO e vsce DEP0190. Windows/Python 3.14; CI/Linux e avaliação visual humana não executados.
- Pendências humanas detalhadas adicionadas por autorização explícita ao final de memory/03-memory-engineering-chief.md; memória saudável não podada. Assinaturas REV-076/REV-077 ficam vazias.
- Revisão independente [REV-077](../human-reviews/rev-077.md) com RECOMMEND-APPROVAL. Consolidação e pushes autorizados concluídos; MCP Hub indisponível, com recibo em arquivo e ferramenta de agentes.

## Defeitos corrigidos antes da entrega

Fonte antiga documentava arquivador legado como compatível com memory; instruções corrigidas para o cliente MDD existente, sem inventar comandos. A skill de pipeline também descrevia quatro etapas de manager e uma ordem antiga das oito etapas de project; agora segue o código verificado, com a exceção A explícita. Referências CODEX e prompts da extensão à skill antiga foram encontradas e atualizadas.

Revisão corrigiu P1: a via cirúrgica de Core/banco agora inclui --core-resources para preservar dono dos seeds, como o pipeline real. P2: tabela e resumo antigos de etapas foram alinhados/removidos; o prompt de backlog usa fonte do escopo real memory/ ou sdd/, com testes em EN/PT-BR. Preservação dos reconhecimentos intencionais foi fortalecida também para propagação global; conflitos de manifestos são recusados antes de renomear diretórios.

## Consolidação Git e pendências finais

Somente caminhos específicos foram adicionados. Sem merge: as cinco branches conectadas permitiam push por avanço direto; a branch existente do Lumix foi preservada. [Resumo Git](../../completions/BATCH-077-git-summary.json), com commits e refs conferidas por git ls-remote:

| Repositório | Branch | Commit de implementação | Push |
| --- | --- | --- | --- |
| conn2flow-ai-workspace | main | cc0107a | confirmado; inclui BATCH-076 e BATCH-077 |
| conn2flow | main | 7f8edac | confirmado |
| conn2flow-site | main | 3f663b2 | confirmado |
| lumix | novo-chat-intelligence | 9ff52f4 | confirmado |
| transformamp | main | 489c5f7 | confirmado |
| conn2flow-home | main | ef71824 | local; repositório sem remote |

Três skills alheias e suas cópias (c2f-ai-features, c2f-modelo-templates, c2f-module-visual-assets), além de alterações anteriores de outros repositórios, ficaram fora dos commits. A auditoria certifica paridade da working tree propagada; essas alterações anteriores continuam locais, sem serem publicadas por este lote. [Plano explícito de stage](../../completions/BATCH-077-stage-plan.json) registra os caminhos selecionados e preservados.

Homologação visual permanece pendente em [03-memory-engineering-chief.md](../03-memory-engineering-chief.md), com instalação do VSIX 1.1.4, conferência de escopo, choques, skills e proporcionalidade. Fichas REV-076 e REV-077 mantêm assinaturas vazias. Não houve instalação da extensão na janela humana, deploy, banco, limpeza do Lab ou publicação no Marketplace.
