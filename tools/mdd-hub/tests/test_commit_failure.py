from pathlib import Path

import pytest
from mdd_hub import evolution


def test_failed_commit_preserves_checkout_and_rejects_incomplete_retry(tmp_path, change, monkeypatch):
    run_git = evolution.git
    run_git(tmp_path, "init")
    run_git(tmp_path, "config", "user.name", "MDD Test")
    run_git(tmp_path, "config", "user.email", "mdd-test@example.invalid")
    (tmp_path / "seed").write_text("seed")
    run_git(tmp_path, "add", "--", "seed")
    run_git(tmp_path, "commit", "-m", "seed")
    head = run_git(tmp_path, "rev-parse", "HEAD")

    def fail(root, *args):
        if args[0] == "commit":
            raise RuntimeError("Synthetic commit failure")
        return run_git(root, *args)

    monkeypatch.setattr(evolution, "git", fail)
    with pytest.raises(RuntimeError, match="retained worktree"):
        evolution.Evolution(tmp_path, "headless").handle(change)
    checkout = None
    listing = run_git(tmp_path, "worktree", "list", "--porcelain")
    for line in listing.splitlines():
        if line.startswith("worktree ") and Path(line.removeprefix("worktree ")).resolve() != tmp_path.resolve():
            checkout = Path(line.removeprefix("worktree "))
    assert checkout and checkout.is_dir()
    try:
        assert run_git(tmp_path, "rev-parse", "HEAD") == head
        assert "memory/proxies" in run_git(checkout, "diff", "--cached", "--name-only")
        monkeypatch.setattr(evolution, "git", run_git)
        with pytest.raises(RuntimeError):
            evolution.Evolution(tmp_path, "headless").handle(change)
    finally:
        # Recover the isolated fixture without force-removal or shared-index changes.
        run_git(checkout, "commit", "-m", "recover test fixture")
        run_git(tmp_path, "worktree", "remove", str(checkout))
        checkout.parent.rmdir()
