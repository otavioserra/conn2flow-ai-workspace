param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [switch]$Force,

    [string]$AgentPrefix
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateRoot = (Resolve-Path (Join-Path $scriptDir '..\templates\private-project-copilot-kit')).Path

if (-not (Test-Path $TargetRepoPath)) {
    New-Item -ItemType Directory -Path $TargetRepoPath -Force | Out-Null
}

$targetRoot = (Resolve-Path $TargetRepoPath).Path

$copyItems = @(
    @{ Source = '.github'; Destination = '.github' },
    @{ Source = 'docs'; Destination = 'docs' },
    @{ Source = 'scripts\hooks'; Destination = 'scripts\hooks' }
)

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

foreach ($item in $copyItems) {
    $sourcePath = Join-Path $templateRoot $item.Source
    $destinationPath = Join-Path $targetRoot $item.Destination

    Copy-MergedTree -SourceRoot $sourcePath -DestinationRoot $destinationPath -Overwrite ([bool]$Force)
}

function Bind-PromptAgents {
    param(
        [string]$RepoRoot,
        [string]$Prefix
    )

    $coordinatorName = 'private-project-coordinator'
    $reviewerName = 'private-project-reviewer'

    if (-not [string]::IsNullOrWhiteSpace($Prefix)) {
        $coordinatorName = "$Prefix-coordinator"
        $reviewerName = "$Prefix-reviewer"
    }

    $bindings = @(
        @{ Path = '.github\prompts\private-project-kickoff.prompt.md'; Agent = $coordinatorName },
        @{ Path = '.github\prompts\continue-private-work.prompt.md'; Agent = $coordinatorName },
        @{ Path = '.github\prompts\review-private-work.prompt.md'; Agent = $reviewerName }
    )

    foreach ($binding in $bindings) {
        $promptPath = Join-Path $RepoRoot $binding.Path
        if (-not (Test-Path $promptPath)) {
            continue
        }

        $content = Get-Content -LiteralPath $promptPath -Raw
        $updated = $content -replace '^agent:\s*agent$', "agent: $($binding.Agent)"
        if ($updated -ne $content) {
            Set-Content -LiteralPath $promptPath -Value $updated -Encoding utf8
        }
    }
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
        @{ Old = 'private-project-coordinator'; New = "$Prefix-coordinator" },
        @{ Old = 'private-project-implementer'; New = "$Prefix-implementer" },
        @{ Old = 'private-project-reviewer'; New = "$Prefix-reviewer" }
    )

    $agentsDir = Join-Path $RepoRoot '.github\agents'

    foreach ($mapping in $mappings) {
        $oldPath = Join-Path $agentsDir ($mapping.Old + '.agent.md')
        $newFileName = $mapping.New + '.agent.md'

        if (Test-Path $oldPath) {
            Rename-Item -LiteralPath $oldPath -NewName $newFileName -Force
        }
    }

    $githubRoot = Join-Path $RepoRoot '.github'
    if (-not (Test-Path $githubRoot)) {
        return
    }

    foreach ($file in Get-ChildItem -Path $githubRoot -Recurse -File | Where-Object { $_.Extension -eq '.md' }) {
        $content = Get-Content -LiteralPath $file.FullName -Raw
        $updated = $content

        foreach ($mapping in $mappings) {
            $updated = $updated.Replace($mapping.Old, $mapping.New)
        }

        if ($updated -ne $content) {
            Set-Content -LiteralPath $file.FullName -Value $updated -Encoding utf8
        }
    }
}

Bind-PromptAgents -RepoRoot $targetRoot -Prefix $AgentPrefix
Rebind-AgentPrefix -RepoRoot $targetRoot -Prefix $AgentPrefix

Write-Host 'Private Project Copilot Kit installation finished.'