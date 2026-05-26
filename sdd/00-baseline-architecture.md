# 00 Baseline Architecture

## 1. Objetivo
Este arquivo registra o estado atual do repositório `conn2flow-ai-workspace` antes das mudanças estruturais bilingues do BATCH-001. Ele descreve o legado técnico do projeto para garantir estabilidade operacional.

---

## 2. Estrutura de Arquivos do Legado
Antes do BATCH-001, a estrutura do projeto é a seguinte:
- **`templates/`**: Pasta raiz dos templates. Contém os subdiretórios `private-project-copilot-kit`, `private-project-claude-kit`, `spec-driven-project-copilot-kit` e `spec-driven-project-claude-kit`. Todos em Português por padrão.
- **`scripts/`**: Pasta contendo scripts em PowerShell (`.ps1`) e Bash (`.sh`) para instalar os quatro kits acima em repositórios alvo.
- **`README.md` & `README-PT-BR.md`**: Documentação raiz bilingue (recém-criada).
- **`sdd/`**: O diretório de governança local (este diretório).

---

## 3. Comportamento dos Scripts de Instalação do Legado
Os instaladores funcionam copiando a estrutura correspondente do diretório `templates/` do workspace para a pasta de destino (informada via argumento `-TargetRepoPath` no Windows ou `$1` no Bash).
- **Kits de Projeto Privado**: Suportam a flag de prefixação (`-AgentPrefix` / `--agent-prefix`) para rebatizar os agentes e atualizar as referências internas de arquivos textuais.
- **Kits SDD**: Apenas copiam os arquivos de IA, criam a pasta `sdd/human-requests/README.md` no destino e amarram os agentes padrão (`sdd-coordinator`, `sdd-implementer`, `sdd-reviewer`) aos prompts, sem suporte a prefixo de agente.

---

## 4. Preservação do Legado e Segurança
*   Os scripts utilitários em `scripts/` são considerados operacionais e funcionais. Qualquer modificação nos scripts deve preservar a compatibilidade (ex: aceitar os parâmetros antigos como obrigatórios e garantir comportamento retrocompatível quando nenhuma flag opcional for fornecida).
*   Os arquivos nos templates (`.claude/` ou `.github/` e regras associadas) são considerados de alta qualidade e testados. Qualquer alteração estrutural nas regras deve ser documentada via Change Request.
