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
$templateRoot = (Resolve-Path (Join-Path $languageRoot "templates\private-project-claude-kit")).Path
$boilerplateRoot = (Resolve-Path (Join-Path $languageRoot "sdd-boilerplate\sdd")).Path

New-Item -ItemType Directory -Force -Path $TargetRepoPath | Out-Null
$targetRoot = (Resolve-Path $TargetRepoPath).Path

function Copy-Dir {
    param(
        [string]$SourceRelative,
        [string]$DestinationRelative
    )

    $trimChars = [char[]]@([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)

    $sourcePath = Join-Path $templateRoot $SourceRelative
    $destinationPath = Join-Path $targetRoot $DestinationRelative

    New-Item -ItemType Directory -Force -Path $destinationPath | Out-Null

    Get-ChildItem -Path $sourcePath -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($sourcePath.Length).TrimStart($trimChars)
        $targetPath = Join-Path $destinationPath $relativePath

        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
            return
        }

        $targetDir = Split-Path -Parent $targetPath
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

        if ((Test-Path $targetPath) -and -not $Force) {
            Write-Host "Skipping existing file: $targetPath"
            return
        }

        Copy-Item $_.FullName $targetPath -Force
        Write-Host "Installed: $targetPath"
    }
}

function Copy-File {
    param(
        [string]$SourceRelative,
        [string]$DestinationRelative
    )

    $sourcePath = Join-Path $templateRoot $SourceRelative
    $destinationPath = Join-Path $targetRoot $DestinationRelative
    $targetDir = Split-Path -Parent $destinationPath

    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

    if ((Test-Path $destinationPath) -and -not $Force) {
        Write-Host "Skipping existing file: $destinationPath"
        return
    }

    Copy-Item $sourcePath $destinationPath -Force
    Write-Host "Installed: $destinationPath"
}

function Copy-MergedTree {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot,
        [bool]$Overwrite
    )

    if (-not (Test-Path $DestinationRoot)) {
        New-Item -ItemType Directory -Force -Path $DestinationRoot | Out-Null
    }

    Get-ChildItem -LiteralPath $SourceRoot -Recurse -Force | ForEach-Object {
        $relativePath = $_.FullName.Substring($SourceRoot.Length).TrimStart([char[]]@('\', '/'))
        $targetPath = Join-Path $DestinationRoot $relativePath

        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
            return
        }

        $targetDir = Split-Path -Parent $targetPath
        New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

        if ((Test-Path $targetPath) -and -not $Overwrite) {
            Write-Host "Skipping existing file: $targetPath"
            return
        }

        Copy-Item $_.FullName $targetPath -Force
        Write-Host "Installed: $targetPath"
    }
}

function Install-SddBoilerplate {
    param(
        [string]$SourceRoot,
        [string]$RepoRoot
    )

    $targetSdd = Join-Path $RepoRoot 'sdd'
    if (Test-Path $targetSdd) {
        Write-Host "Preserving existing SDD directory: $targetSdd"
        return
    }

    Copy-MergedTree -SourceRoot $SourceRoot -DestinationRoot $targetSdd -Overwrite $true
}

Copy-File "CLAUDE.md" "CLAUDE.md"
Copy-Dir ".claude" ".claude"
Copy-Dir "docs" "docs"
Install-SddBoilerplate -SourceRoot $boilerplateRoot -RepoRoot $targetRoot

function Rebind-AgentPrefix {
    param(
        [string]$RepoRoot,
        [string]$Prefix
    )

    if ([string]::IsNullOrWhiteSpace($Prefix)) {
        return
    }

    $oldAgents = @(
        "private-project-coordinator",
        "private-project-implementer",
        "private-project-reviewer"
    )
    $newAgents = @(
        "$Prefix-coordinator",
        "$Prefix-implementer",
        "$Prefix-reviewer"
    )

    $agentsDir = Join-Path $RepoRoot ".claude\agents"

    for ($index = 0; $index -lt $oldAgents.Length; $index++) {
        $oldName = $oldAgents[$index]
        $newName = $newAgents[$index]
        $oldPath = Join-Path $agentsDir "$oldName.md"
        $newPath = Join-Path $agentsDir "$newName.md"

        if (Test-Path $oldPath) {
            Move-Item $oldPath $newPath -Force
            Write-Host "Renamed agent: $oldPath -> $newPath"
        }

        Get-ChildItem -Path $RepoRoot -Recurse -File | Where-Object {
            $_.FullName -like "*\.claude\*" -or $_.FullName -like "*\docs\*" -or $_.Name -eq "CLAUDE.md"
        } | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $updated = $content -replace [regex]::Escape($oldName), $newName
            if ($updated -ne $content) {
                Set-Content -Path $_.FullName -Value $updated -NoNewline
            }
        }
    }
}

Rebind-AgentPrefix -RepoRoot $targetRoot -Prefix $AgentPrefix

Write-Host "Private Project Claude Kit installation finished."