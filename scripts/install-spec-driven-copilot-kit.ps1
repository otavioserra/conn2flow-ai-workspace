param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [switch]$Force,

    [string]$AgentPrefix = '',

    [ValidateSet('pt-br', 'en')]
    [string]$Language = 'pt-br'
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$languageRoot = (Resolve-Path (Join-Path $scriptDir "..\$Language")).Path
$templateRoot = (Resolve-Path (Join-Path $languageRoot 'templates\spec-driven-project-copilot-kit')).Path
$boilerplateRoot = (Resolve-Path (Join-Path $languageRoot 'sdd-boilerplate\sdd')).Path

if (-not (Test-Path $TargetRepoPath)) {
    New-Item -ItemType Directory -Path $TargetRepoPath -Force | Out-Null
}

$targetRoot = (Resolve-Path $TargetRepoPath).Path

$copyItems = @(
    @{ Source = '.github'; Destination = '.github' }
)

$coordinatorAgent = 'sdd-coordinator'
$reviewerAgent = 'sdd-reviewer'

if (-not [string]::IsNullOrWhiteSpace($AgentPrefix)) {
    $coordinatorAgent = "$AgentPrefix-sdd-coordinator"
    $reviewerAgent = "$AgentPrefix-sdd-reviewer"
}

$promptAgentBindings = @{
    '.github\prompts\start-sdd-slice.prompt.md' = $coordinatorAgent
    '.github\prompts\continue-sdd-batch.prompt.md' = $coordinatorAgent
    '.github\prompts\raise-spec-change.prompt.md' = $coordinatorAgent
    '.github\prompts\review-current-batch.prompt.md' = $reviewerAgent
}

$promptExisted = @{}
foreach ($promptRelativePath in $promptAgentBindings.Keys) {
    $promptExisted[$promptRelativePath] = Test-Path (Join-Path $targetRoot $promptRelativePath)
}

$specializedMarkers = @(
    '.github\agents\nexus-sdd-coordinator.agent.md',
    '.github\skills\nexus-validation\SKILL.md',
    '.github\hooks\nexus-sdd-session-start.json'
)

foreach ($marker in $specializedMarkers) {
    $markerPath = Join-Path $targetRoot $marker
    if (Test-Path $markerPath) {
        throw "Target repo already contains specialized Nexus SDD customizations ($marker). Do not install the generic Spec-Driven kit over it. Update the specialized files directly instead."
    }
}

function Copy-MergedTree {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot,
        [bool]$Overwrite
    )

    if (-not (Test-Path $DestinationRoot)) {
        New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null
    }

    foreach ($entry in Get-ChildItem -LiteralPath $SourceRoot -Recurse -Force) {
        $relativePath = $entry.FullName.Substring($SourceRoot.Length).TrimStart([char[]]@('\', '/'))
        $targetPath = Join-Path $DestinationRoot $relativePath

        if ($entry.PSIsContainer) {
            if (-not (Test-Path $targetPath)) {
                New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
            }
            continue
        }

        $targetParent = Split-Path -Parent $targetPath
        if (-not (Test-Path $targetParent)) {
            New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
        }

        if ((Test-Path $targetPath) -and -not $Overwrite) {
            Write-Host "Skipping existing file: $targetPath"
            continue
        }

        Copy-Item $entry.FullName $targetPath -Force
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

    $agentsDir = Join-Path $RepoRoot '.github\agents'

    foreach ($mapping in $mappings) {
        $oldPath = Join-Path $agentsDir ($mapping.Old + '.agent.md')
        $newFileName = $mapping.New + '.agent.md'

        if (Test-Path $oldPath) {
            Rename-Item -LiteralPath $oldPath -NewName $newFileName -Force
            Write-Host "Renamed agent: $oldPath -> $(Join-Path $agentsDir $newFileName)"
        }
    }

    $githubRoot = Join-Path $RepoRoot '.github'
    if (-not (Test-Path $githubRoot)) {
        return
    }

    foreach ($file in Get-ChildItem -Path $githubRoot -Recurse -File) {
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

foreach ($item in $copyItems) {
    $sourcePath = Join-Path $templateRoot $item.Source
    $destinationPath = Join-Path $targetRoot $item.Destination

    Copy-MergedTree -SourceRoot $sourcePath -DestinationRoot $destinationPath -Overwrite ([bool]$Force)
}

Install-SddBoilerplate -SourceRoot $boilerplateRoot -RepoRoot $targetRoot
Copy-MergedTree -SourceRoot (Join-Path $templateRoot 'sdd\scripts\hooks') -DestinationRoot (Join-Path $targetRoot 'sdd\scripts\hooks') -Overwrite ([bool]$Force)
Rebind-AgentPrefix -RepoRoot $targetRoot -Prefix $AgentPrefix

foreach ($binding in $promptAgentBindings.GetEnumerator()) {
    if (-not $Force -and $promptExisted[$binding.Key]) {
        continue
    }

    $promptPath = Join-Path $targetRoot $binding.Key
    if (-not (Test-Path $promptPath)) {
        continue
    }

    $content = Get-Content -LiteralPath $promptPath -Raw
    $updatedContent = $content -replace 'agent:\s*agent', "agent: $($binding.Value)"
    if ($updatedContent -ne $content) {
        Set-Content -LiteralPath $promptPath -Value $updatedContent -NoNewline -Encoding utf8
        Write-Host "Bound prompt to agent: $promptPath -> $($binding.Value)"
    }
}

Write-Host 'Spec-Driven Copilot Kit installation finished.'