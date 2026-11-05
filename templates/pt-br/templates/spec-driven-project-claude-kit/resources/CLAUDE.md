# 🎨 Contexto Especializado: Sistema de Recursos (`resources/`)

Ao atuar no diretório de recursos (`resources/` ou `gestor/resources/`), você está manipulando a semente de compilação de layouts, páginas, componentes e assets.

## ⛔ Regras Invioláveis de Recursos
1. **Fonte da Verdade em Runtime (Banco vs Disco)**:
   - O runtime do Conn2Flow serve HTML e CSS exclusivamente do **BANCO DE DADOS** SQL (`gestor.php:2782`).
   - O diretório `resources/` é a **semente de compilação de autoria** — arquivos em disco NÃO chegam ao visitante até que o pipeline oficial seja executado:
     * Para o sistema: `./c2f manager:update-all` (4 etapas com `css:rebuild`)
     * Para projetos: `./c2f project:deploy <id>` (pipeline padrão do projeto; não é o pipeline de seis etapas do Core)
2. **Os 11 Tipos Canônicos de Recursos**:
   - Todo recurso reside sob `<idioma>/<tipo>/<id>/<id>.html` e `<id>.json`.
   - Proibido arquivos soltos `.html`, `.css` ou `.md` fora da taxonomia oficial (`c2f-html-css-pages-and-components`).
3. **Regra Mandatória de Version Bump**:
   - Ao alterar qualquer arquivo JavaScript ou CSS estático, **obrigatoriamente incremente o campo `"versao"`** no arquivo de metadados `<id>.json` (`c2f-resources-system` e `c2f-javascript-ajax`). Isso previne cache stale em navegadores de clientes e agentes de teste.
4. **Governança do Tailwind CSS v4**:
   - Nunca execute comandos Tailwind CLI manuais (`npx tailwindcss`). Use `./c2f resources:sync`.
   - Separação estrita: `html`/`css` = AUTORIA vs `css_precompiled`/`css_compiled` = DERIVADO. Para recalcular CSS use `./c2f css:rebuild`.

## REQ-077 — Pipeline, worktrees e preservação (DEC-136)

- Projeto: `./c2f project:deploy <id>` é o padrão (95% dos casos). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` é proibido na rotina de projeto; permitido exclusivamente em lote que altera Core e projeto simultaneamente.
- Antes de deploy, confira `git branch --show-current` e `git status --short` na origem; não publique trabalho alheio/inacabado. Confira o destino e sua autorização. Categoria B (skills/documentação/testes/memória): somente checks locais, sem deploy. Execução sequencial, foreground, logs e locks continuam obrigatórios.
- Worktrees por conveniência são proibidas. Só criar com concorrência multi-agente comprovada no mesmo repositório; em dúvida, consultar o humano antes. Registre raiz original, caminho temporário e concorrência na requisição e lote. Ao concluir/homologar, audite trabalho único, integração na main e junctions, então `git worktree remove <caminho>` e `git worktree prune`. Nunca use força para destruir trabalho não integrado; preserve e reporte impedimentos.
- DEC-136: manter por padrão; nada é removido (arquivo, `status='D'`, `DELETE`) sem confirmação explícita do operador humano. Retirada vira choque pendente; `--confirmar-retirada` só quando pedido pelo operador. Fonte incompleta não autoriza retirada.
