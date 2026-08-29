<#
.SYNOPSIS
    Sincroniza instantaneamente todas as 36 skills e kits de IA para todos os repositorios alvo.
.DESCRIPTION
    Atualiza com -Force os templates nos repositorios:
    - conn2flow
    - lumix
    - transformamp
    - conn2flow-site
#>

[CmdletBinding()]
param(
    [switch]$Force = $false,
    [switch]$CommitAndPush = $false
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "Iniciando sincronizacao 1-Click de Skills do Workspace..." -ForegroundColor Cyan

$Targets = @(
    "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow",
    "C:\Users\otavi\OneDrive\Documentos\GIT\lumix",
    "C:\Users\otavi\OneDrive\Documentos\GIT\transformamp",
    "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow-site"
)

$Installers = @(
    "install-spec-driven-claude-kit.ps1",
    "install-spec-driven-cursor-kit.ps1",
    "install-spec-driven-copilot-kit.ps1",
    "install-spec-driven-gemini-kit.ps1",
    "install-spec-driven-codex-kit.ps1"
)

foreach ($target in $Targets) {
    if (Test-Path $target) {
        $repoName = Split-Path -Leaf $target
        Write-Host "`nSincronizando repositorio: $repoName" -ForegroundColor Yellow

        foreach ($installer in $Installers) {
            $scriptPath = Join-Path $WorkspaceRoot "scripts\$installer"
            if (Test-Path $scriptPath) {
                if ($Force) {
                    & powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -TargetRepoPath $target -Language "pt-br" -Force | Out-Null
                } else {
                    & powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -TargetRepoPath $target -Language "pt-br" | Out-Null
                }
                if ($LASTEXITCODE -ne 0) {
                    throw "Installer $installer failed for $repoName with exit code $LASTEXITCODE."
                }
            }
        }
        Write-Host "   36 Skills atualizadas nos 5 kits de $repoName" -ForegroundColor Green

        if ($CommitAndPush) {
            Push-Location $target
            try {
                $syncPaths = @(".claude", ".cursor", ".github", ".gemini", ".codex")
                if ($repoName -eq "conn2flow") {
                    $syncPaths += "cli/src/Commands/AiSyncCommand.php"
                }
                git add -- $syncPaths
                $tailwindSkillPaths = @(
                    ".claude/skills/c2f-tailwind-css-architecture/SKILL.md",
                    ".cursor/skills/c2f-tailwind-css-architecture/SKILL.md",
                    ".github/skills/c2f-tailwind-css-architecture/SKILL.md",
                    ".gemini/skills/c2f-tailwind-css-architecture/SKILL.md"
                )
                git add -f -- $tailwindSkillPaths
                git diff --cached --quiet
                if ($LASTEXITCODE -ne 0) {
                    git commit -m "feat(skills): implement c2f-tailwind-css-architecture skill and sync across all repositories"
                    if ($LASTEXITCODE -ne 0) {
                        throw "Commit failed in $repoName with exit code $LASTEXITCODE."
                    }
                    git push origin (git branch --show-current)
                    if ($LASTEXITCODE -ne 0) {
                        throw "Push failed in $repoName with exit code $LASTEXITCODE."
                    }
                    Write-Host "   Commit e push realizados em $repoName" -ForegroundColor Cyan
                } else {
                    Write-Host "   Nenhuma alteracao de skills pendente em $repoName" -ForegroundColor Gray
                }
            } finally {
                Pop-Location
            }
        }
    } else {
        Write-Host "Repositorio nao encontrado: $target" -ForegroundColor Red
    }
}

Write-Host "`nSincronizacao 1-Click concluida com sucesso em todos os repositorios!" -ForegroundColor Green
