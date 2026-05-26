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
$templateRoot = (Resolve-Path (Join-Path $languageRoot "templates\spec-driven-project-claude-kit")).Path
$boilerplateRoot = (Resolve-Path (Join-Path $languageRoot "sdd-boilerplate\sdd")).Path

New-Item -ItemType Directory -Force -Path $TargetRepoPath | Out-Null
$targetRoot = (Resolve-Path $TargetRepoPath).Path

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

function Rebind-AgentPrefix {
    param(
        [string]$RepoRoot,
        [string]$Prefix
    )

    if ([string]::IsNullOrWhiteSpace($Prefix)) {
        return
    }

    $mappings = @(
        @{ Old = 'sdd-coordinator'; New = "$Prefix-sdd-coordinator" },
        @{ Old = 'sdd-implementer'; New = "$Prefix-sdd-implementer" },
        @{ Old = 'sdd-reviewer'; New = "$Prefix-sdd-reviewer" }
    )

    $agentsDir = Join-Path $RepoRoot '.claude\agents'

    foreach ($mapping in $mappings) {
        $oldPath = Join-Path $agentsDir ($mapping.Old + '.md')
        $newPath = Join-Path $agentsDir ($mapping.New + '.md')

        if (Test-Path $oldPath) {
            Move-Item -LiteralPath $oldPath -Destination $newPath -Force
            Write-Host "Renamed agent: $oldPath -> $newPath"
        }
    }

    $candidateFiles = @()
    $claudePath = Join-Path $RepoRoot 'CLAUDE.md'
    if (Test-Path $claudePath) {
        $candidateFiles += Get-Item -LiteralPath $claudePath
    }

    $claudeRoot = Join-Path $RepoRoot '.claude'
    if (Test-Path $claudeRoot) {
        $candidateFiles += Get-ChildItem -Path $claudeRoot -Recurse -File
    }

    foreach ($file in $candidateFiles) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        $updated = $content

        foreach ($mapping in $mappings) {
            $updated = $updated.Replace($mapping.Old, $mapping.New)
        }

        if ($updated -ne $content) {
            Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline -Encoding utf8
        }
    }
}

Copy-File "CLAUDE.md" "CLAUDE.md"
Copy-MergedTree -SourceRoot (Join-Path $templateRoot '.claude') -DestinationRoot (Join-Path $targetRoot '.claude') -Overwrite ([bool]$Force)
Install-SddBoilerplate -SourceRoot $boilerplateRoot -RepoRoot $targetRoot
Rebind-AgentPrefix -RepoRoot $targetRoot -Prefix $AgentPrefix

Write-Host "Spec-Driven Claude Kit installation finished."