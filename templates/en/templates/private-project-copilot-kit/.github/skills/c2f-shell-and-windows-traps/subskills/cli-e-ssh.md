# CLI and SSH on Windows — recipes (Traps 7, 8, 9 and 17)

Subskill of `c2f-shell-and-windows-traps`. Read it before using `rsync`/SSH from Windows, parsing the output of CLI tools, running commands as another user on a multi-tenant server or calling Node binaries in a build. The critical rules are also in the parent skill.

## 7. `rsync: dup() in/out/err failed` — cwRsync/SSH runtime pairing

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

## 8. ANSI sequences in CLI output (colors break parsers)

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

## 9. `cd` before `sudo -u` on restricted SSH tenants (HestiaCP and similar)

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

## 17. `npx` disappearing and the volatile npm cache on Windows

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
