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

## 📚 Subskills (read on demand)

| Subskill | Read when | Traps |
| --- | --- | --- |
| [`subskills/cli-e-ssh.md`](subskills/cli-e-ssh.md) | rsync/SSH from Windows, colored CLI output, `sudo -u` on a tenant, `npx` in a build | 7, 8, 9, 17 |
| [`subskills/scripts-e-caminhos-msys.md`](subskills/scripts-e-caminhos-msys.md) | generating files by script, heredocs with backslashes, recursive search, rewriting module JSON | 3, 4, 10, 11, 12 |
| [`subskills/worktrees-e-junctions.md`](subskills/worktrees-e-junctions.md) | removing a worktree that has junctions (`vendor`, `node_modules`) | 18 |

The rules below are the mandatory minimum; the full recipe is in the subskill named next to each one.

---

## ⛔ Critical Shell and Windows Traps

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

### 2. `curl` with `<` Character in Form Values

**Problem**: The cURL `-F "campo=<valor"` flag interprets the `<` character as the local file read operator. The value is not sent as string — the cURL tries to open a file called `valor`.

**Mandatory solution**: Use `--form-string` instead of `-F` for fields that may contain `<`:
```bash
# ❌ ERRADO — interpreta <valor como leitura de arquivo
curl -F "html=<div>teste</div>" http://localhost/api

# ✅ CORRETO — envia como string literal
curl --form-string "html=<div>teste</div>" http://localhost/api
```

### 3. Python Heredocs and Escape Sequences

`\b` and `\s` inside a regular Python string become control bytes (backspace `0x08`). Use raw strings (`r"""..."""`) or `chr(92)`. Recipe: `subskills/scripts-e-caminhos-msys.md`.

### 4. Silent Failure Asserts in Intermediate Scripts

A transformation script validates its result **before** writing (`set -e` in Bash; `assert` with a message in Python; size and structure of the generated file). Never write partial output. Recipe: `subskills/scripts-e-caminhos-msys.md`.

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

### 6. Parallelism Contestant in Batch Compilation Commands (PHP Warning Suppression)

**Problem**: Run multiple heavy build, sync or database commands simultaneously (`css:rebuild`, `resources:sync`, `project:update-all`, `manager:update-all`, `db:migrate`) in the same Windows/Docker environment generates I/O disputes, freezes the container and masks critical runtime errors. When run in background or with deleted buffers, warnings and PHP news do not reach the terminal.

==References== A method signature bug (`$fontesExtras` without declared parameter) remained invisible for hours in Core — the Tailwind classes declared in `tailwind_sources` were silently discarded and the terminal did not show any error because the command ran in the background with buffer swallowing PHP warnings.

**Mandatory solution**:
1. **Sequent Execution Exclusive**: NEVER run two build or pipeline commands in parallel in the same container. Run one at a time, awaiting termination (`exit code 0`).
2. **Required Foreground**: Keep the commands running in foreground with direct output in the terminal.
3. **No Buffer / Expo Warnings**: Do not use blind redirects (`> /dev/null 2>&1`). If a PHP warning is fired (e.g. `Undefined variable`, `ArgumentCountError`), it MUST appear in the terminal for immediate resolution.

### 7. `rsync: dup() in/out/err failed` — cwRsync/SSH Runtime Pairing

cwRsync's `rsync` (Cygwin) with Git Bash's `ssh.exe` (MSYS2) dies with `rsync: dup() in/out/err failed` (code 14/12). Use the `ssh.exe` shipped with cwRsync with `-T`, `MSYS_NO_PATHCONV=1` and `/cygdrive/c/...` paths. Recipe: `subskills/cli-e-ssh.md`.

### 8. ANSI Sequences in CLI Output (Colors Break Parsers)

Tailwind CLI, Vite and ESBuild emit ANSI colors even when captured (`tailwindcss \x1b[34mv4.3.3\x1b[39m`). Set `NO_COLOR=1`/`FORCE_COLOR=0` and strip `\x1b\[[0-9;]*[a-zA-Z]` before comparing versions or asserting. Recipe: `subskills/cli-e-ssh.md`.

### 9. `cd` Before `sudo -u` on Restricted SSH Tenants (HestiaCP and Similar)

With a `750`/`700` home, `cd` runs as the SSH user and fails with `Permission denied`. Wrap everything in the elevated shell: `sudo -u tenant sh -c 'cd /home/tenant/web/dominio.com && php artisan migrate'`. Recipe: `subskills/cli-e-ssh.md`.

