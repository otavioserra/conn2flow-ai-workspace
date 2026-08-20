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

function Migrate-LegacySdd {
    param(
        [string]$RepoRoot
    )

    $targetSdd = Join-Path $RepoRoot 'sdd'
    $projectDir = Join-Path $RepoRoot 'project'

    if (-not (Test-Path $projectDir)) {
        return
    }
    if (Test-Path $targetSdd) {
        Write-Host "SDD directory already exists at $targetSdd - skipping legacy migration."
        return
    }

    $legacyFront = $null
    foreach ($subDir in Get-ChildItem -LiteralPath $projectDir -Directory) {
        $markers = @('00-START-HERE.md', 'README.md', 'SPEC.md')
        foreach ($marker in $markers) {
            if (Test-Path (Join-Path $subDir.FullName $marker)) {
                $legacyFront = $subDir
                break
            }
        }
        if ($legacyFront) { break }
    }

    if (-not $legacyFront) {
        return
    }

    $legacyRelative = "project/$($legacyFront.Name)"
    Write-Host "Legacy SDD structure detected: $($legacyFront.FullName)"
    Move-Item -LiteralPath $legacyFront.FullName -Destination $targetSdd -Force
    Write-Host "Migrated: $($legacyFront.FullName) -> $targetSdd"

    $remainingItems = Get-ChildItem -LiteralPath $projectDir -Force -ErrorAction SilentlyContinue
    if (-not $remainingItems) {
        Remove-Item -LiteralPath $projectDir -Force
        Write-Host "Removed empty legacy directory: $projectDir"
    }

    $configDirs = @('.github', '.claude')
    foreach ($configDir in $configDirs) {
        $configPath = Join-Path $RepoRoot $configDir
        if (-not (Test-Path $configPath)) { continue }
        foreach ($file in Get-ChildItem -Path $configPath -Recurse -File) {
            $content = Get-Content -LiteralPath $file.FullName -Raw
            if ($content -match [regex]::Escape($legacyRelative)) {
                $updated = $content.Replace($legacyRelative, 'sdd')
                Set-Content -LiteralPath $file.FullName -Value $updated -NoNewline -Encoding utf8
                Write-Host "Updated reference in: $($file.FullName)"
            }
        }
    }

    $claudePath = Join-Path $RepoRoot 'CLAUDE.md'
    if (Test-Path $claudePath) {
        $content = Get-Content -LiteralPath $claudePath -Raw
        if ($content -match [regex]::Escape($legacyRelative)) {
            $updated = $content.Replace($legacyRelative, 'sdd')
            Set-Content -LiteralPath $claudePath -Value $updated -NoNewline -Encoding utf8
            Write-Host "Updated reference in: $claudePath"
        }
    }
}

function Install-EngineeringMemories {
    param(
        [string]$BoilerplateRoot,
        [string]$RepoRoot
    )

    $targetSdd = Join-Path $RepoRoot 'sdd'
    if (-not (Test-Path $targetSdd)) {
        return
    }

    $memoryFiles = Get-ChildItem -LiteralPath $BoilerplateRoot -File | Where-Object {
        $_.Name -match 'MEMORIA-ENGENHARIA|ENGINEERING-MEMORY'
    }

    foreach ($file in $memoryFiles) {
        $targetPath = Join-Path $targetSdd $file.Name
        if (Test-Path $targetPath) {
            Write-Host "Preserving existing memory file: $targetPath"
            continue
        }
        Copy-Item $file.FullName $targetPath -Force
        Write-Host "Installed memory: $targetPath"
    }
}

function Install-SddArchiveGovernance {
    param(
        [string]$BoilerplateRoot,
        [string]$RepoRoot
    )

    $targetSdd = Join-Path $RepoRoot 'sdd'
    if (-not (Test-Path $targetSdd)) {
        return
    }

    $archiveSections = @('decisions', 'human-requests', 'implementation', 'validation')
    foreach ($section in $archiveSections) {
        $sourceReadme = Join-Path $BoilerplateRoot "$section\archive\README.md"
        $targetArchive = Join-Path $targetSdd "$section\archive"
        $targetReadme = Join-Path $targetArchive 'README.md'

        New-Item -ItemType Directory -Force -Path $targetArchive | Out-Null

        if ((Test-Path $sourceReadme) -and -not (Test-Path $targetReadme)) {
            Copy-Item $sourceReadme $targetReadme -Force
            Write-Host "Installed archive README: $targetReadme"
        }
    }
}

function Install-SddBacklogGovernance {
    param([string]$BoilerplateRoot, [string]$RepoRoot)

    $targetSdd = Join-Path $RepoRoot 'sdd'
    if (-not (Test-Path -LiteralPath $targetSdd)) { return }

    foreach ($relativePath in @('README.md', 'BACKLOG-INDEX.md', 'archive\README.md')) {
        $sourcePath = Join-Path $BoilerplateRoot "backlog\$relativePath"
        $targetPath = Join-Path $targetSdd "backlog\$relativePath"
        if ((Test-Path -LiteralPath $sourcePath) -and -not (Test-Path -LiteralPath $targetPath)) {
            New-Item -ItemType Directory -Force -Path (Split-Path -Parent $targetPath) | Out-Null
            Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
            Write-Host "Installed backlog governance: $targetPath"
        }
    }
}

Copy-File "CLAUDE.md" "CLAUDE.md"
Copy-MergedTree -SourceRoot (Join-Path $templateRoot '.claude') -DestinationRoot (Join-Path $targetRoot '.claude') -Overwrite ([bool]$Force)
Migrate-LegacySdd -RepoRoot $targetRoot
Install-SddBoilerplate -SourceRoot $boilerplateRoot -RepoRoot $targetRoot
Install-EngineeringMemories -BoilerplateRoot $boilerplateRoot -RepoRoot $targetRoot
Install-SddArchiveGovernance -BoilerplateRoot $boilerplateRoot -RepoRoot $targetRoot
Install-SddBacklogGovernance -BoilerplateRoot $boilerplateRoot -RepoRoot $targetRoot
Rebind-AgentPrefix -RepoRoot $targetRoot -Prefix $AgentPrefix

Write-Host "Spec-Driven Claude Kit installation finished."
