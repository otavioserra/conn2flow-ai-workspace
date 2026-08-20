#!/usr/bin/env bash
# ==============================================================================
# 1-Click Automated Setup for Conn2Flow MCP Hub Connectors (Bash)
# ==============================================================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSPACE_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MCP_ENTRY="$WORKSPACE_ROOT/mcp-hub/dist/index.js"
INJECTOR="$SCRIPT_DIR/inject-mcp-connector.cjs"

if [[ ! -f "$MCP_ENTRY" ]]; then
  echo "Building MCP Hub binaries first..."
  (cd "$WORKSPACE_ROOT/mcp-hub" && npm run build)
fi

echo ""
echo "=================================================================="
echo "     Conn2Flow MCP Hub - 1-Click Automated Connector Setup        "
echo "=================================================================="
echo ""
echo "MCP Hub Entry Point: $MCP_ENTRY"
echo ""

# 1. Claude Desktop (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
  CLAUDE_CONFIG="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
else
  CLAUDE_CONFIG="${XDG_CONFIG_HOME:-$HOME/.config}/Claude/claude_desktop_config.json"
fi
node "$INJECTOR" "Claude Desktop" "$CLAUDE_CONFIG" "$MCP_ENTRY"

# 2. Cursor (Workspace level)
node "$INJECTOR" "Cursor (Workspace)" "$WORKSPACE_ROOT/.cursor/mcp.json" "$MCP_ENTRY"

# 3. VS Code / Antigravity (Workspace level)
node "$INJECTOR" "VS Code / Antigravity" "$WORKSPACE_ROOT/.vscode/mcp.json" "$MCP_ENTRY"

echo ""
echo "[MCP Setup Complete] Conn2Flow Hub connectors registered successfully!"
echo "Restart Claude Desktop or reload IDE window to activate."
echo ""
