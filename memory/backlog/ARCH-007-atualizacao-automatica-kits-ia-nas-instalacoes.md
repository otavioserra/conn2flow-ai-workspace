# ARCH-007 — Atualização Automática dos Kits de IA nas Instalações (Repositórios Satélites)

* **Status**: `ICEBOX`
* **Tipo**: Arquitetura / Distribuição de Kits
* **Autor**: Humano-no-Loop & Macro-Arquiteto
* **Data de Criação**: 2026-09-25
* **Repositórios Alvo**: `conn2flow-ai-workspace` (Matriz Central), `conn2flow` (CLI `c2f`), satélites (`conn2flow-site`, `lumix`, `transformamp` e futuros)
* **Relacionados**: [FEAT-014](FEAT-014-programa-documentacao-core-e-site.md) (a skill de documentação será o primeiro recurso a se beneficiar)

---

## 1. Problema

Hoje cada recurso de IA instalado nos repositórios só é atualizado quando alguém lembra de rodar `scripts/sync-all-repos.ps1`. Isso vale para skills, agents, rules, hooks, `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` e o boilerplate SDD.

- Os instaladores (`install-spec-driven-*-kit.ps1`) copiam com `-Force`.
- **Não gravam versão, manifesto nem hash** no destino.
- Consequências:
  - Não há como saber se um satélite está desatualizado.
  - Não há como distinguir "arquivo antigo" de "arquivo customizado localmente de propósito".
  - A lista de alvos está fixa no script (4 repositórios).
  - O `c2f ai:sync` só **audita** contratos, não distribui.

## 2. Proposta de solução

### 2.1 Manifesto versionado na Matriz
- A cada release do kit, gerar `kits/kit-manifest.json` com:
  - `versao` (semver);
  - `commit`;
  - para cada arquivo distribuído: `{ caminho_destino, sha256, kit, idioma }`.
- Tag git `kit-vX.Y.Z` na Matriz. Opcionalmente, um artefato zip anexado a uma GitHub Release, para máquinas sem o repositório clonado.

### 2.2 Lockfile em cada instalação
- O instalador passa a gravar `.c2f-kit.lock` na raiz do satélite, com a versão instalada e o `sha256` de cada arquivo **como foi instalado**.
- Isso permite classificar cada arquivo em três estados, no mesmo espírito do `user_modified` do pipeline de recursos:
  - **intacto**: o hash local é igual ao do lock, então pode atualizar;
  - **customizado**: o hash local é diferente do lock, então **não sobrescreve** e reporta (ou oferece um merge de 3 vias);
  - **removido na nova versão**: remove somente se estiver intacto.

### 2.3 Comando único no CLI (`c2f ai:kit`)
- `c2f ai:kit status`: compara lock × manifesto da Matriz e lista o que está desatualizado e o que foi customizado.
- `c2f ai:kit update [--dry-run] [--force-file=<caminho>]`: aplica a atualização respeitando os estados acima e regrava o lock.
- Origem configurável: caminho local da Matriz (padrão do ambiente de desenvolvimento) **ou** tag/artefato remoto.
- O `ai:sync` continua como auditoria de contrato, rodando depois do `update`.

### 2.4 Gatilhos (do menos para o mais automático)
1. **Aviso no início da sessão:** um hook `SessionStart` (Claude Code) e o equivalente nos outros kits roda `c2f ai:kit status --quiet`. Se houver atraso, avisa o agente e o humano: "kit v1.8.0 instalado, Matriz em v1.9.2".
2. **Propagação local ao publicar:** ao criar a tag `kit-v*` na Matriz, um script ou `post-tag` roda `ai:kit update --dry-run` em todos os satélites registrados e mostra o relatório. A aplicação continua humana.
3. **Registro de satélites:** a lista de alvos sai do script e vai para um `kits/satellites.json`, eliminando a lista fixa do `sync-all-repos.ps1`.
4. **(Futuro) CI:** uma GitHub Action nos satélites abre um PR automático "chore(kit): atualizar para vX.Y.Z" quando sai nova tag. Nada de commit direto na `main`.

### 2.5 Regras de segurança
- Nunca commitar, dar push ou fazer deploy automaticamente (Nível 1 como padrão). O PR automático do item 4 é o limite.
- Arquivo customizado nunca é sobrescrito sem `--force-file` explícito.

## 3. Ponto em aberto
- Confirmar o escopo de "recursos instalados":
  - **somente os kits de IA** nos repositórios (esta proposta);
  - **também** os recursos do sistema (templates, widgets, páginas) nas instalações Conn2Flow em produção. Esse caso já tem caminho próprio via atualização do gestor e `project:update` e seria outro item.

## 🔒 Regra de Governança
Este item está no Backlog e não é executável até promoção formal humana para `sdd/human-requests/`, atualização de `CURRENT.md` e associação a um batch. Deve ser tratado **depois** da fase 1 do FEAT-014.
