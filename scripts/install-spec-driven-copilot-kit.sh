#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-spec-driven-copilot-kit.sh <target-repo-path> [--force] [--agent-prefix <prefix>] [--language <pt-br|en>]" >&2
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
template_root="$(cd "$language_root/templates/spec-driven-project-copilot-kit" && pwd)"
boilerplate_root="$(cd "$language_root/sdd-boilerplate/sdd" && pwd)"

mkdir -p "$target_root"
target_root="$(cd "$target_root" && pwd)"

specialized_markers=(
    ".github/agents/nexus-sdd-coordinator.agent.md"
    ".github/skills/nexus-validation/SKILL.md"
    ".github/hooks/nexus-sdd-session-start.json"
)

prompt_agent_bindings=(
    ".github/prompts/start-sdd-slice.prompt.md:agent"
    ".github/prompts/continue-sdd-batch.prompt.md:agent"
    ".github/prompts/raise-spec-change.prompt.md:agent"
    ".github/prompts/review-current-batch.prompt.md:agent"
)

coordinator_agent="sdd-coordinator"
reviewer_agent="sdd-reviewer"

if [[ -n "$agent_prefix" ]]; then
    coordinator_agent="$agent_prefix-sdd-coordinator"
    reviewer_agent="$agent_prefix-sdd-reviewer"
fi

prompt_existed_file="$(mktemp)"
trap 'rm -f "$prompt_existed_file"' EXIT

for binding in "${prompt_agent_bindings[@]}"; do
    prompt_rel="${binding%%:*}"
    if [[ -e "$target_root/$prompt_rel" ]]; then
        printf '%s\n' "$prompt_rel" >> "$prompt_existed_file"
    fi
done

for marker in "${specialized_markers[@]}"; do
    if [[ -e "$target_root/$marker" ]]; then
        echo "Target repo already contains specialized Nexus SDD customizations ($marker). Do not install the generic Spec-Driven kit over it. Update the specialized files directly instead." >&2
        exit 1
    fi
done

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

    local agents_dir="$repo_root/.github/agents"

    for index in "${!old_agents[@]}"; do
        local old_name="${old_agents[$index]}"
        local new_name="${new_agents[$index]}"

        if [[ -f "$agents_dir/$old_name.agent.md" ]]; then
            mv "$agents_dir/$old_name.agent.md" "$agents_dir/$new_name.agent.md"
            echo "Renamed agent: $agents_dir/$old_name.agent.md -> $agents_dir/$new_name.agent.md"
        fi
    done

    if [[ -d "$repo_root/.github" ]]; then
        while IFS= read -r -d '' file; do
            for index in "${!old_agents[@]}"; do
                sed -i.bak "s/${old_agents[$index]}/${new_agents[$index]}/g" "$file"
                rm -f "$file.bak"
            done
        done < <(find "$repo_root/.github" -type f -print0)
    fi
}

migrate_legacy_sdd() {
    local repo_root="$1"
    local target_sdd="$repo_root/sdd"
    local project_dir="$repo_root/project"

    if [[ ! -d "$project_dir" ]]; then
        return 0
    fi
    if [[ -d "$target_sdd" ]]; then
        echo "SDD directory already exists at $target_sdd - skipping legacy migration."
        return 0
    fi

    local legacy_front=""
    local legacy_name=""
    for sub_dir in "$project_dir"/*/; do
        [[ ! -d "$sub_dir" ]] && continue
        for marker in "00-START-HERE.md" "README.md" "SPEC.md"; do
            if [[ -f "$sub_dir$marker" ]]; then
                legacy_front="$sub_dir"
                legacy_name="$(basename "$sub_dir")"
                break 2
            fi
        done
    done

    if [[ -z "$legacy_front" ]]; then
        return 0
    fi

    local legacy_relative="project/$legacy_name"
    echo "Legacy SDD structure detected: $legacy_front"
    mv "$legacy_front" "$target_sdd"
    echo "Migrated: $legacy_front -> $target_sdd"

    if [[ -z "$(ls -A "$project_dir" 2>/dev/null)" ]]; then
        rmdir "$project_dir"
        echo "Removed empty legacy directory: $project_dir"
    fi

    for config_dir in ".github" ".claude"; do
        local config_path="$repo_root/$config_dir"
        [[ ! -d "$config_path" ]] && continue
        while IFS= read -r -d '' file; do
            if grep -q "$legacy_relative" "$file" 2>/dev/null; then
                sed -i.bak "s|$legacy_relative|sdd|g" "$file"
                rm -f "$file.bak"
                echo "Updated reference in: $file"
            fi
        done < <(find "$config_path" -type f -print0)
    done

    local claude_path="$repo_root/CLAUDE.md"
    if [[ -f "$claude_path" ]] && grep -q "$legacy_relative" "$claude_path" 2>/dev/null; then
        sed -i.bak "s|$legacy_relative|sdd|g" "$claude_path"
        rm -f "$claude_path.bak"
        echo "Updated reference in: $claude_path"
    fi
}

install_engineering_memories() {
    local boilerplate_root="$1"
    local repo_root="$2"
    local target_sdd="$repo_root/sdd"

    if [[ ! -d "$target_sdd" ]]; then
        return 0
    fi

    for memory_file in "$boilerplate_root"/MEMORIA-ENGENHARIA-*.md "$boilerplate_root"/ENGINEERING-MEMORY-*.md; do
        [[ ! -f "$memory_file" ]] && continue
        local filename="$(basename "$memory_file")"
        local target_path="$target_sdd/$filename"
        if [[ -e "$target_path" ]]; then
            echo "Preserving existing memory file: $target_path"
            continue
        fi
        cp "$memory_file" "$target_path"
        echo "Installed memory: $target_path"
    done
}

copy_path ".github" ".github"
migrate_legacy_sdd "$target_root"
install_sdd_boilerplate "$boilerplate_root" "$target_root"
install_engineering_memories "$boilerplate_root" "$target_root"
copy_path "sdd/scripts/hooks" "sdd/scripts/hooks"
rebind_agent_prefix "$target_root" "$agent_prefix"

for binding in "${prompt_agent_bindings[@]}"; do
    prompt_rel="${binding%%:*}"
    agent_name="$coordinator_agent"

    if [[ "$prompt_rel" == ".github/prompts/review-current-batch.prompt.md" ]]; then
        agent_name="$reviewer_agent"
    fi

    prompt_path="$target_root/$prompt_rel"

    if [[ "$force" != "true" ]] && grep -Fxq "$prompt_rel" "$prompt_existed_file"; then
        continue
    fi

    if [[ ! -f "$prompt_path" ]]; then
        continue
    fi

    sed -i.bak "s/^agent: agent$/agent: $agent_name/" "$prompt_path"
    rm -f "$prompt_path.bak"
    echo "Bound prompt to agent: $prompt_path -> $agent_name"
done

echo "Spec-Driven Copilot Kit installation finished."