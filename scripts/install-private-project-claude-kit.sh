#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-private-project-claude-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>] [--language <pt-br|en>]" >&2
    exit 1
fi

target_root="$1"
shift
force="false"
agent_prefix=""
language="pt-br"

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
        --language)
            if [[ $# -lt 2 ]]; then
                echo "Missing value for --language" >&2
                exit 1
            fi
            language="$2"
            shift
            ;;
        *)
            echo "Unknown argument: $1" >&2
            exit 1
            ;;
    esac

    shift
done

if [[ "$language" != "pt-br" && "$language" != "en" ]]; then
    echo "Invalid language: $language. Use pt-br or en." >&2
    exit 1
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
language_root="$(cd "$script_dir/../$language" && pwd)"
template_root="$(cd "$language_root/templates/private-project-claude-kit" && pwd)"
boilerplate_root="$(cd "$language_root/sdd-boilerplate/sdd" && pwd)"

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

copy_merged_tree() {
    local source_root="$1"
    local destination_root="$2"

    mkdir -p "$destination_root"

    while IFS= read -r -d '' entry; do
        local relative_path="${entry#$source_root/}"
        local target_path="$destination_root/$relative_path"

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
    done < <(find "$source_root" -mindepth 1 -print0)
}

install_sdd_boilerplate() {
    local source_root="$1"
    local repo_root="$2"
    local target_sdd="$repo_root/sdd"

    if [[ -d "$target_sdd" ]]; then
        echo "Preserving existing SDD directory: $target_sdd"
        return 0
    fi

    copy_merged_tree "$source_root" "$target_sdd"
}

install_sdd_boilerplate "$boilerplate_root" "$target_root"

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