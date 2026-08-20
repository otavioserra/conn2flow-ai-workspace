<#
.SYNOPSIS
    Provision isolated Git Worktree for concurrent agent execution.
.DESCRIPTION
    Creates a new branch and dedicated git worktree for multi-agent parallel workflows,
    preventing file collision and working-tree contention on the main branch.
.PARAMETER RepoPath
    Path to the git repository. Defaults to current directory.
.PARAMETER BranchName
    Name of the feature/batch branch (e.g. feat-req-013, batch-016). Required.
.PARAMETER BaseBranch
    Base branch to branch off from. Defaults to 'main'.
.PARAMETER WorktreePath
    Custom path for the worktree. Defaults to '<RepoPath>\worktrees\<BranchName>'.
.EXAMPLE
    .\create-agent-worktree.ps1 -RepoPath "C:\Users\otavi\OneDrive\Documentos\GIT\conn2flow" -BranchName "feat-req-013-reporting"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$RepoPath = (Get-Location).Path,

    [Parameter(Mandatory = $true, Position = 0)]
    [string]$BranchName,

    [Parameter(Mandatory = $false)]
    [string]$BaseBranch = "main",

    [Parameter(Mandatory = $false)]
    [string]$WorktreePath
)

$ErrorActionPreference = 'Stop'

# Resolve absolute repo path
$RepoPath = (Resolve-Path $RepoPath).Path
if (-not (Test-Path (Join-Path $RepoPath ".git"))) {
    Write-Error "The specified directory is not a Git repository: $RepoPath"
    exit 1
}

# Determine worktree destination
if (-not $WorktreePath) {
    $WorktreePath = Join-Path $RepoPath "worktrees\$BranchName"
}

Write-Host "🌲 [Git Worktree Provisioner] Initializing worktree for concurrent agent execution..." -ForegroundColor Cyan
Write-Host "   Repository:  $RepoPath"
Write-Host "   Branch:      $BranchName"
Write-Host "   Base:        $BaseBranch"
Write-Host "   Destination: $WorktreePath"

# Ensure parent directory of worktree exists
$worktreeParent = Split-Path -Parent $WorktreePath
if (-not (Test-Path $worktreeParent)) {
    $null = New-Item -ItemType Directory -Path $worktreeParent -Force
}

# Check if branch already exists in repo
$branchExists = (git -C $RepoPath branch --list $BranchName).Trim()

if ($branchExists) {
    Write-Host "ℹ️  Branch '$BranchName' already exists. Attaching worktree to existing branch..." -ForegroundColor Yellow
    git -C $RepoPath worktree add $WorktreePath $BranchName
} else {
    Write-Host "🌱 Creating new branch '$BranchName' from '$BaseBranch'..." -ForegroundColor Green
    git -C $RepoPath worktree add -b $BranchName $WorktreePath $BaseBranch
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create Git worktree."
    exit 1
}

# Link or copy .env if it exists in parent
$parentEnv = Join-Path $RepoPath ".env"
$targetEnv = Join-Path $WorktreePath ".env"
if ((Test-Path $parentEnv) -and -not (Test-Path $targetEnv)) {
    Copy-Item $parentEnv $targetEnv -Force
    Write-Host "✔ Copied .env configuration to worktree." -ForegroundColor Green
}

Write-Host "`n✅ [Worktree Ready] Isolated agent environment provisioned successfully!" -ForegroundColor Green
Write-Host "   To switch agent context, navigate to:" -ForegroundColor Cyan
Write-Host "   cd $WorktreePath" -ForegroundColor White
Write-Host "`n   When task finishes, remove the worktree with:" -ForegroundColor Gray
Write-Host "   git worktree remove $WorktreePath" -ForegroundColor Gray
