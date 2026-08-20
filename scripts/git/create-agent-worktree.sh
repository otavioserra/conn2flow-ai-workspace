#!/usr/bin/env bash
# ==============================================================================
# Git Worktree Provisioner for Concurrent Agent Execution (Bash)
# ==============================================================================

set -e

REPO_PATH="."
BRANCH_NAME=""
BASE_BRANCH="main"
WORKTREE_PATH=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --repo-path)
      REPO_PATH="$2"
      shift 2
      ;;
    --branch)
      BRANCH_NAME="$2"
      shift 2
      ;;
    --base)
      BASE_BRANCH="$2"
      shift 2
      ;;
    --path)
      WORKTREE_PATH="$2"
      shift 2
      ;;
    -*)
      echo "Unknown option: $1"
      exit 1
      ;;
    *)
      if [[ -z "$BRANCH_NAME" ]]; then
        BRANCH_NAME="$1"
      fi
      shift
      ;;
  esac
done

if [[ -z "$BRANCH_NAME" ]]; then
  echo "Error: Branch name is required."
  echo "Usage: ./create-agent-worktree.sh <branch-name> [--repo-path <path>] [--base <base-branch>]"
  exit 1
fi

REPO_PATH=$(cd "$REPO_PATH" && pwd)

if [[ ! -d "$REPO_PATH/.git" && ! -f "$REPO_PATH/.git" ]]; then
  echo "Error: Directory '$REPO_PATH' is not a git repository."
  exit 1
fi

if [[ -z "$WORKTREE_PATH" ]]; then
  WORKTREE_PATH="$REPO_PATH/worktrees/$BRANCH_NAME"
fi

mkdir -p "$(dirname "$WORKTREE_PATH")"

echo "🌲 [Git Worktree Provisioner] Initializing worktree for concurrent agent..."
echo "   Repository:  $REPO_PATH"
echo "   Branch:      $BRANCH_NAME"
echo "   Base:        $BASE_BRANCH"
echo "   Destination: $WORKTREE_PATH"

if git -C "$REPO_PATH" branch --list "$BRANCH_NAME" | grep -q "$BRANCH_NAME"; then
  echo "ℹ️  Branch '$BRANCH_NAME' exists. Attaching worktree..."
  git -C "$REPO_PATH" worktree add "$WORKTREE_PATH" "$BRANCH_NAME"
else
  echo "🌱 Creating new branch '$BRANCH_NAME' from '$BASE_BRANCH'..."
  git -C "$REPO_PATH" worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "$BASE_BRANCH"
fi

if [[ -f "$REPO_PATH/.env" && ! -f "$WORKTREE_PATH/.env" ]]; then
  cp "$REPO_PATH/.env" "$WORKTREE_PATH/.env"
  echo "✔ Copied .env configuration to worktree."
fi

echo ""
echo "✅ [Worktree Ready] Isolated agent environment provisioned successfully!"
echo "   cd $WORKTREE_PATH"
