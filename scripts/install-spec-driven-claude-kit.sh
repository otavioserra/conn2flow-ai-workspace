#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
    echo "Usage: install-spec-driven-claude-kit.sh <target-repo-path> [--force]" >&2
    exit 1
fi

target_root="$1"
force="false"

if [[ ${2:-} == "--force" ]]; then
    force="true"
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
template_root="$(cd "$script_dir/../templates/spec-driven-project-claude-kit" && pwd)"

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

echo "Spec-Driven Claude Kit installation finished."