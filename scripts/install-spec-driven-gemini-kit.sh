#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-spec-driven-gemini-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>] [--language <pt-br|en>]" >&2
    exit 1
fi

target_root="$1"
shift
force="false"
agent_prefix=""
language="pt-br"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --force) force="true" ;;
        --agent-prefix)
            [[ $# -ge 2 ]] || { echo "Missing value for --agent-prefix" >&2; exit 1; }
            agent_prefix="$2"
            shift
            ;;
        --language)
            [[ $# -ge 2 ]] || { echo "Missing value for --language" >&2; exit 1; }
            language="$2"
            shift
            ;;
        *) echo "Unknown argument: $1" >&2; exit 1 ;;
    esac
    shift
done

if [[ "$language" != "pt-br" && "$language" != "en" ]]; then
    echo "Invalid language: $language. Use pt-br or en." >&2
    exit 1
fi
if [[ -n "$agent_prefix" && ! "$agent_prefix" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "Invalid agent prefix. Use letters, numbers, dots, underscores, or hyphens." >&2
    exit 1
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
language_root="$(cd "$script_dir/../$language" && pwd)"
template_root="$(cd "$language_root/templates/spec-driven-project-gemini-kit" && pwd)"
boilerplate_root="$(cd "$language_root/sdd-boilerplate/sdd" && pwd)"
mkdir -p "$target_root"
target_root="$(cd "$target_root" && pwd)"
installed_files=()

copy_gemini_file() {
    local source_path="$1"
    local destination_path="$2"
    mkdir -p "$(dirname "$destination_path")"
    if [[ -e "$destination_path" && "$force" != "true" ]]; then
        echo "Skipping existing file: $destination_path"
        return 0
    fi
    cp "$source_path" "$destination_path"
    installed_files+=("$destination_path")
    echo "Installed: $destination_path"
}

copy_gemini_tree() {
    local source_root="$1"
    local destination_root="$2"
    mkdir -p "$destination_root"
    while IFS= read -r -d '' entry; do
        local relative_path="${entry#$source_root/}"
        local target_path="$destination_root/$relative_path"
        if [[ -d "$entry" ]]; then
            mkdir -p "$target_path"
        else
            copy_gemini_file "$entry" "$target_path"
        fi
    done < <(find "$source_root" -mindepth 1 -print0)
}

install_sdd_boilerplate() {
    local target_sdd="$target_root/sdd"
    if [[ -d "$target_sdd" ]]; then
        echo "Preserving existing SDD directory: $target_sdd"
        return 0
    fi
    copy_gemini_tree "$boilerplate_root" "$target_sdd"
}

install_engineering_memories() {
    local target_sdd="$target_root/sdd"
    [[ -d "$target_sdd" ]] || return 0
    for memory_file in "$boilerplate_root"/MEMORIA-ENGENHARIA-*.md "$boilerplate_root"/ENGINEERING-MEMORY-*.md; do
        [[ -f "$memory_file" ]] || continue
        local target_path="$target_sdd/$(basename "$memory_file")"
        if [[ -e "$target_path" ]]; then
            echo "Preserving existing memory file: $target_path"
        else
            copy_gemini_file "$memory_file" "$target_path"
        fi
    done
}

install_sdd_archive_governance() {
    local target_sdd="$target_root/sdd"
    [[ -d "$target_sdd" ]] || return 0
    for section in decisions human-requests implementation validation; do
        local source_readme="$boilerplate_root/$section/archive/README.md"
        local target_readme="$target_sdd/$section/archive/README.md"
        if [[ -f "$source_readme" && ! -e "$target_readme" ]]; then
            copy_gemini_file "$source_readme" "$target_readme"
        fi
    done
}

install_sdd_backlog_governance() {
    local target_sdd="$target_root/sdd"
    [[ -d "$target_sdd" ]] || return 0
    for relative_path in README.md BACKLOG-INDEX.md archive/README.md; do
        local source_path="$boilerplate_root/backlog/$relative_path"
        local target_path="$target_sdd/backlog/$relative_path"
        if [[ -f "$source_path" && ! -e "$target_path" ]]; then
            copy_gemini_file "$source_path" "$target_path"
        fi
    done
}

set_agent_identity() {
    local agent_name="sdd-executor"
    [[ -z "$agent_prefix" ]] || agent_name="$agent_prefix-sdd-executor"
    for file in "${installed_files[@]}"; do
        sed -i.bak "s/{{AGENT_NAME}}/$agent_name/g" "$file"
        rm -f "$file.bak"
    done
}

for filename in GEMINI.md .geminiignore .aiexclude; do
    copy_gemini_file "$template_root/$filename" "$target_root/$filename"
done
copy_gemini_tree "$template_root/.gemini" "$target_root/.gemini"
install_sdd_boilerplate
install_engineering_memories
install_sdd_archive_governance
install_sdd_backlog_governance
set_agent_identity

echo "Spec-Driven Gemini Kit installation finished."
