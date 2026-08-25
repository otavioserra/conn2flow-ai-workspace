#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

TARGET_REPO=""
FORCE=false
AGENT_PREFIX=""
LANGUAGE="pt-br"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --force) FORCE=true; shift ;;
        --agent-prefix) AGENT_PREFIX="$2"; shift 2 ;;
        --language) LANGUAGE="$2"; shift 2 ;;
        *) TARGET_REPO="$1"; shift ;;
    esac
done

if [[ -z "$TARGET_REPO" ]]; then
    echo "Usage: $0 <target-repo-path> [--force] [--agent-prefix <prefix>] [--language pt-br|en]"
    exit 1
fi

TEMPLATE_ROOT="$WORKSPACE_ROOT/templates/$LANGUAGE/templates/spec-driven-project-codex-kit"
BOILERPLATE_ROOT="$WORKSPACE_ROOT/templates/$LANGUAGE/sdd-boilerplate/sdd"

mkdir -p "$TARGET_REPO"
TARGET_ROOT="$(cd "$TARGET_REPO" && pwd)"

copy_file() {
    local src="$1" dst="$2"
    mkdir -p "$(dirname "$dst")"
    if [[ -f "$dst" ]] && [[ "$FORCE" != "true" ]]; then
        echo "Skipping existing file: $dst"
        return
    fi
    cp -f "$src" "$dst"
    echo "Installed: $dst"
}

copy_tree() {
    local src="$1" dst="$2"
    mkdir -p "$dst"
    find "$src" -type f | while read -r file; do
        local rel="${file#$src/}"
        copy_file "$file" "$dst/$rel"
    done
}

# Install CODEX.md and AGENTS.md
for filename in CODEX.md AGENTS.md; do
    copy_file "$TEMPLATE_ROOT/$filename" "$TARGET_ROOT/$filename"
done

# Install .codex/ directory (settings + skills)
copy_tree "$TEMPLATE_ROOT/.codex" "$TARGET_ROOT/.codex"

# Install SDD boilerplate if not present
if [[ ! -d "$TARGET_ROOT/sdd" ]]; then
    copy_tree "$BOILERPLATE_ROOT" "$TARGET_ROOT/sdd"
else
    echo "Preserving existing SDD directory: $TARGET_ROOT/sdd"
fi

# Install engineering memories
if [[ -d "$TARGET_ROOT/sdd" ]]; then
    for mem in "$BOILERPLATE_ROOT"/MEMORIA-ENGENHARIA-* "$BOILERPLATE_ROOT"/ENGINEERING-MEMORY-*; do
        [[ -f "$mem" ]] || continue
        local_name="$(basename "$mem")"
        if [[ -f "$TARGET_ROOT/sdd/$local_name" ]]; then
            echo "Preserving existing memory file: $TARGET_ROOT/sdd/$local_name"
        else
            copy_file "$mem" "$TARGET_ROOT/sdd/$local_name"
        fi
    done
fi

# Install archive governance
if [[ -d "$TARGET_ROOT/sdd" ]]; then
    for section in decisions human-requests implementation validation; do
        src_readme="$BOILERPLATE_ROOT/$section/archive/README.md"
        dst_readme="$TARGET_ROOT/sdd/$section/archive/README.md"
        if [[ -f "$src_readme" ]] && [[ ! -f "$dst_readme" ]]; then
            copy_file "$src_readme" "$dst_readme"
        fi
    done
fi

# Install backlog governance
if [[ -d "$TARGET_ROOT/sdd" ]]; then
    for relpath in README.md BACKLOG-INDEX.md archive/README.md; do
        src_path="$BOILERPLATE_ROOT/backlog/$relpath"
        dst_path="$TARGET_ROOT/sdd/backlog/$relpath"
        if [[ -f "$src_path" ]] && [[ ! -f "$dst_path" ]]; then
            copy_file "$src_path" "$dst_path"
        fi
    done
fi

# Resolve {{AGENT_NAME}}
AGENT_NAME="sdd-executor"
[[ -n "$AGENT_PREFIX" ]] && AGENT_NAME="$AGENT_PREFIX-sdd-executor"
find "$TARGET_ROOT/.codex" "$TARGET_ROOT/CODEX.md" "$TARGET_ROOT/AGENTS.md" -type f 2>/dev/null | while read -r file; do
    if grep -q '{{AGENT_NAME}}' "$file" 2>/dev/null; then
        sed -i "s/{{AGENT_NAME}}/$AGENT_NAME/g" "$file"
    fi
done

echo "Spec-Driven Codex Kit installation finished."
