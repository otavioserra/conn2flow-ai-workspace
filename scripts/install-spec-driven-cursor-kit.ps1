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
$languageRoot = (Resolve-Path (Join-Path $scriptDir "..\$Language")).Path
$templateRoot = (Resolve-Path (Join-Path $languageRoot 'templates\spec-driven-project-cursor-kit')).Path
$boilerplateRoot = (Resolve-Path (Join-Path $languageRoot 'sdd-boilerplate\sdd')).Path

New-Item -ItemType Directory -Force -Path $TargetRepoPath | Out-Null
$targetRoot = (Resolve-Path $TargetRepoPath).Path
$installedFiles = [System.Collections.Generic.List[string]]::new()

function Copy-CursorFile {
    param(
        [string]$SourcePath,
        [string]$DestinationPath
    )

    $targetDir = Split-Path -Parent $DestinationPath
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

    if ((Test-Path -LiteralPath $DestinationPath) -and -not $Force) {
        Write-Host "Skipping existing file: $DestinationPath"
        return
    }

    Copy-Item -LiteralPath $SourcePath -Destination $DestinationPath -Force
    $script:installedFiles.Add($DestinationPath)
    Write-Host "Installed: $DestinationPath"
}

function Copy-CursorTree {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot
    )

    New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
    Get-ChildItem -LiteralPath $SourceRoot -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceRoot.Length).TrimStart([char[]]@('\', '/'))
        $targetPath = Join-Path $DestinationRoot $relativePath

        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
            return
        }

        Copy-CursorFile -SourcePath $_.FullName -DestinationPath $targetPath
    }
}

function Install-SddBoilerplate {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (Test-Path -LiteralPath $targetSdd) {
        Write-Host "Preserving existing SDD directory: $targetSdd"
        return
    }

    Copy-CursorTree -SourceRoot $boilerplateRoot -DestinationRoot $targetSdd
}

function Install-EngineeringMemories {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) {
        return
    }

    Get-ChildItem -LiteralPath $boilerplateRoot -File | Where-Object {
        $_.Name -match 'MEMORIA-ENGENHARIA|ENGINEERING-MEMORY'
    } | ForEach-Object {
        $targetPath = Join-Path $targetSdd $_.Name
        if (Test-Path -LiteralPath $targetPath) {
            Write-Host "Preserving existing memory file: $targetPath"
            return
        }
        Copy-CursorFile -SourcePath $_.FullName -DestinationPath $targetPath
    }
}

function Install-SddArchiveGovernance {
    $targetSdd = Join-Path $targetRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) {
        return
    }

    foreach ($section in @('decisions', 'human-requests', 'implementation', 'validation')) {
        $sourceReadme = Join-Path $boilerplateRoot "$section\archive\README.md"
        $targetArchive = Join-Path $targetSdd "$section\archive"
        $targetReadme = Join-Path $targetArchive 'README.md'
        New-Item -ItemType Directory -Force -Path $targetArchive | Out-Null

        if ((Test-Path -LiteralPath $sourceReadme) -and -not (Test-Path -LiteralPath $targetReadme)) {
            Copy-CursorFile -SourcePath $sourceReadme -DestinationPath $targetReadme
        }
    }
}

function Set-AgentIdentity {
    $agentName = if ([string]::IsNullOrWhiteSpace($AgentPrefix)) {
        'sdd-executor'
    } else {
        "$AgentPrefix-sdd-executor"
    }

    foreach ($file in $installedFiles) {
        if (-not (Test-Path -LiteralPath $file)) {
            continue
        }
        $content = Get-Content -LiteralPath $file -Raw -Encoding UTF8
        if ($content.Contains('{{AGENT_NAME}}')) {
            $content.Replace('{{AGENT_NAME}}', $agentName) |
                Set-Content -LiteralPath $file -NoNewline -Encoding UTF8
        }
    }
}

Copy-CursorFile -SourcePath (Join-Path $templateRoot '.cursorrules') -DestinationPath (Join-Path $targetRoot '.cursorrules')
Copy-CursorTree -SourceRoot (Join-Path $templateRoot '.cursor') -DestinationRoot (Join-Path $targetRoot '.cursor')
Install-SddBoilerplate
Install-EngineeringMemories
Install-SddArchiveGovernance
Set-AgentIdentity

Write-Host 'Spec-Driven Cursor Kit installation finished.'
