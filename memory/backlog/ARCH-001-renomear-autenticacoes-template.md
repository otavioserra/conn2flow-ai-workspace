# ARCH-001: Renomear autenticacoes.exemplo para autenticacoes.template

*   **Status**: `ICEBOX`
*   **Tipo**: Arquitetura / Refatoração Semântica
*   **Data de Registro**: 2026-08-18
*   **Solicitante**: Chief Engineer / User
*   **Prioridade**: Baixa (Plano Futuro)

---

## 🎯 Contexto e Justificativa

No Conn2Flow, a palavra `template` é o padrão semântico adotado para modelos base (ex: templates de página, templates de kit de IA). A pasta de referência de credenciais e variáveis de ambiente atualmente se chama `gestor/autenticacoes.exemplo/`.

O termo `.exemplo` induz agentes de IA a pensar que se trata de código descartável de teste, quando na verdade funciona como o **template canônico de variáveis de ambiente** que deve ser mantido sincronizado para mesclagem automática no `.env` da instância nos deploys.

Renomear para `gestor/autenticacoes.template/` estabelece total clareza semântica para desenvolvedores e agentes de IA.

---

## 📋 Mapeamento de Impacto (Checklist para Execução Futura)

### 1. Diretório Físico:
- [ ] Renomear `gestor/autenticacoes.exemplo/` ➔ `gestor/autenticacoes.template/` no repositório `conn2flow`.

### 2. Scripts de Build e Release:
- [ ] `.github/workflows/release-gestor.yml` (linha 175): Atualizar regra `find -not -path '*/autenticacoes.template/*'`
- [ ] `ai-workspace/pt-br/scripts/updates/build-local-gestor.sh` (linha 45)
- [ ] `ai-workspace/en/scripts/updates/build-local-manager.sh` (linha 45)
- [ ] `ai-workspace/en/scripts/releases/release.sh` (linha 138)

### 3. Documentações e Prompts:
- [ ] `README.md` e `README-PT-BR.md`
- [ ] `ai-workspace/pt-br/docs/CONN2FLOW-ATUALIZACOES-SISTEMA.md`
- [ ] `ai-workspace/en/docs/CONN2FLOW-SYSTEM-UPDATES.md`
- [ ] `ai-workspace/pt-br/prompts/atualizacoes/atualizacoes-sistema.md`
- [ ] `ai-workspace/en/prompts/updates/system-updates.md`

### 4. Skills de IA:
- [ ] `c2f-environment-configuration/SKILL.md`: Atualizar referências para `gestor/autenticacoes.template/dominio/.env`
- [ ] `c2f-global-variables/SKILL.md`: Atualizar referências para `gestor/autenticacoes.template/dominio/.env`
- [ ] Propagar em todos os templates e repositórios alvo.