### 10. Backslash Collapse in Git Bash (MSYS2) Heredocs

A Git Bash heredoc collapses `\\` into `\` without an error, corrupting Windows paths, regexes and PHP code. Use `DIRECTORY_SEPARATOR`, `printf` or a placeholder plus `sed`. Recipe: `subskills/scripts-e-caminhos-msys.md`.

### 11. `grep -rn` Timeouts and Hangs at the Repository Root on Windows

> [!CAUTION]
> NEVER run `grep -rn` at the root of repositories with large `node_modules` or `.git`. On Windows, MSYS2 has no automatic kill on timeout — the process can hang indefinitely.

Narrow the folder, use `--exclude-dir={node_modules,.git,vendor,dist,build}`, `rg` or `timeout 30`. Recipe: `subskills/scripts-e-caminhos-msys.md`.

### 12. Python `json.dumps()` Drops the `\/` Escapes of PHP Module JSON

PHP writes `"products\/add\/"`; `json.dumps()` writes `"products/add/"` and the diff marks the whole file. Detect `\/` in the original and restore it after serializing, with `ensure_ascii=False` and the original line endings. Recipe: `subskills/scripts-e-caminhos-msys.md`.

### 13. Heredoc with apostrophe, crash or reverse bar: write the file, not heredoc

**Symptoms**: `unexpected EOF while looking for matching` or a `assert` that fails because `\\r\\n` has become something else.

A Python or JavaScript script with apostrophes (`What's new`), crashes or `\r\n` inside a Git Bash heredoc breaks in different ways to each case, even with the quote delimiter.

**Rule**: script with more than ten lines, or with any of these characters, is saved as file by the writing tool and then executed. Heredoc only for short cuts and no quotes.

### 14. Argument that starts with `/` past `node` or `curl`

Git Bash converts `/pro/` to `C:/Program Files/Git/pro/` also into `node` arguments and variable-mounted URLs. Symptoms: `ERR_NAME_NOT_RESOLVED` in a host like `conn2flow.localc`.

```bash
MSYS_NO_PATHCONV=1 node validar.cjs rotulo "/,/pro/,/en/"
MSYS_NO_PATHCONV=1 curl -sk "https://host$rota"
```

`curl ... -o /dev/null` on Windows can exit with code 23 even with the correct answer: check `%{http_code}`, not the output code.

### 15. Repository inside synchronized folder (OneDrive)

Large file rerecorded frequently (a `*Data.json` of dozens of MB) is blocked for moments by the syncer. Symptoms: `OSError: [Errno 22]` in Python, `file_put_contents` returning `false` in PHP.

- All generated file writing checks the result and tries again; never ignore the return.
- An isolated writing flaw that disappears on the second attempt is this, not a defect in your code. Register and follow.

### 16. PHP Suite: Run on Linux environment

Windows PHP fails tests that depend on OpenSSL (`openssl.cnf`) and `pdo_sqlite`. The reference suite runs in the SSH test environment:

```bash
ssh usuario@lab 'cd /mnt/c/caminho/do/repo && php vendor/bin/phpunit --configuration phpunit.xml'
```

End of line checkout CRLF read by Linux fails tests that run scripts `.sh` (`syntax error near unexpected token`). It is a failure of the environment: register as pre-existing, not as regression. Shebang copied script for a worktree needs to be in LF.

### 17. `npx` Disappearing and the Volatile npm Cache on Windows

> [!CAUTION]
> NEVER use `npx tailwindcss` or `npx terser` in automated build scripts or repeated build routines. Depend strictly on the local dependencies in `node_modules/.bin/`.

Windows/CMD: `.\node_modules\.bin\tailwindcss.cmd`; Git Bash/Linux/Docker: `./node_modules/.bin/tailwindcss`. Causes and examples: `subskills/cli-e-ssh.md`.

### 18. Remove a worktree with junctions

On Windows, do the whole inspection and removal in **a single Command Prompt (CMD) session**, with verified absolute paths. Step by step (integration check, link inventory one level at a time, one-by-one removal, `git worktree remove`/`prune` and final check): **`subskills/worktrees-e-junctions.md`**.

- Remove each `<JUNCTION>` by its literal path with `rmdir "<folder>\<link>"`, one at a time and without `/S`; enumerate with `dir /AL`, one level at a time, never with `/S`.
- **A query error is not zero links (FB-007)**: zero only counts when the path was validated and `dir /AL` answered `File Not Found`/`Arquivo não encontrado`. A syntax, path or access error stops the cleanup. Do not run the inventory through `cmd //c` in Git Bash.

