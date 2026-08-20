#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: sync-back-template.sh <target-repo-path> [--language <pt-br|en>] [--kit <kit-name>] [--agent-prefix <prefix>]" >&2
    exit 1
fi

target_root="$1"
shift

language="pt-br"
kit_name=""
agent_prefix=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --language)
            if [[ $# -lt 2 ]]; then
                echo "Missing value for --language" >&2
                exit 1
            fi
            language="$2"
            shift
            ;;
        --kit)
            if [[ $# -lt 2 ]]; then
                echo "Missing value for --kit" >&2
                exit 1
            fi
            kit_name="$2"
            shift
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

case "$language" in
    pt-br|en)
        ;;
    *)
        echo "Invalid language: $language. Use pt-br or en." >&2
        exit 1
        ;;
esac

case "$kit_name" in
    ""|private-project-claude-kit|private-project-copilot-kit|spec-driven-project-claude-kit|spec-driven-project-copilot-kit)
        ;;
    *)
        echo "Invalid kit name: $kit_name" >&2
        exit 1
        ;;
esac

if [[ ! -e "$target_root" ]]; then
    echo "Target repo path does not exist: $target_root" >&2
    exit 1
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
workspace_root="$(cd "$script_dir/.." && pwd)"
language_root="$(cd "$workspace_root/templates/$language" && pwd)"
target_root="$(cd "$target_root" && pwd)"

is_text_file() {
    case "$1" in
        *.md|*.json|*.ps1|*.sh)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

detect_kits() {
    local repo_root="$1"
    local detected=()

    [[ -f "$repo_root/.claude/skills/private-project-context/SKILL.md" ]] && detected+=("private-project-claude-kit")
    [[ -f "$repo_root/.github/skills/private-project-context/SKILL.md" ]] && detected+=("private-project-copilot-kit")
    [[ -f "$repo_root/.claude/skills/sdd-workflow/SKILL.md" ]] && detected+=("spec-driven-project-claude-kit")
    [[ -f "$repo_root/.github/skills/sdd-workflow/SKILL.md" ]] && detected+=("spec-driven-project-copilot-kit")

    printf '%s\n' "${detected[@]}"
}

