#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-spec-driven-copilot-kit.sh <target-repo-path> [--force]" >&2
    exit 1
fi

target_root="$1"
force="false"

if [[ ${2:-} == "--force" ]]; then
    force="true"
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
template_root="$(cd "$script_dir/../templates/spec-driven-project-copilot-kit" && pwd)"

mkdir -p "$target_root"
target_root="$(cd "$target_root" && pwd)"

specialized_markers=(
    ".github/agents/nexus-sdd-coordinator.agent.md"
    ".github/skills/nexus-validation/SKILL.md"
    ".github/hooks/nexus-sdd-session-start.json"
)

prompt_agent_bindings=(
    ".github/prompts/start-sdd-slice.prompt.md:sdd-coordinator"
    ".github/prompts/continue-sdd-batch.prompt.md:sdd-coordinator"
    ".github/prompts/raise-spec-change.prompt.md:sdd-coordinator"
    ".github/prompts/review-current-batch.prompt.md:sdd-reviewer"
)

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

copy_path ".github" ".github"
copy_path "sdd/scripts/hooks" "sdd/scripts/hooks"

human_requests_dir="$target_root/sdd/human-requests"
human_requests_readme="$human_requests_dir/README.md"
human_requests_content=$(cat <<'EOF'
# Human Requests

This folder stores human-authored intake files for the SDD workflow.

Rules:

- This folder is not the normative source of truth.
- Approved requirement changes must move to `sdd/change-requests/` before updating numbered sdd.
- Implementation-only feedback must move to `sdd/reviews/`, `sdd/implementation/`, `sdd/validation/` or `sdd/decisions/`.
- When a workflow receives only the folder path, use `CURRENT.md`, then `README.md`, then the most recent `.md` file.
EOF
)

mkdir -p "$human_requests_dir"

if [[ ! -e "$human_requests_readme" || "$force" == "true" ]]; then
    printf '%s\n' "$human_requests_content" > "$human_requests_readme"
    echo "Installed: $human_requests_readme"
fi

for binding in "${prompt_agent_bindings[@]}"; do
    prompt_rel="${binding%%:*}"
    agent_name="${binding##*:}"
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