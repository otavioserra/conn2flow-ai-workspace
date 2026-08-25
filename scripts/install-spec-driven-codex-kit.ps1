param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [switch]$Force,

    [string]$AgentPrefix = "",

    [ValidateSet('pt-br', 'en')]
    [string]$Language = 'pt-br'
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$languageRoot = (Resolve-Path (Join-Path $scriptDir "..\templates\$Language")).Path
$templateRoot = (Resolve-Path (Join-Path $languageRoot 'templates\spec-driven-project-codex-kit')).Path
$boilerplateRoot = (Resolve-Path (Join-Path $languageRoot 'sdd-boilerplate\sdd')).Path

New-Item -ItemType Directory -Force -Path $TargetRepoPath | Out-Null
$targetRoot = (Resolve-Path $TargetRepoPath).Path
$installedFiles = [System.Collections.Generic.List[string]]::new()

function Copy-CodexFile {
    param([string]$SourcePath, [string]$DestinationPath)

    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $DestinationPath) | Out-Null
    if ((Test-Path -LiteralPath $DestinationPath) -and -not $Force) {
        Write-Host "Skipping existing file: $DestinationPath"
        return
    }

    Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
    $script:installedFiles.Add($DestinationPath)
    Write-Host "Installed: $DestinationPath"
}

function Copy-CodexTree {
    param([string]$SourceRoot, [string]$DestinationRoot)

    New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceRoot.Length).TrimStart([char[]]@('\', '/'))
        $targetPath = Join-Path $DestinationRoot $relativePath
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
        } else {
            Copy-CodexFile -SourcePath $_.FullName -DestinationPath $targetPath
        }
    }
}

function Install-SddBoilerplate {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (Test-Path -LiteralPath $targetSdd) {
        Write-Host "Preserving existing SDD directory: $targetSdd"
        return
    }
    Copy-CodexTree -SourceRoot $boilerplateRoot -DestinationRoot $targetSdd
}

function Install-EngineeringMemories {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) { return }

    Get-ChildItem -LiteralPath $boilerplateRoot -File | Where-Object {
        $_.Name -match 'MEMORIA-ENGENHARIA|ENGINEERING-MEMORY'
    } | ForEach-Object {
        $targetPath = Join-Path $targetSdd $_.Name
        if (Test-Path -LiteralPath $targetPath) {
            Write-Host "Preserving existing memory file: $targetPath"
        } else {
            Copy-CodexFile -SourcePath $_.FullName -DestinationPath $targetPath
        }
    }
}

function Install-SddArchiveGovernance {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) { return }

    foreach ($section in @('decisions', 'human-requests', 'implementation', 'validation')) {
        $sourceReadme = Join-Path $boilerplateRoot "$section\archive\README.md"
        $targetReadme = Join-Path $targetSdd "$section\archive\README.md"
        if ((Test-Path -LiteralPath $sourceReadme) -and -not (Test-Path -LiteralPath $targetReadme)) {
            Copy-CodexFile -SourcePath $sourceReadme -DestinationPath $targetReadme
        }
    }
}

function Install-SddBacklogGovernance {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) { return }

    foreach ($relativePath in @('README.md', 'BACKLOG-INDEX.md', 'archive\README.md')) {
        $sourcePath = Join-Path $boilerplateRoot "backlog\$relativePath"
        $targetPath = Join-Path $targetSdd "backlog\$relativePath"
        if ((Test-Path -LiteralPath $sourcePath) -and -not (Test-Path -LiteralPath $targetPath)) {
            Copy-CodexFile -SourcePath $sourcePath -DestinationPath $targetPath
        }
    }
}

function Set-AgentIdentity {
    $agentName = if ([string]::IsNullOrWhiteSpace($AgentPrefix)) { 'sdd-executor' } else { "$AgentPrefix-sdd-executor" }
    foreach ($file in $installedFiles) {
        $content = Get-Content -LiteralPath $file -Raw -Encoding UTF8
        if ($content.Contains('{{AGENT_NAME}}')) {
            $content.Replace('{{AGENT_NAME}}', $agentName) | Set-Content -LiteralPath $file -NoNewline -Encoding UTF8
        }
    }
}

foreach ($filename in @('CODEX.md', 'AGENTS.md')) {
    Copy-CodexFile -SourcePath (Join-Path $templateRoot $filename) -DestinationPath (Join-Path $targetRoot $filename)
}
Copy-CodexTree -SourceRoot (Join-Path $templateRoot '.codex') -DestinationRoot (Join-Path $targetRoot '.codex')
Install-SddBoilerplate
Install-EngineeringMemories
Install-SddArchiveGovernance
Install-SddBacklogGovernance
Set-AgentIdentity

Write-Host 'Spec-Driven Codex Kit installation finished.'
