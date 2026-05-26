# Checklist de escopo SDD local

Considere que uma frente em `project/` usa SDD local quando houver pelo menos estes sinais:

- `00-START-HERE.md`
- `01-WORKFLOW.md`
- um arquivo principal de spec
- `implementation/BATCH-INDEX.md`
- `validation/VALIDATION-CHECKLIST.md`

## Como agir

- leia os artefatos locais antes de mexer em código ou docs dessa frente
- trate batch e validation como unidade operacional
- conserve a spec principal limpa
- use `antigo/` apenas como histórico

## Como não agir

- não tente impor SDD ao repositório inteiro só porque uma frente usa esse modelo
- não misture comentário de rodada com mudança de requisito na spec principal
- não ignore batch e validation quando eles já existem