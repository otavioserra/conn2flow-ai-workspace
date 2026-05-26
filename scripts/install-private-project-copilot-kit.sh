#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-private-project-copilot-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>] [--language <pt-br|en>]" >&2
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
template_root="$(cd "$language_root/templates/private-project-copilot-kit" && pwd)"
boilerplate_root="$(cd "$language_root/sdd-boilerplate/sdd" && pwd)"

mkdir -p "$target_root"
target_root="$(cd "$target_root" && pwd)"

copy_path() {
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

copy_path ".github" ".github"
copy_path "docs" "docs"
copy_path "scripts/hooks" "scripts/hooks"

copy_path_from_root() {
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

    copy_path_from_root "$source_root" "$target_sdd"
}

install_sdd_boilerplate "$boilerplate_root" "$target_root"

bind_prompt_agents() {
    local repo_root="$1"
    local prefix="$2"
    local coordinator_name="private-project-coordinator"
    local reviewer_name="private-project-reviewer"

    if [[ -n "$prefix" ]]; then
        coordinator_name="$prefix-coordinator"
        reviewer_name="$prefix-reviewer"
    fi

    local kickoff_prompt="$repo_root/.github/prompts/private-project-kickoff.prompt.md"
    local continue_prompt="$repo_root/.github/prompts/continue-private-work.prompt.md"
    local review_prompt="$repo_root/.github/prompts/review-private-work.prompt.md"

    if [[ -f "$kickoff_prompt" ]]; then
        sed -i.bak "s/^agent: agent$/agent: $coordinator_name/" "$kickoff_prompt"
        rm -f "$kickoff_prompt.bak"
    fi

    if [[ -f "$continue_prompt" ]]; then
        sed -i.bak "s/^agent: agent$/agent: $coordinator_name/" "$continue_prompt"
        rm -f "$continue_prompt.bak"
    fi

    if [[ -f "$review_prompt" ]]; then
        sed -i.bak "s/^agent: agent$/agent: $reviewer_name/" "$review_prompt"
        rm -f "$review_prompt.bak"
    fi
}

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

    local agents_dir="$repo_root/.github/agents"
    local index
    for index in "${!old_agents[@]}"; do
        local old_name="${old_agents[$index]}"
        local new_name="${new_agents[$index]}"

        if [[ -f "$agents_dir/$old_name.agent.md" ]]; then
            mv "$agents_dir/$old_name.agent.md" "$agents_dir/$new_name.agent.md"
        fi
    done

    while IFS= read -r -d '' file; do
        for index in "${!old_agents[@]}"; do
            local old_name="${old_agents[$index]}"
            local new_name="${new_agents[$index]}"
            sed -i.bak "s/$old_name/$new_name/g" "$file"
            rm -f "$file.bak"
        done
    done < <(find "$repo_root/.github" -type f -name '*.md' -print0)
}

bind_prompt_agents "$target_root" "$agent_prefix"
rebind_agent_prefix "$target_root" "$agent_prefix"

echo "Private Project Copilot Kit installation finished."