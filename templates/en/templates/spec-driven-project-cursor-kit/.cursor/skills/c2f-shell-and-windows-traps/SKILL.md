---
name: c2f-shell-and-windows-traps
description: "READ BEFORE Docker, cURL, Python/Node editing scripts or POST requests in Windows/Git Bash. Prevents MSYS path conversion, silent upload failures, quoting errors, PHP concurrency issues and rejected Gestor forms."
user-invocable: false
---

# Shell, Windows, and Git Bash Traps in Conn2Flow Environment

## Chrome DevTools MCP: profile and processes on Windows

- Use the `conn2flow-ai-workspace/scripts/mcp/launch-devtools-chrome.ps1` matrix launcher with `-Headless` (default) or `-Visible`. It maintains the profile in `%TEMP%\conn2flow-chrome-sandbox`, CDP loopback and port 9222; never reuse the personal profile, copy credentials/historical or add `--no-sandbox`.
- To connect MCP to the launcher, add `--browser-url=http://127.0.0.1:9222` to the session. Without this option the server starts its own Chrome. Check `/json/version` before trying to connect; busy port does not prove that the instance belongs to the sandbox.
- In port/profile error in use, see `Get-NetTCPConnection -LocalPort 9222 -State Listen` and `Get-CimInstance Win32_Process` for PID/property `CommandLine`. Close only processes whose command line points to the sandbox or PID returned by the launcher. Never use `Stop-Process -Name chrome` or `taskkill /IM chrome.exe`.
- Paths with spaces require quotes in the argument `--user-data-dir`. Do not delete the profile while a process still owns or uses it; any cleaning should check absolute path within TEMP and refuse junctions/symlinks. The launcher does not perform automatic recursive removal.
- Before using `npx ...@latest`, check package Node requirements. Version 1.10.1 requires `^20.19.0 || ^22.12.0 || >=23`; Node 20.14 fails before handshake. Node 22 temporary via `npm exec --yes --package=node@22 --package=chrome-devtools-mcp@latest -- chrome-devtools-mcp --help` allows you to diagnose without changing the global Node; set up a compatible runtime on the client's PATH for persistent use.

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Run Docker commands (`docker exec`), upload/POST curl, Python/Node scripts that generate files, or POST calls for Gestor forms in Windows/Git Bash environment.
- **SKIP ONLY IF**: purely code reading or editing tasks without shell execution.
- **CONSEQUENCE OF IGNORING**: corrupt Linux paths for `C:/Program Files/Git/...`, uploaded as local file reading, heredocs with `\b`/`\s` converted into control bytes, concurrency locking PHP processes and swallowing vital warns, and silently rejected forms for lack of hidden fields.

---

## ⛔ The 17 Critical Traps

### 1. Automatic Conversion of Paths into Git Bash (MSYS Path Conversion)

**Problem**: Git Bash on Windows automatically converts paths starting with `/` to Windows paths. Command:
```bash
docker exec conn2flow-app php /var/www/html/script.php
```
It is silently corrupted to:
```bash
docker exec conn2flow-app php C:/Program Files/Git/var/www/html/script.php
```

**Mandatory solution**: Prefix ALL `docker exec` commands with the `MSYS_NO_PATHCONV=1` environment variable:
```bash
MSYS_NO_PATHCONV=1 docker exec conn2flow-app php /var/www/html/script.php
```

The same mechanism breaks SSH transport with `rsync`. MSYS2 converts a local source as
`/c/Users/...` for `C:/Users/...`; how `rsync` interprets `C:` as host specification, one
`usuario@host:/caminho` destination makes both sides look remote and produces
`The source and destination cannot both be remote`.

**Compulsory solution for rsync**: Every invocation must use `MSYS_NO_PATHCONV=1` directly or
by shared helper:
```bash
MSYS_NO_PATHCONV=1 rsync -avu "/c/Users/.../origem/" "usuario@host:/destino/"
```

> [!WARNING]
> This trap is **silent** — the command runs without visible error, but the path inside the container is wrong. PHP simply does not find the file and returns a generic error.

---

### 2. `curl` with `<` Character in Form Values

**Problem**: The cURL `-F "campo=<valor"` flag interprets the `<` character as the local file read operator. The value is not sent as string — the cURL tries to open a file called `valor`.

