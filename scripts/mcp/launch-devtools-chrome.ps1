<#
.SYNOPSIS
    Starts an isolated Chrome instance for local Chrome DevTools MCP inspection.
.DESCRIPTION
    Uses only %TEMP%\conn2flow-chrome-sandbox and loopback CDP on port 9222.
    Never imports the user's Chrome profile. Refuses occupied ports or profiles.
    Returns the process ID and CDP endpoint after checking /json/version.
    Connect MCP with --browser-url=http://127.0.0.1:9222; the canonical MCP
    configuration otherwise launches its own separate browser on demand.
.EXAMPLE
    .\scripts\mcp\launch-devtools-chrome.ps1 -Headless
.EXAMPLE
    .\scripts\mcp\launch-devtools-chrome.ps1 -Visible
.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/mcp/launch-devtools-chrome.ps1 -Headless
#>
[CmdletBinding(DefaultParameterSetName = 'Headless')]
param(
    [Parameter(ParameterSetName = 'Headless')]
    [switch]$Headless,
    [Parameter(Mandatory = $true, ParameterSetName = 'Visible')]
    [switch]$Visible,
    [string]$ChromePath,
    [ValidateRange(1, 65535)]
    [int]$Port = 9222,
    [ValidateRange(1, 60)]
    [int]$TimeoutSeconds = 15
)

$ErrorActionPreference = 'Stop'
$sandboxPath = [IO.Path]::GetFullPath((Join-Path ([IO.Path]::GetTempPath()) 'conn2flow-chrome-sandbox'))
if (Test-Path -LiteralPath $sandboxPath) {
    $profileItem = Get-Item -LiteralPath $sandboxPath -Force
    if (-not $profileItem.PSIsContainer -or ($profileItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Sandbox must be a real directory, not a file or junction: $sandboxPath"
    }
}

# A listener or another Chrome using this profile must not be reused implicitly.
$listeners = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
if ($listeners.Count -gt 0) {
    throw "CDP port $Port is occupied. Stop only the owning sandbox instance or select -Port."
}
$profileProcesses = @(Get-CimInstance Win32_Process -Filter "Name = 'chrome.exe'" | Where-Object {
    $_.CommandLine -and $_.CommandLine.IndexOf($sandboxPath, [StringComparison]::OrdinalIgnoreCase) -ge 0
})
if ($profileProcesses.Count -gt 0) {
    throw "Sandbox profile is already in use. Inspect its owning PID before closing it: $sandboxPath"
}

if (-not $ChromePath) {
    $candidates = @(
        (Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),
        (Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')
    )
    $ChromePath = $candidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
}
if (-not $ChromePath -or -not (Test-Path -LiteralPath $ChromePath -PathType Leaf)) {
    throw 'Google Chrome was not found. Supply -ChromePath with the installed chrome.exe path.'
}
$ChromePath = (Resolve-Path -LiteralPath $ChromePath).Path
if ([IO.Path]::GetFileName($ChromePath) -ne 'chrome.exe') {
    throw '-ChromePath must point to chrome.exe.'
}
New-Item -ItemType Directory -Path $sandboxPath -Force | Out-Null
$chromeArguments = @(
    "--remote-debugging-port=$Port",
    '--remote-debugging-address=127.0.0.1',
    ('--user-data-dir="{0}"' -f $sandboxPath),
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-extensions',
    '--window-size=1280,900'
)
if (-not $Visible) { $chromeArguments += '--headless=new' }
$chromeArguments += 'about:blank'
$launchOptions = @{
    FilePath = $ChromePath
    ArgumentList = $chromeArguments
    PassThru = $true
    WindowStyle = 'Hidden'
}
if ($Visible) { $launchOptions.WindowStyle = 'Normal' }
$chromeProcess = Start-Process @launchOptions
$endpoint = "http://127.0.0.1:$Port"
$deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
try {
    do {
        $chromeProcess.Refresh()
        if ($chromeProcess.HasExited) { throw 'The sandbox Chrome process exited before CDP became ready.' }
        try {
            $version = Invoke-RestMethod -Uri "$endpoint/json/version" -TimeoutSec 1
        } catch {
            $version = $null
        }
        if ($version -and $version.webSocketDebuggerUrl) {
            return [pscustomobject]@{
                ProcessId = $chromeProcess.Id
                ProfilePath = $sandboxPath
                Headless = -not [bool]$Visible
                BrowserUrl = $endpoint
                WebSocketDebuggerUrl = $version.webSocketDebuggerUrl
                Browser = $version.Browser
            }
        }
        Start-Sleep -Milliseconds 200
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Chrome did not expose CDP within $TimeoutSeconds seconds."
} catch {
    # Only stop the process created by this invocation, never all chrome.exe instances.
    $chromeProcess.Refresh()
    if (-not $chromeProcess.HasExited) { Stop-Process -Id $chromeProcess.Id -ErrorAction SilentlyContinue }
    throw
}
