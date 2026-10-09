# BATCH-069 — Fundação MDD e lições do BL-028

- Projeto: conn2flow-ai-workspace
- Raiz: C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace
- Requisição: [REQ-067](../human-requests/req-067.md)
- Status: ready-for-review
- Autonomia: autonomo_monitorado
- Data: 2026-10-09

## Live Todo List

- [x] 1. Renomear sdd/ para memory/ via git mv.
- [x] 2. Criar 00-baseline-architecture.md, 01-general-memory.md e 02-policy.md.
- [x] 3. Provisionar reports/ com BL-028 integral e raw/active/ e raw/archive/.
- [x] 4. Provisionar index.md e archive/compacted/ e archive/original/ nas áreas canônicas.
- [x] 5. Criar c2f-ai-features com oito pilares e fronteiras comprovadas do core.
- [x] 6. Adicionar Armadilhas 18 e 19.
- [x] 7. Atualizar as sete skills correlatas, mantendo traduções declaradas.
- [x] 8. Atualizar AGENTS.md e GEMINI.md para MDD e 44 skills.
- [x] 9. Sincronizar pelo script oficial e auditar os 39 alvos.
- [x] 10. Executar 124/124 testes da extensão, com compilação e smoke de descoberta MDD/SDD.
- [x] 11. Preencher checklist, relatório e recibo.

## Entregas e evidências

Migração comprovada por 219 renames R100 no índice Git. Snapshot independente confirma a presença dos 231 arquivos físicos anteriores (incluindo 12 arquivos locais ignorados), sem perda; arquivos atualizados são enumerados na auditoria estrutural. A baseline antiga foi preservada byte a byte em reports/archive/original/ e recebeu síntese compactada. O BL-028 foi importado com SHA-256 igual à fonte do site.

A tríade raiz define quatro camadas, ciclo de memória, contexto econômico, pastas, janela de dez ativos, teto ativo de 50 KB, router abaixo de 30 KB, SLAs por evento e modos supervised/monitored/headless com aliases existentes. Provisionamento alcança todas as áreas solicitadas, mais process/, e todos os nós de arquivo legados. Os índices são gerados pelo script do lote com tabela padronizada e links relativos verificados.

A nova skill cobre provedores unificados, créditos pelos hooks, modos editáveis, envelope de dados, saída segura, telemetria sem texto, degradação e mascaramento/liberação MySQL. A leitura do core confirmou assinaturas, pedido.autorizar/pedido.concluido, liberação antes do HTTP e comportamento de exceções nos hooks. Não se promete bloqueio por crédito sem a integração Pro registrada.

Skills correlatas receberam CSS isolado de hooks e #x#, leitura restrita a main, montagem tardia com MutationObserver, scripts por arquivo, contrato de banco_select, locks, fixtures realistas, inspeção de respostas, limpeza finally, Como usar com termos da UI, links externos e verificação de refs por git ls-remote. Traduções de project-validation e sdd-memory-gardening foram editadas em inglês nos templates, sem cópia manual.

| Verificação | Resultado | Evidência |
| --- | --- | --- |
| Estrutura, preservação e links de índices | PASS | [estrutura](../../completions/BATCH-069-structure-audit.json) |
| Propagação oficial | PASS | [apply](../../completions/BATCH-069-skills-apply.json) |
| Auditoria MD5 e por alvo | PASS: 44 skills, 39 alvos, 1.653 iguais, 21 traduções, zero divergências | [auditoria](../../completions/BATCH-069-skills-audit.json) |
| Preservação local | PASS: 60 SKILL.md no sincronizador; SHA-256 independente de 36 skills dos satélites | [preservação](../../completions/BATCH-069-preservation-audit.json) |
| Extensão VS Code | PASS: 124/124, zero falhas/skips | [testes](../../completions/BATCH-069-extension-tests.json) / [log](../../completions/BATCH-069-extension-tests.log) |
| Descoberta matriz memory/ e core sdd/ | PASS, incluindo prefixos legados e MDD | [smoke](../../completions/BATCH-069-extension-scope-smoke.json) |
| Compilação TypeScript | npm.cmd run compile, exit 0 | Executado antes da suíte final |
| Skill nova | quick_validate.py: Skill is valid!, exit 0 | PyYAML instalado somente em pasta temporária |
| Scripts e diff | node --check e git diff --check (stage e working tree), exit 0 | Verificador reproduzível |

O total histórico “60 skills dos satélites” é impreciso: são 9 do site, 8 do lumix, 19 do transformamp (36), mais 24 locais nos templates. Todas as 60 foram preservadas pelo sincronizador; o snapshot independente cobre todos os arquivos das 36 skills satélites.

Reprodução: node scripts/memory/batch-069.cjs indexes; node scripts/memory/verify-batch-069.cjs. Propagação é exclusivamente node scripts/skills/sync-skills.cjs --apply --all; auditoria oficial usa --report completions/BATCH-069-skills-audit.json. Ao reemitir o relatório oficial agregado, execute o verificador para acrescentar os resultados por alvo.

## Defeitos achados e corrigidos antes da entrega

- Migração quebrou teste que lia sdd/human-requests/CURRENT.md: atualizado para memory/. A descoberta da extensão ganhou suporte à matriz MDD, com preferência por memory/, sem migrar satélites.
- Índice herdava links de resumos sem ajustar sua base: gerador mantém resumo textual e link dedicado, com validação de todos os destinos.
- Validador de skills não aceita user-invocable: a nova skill usa somente os campos portáveis name/description, mantendo descoberta automática.
- npm.ps1 foi bloqueado pela política do host: compilação executada com npm.cmd e confirmada separadamente, sem alterar a política.

## O que não foi exercitado

- Nenhuma geração real de IA, cobrança, banco de dados, publicação de documentação ou UI do Gestor foi executada; a entrega é governança e skills. O BL-028 permanece histórico integral, e suas alegações operacionais não foram todas reproduzidas neste lote.
- Nenhuma worktree foi removida; as instruções de remoção são documentação do incidente e procedimento seguro, sem teste destrutivo.
- Instância interativa do VS Code não foi aberta; descoberta foi exercitada no JS compilado com stub do host e caminhos reais.
- Revisão independente e homologação do Arquiteto não foram simuladas como concluídas.

## Limites conhecidos

- Client CLI Daemon ARCH-010 e Hub/Watcher ARCH-011 permanecem fora de escopo.
- Satélites, boilerplates, instaladores e identificadores/comandos SDD existentes permanecem compatíveis. A extensão encontra a matriz MDD, mas os textos históricos SDD não foram renomeados em massa; release v1.1.2 pertence à REQ-062.
- Históricos legados em archive/ foram indexados no lugar; não foram movidos para original/ em massa nem podados. O arquivo validation/archive/validation-004-050.md tem 66.318 bytes e é histórico, fora do teto de documentos ativos. Referências absolutas à antiga raiz da matriz foram reparadas; links históricos não foram homologados integralmente, apenas links dos índices gerados e entregas novas.
- A nova regra dos dez ativos e teto MDD não executa gardening de documentos saudáveis; a manutenção futura requer preservação dual e reparo de links. SPEC permanece contrato existente dos instaladores e templates SDD.
- MCP Hub não estava exposto como ferramenta nesta sessão. Comandos foram executados localmente e recibo JSON foi emitido em completions/.

Entrega técnica pronta para revisão; sem commit, push ou deploy de produção.