**Mandatory solution**: Use `--form-string` instead of `-F` for fields that may contain `<`:
```bash
# ❌ ERRADO — interpreta <valor como leitura de arquivo
curl -F "html=<div>teste</div>" http://localhost/api

# ✅ CORRETO — envia como string literal
curl --form-string "html=<div>teste</div>" http://localhost/api
```

---

### 3. Python Heredocs and Escape Sequences

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

---

### 4. Silent Failure Asserts in Intermediate Scripts

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

---

### 5. Gestor forms: `multipart/form-data` with Hidden Triggers

**Problem**: The Gestor Conn2Flow forms are `multipart/form-data` and depend on mandatory hidden fields (`_gestor-atualizar`, `_gestor-registro-id`) to trigger server-side processing. Send the form without these fields results in silent rejection ( POST is received but no update is executed).

**Mandatory solution**: Always include hidden fields when submitting forms programmatically:
```bash
curl --form-string "_gestor-atualizar=1" \
     --form-string "_gestor-registro-id=42" \
     --form-string "titulo=Novo Título" \
     --form-string "html=<section>conteudo</section>" \
     -b cookies.txt \
     http://localhost/gestor/modulo/registro/42
```

|Hidden Field|Value|Function|
|---|---|---|
|`_gestor-atualizar`| `1` |Signals that POST is a valid update|
|`_gestor-registro-id`|Numeric ID|Identifies target record in database|
|`ajax`|`sim`| (If AJAX) Prevent redirection and return JSON|

---

### 6. Parallelism Contestant in Batch Compilation Commands (PHP Warning Suppression)

**Problem**: Run multiple heavy build, sync or database commands simultaneously (`css:rebuild`, `resources:sync`, `project:update-all`, `manager:update-all`, `db:migrate`) in the same Windows/Docker environment generates I/O disputes, freezes the container and masks critical runtime errors. When run in background or with deleted buffers, warnings and PHP news do not reach the terminal.

==References== A method signature bug (`$fontesExtras` without declared parameter) remained invisible for hours in Core — the Tailwind classes declared in `tailwind_sources` were silently discarded and the terminal did not show any error because the command ran in the background with buffer swallowing PHP warnings.

**Mandatory solution**:
1. **Sequent Execution Exclusive**: NEVER run two build or pipeline commands in parallel in the same container. Run one at a time, awaiting termination (`exit code 0`).
2. **Required Foreground**: Keep the commands running in foreground with direct output in the terminal.
3. **No Buffer / Expo Warnings**: Do not use blind redirects (`> /dev/null 2>&1`). If a PHP warning is fired (e.g. `Undefined variable`, `ArgumentCountError`), it MUST appear in the terminal for immediate resolution.

---

### 7. `rsync: dup() in/out/err failed` — CwRsync/SSH Runtime Pairing

**Problem**: The `rsync` 3.4.x from the cwRsync (runtime Cygwin) package uses native Win32 pipes. When the `ssh.exe` invoked comes from Git Bash (runtime MSYS2), the descriptors are not compatible and the process dies with:
```
rsync: dup() in/out/err failed
rsync error: error in IPC code (code 14) at pipe.c(...)
```
Exit code 12 does not produce a readable message without `-v`.

**Mandatory solution**:
1. **Mandatory matching of runtimes**: Use the `ssh.exe` of the cwRsync (`C:\cwrsync\bin\ssh.exe`) package itself, never Git Bash.
2. **`-e` with explicit SSH flags**: `-e "C:/cwrsync/bin/ssh.exe -T -i <chave>"`. The `-T` flag blocks pseudo-TTY (the binary rsync protocol does not work with PTY).
3. **`MSYS_NO_PATHCONV=1`** remains mandatory (the same reason as Trap 1).
4. **Local Paths**: Convert to `/cygdrive/c/...` (Cygwin format), never `/c/...` (MSYS2).

```bash
MSYS_NO_PATHCONV=1 rsync -avz \
  -e "C:/cwrsync/bin/ssh.exe -T -i $HOME/.ssh/id_ed25519" \
  "/cygdrive/c/Users/otavi/projeto/src/" \
  "usuario@host:/opt/projeto/src/"
```

> [!WARNING]
> The `dup()` error appears ONLY with the wrong `ssh.exe`. The message does not mention SSH — the natural diagnosis is to blame rsync or permissions.