**Commands forbidden in this cleanup:** `rmdir /S`, `Remove-Item -Recurse`, `rm -rf`, and enumerating in PowerShell followed by deleting in CMD. Never use `git worktree remove --force` to override unintegrated work.

### 19. iconv //TRANSLIT not portable in PHP Windows

iconv('UTF-8', 'ASCII//TRANSLIT', $texto) can replace accents with different characters, question or return false according to the platform. For keys/slugs that require determinism, use explicit associative table with strtr (include lower case / upper case and the character set accepted by the product), followed by controlled normalization. Do not turn a failure into an empty string or silence warning. Exercise accentuated entry on Windows and Linux, characters off the map and repeatability; do not apply transliteration to the presentation text. Preserve the Unicode behavior defined by the resource contract.

## 20. REP-002 — stdin, edition with assertions and CRLF

- Never run `cat > arquivo;` without delimited input: wait stdin until timeout. Prefer editing tool; complex scripts should be written in file and executed later.
- Replacements require explicit path and assertion from count expected before recording. Zero or multiple unexpected abort without writing; validate all targets before batch change.
- CRLF files require safe editing tool or script that read bytes and consciously preserve/normalize line ends; do not apply multiline regex assuming LF.
- **FB-008**: Git Bash `sed -i` converts CRLF to LF; Windows Python `Path.write_text()` writes CRLF by default when given `\n`. Use `Path.read_bytes()` and `Path.write_bytes()`, preserve the original EOL, and verify the bytes afterward.
- `grep -c $'\r'` can produce false negative on Windows/Git Bash (measured: 0 on a CRLF file). Before building a patch, detect the EOL from the bytes: `node -e "const s=require('fs').readFileSync(process.argv[1],'latin1');console.log((s.match(/\r\n/g)||[]).length,'CRLF')" <file>` (or `Path(...).read_bytes().count(b'\r\n')`, PHP `bin2hex`); zero grep output does not prove LF.
- In a CRLF file, a replacement pattern with an embedded `\n` matches 0 times. Build the old snippet without the trailing line break, or use the detected EOL (`\r\n`) between lines, and require the expected count before writing.
- When restoring a specific path on Windows, checkout may convert LF to CRLF. Check with `git ls-files --eol -- <caminho>` (`i/` index, `w/` working tree) and compare the bytes against the reference blob (`git show HEAD:<caminho>`) before declaring parity.
- In Windows removal, use a single shell from end to end; check absolute paths and reparse points before deleting. Do not enumerate in PowerShell to pass deletion to CMD. Never cross junctions in cleaning.

### 21. How to recognize an orphan `index.lock` on Windows

1. **Symptom**: `fatal: Unable to create '.../.git/index.lock': File exists` (or `.git/worktrees/<name>/index.lock`) after an interrupted Git command, timeout or hang on Windows/OneDrive.
2. **Prohibition**: never delete `index.lock` without checking for an active `git.exe` on the repository. Deleting an active lock corrupts the index.
3. **Mandatory diagnosis (PowerShell)**:
   ```powershell
   Get-CimInstance Win32_Process -Filter "Name='git.exe'" | Select-Object ProcessId, CreationDate, CommandLine
   Get-Item -LiteralPath .git/index.lock | Select-Object FullName, Length, LastWriteTime
   ```
   Confirm that the lock timestamp does not change.
4. **Safe action**: with an active `git.exe` on that repo/worktree, wait and never delete someone else's lock. With no `git.exe` acting and the file idle (orphan), remove only the literal file (`Remove-Item -LiteralPath .git/index.lock`) and check with `git status --short` (and `git fsck` if the interruption happened during a write).
5. **Deploy in a repository on OneDrive**: the `git diff` triggered by the deploy pipeline often leaves an orphan `.git/index.lock` when the repository lives on OneDrive. Before retrying the deploy, apply the diagnosis from steps 3 and 4.

### Finding skills in dot-prefixed directories

Python's `glob(..., recursive=True)` skips dot-prefixed directories by default, including `.gemini`, `.claude`, `.codex`, and `.github`. Use `os.walk` or `Path.rglob` to scan the skill kits.
In the `conn2flow-ai-workspace` source repository, run `.\.venv-mdd\Scripts\pytest.exe -q tools/mdd-client/tests`.
