---
name: c2f-json-resources-sync
description: "READ BEFORE editing *Data.json or compiling/synchronizing resources. Prevents invalid checksums, stale database resources and overwritten local changes."
user-invocable: false
---

# JSON Conn2Flow Resource Sync

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Edit manifests Resource JSON (`pages.json`, `components.json`, `layouts.json`, `templates.json`) or run the build pipeline for `*Data.json`.
- **SKIP ONLY IF**: PHP code editing of controllers without changing resource structure.
- **CONSEQUENCE OF IGNORING**: Divergence between physical files and data in database SQL (`Data.json`), miscalculation of checksums and loss of changes after deploy.

---

- Do not manually calculate or edit resource checksums.
- In new resource, use the initial version required by the manifest, usually `1.0`, and leave checksums as an empty string.
- In changed resource, clean the affected checksums; do not invent hashes or make mechanical booms outside the project contract.
- The update/deploy pipeline runs `gestor/controladores/agents/arquitetura/atualizacao-dados-recursos.php` and recalculates versions/checksums.
- After tests that regenerate data files, check `git status` and keep only artifacts that belong to the approved scope.

---

## Preservation of Short Bars (`\/`) in JSON Modules

PHP serializes JSON modules with escaping by default (`"products\/add\/"`). By manipulating these files with external tools (Python, Node), escaping can be lost, generating massive noises in Git diff.

### Normative Directive

While reading and rewriting files Module JSON via Python:

```python
import json

# Ler preservando encoding
with open(json_path, 'r', encoding='utf-8') as f:
    original = f.read()
    data = json.loads(original)

# Modificar dados...
data['nova_chave'] = 'valor'

# Reescrever PRESERVANDO escapes e line endings
output = json.dumps(data, indent=4, ensure_ascii=False)

# Restaurar escape de barra (PHP padrão)
if '\\/' in original:
    output = output.replace('/', '\\/')

# Preservar line endings nativas (LF vs CRLF)
if '\\r\\n' in original:
    output = output.replace('\\n', '\\r\\n')

with open(json_path, 'w', encoding='utf-8', newline='') as f:
    f.write(output)
```

|Request|Implementation|
|---|---|
|**Bar escape**|`output.replace('/', '\\/')` when the original contains `\\/`|
|**Encoding**|`ensure_ascii=False` to preserve accents and characters UTF-8|
|**Line endings**|Detect and maintain LF or CRLF native to original file|

> [!CAUTION]
> Without preserving the escaping bar, `git diff` points to artificial changes in **all lines** file containing paths with `/`, polluting the history and making revisions difficult.
