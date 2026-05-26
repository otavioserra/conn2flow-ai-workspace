param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateRoot = (Resolve-Path (Join-Path $scriptDir '..\templates\spec-driven-project-copilot-kit')).Path

if (-not (Test-Path $TargetRepoPath)) {
    New-Item -ItemType Directory -Path $TargetRepoPath -Force | Out-Null
}

$targetRoot = (Resolve-Path $TargetRepoPath).Path

$copyItems = @(
    @{ Source = '.github'; Destination = '.github' },
    @{ Source = 'sdd\scripts\hooks'; Destination = 'sdd\scripts\hooks' }
)

$promptAgentBindings = @{
    '.github\prompts\start-sdd-slice.prompt.md' = 'sdd-coordinator'
    '.github\prompts\continue-sdd-batch.prompt.md' = 'sdd-coordinator'
    '.github\prompts\raise-spec-change.prompt.md' = 'sdd-coordinator'
    '.github\prompts\review-current-batch.prompt.md' = 'sdd-reviewer'
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

foreach ($item in $copyItems) {
    $sourcePath = Join-Path $templateRoot $item.Source
    $destinationPath = Join-Path $targetRoot $item.Destination

    Copy-MergedTree -SourceRoot $sourcePath -DestinationRoot $destinationPath -Overwrite ([bool]$Force)
}

$humanRequestsDir = Join-Path $targetRoot 'sdd\human-requests'
$humanRequestsReadme = Join-Path $humanRequestsDir 'README.md'
$humanRequestsContent = @'
# Human Requests

This folder stores human-authored intake files for the SDD workflow.

Rules:

- This folder is not the normative source of truth.
- Approved requirement changes must move to `sdd/change-requests/` before updating numbered sdd.
- Implementation-only feedback must move to `sdd/reviews/`, `sdd/implementation/`, `sdd/validation/` or `sdd/decisions/`.
- When a workflow receives only the folder path, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
'@

if (-not (Test-Path $humanRequestsDir)) {
    New-Item -ItemType Directory -Path $humanRequestsDir -Force | Out-Null
}

if ($Force -or -not (Test-Path $humanRequestsReadme)) {
    Set-Content -LiteralPath $humanRequestsReadme -Value $humanRequestsContent -NoNewline -Encoding utf8
    Write-Host "Installed: $humanRequestsReadme"
}

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