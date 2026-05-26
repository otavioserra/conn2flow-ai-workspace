#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-spec-driven-claude-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>] [--language <pt-br|en>]" >&2
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
template_root="$(cd "$language_root/templates/spec-driven-project-claude-kit" && pwd)"
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
copy_merged_tree "$template_root/.claude" "$target_root/.claude"

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

rebind_agent_prefix() {
    local repo_root="$1"
    local prefix="$2"

    if [[ -z "$prefix" ]]; then
        return 0
    fi

    local old_agents=(
        "sdd-coordinator"
        "sdd-implementer"
        "sdd-reviewer"
    )
    local new_agents=(
        "$prefix-sdd-coordinator"
        "$prefix-sdd-implementer"
        "$prefix-sdd-reviewer"
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
    done

    local claude_path="$repo_root/CLAUDE.md"
    if [[ -f "$claude_path" ]]; then
        for index in "${!old_agents[@]}"; do
            sed -i.bak "s/${old_agents[$index]}/${new_agents[$index]}/g" "$claude_path"
            rm -f "$claude_path.bak"
        done
    fi

    if [[ -d "$repo_root/.claude" ]]; then
        while IFS= read -r -d '' file; do
            for index in "${!old_agents[@]}"; do
                sed -i.bak "s/${old_agents[$index]}/${new_agents[$index]}/g" "$file"
                rm -f "$file.bak"
            done
        done < <(find "$repo_root/.claude" -type f -print0)
    fi
}

install_sdd_boilerplate "$boilerplate_root" "$target_root"
rebind_agent_prefix "$target_root" "$agent_prefix"

echo "Spec-Driven Claude Kit installation finished."