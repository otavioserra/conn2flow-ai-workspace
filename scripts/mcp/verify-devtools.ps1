# Run: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mcp/verify-devtools.ps1
# Runs only a synthetic loopback fixture and closes only the Chrome it starts.
$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$launcher = Join-Path $PSScriptRoot 'launch-devtools-chrome.ps1'
$parseErrors = $null
$parseTokens = $null
[System.Management.Automation.Language.Parser]::ParseFile($launcher, [ref]$parseTokens, [ref]$parseErrors) | Out-Null
if ($parseErrors.Count) { throw ($parseErrors | Out-String) }
$launch = & $launcher -Headless
$guards = @()
try {
    foreach ($port in @('9222', '9223')) {
        try {
            & $launcher -Headless -Port ([int]$port) | Out-Null
            throw 'Expected occupied-port/profile rejection.'
        } catch {
            $expected = if ($port -eq '9222') { 'occupied' } else { 'profile is already in use' }
            if ($_.Exception.Message -notmatch $expected) { throw }
            $guards += $expected
        }
    }
    Push-Location $workspace
    try {
        npm exec --yes --package=node@22 --package=chrome-devtools-mcp@latest -- node scripts/mcp/verify-devtools.cjs
        if ($LASTEXITCODE -ne 0) { throw "MCP integration probe failed: $LASTEXITCODE" }
    } finally { Pop-Location }
    $report = [ordered]@{
        batch = 'BATCH-065'
        status = 'PASS'
        browser = $launch.Browser
        headless = $launch.Headless
        profilePath = $launch.ProfilePath
        endpoint = $launch.BrowserUrl
        guards = $guards
        syntax = 'PASS'
    }
    Stop-Process -Id $launch.ProcessId -ErrorAction SilentlyContinue
    $deadline = [DateTime]::UtcNow.AddSeconds(5)
    do {
        $remaining = @(Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object {
            $_.CommandLine -and $_.CommandLine.Contains($launch.ProfilePath)
        })
        if (-not $remaining.Count) { break }
        Start-Sleep -Milliseconds 100
    } while ([DateTime]::UtcNow -lt $deadline)
    if ($remaining.Count) { throw 'Sandbox process did not exit during teardown.' }

    function Test-VisibleArguments {
        # Intercept process creation: exercise the visible path without opening a window.
        function Start-Process {
            param($FilePath, $ArgumentList, [switch]$PassThru, $WindowStyle)
            if ($WindowStyle -ne 'Normal' -or $ArgumentList -contains '--headless=new') {
                throw 'Visible mode must request a normal window without headless.'
            }
            throw 'visible-arguments-verified'
        }
        try {
            & $launcher -Visible | Out-Null
            throw 'Visible process interception did not run.'
        } catch {
            if ($_.Exception.Message -ne 'visible-arguments-verified') { throw }
        }
    }
    Test-VisibleArguments
    $report.visibleArguments = 'PASS (process creation intercepted)'
    $json = $report | ConvertTo-Json -Depth 5
    [IO.File]::WriteAllText((Join-Path $workspace 'completions/BATCH-065-launcher-smoke.json'), $json + "`n", [Text.UTF8Encoding]::new($false))
    Write-Output $json
} finally {
    Stop-Process -Id $launch.ProcessId -ErrorAction SilentlyContinue
}
