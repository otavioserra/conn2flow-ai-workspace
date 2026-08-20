<#
.SYNOPSIS
    Sincroniza instantaneamente todas as 32 skills e kits de IA para todos os repositórios alvo.
.DESCRIPTION
    Atualiza com -Force os templates nos repositórios:
    - conn2flow
    - lumix
    - transformamp
    - conn2flow-site
#>

[CmdletBinding()]
param(
    [switch]$CommitAndPush = $false
)

$ErrorActionPreference = "Stop"
$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

Write-Host "🚀 Iniciando sincronização 1-Click de Skills do Workspace..." -ForegroundColor Cyan

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
    "install-spec-driven-gemini-kit.ps1"
)

foreach ($target in $Targets) {
    if (Test-Path $target) {
        $repoName = Split-Path -Leaf $target
        Write-Host "`n📦 Sincronizando repositório: $repoName" -ForegroundColor Yellow

        foreach ($installer in $Installers) {
            $scriptPath = Join-Path $WorkspaceRoot "scripts\$installer"
            if (Test-Path $scriptPath) {
                & powershell -NoProfile -ExecutionPolicy Bypass -File $scriptPath -TargetRepoPath $target -Language "pt-br" -Force | Out-Null
            }
        }
        Write-Host "   ✅ 32 Skills atualizadas nos 4 kits de $repoName" -ForegroundColor Green

        if ($CommitAndPush) {
            Push-Location $target
            try {
                $status = git status --porcelain
                if ($status) {
                    git add .
                    git commit -m "chore(skills): 1-click sync 32 skills from ai-workspace"
                    git push origin (git branch --show-current)
                    Write-Host "   🚀 Commit e push realizados em $repoName" -ForegroundColor Cyan
                } else {
                    Write-Host "   ✨ Nenhuma alteração pendente em $repoName" -ForegroundColor Gray
                }
            } finally {
                Pop-Location
            }
        }
    } else {
        Write-Host "⚠️ Repositório não encontrado: $target" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Sincronização 1-Click concluída com sucesso em todos os repositórios!" -ForegroundColor Green
