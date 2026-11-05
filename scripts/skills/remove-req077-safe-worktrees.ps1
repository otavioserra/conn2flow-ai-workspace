$ErrorActionPreference = 'Stop'
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$gitRoot = [IO.Directory]::GetParent($workspaceRoot).FullName
$coreRoot = Join-Path $gitRoot 'conn2flow'
$siteRoot = Join-Path $gitRoot 'conn2flow-site'
$backups = Get-Content -Raw -Encoding UTF8 (Join-Path $workspaceRoot 'completions/BATCH-079-preserved-ignored.json') | ConvertFrom-Json

function Get-ReparseNodes([string] $root) {
    $pending = [Collections.Generic.Stack[string]]::new()
    $pending.Push($root)
    while ($pending.Count -gt 0) {
        foreach ($entry in Get-ChildItem -LiteralPath $pending.Pop() -Force) {
            if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) { $entry }
            elseif ($entry.PSIsContainer -and $entry.Name -ne '.git') { $pending.Push($entry.FullName) }
        }
    }
}

$dependencies = @((Join-Path $coreRoot 'vendor/autoload.php'), (Join-Path $coreRoot 'node_modules/.package-lock.json'))
$before = @{}
foreach ($file in $dependencies) { $before[$file] = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash }
$registered = @()
foreach ($repository in @($coreRoot, $siteRoot)) {
    $listing = git -C $repository worktree list --porcelain
    if ($LASTEXITCODE -ne 0) { throw 'Cannot list worktrees' }
    $registered += @($listing | Where-Object { $_.StartsWith('worktree ') } | ForEach-Object { $_.Substring(9) })
}
$allLinks = @()
foreach ($root in $registered) { if (Test-Path -LiteralPath $root) { $allLinks += @(Get-ReparseNodes $root) } }
$results = @()
foreach ($name in @('conn2flow-req277', 'conn2flow-req284')) {
    $target = [IO.Path]::GetFullPath((Join-Path $gitRoot $name))
    if ([IO.Directory]::GetParent($target).FullName -ne $gitRoot -or $target -eq $coreRoot) { throw 'Unsafe target' }
    $backup = @($backups | Where-Object worktree -eq $name)
    if ($backup.Count -ne 1 -or -not $backup[0].verified) { throw 'Verified backup missing' }
    if ((Get-FileHash -LiteralPath $backup[0].archive -Algorithm SHA256).Hash -ne $backup[0].archive_sha256) { throw 'Backup changed' }
    $status = git -C $target status --porcelain=v1 --untracked-files=all
    if ($LASTEXITCODE -ne 0 -or $status) { throw "Worktree changed: $name" }
    $headSha = git -C $target rev-parse HEAD
    if ($LASTEXITCODE -ne 0 -or $headSha -ne $backup[0].head) { throw 'HEAD changed since backup' }
    git -C $coreRoot merge-base --is-ancestor $headSha main
    if ($LASTEXITCODE -ne 0) { throw 'Worktree has unique commits' }
    foreach ($link in $allLinks) {
        foreach ($destination in $link.Target) {
            $normalized = $destination.Replace('\\?\', '').Replace('/', '\')
            if ($normalized -eq $target -or $normalized.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase)) { throw "Incoming junction targets $name" }
        }
    }
    $links = @(Get-ReparseNodes $target)
    foreach ($link in $links) {
        if ($link.Parent.FullName -ne $target -or $link.Name -notin @('node_modules', 'vendor')) { throw 'Unexpected reparse node' }
        # Delete the junction itself, without recursive enumeration or another shell.
        [IO.Directory]::Delete($link.FullName, $false)
    }
    if (@(Get-ReparseNodes $target).Count) { throw 'Reparse points remain' }
    git -C $coreRoot worktree remove -- $target
    if ($LASTEXITCODE -ne 0) { throw "Git refused safe removal of $name; no force attempted" }
    $results += @{ path = $target; head = $headSha; removed = -not (Test-Path -LiteralPath $target); backup_verified = $true; detached_junctions = $links.Count }
    Write-Output "$name removed safely"
}
git -C $coreRoot worktree prune
if ($LASTEXITCODE -ne 0) { throw 'Core prune failed' }
foreach ($file in $dependencies) {
    if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $before[$file]) { throw 'Main dependency changed' }
}
@{ removed = $results; dependency_hashes_unchanged = $true; preserved_worktrees = 15; user_direction = 'Preservar trabalho unico; remover somente comprovadamente seguras' } | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $workspaceRoot 'completions/BATCH-079-cleanup-result.json')