resolve_kit() {
    if [[ -n "$kit_name" ]]; then
        printf '%s\n' "$kit_name"
        return 0
    fi

    mapfile -t detected_kits < <(detect_kits "$target_root")
    if [[ ${#detected_kits[@]} -eq 0 ]]; then
        echo "Could not detect a supported kit in the target repo. Use --kit explicitly." >&2
        exit 1
    fi

    if [[ ${#detected_kits[@]} -gt 1 ]]; then
        echo "Multiple supported kits were detected in the target repo (${detected_kits[*]}). Use --kit explicitly." >&2
        exit 1
    fi

    printf '%s\n' "${detected_kits[0]}"
}

get_agent_metadata() {
    case "$1" in
        private-project-claude-kit)
            printf '%s|%s|%s|%s|%s|%s\n' '.claude/agents' '.md' 'private-project-coordinator' 'private-project-implementer' 'private-project-reviewer' '-coordinator|-implementer|-reviewer'
            ;;
        private-project-copilot-kit)
            printf '%s|%s|%s|%s|%s|%s\n' '.github/agents' '.agent.md' 'private-project-coordinator' 'private-project-implementer' 'private-project-reviewer' '-coordinator|-implementer|-reviewer'
            ;;
        spec-driven-project-claude-kit)
            printf '%s|%s|%s|%s|%s|%s\n' '.claude/agents' '.md' 'sdd-coordinator' 'sdd-implementer' 'sdd-reviewer' '-sdd-coordinator|-sdd-implementer|-sdd-reviewer'
            ;;
        spec-driven-project-copilot-kit)
            printf '%s|%s|%s|%s|%s|%s\n' '.github/agents' '.agent.md' 'sdd-coordinator' 'sdd-implementer' 'sdd-reviewer' '-sdd-coordinator|-sdd-implementer|-sdd-reviewer'
            ;;
        *)
            printf '\n'
            ;;
    esac
}

resolve_agent_prefix() {
    local resolved_kit="$1"
    local explicit_prefix="$2"

    if [[ -n "$explicit_prefix" ]]; then
        printf '%s\n' "$explicit_prefix"
        return 0
    fi

    local metadata
    metadata="$(get_agent_metadata "$resolved_kit")"
    if [[ -z "$metadata" ]]; then
        printf '\n'
        return 0
    fi

    local agents_dir extension base_coordinator base_implementer base_reviewer suffix_blob
    IFS='|' read -r agents_dir extension base_coordinator base_implementer base_reviewer suffix_blob <<< "$metadata"
    local coordinator_suffix implementer_suffix reviewer_suffix
    IFS='|' read -r coordinator_suffix implementer_suffix reviewer_suffix <<< "$suffix_blob"

    agents_dir="$target_root/$agents_dir"
    if [[ ! -d "$agents_dir" ]]; then
        printf '\n'
        return 0
    fi

    if [[ -f "$agents_dir/$base_coordinator$extension" && -f "$agents_dir/$base_implementer$extension" && -f "$agents_dir/$base_reviewer$extension" ]]; then
        printf '\n'
        return 0
    fi

    local candidates=()
    while IFS= read -r -d '' entry; do
        local file_name
        file_name="$(basename "$entry")"
        [[ "$file_name" == *"$extension" ]] || continue

        local bare_name="${file_name%$extension}"
        [[ "$bare_name" == *"$coordinator_suffix" ]] || continue

        local candidate_prefix="${bare_name%$coordinator_suffix}"
        [[ -n "$candidate_prefix" ]] || continue

        if [[ -f "$agents_dir/$candidate_prefix$implementer_suffix$extension" && -f "$agents_dir/$candidate_prefix$reviewer_suffix$extension" ]]; then
            candidates+=("$candidate_prefix")
        fi
    done < <(find "$agents_dir" -maxdepth 1 -type f -print0)

    if [[ ${#candidates[@]} -eq 0 ]]; then
        printf '\n'
        return 0
    fi

    mapfile -t candidates < <(printf '%s\n' "${candidates[@]}" | sort -u)
    if [[ ${#candidates[@]} -gt 1 ]]; then
        echo "Could not infer a single agent prefix for $resolved_kit. Use --agent-prefix explicitly." >&2
        exit 1
    fi

    printf '%s\n' "${candidates[0]}"
}

declare -a mapping_old=()
declare -a mapping_new=()

build_agent_mappings() {
    local resolved_kit="$1"
    local detected_prefix="$2"

    mapping_old=()
    mapping_new=()

    [[ -n "$detected_prefix" ]] || return 0

    case "$resolved_kit" in
        private-project-claude-kit|private-project-copilot-kit)
            mapping_old+=("$detected_prefix-coordinator" "$detected_prefix-implementer" "$detected_prefix-reviewer")
            mapping_new+=("private-project-coordinator" "private-project-implementer" "private-project-reviewer")
            ;;
        spec-driven-project-claude-kit|spec-driven-project-copilot-kit)
            mapping_old+=("$detected_prefix-sdd-coordinator" "$detected_prefix-sdd-implementer" "$detected_prefix-sdd-reviewer")
            mapping_new+=("sdd-coordinator" "sdd-implementer" "sdd-reviewer")
            ;;
    esac
}

normalize_value() {
    local value="$1"
    local index
    for index in "${!mapping_old[@]}"; do
        value="${value//${mapping_old[$index]}/${mapping_new[$index]}}"
    done
    printf '%s' "$value"
}

replace_file_content() {
    local source_path="$1"
    local target_path="$2"

    cp "$source_path" "$target_path"

    local index
    for index in "${!mapping_old[@]}"; do
        local old_escaped new_escaped
        old_escaped="$(printf '%s' "${mapping_old[$index]}" | sed 's/[\/&]/\\&/g')"
        new_escaped="$(printf '%s' "${mapping_new[$index]}" | sed 's/[\/&]/\\&/g')"
        sed -i.bak "s/$old_escaped/$new_escaped/g" "$target_path"
        rm -f "$target_path.bak"
    done
}

sync_item() {
    local source_rel="$1"
    local destination_rel="$2"
    local source_path="$target_root/$source_rel"
    local destination_path="$template_root/$destination_rel"

    if [[ ! -e "$source_path" ]]; then
        echo "Skipping missing source path: $source_path" >&2
        return 0
    fi

    if [[ -f "$source_path" ]]; then
        mkdir -p "$(dirname "$destination_path")"
        if is_text_file "$source_path"; then
            replace_file_content "$source_path" "$destination_path"
        else
            cp "$source_path" "$destination_path"
        fi
        echo "Synced: $source_path -> $destination_path"
        return 0
    fi

    mkdir -p "$destination_path"

    while IFS= read -r -d '' entry; do
        local relative_path="${entry#$source_path/}"
        local normalized_relative_path
        normalized_relative_path="$(normalize_value "$relative_path")"
        local target_path="$destination_path/$normalized_relative_path"

        if [[ -d "$entry" ]]; then
            mkdir -p "$target_path"
            continue
        fi

        mkdir -p "$(dirname "$target_path")"
        if is_text_file "$entry"; then
            replace_file_content "$entry" "$target_path"
        else
            cp "$entry" "$target_path"
        fi
        echo "Synced: $entry -> $target_path"
    done < <(find "$source_path" -mindepth 1 -print0)
}

resolved_kit="$(resolve_kit)"
template_root="$(cd "$language_root/templates/$resolved_kit" && pwd)"
detected_prefix="$(resolve_agent_prefix "$resolved_kit" "$agent_prefix")"
build_agent_mappings "$resolved_kit" "$detected_prefix"

echo "Detected kit: $resolved_kit"
if [[ -n "$detected_prefix" ]]; then
    echo "Detected agent prefix: $detected_prefix"
else
    echo "Detected agent prefix: <none>"
fi

case "$resolved_kit" in
    private-project-claude-kit)
        plan_items=(
            "CLAUDE.md|CLAUDE.md"
            ".claude/settings.json|.claude/settings.json"
            ".claude/rules|.claude/rules"
            ".claude/agents|.claude/agents"
            ".claude/skills|.claude/skills"
            "docs|docs"
        )
        ;;
    private-project-copilot-kit)
        plan_items=(
            ".github/copilot-instructions.md|.github/copilot-instructions.md"
            ".github/instructions|.github/instructions"
            ".github/agents|.github/agents"
            ".github/prompts|.github/prompts"
            ".github/skills|.github/skills"
            ".github/hooks|.github/hooks"
            "docs|docs"
            "scripts/hooks|scripts/hooks"
        )
        ;;
    spec-driven-project-claude-kit)
        plan_items=(
            "CLAUDE.md|CLAUDE.md"
            ".claude/settings.json|.claude/settings.json"
            ".claude/rules|.claude/rules"
            ".claude/agents|.claude/agents"
            ".claude/skills|.claude/skills"
        )
        ;;
    spec-driven-project-copilot-kit)
        plan_items=(
            ".github/copilot-instructions.md|.github/copilot-instructions.md"
            ".github/instructions|.github/instructions"
            ".github/agents|.github/agents"
            ".github/prompts|.github/prompts"
            ".github/skills|.github/skills"
            ".github/hooks|.github/hooks"
            "sdd/scripts/hooks|sdd/scripts/hooks"
        )
        ;;
esac

for item in "${plan_items[@]}"; do
    IFS='|' read -r source_rel destination_rel <<< "$item"
    sync_item "$source_rel" "$destination_rel"
done

echo "Template sync-back finished."