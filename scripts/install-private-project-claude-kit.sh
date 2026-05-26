#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-private-project-claude-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>]" >&2
    exit 1
fi

target_root="$1"
shift
force="false"
agent_prefix=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --force)
            force="true"
            ;;
        --agent-prefix)
            if [[ $# -lt 2 ]]; then
                echo "Missing value for --agent-prefix" >&2
                exit 1
            fi
            agent_prefix="$2"
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac

    shift
done

script_dir="$(cd "$(dirname "$0")" && pwd)"
template_root="$(cd "$script_dir/../templates/private-project-claude-kit" && pwd)"

mkdir -p "$target_root"
target_root="$(cd "$target_root" && pwd)"

copy_dir() {
    local source_rel="$1"
    local destination_rel="$2"
    local source_path="$template_root/$source_rel"
    local destination_path="$target_root/$destination_rel"

    mkdir -p "$destination_path"

    while IFS= read -r -d '' entry; do
        local relative_path="${entry#$source_path/}"
        local target_path="$destination_path/$relative_path"

        if [[ -d "$entry" ]]; then
            mkdir -p "$target_path"
            continue
        fi

        mkdir -p "$(dirname "$target_path")"

        if [[ -e "$target_path" && "$force" != "true" ]]; then
            echo "Skipping existing file: $target_path"
            continue
        fi

        cp "$entry" "$target_path"
        echo "Installed: $target_path"
    done < <(find "$source_path" -mindepth 1 -print0)
}

copy_file() {
    local source_rel="$1"
    local destination_rel="$2"
    local source_path="$template_root/$source_rel"
    local destination_path="$target_root/$destination_rel"

    mkdir -p "$(dirname "$destination_path")"

    if [[ -e "$destination_path" && "$force" != "true" ]]; then
        echo "Skipping existing file: $destination_path"
        return 0
    fi

    cp "$source_path" "$destination_path"
    echo "Installed: $destination_path"
}

copy_file "CLAUDE.md" "CLAUDE.md"
copy_dir ".claude" ".claude"
copy_dir "docs" "docs"

rebind_agent_prefix() {
    local repo_root="$1"
    local prefix="$2"

    if [[ -z "$prefix" ]]; then
        return 0
    fi

    local old_agents=(
        "private-project-coordinator"
        "private-project-implementer"
        "private-project-reviewer"
    )
    local new_agents=(
        "$prefix-coordinator"
        "$prefix-implementer"
        "$prefix-reviewer"
    )

    local agents_dir="$repo_root/.claude/agents"

    for index in "${!old_agents[@]}"; do
        local old_name="${old_agents[$index]}"
        local new_name="${new_agents[$index]}"
        local old_path="$agents_dir/$old_name.md"
        local new_path="$agents_dir/$new_name.md"

        if [[ -f "$old_path" ]]; then
            mv "$old_path" "$new_path"
            echo "Renamed agent: $old_path -> $new_path"
        fi

        while IFS= read -r -d '' file; do
            sed -i.bak "s/$old_name/$new_name/g" "$file"
            rm -f "$file.bak"
        done < <(find "$repo_root" \( -path "$repo_root/.claude/*" -o -path "$repo_root/docs/*" -o -name "CLAUDE.md" \) -type f -print0)
    done
}

rebind_agent_prefix "$target_root" "$agent_prefix"

echo "Private Project Claude Kit installation finished."