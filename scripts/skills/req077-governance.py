"""Apply the approved REQ-077 instruction migration, preserving file newlines."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
POLICY = """
## REQ-077 — Pipeline, worktrees e preservação (DEC-136)

- Projeto: `./c2f project:deploy <id>` é o padrão (95% dos casos). Core: `./c2f manager:update-all`. `./c2f project:update-all <id>` é proibido na rotina de projeto; permitido exclusivamente em lote que altera Core e projeto simultaneamente.
- Antes de deploy, confira `git branch --show-current` e `git status --short` na origem; não publique trabalho alheio/inacabado. Confira o destino e sua autorização. Categoria B (skills/documentação/testes/memória): somente checks locais, sem deploy. Execução sequencial, foreground, logs e locks continuam obrigatórios.
- Worktrees por conveniência são proibidas. Só criar com concorrência multi-agente comprovada no mesmo repositório; em dúvida, consultar o humano antes. Registre raiz original, caminho temporário e concorrência na requisição e lote. Ao concluir/homologar, audite trabalho único, integração na main e junctions, então `git worktree remove <caminho>` e `git worktree prune`. Nunca use força para destruir trabalho não integrado; preserve e reporte impedimentos.
- DEC-136: manter por padrão; nada é removido (arquivo, `status='D'`, `DELETE`) sem confirmação explícita do operador humano. Retirada vira choque pendente; `--confirmar-retirada` só quando pedido pelo operador. Fonte incompleta não autoriza retirada.
"""

def read(p):
    return p.read_bytes().decode('utf-8-sig')

def write(p, text):
    old = p.read_bytes()
    newline = '\r\n' if b'\r\n' in old else '\n'
    text = text.replace('\r\n', '\n').replace('\n', newline)
    prefix = b'\xef\xbb\xbf' if old.startswith(b'\xef\xbb\xbf') else b''
    p.write_bytes(prefix + text.encode('utf-8'))

def replace(text, old, new, count=None):
    found = text.count(old)
    assert found == count if count is not None else found > 0, (old, found, count)
    return text.replace(old, new)

paths = [ROOT / n for n in ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md', 'memory/02-policy.md', 'memory/process/STARTER-PROMPTS.md']]
for base in ['.gemini/rules', '.claude/rules', '.codex/rules', '.cursor/rules', '.github/rules', '.claude/hooks', '.gemini/hooks', '.gemini/agents', '.claude/agents', '.codex/agents', 'templates']:
    folder = ROOT / base
    if folder.exists():
        paths += [p for p in folder.rglob('*') if p.is_file() and p.suffix in {'.md', '.json', '.ps1', '.sh'} and 'skills' not in p.parts]
paths += list((ROOT / '.gemini/skills').glob('*/SKILL.md'))
changed = []
for p in dict.fromkeys(paths):
    text = read(p).replace('\r\n', '\n')
    original = text
    # The eight-stage pipeline is retained explicitly as a mixed-batch exception below.
    if p.parent.name == 'c2f-project-pipeline-and-tasks':
        text = replace(text, '### Pipeline Completo para Projetos (Categoria C / 8 etapas; ver Regra #8):', '### Pipeline padrão para projetos (95% dos casos):', 1)
        text = replace(text, 'Consulte a sequência completa e atual de oito etapas na Regra #8; a Categoria A aplica `--skip-css` nas etapas pertinentes, sem alterar as demais.', 'O deploy publica o projeto via `deploy-project-v2.sh`. Não atribua a ele as oito etapas de `project:update-all` nem a flag `--skip-css`, que o wrapper de deploy não repassa. A Regra #8 descreve somente a exceção mista Core + projeto.', 1)
        text = replace(text, 'Use uma worktree limpa (`scripts/git/create-agent-worktree`), com `dev-environment/data/environment.json` copiado.', 'Preserve a origem e coordene os agentes; uma worktree só é admitida com concorrência comprovada, registro e consulta humana em caso de dúvida.', 1)
        text = replace(text, '**Retirada por dono**: o que o dono deixa de entregar recebe `status=\'D\'` (ou é apagado, se a tabela não tem `status`). O que volta a ser entregue é reativado pelo manifesto de retirados.', '**Retirada por dono (DEC-136)**: o que o dono deixa de entregar vira choque `retirado`, mantido até confirmação humana. Com retirada confirmada, tabelas sem `status` sofrem DELETE físico e exigem dump para recuperação.', 1)
    # Replace routine recommendations, leaving bare command inventories and exception descriptions intact.
    if 'project:update-all' in text:
        text = re.sub(r'project:update-all(\s+[^\s`\'";,)]+)?(?=\s+--skip-css)', lambda m: m.group(0).replace('project:update-all', 'project:deploy'), text)
        text = text.replace('project:deploy <id> --skip-css', 'project:deploy <id>')
        text = text.replace('project:update-all <', 'project:deploy <').replace('project:update-all conn2flow-site-local', 'project:deploy conn2flow-site-local')
        text = text.replace('ou c2f project:update-all)', 'ou c2f project:deploy <id>)')
    if p.parent.name == 'c2f-project-pipeline-and-tasks':
        text = text.replace('| 🗃️ Projects - Update All → ID | `c2f project:deploy <id>` |', '| 🗃️ Projects - Update All → ID (somente lote misto) | `c2f project:update-all <id>` |')
        text = text.replace('## 🧭 Regra #8: O pipeline de projeto tem 8 etapas (correção da contagem)', '## 🧭 Regra #8: Exceção mista Core + projeto — `project:update-all <id>` (8 etapas)')
    if p.parent.name in {'c2f-project-pipeline-and-tasks', 'c2f-executor-agent', 'c2f-resources-system'}:
        # Remove the old out-of-manifest shortcut from routine proportionality instructions.
        text = re.sub(r'Para mudanças exclusivamente de Core/banco:.*?Build completo de Tailwind é proibido nesta categoria\.', 'Para Core isolado, use o pipeline do sistema. Build completo de Tailwind é proibido nesta categoria.', text)
        text = re.sub(r'Mudanças exclusivamente de Core/banco admitem .*?--core-resources`\.', 'Core isolado usa o pipeline do sistema.', text)
        text = re.sub(r'ou, para Core/banco, .*?--core-resources`\.', 'e para Core isolado use o pipeline do sistema.', text)
    if p.parent.name == 'c2f-database-operations':
        text = text.replace("O que o dono deixou de entregar vira `status='D'`; o que volta é reativado pelo manifesto", 'Retirada vira choque pendente; somente confirmação humana permite desativação ou DELETE (DEC-136)')
        text = text.replace('1. **Remover manualmente**', '1. **Após confirmação explícita do humano, remover manualmente**')
    text = text.replace('Criação de branch/worktree isolada (`feat/req-XXX`).', 'Criação de branch (`feat/req-XXX`); worktree apenas sob concorrência comprovada, conforme REQ-077.')
    if text != original or p in paths[:5] or p.parent.name in {'c2f-project-pipeline-and-tasks', 'c2f-executor-agent', 'c2f-resources-system', 'c2f-database-operations', 'mdd-workflow'}:
        if p.suffix == '.md' and '## REQ-077 —' not in text:
            text = text.rstrip() + '\n\n' + POLICY.lstrip()
        if p.suffix == '.json' and p.name == 'c2f_executor.json':
            import json
            obj = json.loads(text)
            obj['system_prompt'] = obj['system_prompt'].replace('sdd/human-requests/', 'memory/human-requests/') + ' Projeto: project:deploy <id>; project:update-all apenas para lote misto Core + projeto. Worktree somente sob concorrência comprovada; em dúvida consulte o humano; remova/prune ao fechar após auditoria. DEC-136: nada sai sem confirmação humana.'
            text = json.dumps(obj, ensure_ascii=False, indent=2) + '\n'
        if text != original:
            write(p, text)
            changed.append(str(p.relative_to(ROOT)))

extras = {
'c2f-project-pipeline-and-tasks': '''
## REP-002 — manifesto e diagnóstico

`project:sync-core` e `sync-files` no Lab gravam fora do manifesto e podem produzir choques falsos. Prefira deploy/release; reconciliação em massa requer simulação e autorização humana. Não use essa via como atalho de rotina.
“Falha <etapa>” é falha HTTP: log da sessão → access log do Nginx (código e bytes) → `php-error.log` no horário → banco SQL. Hipóteses de timeout/memória/sessão exigem evidência.
''',
'c2f-executor-agent': '''
## REP-002 — diagnóstico e rodadas

“Falha <etapa>” significa falha HTTP. Inspecione log da sessão → access log do Nginx (código e bytes) → `php-error.log` no horário → banco SQL. Não siga hipótese preliminar sem evidência. Confira branch e git status antes de deploy.
Use seções “Rodada N” no lote e no VALIDATION-CHECKLIST, com escopo, alterações, comandos/resultados, evidências e pendências de cada rodada. Preserve os resultados anteriores; não atribua homologação humana.
''',
'c2f-resources-system': '''
## REP-002 — manifestos por camada e choques

Precedência: `projeto` > `plugin:<id>` > `core`. Arquivos usam `installation/manifests/<camada>.json`; dados usam `recursos-<dono>.json`. Dados homônimos em `db/data/` não mudam de dono: a etapa Core lê a entrega Core; a etapa projeto lê a entrega projeto.

| Choque | Situação |
| --- | --- |
| `editado` | Arquivo local difere da versão entregue pela camada |
| `sobreposto` | Camada superior tem precedência sobre a entrega |
| `retirado` | Dono deixou de entregar; manter até decisão humana |
| `retirado-editado` | Arquivo retirado também possui edição local |
| `original-ausente` | Original necessário à comparação não está disponível |

Registrar choques antes de gravar o manifesto; versões novas ficam em `backups/overrides/<versão>/`. Nunca reconciliar em massa sem simulação e confirmação humana (DEC-136).
''',
'c2f-database-operations': '''
## REP-002 — retirada física e Unicode

DEC-136: mantenha registros por padrão; `status='D'` e `DELETE` requerem confirmação humana. Confira schema e `RECURSOS_RETIRADA ... removidos=` antes de propor reparo. Tabelas sem coluna `status`, como `variaveis`, sofrem DELETE físico quando a retirada é confirmada: não há reativação lógica. Valide o dump anterior, restaure em banco auxiliar, compare PKs/status/ausências e simule antes de aplicar o reparo autorizado.
Tabelas e colunas de diff de choques (`atualizacoes_choques.diff`) devem usar `utf8mb4`, inclusive a conexão, para preservar emojis e evitar INSERT rejeitado no MariaDB. Confira retorno da gravação; não silencie erros.
''',
'c2f-shell-and-windows-traps': '''
## 20. REP-002 — stdin, edição com asserções e CRLF

- Nunca execute `cat > arquivo;` sem entrada delimitada: fica esperando stdin até timeout. Prefira ferramenta de edição; scripts complexos devem ser escritos em arquivo e executados depois.
- Substituições exigem caminho explícito e asserção da contagem esperada antes de gravar. Zero ou múltiplos inesperados abortam sem escrita; valide todos os alvos antes de alteração em lote.
- Arquivos CRLF exigem ferramenta de edição segura ou script que leia bytes e preserve/normalize conscientemente os finais de linha; não aplique regex multilinha presumindo LF.
- `grep -c $'\\r'` pode produzir falso negativo no Windows/Git Bash. Confira bytes (`Path(...).read_bytes().count(b'\\r\\n')` ou PHP `bin2hex`); saída zero de grep não prova LF.
- Na remoção Windows, use uma única shell de ponta a ponta; verifique caminhos absolutos e reparse points antes de excluir. Não enumere no PowerShell para passar exclusão ao CMD. Nunca atravesse junctions na limpeza.
''',
'c2f-javascript-ajax': '''
## REP-002 — falhas HTTP observáveis

Callbacks `.fail()` de chamadas AJAX críticas devem registrar explicitamente `xhr.status`, etapa e horário para correlacionar com o access log, sem tokens nem conteúdo sensível:
```javascript
.fail(function (xhr) {
    console.error('HTTP', xhr.status);
});
```
Preserve liberação de spinner e tratamento de sessão/CSRF. Mensagem “Falha” sozinha não sustenta diagnóstico de timeout ou memória.
'''
}
for name, extra in extras.items():
    p = ROOT / '.gemini/skills' / name / 'SKILL.md'
    text = read(p)
    assert extra.splitlines()[1] not in text, name
    write(p, text.rstrip() + '\n\n' + extra.lstrip())
print('\n'.join(changed))