---

### 8. ANSI sequences in CLI Utilities Outputs

**Problem**: Multiplatform utilities (Tailwind CLI, Vite, ESBuild) emit ANSI color sequences even when captured by `proc_open()`, `exec()` or backtics. Version output:
```
tailwindcss \x1b[34mv4.3.3\x1b[39m
```
version comparators break (`version_compare()`, `semver.satisfies()`) and assertions in tests.

**Mandatory solution**:
1. **Environment variables**: Set `NO_COLOR=1` and/or `FORCE_COLOR=0` before invoking the process.
2. **Mandatory hygiene** before any parsing or version comparison:
```php
$limpo = preg_replace('/\x1b\[[0-9;]*[a-zA-Z]/', '', $saida_bruta);
```
```javascript
const limpo = saidaBruta.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
```
3. **Asserts/tests**: Always sanitize BEFORE you compare, never trust that the output is pure text.

> [!WARNING]
> The contamination is **invisible** in the terminal (which renders the colors) but **breaker** in captured strings. `"v4.3.3" !== "\x1b[34mv4.3.3\x1b[39m"` fails without explanatory message.

---

### 9. `cd` Before `sudo -u` in Limited SSH Tenants (HestiaCP and Similar)

**Problem**: On multi-tenant servers (HestiaCP, cPanel, Plesk) with home directories in `750` or `700` mode, the deploy SSH user is not allowed to enter the tenant directory before the privilege elevation:
```bash
# ❌ FALHA — cd executa como o usuário SSH, que não tem acesso a /home/tenant/
cd /home/tenant/web/dominio.com && sudo -u tenant php artisan migrate
```

**Mandatory solution**: Encapsulate directory exchange and command in the same high shell:
```bash
# ✅ CORRETO — cd e php executam ambos como `tenant`
sudo -u tenant sh -c 'cd /home/tenant/web/dominio.com && php artisan migrate'
```

> [!WARNING]
> The error is `Permission denied` in `cd`, not `sudo`. The natural diagnosis is to blame the sudo configuration, but the problem is in order of operations.

---

### 10. Inverted Bar Collapse in Heredoc in Git Bash (MSYS2)

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

---

### 11. Timeout and Lock of `grep -rn` on Repositories Root on Windows

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

---

### 12. Python `json.dumps()` Remove Toolbar (`\/`) from JSON PHP Modules

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

---

### 13. Heredoc with apostrophe, crash or reverse bar: write the file, not heredoc

**Symptoms**: `unexpected EOF while looking for matching` or a `assert` that fails because `\\r\\n` has become something else.

A Python or JavaScript script with apostrophes (`What's new`), crashes or `\r\n` inside a Git Bash heredoc breaks in different ways to each case, even with the quote delimiter.

**Rule**: script with more than ten lines, or with any of these characters, is saved as file by the writing tool and then executed. Heredoc only for short cuts and no quotes.

---

### 14. Argument that starts with `/` past `node` or `curl`

Git Bash converts `/pro/` to `C:/Program Files/Git/pro/` also into `node` arguments and variable-mounted URLs. Symptoms: `ERR_NAME_NOT_RESOLVED` in a host like `conn2flow.localc`.

```bash
MSYS_NO_PATHCONV=1 node validar.cjs rotulo "/,/pro/,/en/"
MSYS_NO_PATHCONV=1 curl -sk "https://host$rota"
```

`curl ... -o /dev/null` on Windows can exit with code 23 even with the correct answer: check `%{http_code}`, not the output code.

---

### 15. Repository inside synchronized folder (OneDrive)

Large file rerecorded frequently (a `*Data.json` of dozens of MB) is blocked for moments by the syncer. Symptoms: `OSError: [Errno 22]` in Python, `file_put_contents` returning `false` in PHP.

- All generated file writing checks the result and tries again; never ignore the return.
- An isolated writing flaw that disappears on the second attempt is this, not a defect in your code. Register and follow.

---

### 16. PHP Suite: Run on Linux environment

Windows PHP fails tests that depend on OpenSSL (`openssl.cnf`) and `pdo_sqlite`. The reference suite runs in the SSH test environment:

```bash
ssh usuario@lab 'cd /mnt/c/caminho/do/repo && php vendor/bin/phpunit --configuration phpunit.xml'
```

