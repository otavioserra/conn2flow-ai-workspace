<#
.SYNOPSIS
    1-Click Automated Setup for Conn2Flow MCP Hub Connectors.
.DESCRIPTION
    Automatically detects and non-destructively injects the 'conn2flow-hub' MCP server
    configuration into Claude Desktop, Cursor, and VS Code / Agentic IDEs.
.EXAMPLE
    .\scripts\setup-mcp-connectors.ps1
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# Determine absolute path to mcp-hub entry point
$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mcpHubEntry = Join-Path $workspaceRoot 'mcp-hub\dist\index.js'
$injectorScript = Join-Path $PSScriptRoot 'inject-mcp-connector.cjs'

if (-not (Test-Path $mcpHubEntry)) {
    Write-Host "Building MCP Hub TypeScript binaries..." -ForegroundColor Cyan
    Push-Location (Join-Path $workspaceRoot 'mcp-hub')
    npm run build
    Pop-Location
}

if (-not (Test-Path $mcpHubEntry)) {
    Write-Error "MCP Hub entry point not found at: $mcpHubEntry"
    exit 1
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "     Conn2Flow MCP Hub - 1-Click Automated Connector Setup        " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "MCP Hub Entry Point: $mcpHubEntry" -ForegroundColor White
Write-Host ""

# 1. Claude Desktop (Windows)
$claudeConfig = Join-Path $env:APPDATA 'Claude\claude_desktop_config.json'
node $injectorScript "Claude Desktop" $claudeConfig $mcpHubEntry

# 2. Cursor (Workspace level)
$cursorConfig = Join-Path $workspaceRoot '.cursor\mcp.json'
node $injectorScript "Cursor (Workspace)" $cursorConfig $mcpHubEntry

# 3. VS Code Native MCP & Copilot (Workspace level)
$vscodeConfig = Join-Path $workspaceRoot '.vscode\mcp.json'
node $injectorScript "VS Code" $vscodeConfig $mcpHubEntry

# 4. Google Antigravity / Gemini (Workspace level)
$agentsConfig = Join-Path $workspaceRoot '.agents\mcp_config.json'
node $injectorScript "Google Antigravity (.agents)" $agentsConfig $mcpHubEntry

Write-Host ""
Write-Host "[MCP Setup Complete] Conn2Flow Hub connectors registered successfully!" -ForegroundColor Green
Write-Host "Restart Claude Desktop or reload Cursor / VS Code window to activate." -ForegroundColor Gray
Write-Host ""
