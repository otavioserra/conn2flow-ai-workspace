# Decision Log

Este arquivo registra as decisões arquiteturais e escolhas de design tomadas no desenvolvimento do `conn2flow-ai-workspace`.

---

## Histórico de Decisões

| Código | Status | Tópico | Contexto & Justificativa | Data |
| --- | --- | --- | --- | --- |
| **DEC-001** | APPROVED | Modelo de Agente Duplo | Adotada a divisão de papéis: Arquiteto gerencia a pasta `sdd/` em alto nível e Executor edita arquivos de código em baixo nível para evitar dispersão de contexto. | 2026-05-26 |
| **DEC-002** | APPROVED | Reorganização Bilingue | Separação física de templates por idioma em pastas raiz `/en` e `/pt-br` para simplificar a manutenção e suporte internacional. | 2026-05-26 |
| **DEC-003** | APPROVED | Cópia Condicional do Boilerplate | Os scripts copiam o boilerplate do SDD apenas se a pasta `sdd/` estiver ausente no destino, garantindo que atualizações de kits não corrompam a governança ativa do cliente. | 2026-05-26 |
| **DEC-004** | APPROVED | Memórias de Engenharia e Migrador nos Instaladores | Introdução do conceito de memórias persistentes bilingues nos boilerplates de SDD e automação da migração de pastas legadas (como `project/` para `sdd/`) diretamente nos instaladores. | 2026-06-03 |