End of line checkout CRLF read by Linux fails tests that run scripts `.sh` (`syntax error near unexpected token`). It is a failure of the environment: register as pre-existing, not as regression. Shebang copied script for a worktree needs to be in LF.

---

### 17. Disappearance of `npx` and NPM Volatile Cache on Windows

**Problem**: In Windows/Git Bash, invoking `npx tailwindcss` or `npx terser` may fail intermittently or disappear during continuous compilations, triggering errors such as `npx: command not found`, `npm ERR! code ENOENT` or resolution lockings and downloading packages in `%LOCALAPPDATA%\npm-cache` volatile cache.

**Root Cause**:
1. The `npx` command tries to verify and consult remote or temporary records when invoked generically, subjecting build to network timeouts or file locks by antivirus/OneDrive.
2. Path resolution problems in Windows PATH make global `npx` executables diverge from the versions set in the repository.

**Mandatory solution**:
1. **Strict Use of Local Binarys**: Always directly invoke the binaries installed in the `node_modules/.bin/` repository:
```cmd
# No Windows / PowerShell / CMD:
.\node_modules\.bin\tailwindcss.cmd -i input.css -o output.css --minify
.\node_modules\.bin\terser.cmd script.js -o script.min.js
```
```bash
# No Git Bash / sh:
./node_modules/.bin/tailwindcss -i input.css -o output.css --minify
./node_modules/.bin/terser script.js -o script.min.js
```
2. **In PHP/CLI scripts and pipelines**: The framework and tools should directly reference the relative path to `node_modules/.bin/tailwindcss.cmd` (on Windows) or `node_modules/.bin/tailwindcss` (on Linux/Docker), without intermediating calls via `npx`.

> [!CAUTION]
> NEVER use `npx tailwindcss` or `npx terser` in automated build scripts or build repetitive routines. It depends strictly on local dependencies in `node_modules/.bin/`.

### 18. Junctions and git worktree remove (critical)

The BL-028 records loss of vendor and node_modules in 2026-10-08: removal of worktrees in Windows crossed Directory Junctions (mklink /J) and emptied destinations in the main tree. Treat any removal as unsafe until you check the reparse points and its references.

Before removing, confirm the absolute path of worktree, which is neither main tree nor pipeline origin. List junctions with cmd /c "dir /AL <pasta>" (also inspect internal nodes without crossing links). Check references from other worktrees into it; if there is, preserve/repoint first. Undo each junction individually with cmd /c "rmdir <pasta>\<atalho>" **without /S**: this removes only the shortcut. Use previously checked literal paths and end-to-end CMD; never enumerate paths in PowerShell and pass deletion to another shell. Confirm that the links have left, then run git worktree remove. Never use --force to overcome unintegrated work. Then check the content of the vendor/node_modules on the main trees and the remaining worktrees.

Do not create junction for another temporary worktree; when necessary, the reference is for the main tree. Check the six-step routine in mdd-memory-gardening.

### 19. iconv //TRANSLIT not portable in PHP Windows

iconv('UTF-8', 'ASCII//TRANSLIT', $texto) can replace accents with different characters, question or return false according to the platform. For keys/slugs that require determinism, use explicit associative table with strtr (include lower case / upper case and the character set accepted by the product), followed by controlled normalization. Do not turn a failure into an empty string or silence warning. Exercise accentuated entry on Windows and Linux, characters off the map and repeatability; do not apply transliteration to the presentation text. Preserve the Unicode behavior defined by the resource contract.

## 20. REP-002 — stdin, edition with assertions and CRLF

- Never run `cat > arquivo;` without delimited input: wait stdin until timeout. Prefer editing tool; complex scripts should be written in file and executed later.
- Replacements require explicit path and assertion from count expected before recording. Zero or multiple unexpected abort without writing; validate all targets before batch change.
- CRLF files require safe editing tool or script that read bytes and consciously preserve/normalize line ends; do not apply multiline regex assuming LF.
- `grep -c $'\r'` can produce false negative on Windows/Git Bash. Check bytes (`Path(...).read_bytes().count(b'\r\n')` or PHP `bin2hex`); zero grep output does not prove LF.
- In Windows removal, use a single shell from end to end; check absolute paths and reparse points before deleting. Do not enumerate in PowerShell to pass deletion to CMD. Never cross junctions in cleaning.
