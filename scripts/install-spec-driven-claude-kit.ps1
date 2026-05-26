param(
    [Parameter(Mandatory = $true)]
    [string]$TargetRepoPath,

    [switch]$Force
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templateRoot = (Resolve-Path (Join-Path $scriptDir "..\templates\spec-driven-project-claude-kit")).Path

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

Copy-File "CLAUDE.md" "CLAUDE.md"
Copy-Dir ".claude" ".claude"

$humanRequestsDir = Join-Path $targetRoot "sdd\human-requests"
$humanRequestsReadme = Join-Path $humanRequestsDir "README.md"

$humanRequestsContent = @"
# Human Requests

This folder stores human-authored intake files for the SDD workflow.

Rules:

- This folder is not the normative source of truth.
- Approved requirement changes must move to `sdd/change-requests/` before updating numbered sdd.
- Implementation-only feedback must move to `sdd/reviews/`, `sdd/implementation/`, `sdd/validation/` or `sdd/decisions/`.
- When a workflow receives only the folder path, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
"@

New-Item -ItemType Directory -Force -Path $humanRequestsDir | Out-Null

if ((-not (Test-Path $humanRequestsReadme)) -or $Force) {
    Set-Content -Path $humanRequestsReadme -Value $humanRequestsContent
    Write-Host "Installed: $humanRequestsReadme"
}

Write-Host "Spec-Driven Claude Kit installation finished."