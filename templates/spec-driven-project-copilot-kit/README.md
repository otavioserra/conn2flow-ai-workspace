# Spec-Driven Project Copilot Kit

Este kit é um ponto de partida para repositórios que usam SDD com `sdd/` como fonte normativa.

## Pré-requisitos esperados no repo alvo

- `sdd/README.md`
- sdd numerados com requisitos e contratos
- `sdd/human-requests/` para intake humano não normativo
- `sdd/process/`
- `sdd/change-requests/`
- `sdd/reviews/`
- `sdd/implementation/`
- `sdd/validation/`
- `sdd/decisions/`

## O que entra no kit

- `.github/copilot-instructions.md`: regras sempre ativas para trabalho ancorado em sdd.
- `.github/instructions/*.instructions.md`: regras para sdd, código Python e testes.
- `.github/agents/*.agent.md`: coordenação, implementação de batch e review.
- `.github/prompts/*.prompt.md`: kickoff, continuidade, review e change request.
- `.github/skills/*/SKILL.md`: workflow SDD e validação local.
- `.github/hooks/*.json` e `sdd/scripts/hooks/*`: lembrete leve de início de sessão.

## Instalação

1. A partir da raiz de `conn2flow-ai-workspace`, rode `scripts/install-spec-driven-copilot-kit.ps1 -TargetRepoPath <repo>` ou `scripts/install-spec-driven-copilot-kit.sh <repo>`.
2. Se preferir manualmente, copie `.github` e `sdd/scripts/hooks` para a raiz do repositório alvo.
3. O instalador promove automaticamente os prompts genéricos para `sdd-coordinator` e `sdd-reviewer`; se copiar manualmente, ajuste esse binding nos prompts.
4. Ajuste nomes de agentes, comandos de validação e caminhos específicos do projeto.
5. Se o repo já tiver um setup SDD especializado, não reaplique este kit genérico com force; ajuste os arquivos especializados diretamente.
6. Valide carregamento no Chat Diagnostics.

## Intake humano

Use `sdd/human-requests/` para briefs humanos, pedidos soltos, rascunhos de rodada e arquivos Markdown de entrada.

Regras:

- `sdd/human-requests/` não é fonte normativa.
- requisitos aprovados continuam indo para `sdd/change-requests/`, `sdd/reviews/`, `sdd/implementation/`, `sdd/validation/` e `sdd/decisions/`.
- os sdd numerados continuam sendo a fonte normativa.
- quando o usuário passar apenas a pasta `sdd/human-requests/`, o fluxo deve escolher `CURRENT.md`, depois `README.md`, e por fim o `.md` mais recente da pasta.