---
name: c2f-dev-scripts
description: "READ BEFORE running dev-environment scripts or project CLI tools. Prevents incorrect working directories, missing environment variables and execution outside the Docker container."
user-invocable: false
---

# Automation and Development Scripts (`ai-workspace/scripts/`)

# ⚡ MANDATORY TRIGGER
- **TRIGGER**: Perform automation, synchronization, resource generation, migration or testing tasks via PowerShell/Bash scripts in `dev-environment/` or `scripts/`.
- **SKIP ONLY IF**: Manual documentation editing Markdown without running auxiliary scripts.
- **CONSEQUENCE OF IGNORING**: Commands fail by incorrect paths, Docker permissions, or improper overwriting of environment files.

---

See Conventions for use and creation of development scripts in Conn2Flow:

## 1. Script Directory Structure

The scripts are bilingual and live under the language (`en/` or `pt-br/`), never at the root of `ai-workspace/`:

```
ai-workspace/<idioma>/scripts/
├── api/               # Sondas e clientes das APIs do gestor
├── commits/           # Validação e padronização de commits
├── dev-environment/   # Configuração e criação de novos módulos/instalações
├── projects/          # Deploy, recover, sync e atualização de projetos
├── releases/          # Tags e automação de releases Git
├── resources/         # CLI de manipulação de recursos (upsert-resources.php)
├── tests/             # Scripts de teste e diagnóstico
├── translates/        # Rotinas de tradução e paridade bilíngue
├── updates/           # Builds locais e compilação de pacotes
└── utils/             # Scripts auxiliares Node/JS (ex: fix-tailwind-spacing.js)
```

---

## 2. Main Scripts Available Utilities

* `ai-workspace/<idioma>/scripts/resources/upsert-resources.php`: CLI to create, clone, edit and delete resources with support for `--type`, `--id`, `--action=copy` and `--open`.
* `ai-workspace/<idioma>/scripts/projects/deploy-project-v2.sh`: Automated projects packaging and deploy via OAuth API.
* `ai-workspace/<idioma>/scripts/projects/recover-project.sh`: Data recovery/pull and server structure.
* `ai-workspace/<idioma>/scripts/dev-environment/create-new-module.sh`: Scaffold of new modules.
* `ai-workspace/<idioma>/scripts/dev-environment/create-new-installation.sh`: New local installation setup.
* `ai-workspace/pt-br/scripts/utils/fix-tailwind-spacing.js`: Node utility for Tailwind class correction.

---

## 3. CLI Console Canon Contract (`c2f`)

> [!IMPORTANT]
> The `c2f` **does not use Symphony Console** console. He has his own contracts at `Conn2Flow\Cli\Contracts`.
> Never invent `Symfony\Component\Console\Command\Command`, `configure()`, `InputArgument`, `addOption()`
> or `#[AsCommand]` attributes: none of this exists in project and the command will not be registered.

Every new command MUST implement `Conn2Flow\Cli\Contracts\CommandInterface` or extend
`Conn2Flow\Cli\Commands\BaseProcessCommand` (which already implements the interface and adds `runShell()`).

**Required area of `CommandInterface`** (`cli/src/Contracts/CommandInterface.php`):

|Method|Return|Paper|
| --- | --- | --- |
|`getName()`|`string`|Single name in `grupo:acao` format (e.g. `resources:sync`).|
|`getDescription()`|`string`|Short description displayed on `c2f help`.|
|`getAliases()`|`array<string>`|Accepted aliases (e.g. `['release:installer']`).|
|`getHelp()`|`string`|Detailed command usage text.|
|`execute(InputInterface $input, OutputInterface $output)`|`int`|Logic of command. `0` = success; different from `0` = failure.|

**Implementation rules**:

1. **Entry and exit by contracts**: read arguments with `$input->getArgument(<indice>, <padrao>)` and write with
   `$output->title()`, `$output->info()` and `$output->error()`. Do not use direct `$argv`, `echo` or `print_r`.
