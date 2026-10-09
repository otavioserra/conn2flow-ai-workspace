# FEAT-002: Esteira de CI/CD com Loop de Auto-Cura (Self-Healing Tests)

*   **Status**: `ICEBOX`
*   **Tipo**: CI/CD / Automação de Agentes
*   **Data de Registro**: 2026-08-18
*   **Solicitante**: Chief Architect / User
*   **Prioridade**: Média (Evolução de Escala)

---

## 🎯 Contexto e Justificativa

Implementar uma rotina automatizada no GitHub Actions ou runner local que:
1. Executa migrações Phinx.
2. Executa a compilação de recursos (`atualizacao-dados-recursos.php`) e valida se há órfãos em `gestor/db/orphans/`.
3. Executa a sincronização de banco (`atualizacoes-banco-de-dados.php`) e os testes unitários/PHPUnit.
4. Em caso de falha em um PR, invoca um subagente com o log de erro para auto-corrigir o código e reaplicar o commit.

---

## 📋 Escopo Futuro (Checklist de Implementação)

- [ ] Criar workflow `.github/workflows/validate-resources-and-tests.yml`.
- [ ] Implementar verificação estrita de ausência de arquivos em `gestor/db/orphans/`.
- [ ] Adicionar gatilho para acionar agente de auto-cura em falhas.
