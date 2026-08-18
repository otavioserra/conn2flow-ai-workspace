# 🚀 Roteiro de Evolução Futura & Inovações em IA

Este documento compila a visão estratégica de longo prazo do **Conn2Flow AI Workspace**, detalhando as iniciativas técnicas incubadas no backlog e as diretrizes para expansão educacional.

---

## 🔮 1. Iniciativas de Arquitetura no Backlog

### A. Centralização de Skills via Servidor MCP (`ARCH-002`)
* **Problema**: Manter 32 skills copiadas fisicamente em cada repositório consome armazenamento e exige rotinas de sincronização contínuas.
* **Solução**: Desenvolver um **Servidor MCP Local do Conn2Flow**. As IDEs e CLIs (Claude, Cursor, Antigravity) conectam via protocolo aberto e consultam as skills e documentações diretamente da fonte em tempo real.

### B. Esteira CI/CD com Loop de Auto-Cura (`FEAT-002`)
* **Problema**: Erros em PRs precisam de intervenção manual do desenvolvedor para rodar testes e corrigir falhas de compilação de dados de recursos.
* **Solução**: Um GitHub Action que executa as migrações, a compilação (`atualizacao-dados-recursos.php`) e a suíte de testes. Em caso de falha, um subagente é invocado automaticamente com os logs para corrigir o código e reaplicar o commit antes da revisão humana.

### C. Refatoração Semântica de Templates (`ARCH-001`)
* Renomear a pasta física `gestor/autenticacoes.exemplo/` para `gestor/autenticacoes.template/`, alinhando a nomenclatura de autenticações ao padrão conceitual de templates do sistema.

---

## 🎓 2. Estratégia Educacional: O Curso de IA (Do Leigo ao Avançado)

O ecossistema Conn2Flow serve como a base prática viva para o treinamento de engenharia com IA:

1. **Módulo Básico (Mentalidade & Chats)**:
   - Apresentação do ecossistema de chats (ChatGPT, Claude, Gemini, Copilot).
   - Por que o modelo de "copiar e colar do chat" falha em projetos sérios (a metáfora do Arquiteto e do Construtor).

2. **Módulo Intermediário (Metodologia SDD)**:
   - Como estruturar um repositório com SDD (especificações, decisões, requisições).
   - Como evitar alucinações de arquivos e manter o controle do Git.

3. **Módulo Avançado (Agente Duplo & Skills)**:
   - Orquestração com Google Antigravity e subagentes executores (Claude Code / Cursor).
   - Como criar Skills declarativas para ensinar qualquer framework para a IA.