2. **Herde `BaseProcessCommand` to orchestrate processes**: it receives `string $rootPath` in the builder and exposes
   `runShell(string $cmd, OutputInterface $output, ?string $cwd = null): int`, which already stream stdout,
   stderr capture and spread of exit code.
3. **Solve paths from `$this->rootPath`**, never `getcwd()` or script paths.
4. **Validate arguments before executing** and return `1` with `$output->error()` explaining the correct use.
5. **State `declare(strict_types=1);`**, use the `Conn2Flow\Cli\Commands` namespace and mark the class as `final`.
6. **Log command** on the console (`cli/src/Console/`) to show up on `c2f help`. A command other than
   is not executable in the catalogue.

---

## 4. Anti-Deadlock Rule: HTTP Probes From Front-End

> [!WARNING]
> **PROHIBITED to fire HTTP synchronous loopback probe from within the PHP process itself in web mode.**

In a local environment, Docker and VPS single-pool, PHP-FPM has a reduced number of workers. If a PHP script
who is attending a request opens a curl for **Host itself**, it occupies a worker while waiting another
Worker meet probe. With the pool saturated, no one answers: the curl only returns on the timeout and the original request
Lock. It's self-requisition deadlock, not slow.

**Rules**:

1. **Web mode**: Who runs the connectivity probe, rewrite or healthcheck URL is **browser**
   (`fetch`/`XMLHttpRequest` asynchronous in front-end JavaScript). The **mounts the probe plane** only backend
   (Target URL, expected response, configuration snippet) and **records the verdict** returned by the client.
2. **CLI/headless mode**: then PHP itself can scan, because there is no browser and the runner does not compete for
   PHP-FPM pool. Protect with an explicit SAPI check.
3. **Never** let the diagnostic route depend on the resource it diagnoses. Always offer a path
   deterministic achievable by front-controller (e.g. `?api=rewrite-probe` plus `api/rewrite-probe`).

**Reference implementation** (installer rewrite probe, REQ-027/REQ-028):

* `gestor-instalador/src/InstallerGuard.php`: constants `REWRITE_PROBE`, `REWRITE_PROBE_OK` and `API_REWRITE_PROBE`.
* `gestor-instalador/index.php`: responds to probe before session/lock and accepts `?api=rewrite-probe` as route
  deterministic; the verdict arrives in the request as `rewrite_ok`.
* `gestor-instalador/assets/js/installer.js`: It is the **browser** that fires the `fetch` of the probe.
* `gestor-instalador/src/Installer.php`: `rewriteProbeReport()` consumes the customer verdict; `probeRewrite()`
  abort with `if (!InstallerGuard::isCli()) return null;` — the server probe only runs on CLI.

```php
// Padrão obrigatório para qualquer sonda HTTP no servidor.
private function probeSelf($url)
{
    // Em modo web a requisição atingiria o mesmo pool PHP-FPM que conduz esta execução.
    if (!InstallerGuard::isCli()) return null;
    if (!function_exists('curl_init')) return null;
    // ... cURL com CURLOPT_TIMEOUT e CURLOPT_CONNECTTIMEOUT curtos ...
}
```

---

## 5. Guidelines for Creating New Development Scripts

1. **Flexible Parameters**: Support for explicit flags (`--project=ID`, `--lang=pt-br`, `--force`) and secure fallbacks for interactive execution if arguments omit required parameters.
2. **Idepotence and Security**: Update/sync scripts should be idempotent (can run multiple times without corrupting data).
3. **Logs and Return**: Emulate color/formatted output on the console (`echo -e "\033[0;32mOK...\033[0m"`) and check HTTP output codes or command status.
4. **`--dry-run` Mode**: scripts that mutate versioned files (e.g. release version boom) should offer
   `--dry-run`, calculating and printing the result without writing to disk, so release gates can
   pre-validate tags and documentation before mutation.
5. **Explicit Git Staging**: scripts that commit MUST list the paths (`git add -- "$ARQUIVO"`). `git add .`
   and `git add -A` are prohibited: they drag work concurrent from other agents to commit.
