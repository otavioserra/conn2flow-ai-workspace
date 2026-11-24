# Scripts and paths in Git Bash (MSYS2) — recipes (Traps 3, 4, 10, 11 and 12)

Subskill of `c2f-shell-and-windows-traps`. Read it before generating or transforming files with a script, writing backslashes in a heredoc, searching a repository recursively on Windows or rewriting a PHP module JSON. The critical rules are also in the parent skill.

## 3. Python heredocs and escape sequences

**Problem**: When generating files with HTML/CSS/JS content using heredocs in Python, sequences such as `\b` (word union in regex) and `\s` (whitespace) are interpreted as bytes of control (backspace `0x08` and escaping sequences).

**Mandatory solution**: Use raw strings (`r"""..."""`) or build characters with `chr(92)` (backslash):
```python
# ❌ ERRADO — \b e \s viram bytes de controle
content = """
  border: 1px solid #ccc;
  .selector { color: red; }
"""

# ✅ CORRETO — raw string preserva literais
content = r"""
  border: 1px solid #ccc;
  .selector { color: red; }
"""
```

## 4. Asserts that fail silently in intermediate scripts

**Problem**: Asserts in transformation scripts (Python, Node) that fail silently leave output files corrupted in half. The script continues to run after the assert fails, generating partial data.

**Mandatory solution**:
1. Use `set -e` in Bash scripts (exit on first error).
2. In Python, use `assert` with descriptive messages and check the result BEFORE saving to disk.
3. Validate output file after generation (size > 0, valid JSON/HTML structure).

```python
# ✅ Validar ANTES de gravar
result = transform(input_data)
assert result is not None, f"Transform failed for {input_file}"
assert len(result) > 100, f"Result suspiciously small: {len(result)} bytes"

with open(output_file, 'w') as f:
    f.write(result)
```

## 10. Backslash collapse in Git Bash (MSYS2) heredocs

**Problem**: In Git Bash (MSYS2), heredocs in scripts Bash or inline invocations collapse double reverse bars (`\\`) in plain (`\`). This silently corrupts Windows paths, regular and constant PHP expressions like `DIRECTORY_SEPARATOR`.

Example of the problem:
```bash
# ❌ No Git Bash, o heredoc colapsa \\ para \
cat <<'EOF' > script.php
$sep = DIRECTORY_SEPARATOR;  // OK
$caminho = "C:\\Users\\otavi";  // Vira "C:\Users\otavi" (errado)
EOF
```

**Mandatory solution**:
1. **For PHP paths**: Use `DIRECTORY_SEPARATOR` instead of literal backslashes:
```php
// ✅ CORRETO — portável e imune ao heredoc
$caminho = 'C:' . DIRECTORY_SEPARATOR . 'Users' . DIRECTORY_SEPARATOR . 'otavi';
```

2. **For generated scripts**: Use `printf` or `echo` with explicit escaping instead of heredoc:
```bash
# ✅ CORRETO — printf preserva as barras
printf '%s\n' '$caminho = "C:\\\\Users\\\\otavi";' > script.php
```

3. **For inevitable heredocs**: Use post-generation `sed` replacement:
```bash
cat <<'EOF' > temp.php
$caminho = "C:__SEP__Users__SEP__otavi";
EOF
sed -i 's/__SEP__/\\\\/g' temp.php
```

> [!WARNING]
> The collapse is **silent** — the file is generated without error, but the content is corrupted. Paths like `C:\Users` work on Windows but differ from expected `C:\\Users` in PHP source code.

## 11. `grep -rn` timeouts and hangs at the repository root on Windows

**Problem**: Running `grep -rn` (recursive search) from the root of a repository in Windows/Git Bash can cause:
- **Timeout** by `node_modules/`, `.git/`, `vendor/` and other heavy directories.
- Terminal **Lock complete** when file volume exceeds MSYS2 I/O limits.
- **Excessive memory consumption** with undrained output buffers.

**Mandatory solution**:
1. **Always delete heavy directories** with `--exclude-dir`:
```bash
# ✅ CORRETO — exclui diretórios que causam timeout
grep -rn 'padrão' --exclude-dir={node_modules,.git,vendor,dist,build} .
```

2. **Limit depth and scope**:
```bash
# ✅ CORRETO — buscar em diretório específico
grep -rn 'padrão' src/
grep -rn 'padrão' modulos/meu-modulo/
```

3. **Use optimized alternatives** when available:
```bash
# ✅ ripgrep (rg) respeita .gitignore automaticamente
rg 'padrão' .

# ✅ findstr no PowerShell (nativo Windows)
Get-ChildItem -Recurse -Include *.php | Select-String 'padrão'
```

4. **Defensive Timeout** for automated scripts:
```bash
# ✅ Limitar tempo de execução
timeout 30 grep -rn 'padrão' --exclude-dir={node_modules,.git,vendor} .
```

> [!CAUTION]
> NEVER run `grep -rn` at the root of repositories with large `node_modules` or `.git`. On Windows, MSYS2 does not have auto kill per timeout — the process can stop indefinitely.

## 12. Python `json.dumps()` drops the `\/` escapes of PHP module JSON

**Problem**: PHP serializes JSON modules with escaping by default (`"products\/add\/"`). The `json.dumps()` of Python **does not produce** escaping bar (`"products/add/"`), causing massive noises in Git diff — all lines with paths appear as changed, even without semantic modification.

**Mandatory solution**:
1. **Detect** if the original file contains `\/` before rewrite.
2. **Restore** or escaping after `json.dumps()`:
```python
import json

with open(json_path, 'r', encoding='utf-8') as f:
    original = f.read()
    data = json.loads(original)

# Após modificações...
output = json.dumps(data, indent=4, ensure_ascii=False)

# Restaurar escape de barra nativo do PHP
if '\\/' in original:
    output = output.replace('/', '\\/')

with open(json_path, 'w', encoding='utf-8', newline='') as f:
    f.write(output)
```

3. **Always use `ensure_ascii=False`** to preserve accents and UTF-8 characters.
4. **Preserve native line endings** (LF vs CRLF) from the original file.

> [!WARNING]
> The impact is **aesthetic but destructive for the workflow**: hundreds of lines changed in diff make it difficult to review the Quality Auditor and hide real changes in noise.
