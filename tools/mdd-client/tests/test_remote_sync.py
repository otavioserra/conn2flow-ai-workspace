"""Remote updates exercise the real project writes with an offline Git fixture."""

import hashlib
import json
import shutil
from pathlib import Path
from types import SimpleNamespace

import pytest
import yaml
from mdd_client import bootstrap as boot
from mdd_client import remote_sync as sync
from mdd_client.cli import app
from typer.testing import CliRunner

MATRIX = Path(__file__).resolve().parents[3]
CORE = "c2f-persona-executor"
OTHER = "c2f-javascript-ajax"
KIT = ".codex/skills"


def put(root, path, content):
    target = root / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(content)
    return target


def snapshot(root):
    return {file.relative_to(root).as_posix(): file.read_bytes() for file in root.rglob("*") if file.is_file()}


@pytest.fixture
def upstream(tmp_path):
    source = tmp_path / "remote"
    project = tmp_path / "project"
    cache = tmp_path / "cache"
    for domain in ("generic", "conn2flow"):
        path = f"domains/{domain}/domain.json"
        put(source, path, (MATRIX / path).read_bytes())
    for name in (CORE, OTHER):
        put(source, f".gemini/skills/{name}/SKILL.md", b"original\n")
    (project / KIT).mkdir(parents=True)
    return source, project, cache


class OfflineGit:
    def __init__(self, source, url=sync.SOURCE_URL):
        self.source = source
        self.url = url
        self.calls = []
        self.revision = "a" * 40

    def __call__(self, cwd, args):
        self.calls.append((cwd, args))
        if args[0] == "clone":
            target = Path(args[-1])
            shutil.copytree(self.source, target)
            (target / ".git").mkdir()
            assert args[args.index("--depth") + 1] == "1"
        elif args[0] == "remote":
            return self.url
        elif args == ["rev-parse", "--show-toplevel"]:
            return str(cwd)
        elif args[0] == "fetch":
            assert args[-1].endswith("refs/remotes/origin/main")
        elif "reset" in args:
            assert args[:2] == [f"--git-dir={cwd / '.git'}", f"--work-tree={cwd}"]
            shutil.copytree(self.source, cwd, dirs_exist_ok=True)
        elif args == ["rev-parse", "HEAD"]:
            return self.revision
        else:
            pytest.fail(f"Unexpected Git command: {args}")
        return ""


def update(upstream, runner, **kwargs):
    _, project, cache = upstream
    return sync.remote_sync(project, cache_dir=cache, git=runner, **kwargs)


def test_check_only_and_apply_then_remote_fetch(upstream):
    source, project, cache = upstream
    git = OfflineGit(source)
    local = put(project, f"{KIT}/my-project-guide/SKILL.md", b"my instructions\r\n")
    before = snapshot(project)
    first = update(upstream, git, check_only=True)
    key = f"{KIT}/{CORE}/SKILL.md"
    assert first["domain"] == "generic"
    assert first["available"] == [key]
    assert first["updated"] == first["conflicts"] == []
    assert snapshot(project) == before
    assert (cache / ".git" / sync.CACHE_MARKER).read_text().strip() == sync.SOURCE_URL

    enrolled = update(upstream, git)
    assert enrolled["updated"] == [key] and enrolled["metadata_changed"]
    assert not (project / KIT / OTHER).exists()
    assert not (project / ".cursor").exists()
    assert local.read_bytes() == before[f"{KIT}/my-project-guide/SKILL.md"]
    assert json.loads((project / sync.STATE).read_text())["files"][key] == sync._hash(b"original\n")
    (project / key).write_bytes(b"original\r\n")
    put(source, f".gemini/skills/{CORE}/SKILL.md", b"new seed\n")
    subskill = f"{KIT}/{CORE}/subskills/recipe.md"
    put(source, f".gemini/skills/{CORE}/subskills/recipe.md", b"new recipe\n")
    git.revision = "b" * 40

    dry = update(upstream, git, check_only=True)
    assert dry["revision"] == git.revision
    assert dry["available"] == [key, subskill]
    assert (project / key).read_bytes() == b"original\r\n"
    assert not (project / subskill).exists()
    applied = update(upstream, git)
    assert applied["updated"] == dry["available"]
    assert (project / key).read_bytes() == b"new seed\r\n"
    assert (project / subskill).read_bytes() == b"new recipe\n"
    assert not update(upstream, git)["metadata_changed"]
    assert any(args[0] == "fetch" and cwd == cache for cwd, args in git.calls)
    assert all(cwd != project for cwd, _ in git.calls)


def test_conflicts_and_customizations_leave_local_bytes_intact(upstream):
    source, project, _ = upstream
    git = OfflineGit(source)
    custom = put(project, f"{KIT}/{CORE}/SKILL.md", b"custom instructions\r\n")
    raw_lf = custom.read_bytes().replace(b"\r\n", b"\n")
    put(project, sync.CUSTOMIZATIONS, json.dumps({
        f"{KIT}/{CORE}/SKILL.md": {"local_sha256": hashlib.sha256(raw_lf).hexdigest(), "seed_sha256": "old"}
    }).encode())
    unknown = put(project, f"{KIT}/{OTHER}/SKILL.md", b"unrecognized local variant")
    put(source, f".gemini/skills/{CORE}/subskills/new.md", b"upstream")
    result = update(upstream, git, domain="conn2flow")
    assert result["customized"] == [f"{KIT}/{CORE}/SKILL.md"]
    assert result["conflicts"] == [{"path": f"{KIT}/{OTHER}/SKILL.md", "reason": "unknown_baseline"}]
    assert result["updated"] == []
    assert not custom.with_name("subskills").exists()
    assert unknown.read_bytes() == b"unrecognized local variant"

    custom.write_bytes(b"additional local edits")
    check = update(upstream, git, domain="conn2flow", check_only=True)
    assert {item["reason"] for item in check["conflicts"]} == {"customization_changed", "unknown_baseline"}
    assert custom.read_bytes() == b"additional local edits"


def test_does_not_recreate_locally_deleted_seed_or_replace_group(upstream):
    source, project, _ = upstream
    git = OfflineGit(source)
    put(source, f".gemini/skills/{CORE}/subskills/existing.md", b"published")
    update(upstream, git)
    recipe = project / KIT / CORE / "subskills/existing.md"
    recipe.unlink()
    put(source, f".gemini/skills/{CORE}/SKILL.md", b"new seed")
    result = update(upstream, git)
    assert result["conflicts"] == [{"path": f"{KIT}/{CORE}/subskills/existing.md", "reason": "locally_modified"}]
    assert result["updated"] == []
    assert (project / KIT / CORE / "SKILL.md").read_bytes() == b"original\n"


def test_non_skill_directory_and_file_collision_are_preserved(upstream):
    source, project, _ = upstream
    git = OfflineGit(source)
    unrelated = put(project, f"{KIT}/{CORE}/notes.md", b"local")
    first = update(upstream, git)
    assert first["conflicts"][0]["reason"] == "local_skill_directory"
    put(project, f"{KIT}/{CORE}/SKILL.md", b"original\n")
    put(source, f".gemini/skills/{CORE}/subskills/example.md", b"published")
    (project / KIT / CORE / "subskills/example.md").mkdir(parents=True)
    second = update(upstream, git)
    assert second["conflicts"] == [{"path": f"{KIT}/{CORE}/subskills/example.md", "reason": "not_a_file"}]
    assert second["available"] == []
    assert unrelated.read_bytes() == b"local"


def test_bootstrap_records_seeds_and_copies_opt_in_workflow(upstream):
    source, project, _ = upstream
    template = "templates/ci/mdd-skills-autosync.yml"
    workflow = ".github/workflows/mdd-skills-autosync.yml"
    put(source, template, (MATRIX / template).read_bytes())
    before = snapshot(project)
    preflight = boot.bootstrap(project, "generic", kits=["codex"], matrix=source, dry_run=True, with_ci_sync=True)
    assert preflight["ci_sync"]["status"] == "planned"
    assert snapshot(project) == before

    result = CliRunner().invoke(app, ["bootstrap", "--path", str(project), "--matrix", str(source), "--domain", "generic",
                                      "--kits", "codex", "--with-ci-sync", "--json"])
    assert result.exit_code == 0, result.output
    assert json.loads(result.output)["ci_sync"]["status"] == "created"
    data = yaml.safe_load((project / workflow).read_text())
    assert data["jobs"]["sync"]["runs-on"] == "ubuntu-latest"
    assert data["permissions"]["pull-requests"] == "write"
    assert (project / workflow).read_bytes() == (source / template).read_bytes()
    assert json.loads((project / sync.STATE).read_text())["domain"] == "generic"
    different = put(project, workflow, b"# configured locally\n")
    rerun = boot.bootstrap(project, "generic", kits=["codex"], matrix=source, with_ci_sync=True)
    assert rerun["ci_sync"]["status"] == "preserved"
    assert different.read_bytes() == b"# configured locally\n"

    # The saved domain takes precedence over stack detection, and bootstrap hashes enable an initial update.
    put(project, "gestor/config.php", b"<?php")
    put(source, f".gemini/skills/{CORE}/SKILL.md", b"new seed")
    report = update(upstream, OfflineGit(source))
    assert report["domain"] == "generic"
    assert report["updated"] == [f"{KIT}/{CORE}/SKILL.md"]


def test_cache_guards_refuse_unowned_nested_and_foreign_worktrees(upstream):
    source, project, cache = upstream
    git = OfflineGit(source)
    with pytest.raises(ValueError, match="separate directories"):
        sync.remote_sync(project, cache_dir=project / "cache", git=git)
    with pytest.raises(ValueError, match="separate directories"):
        sync.remote_sync(project, cache_dir=project.parent, git=git)
    with pytest.raises(ValueError, match="HTTPS"):
        update(upstream, git, source_url="https://token@example.com/org/repo")
    assert git.calls == []
    cache.mkdir()
    sentinel = put(cache, "work.txt", b"keep")
    with pytest.raises(ValueError, match="not an MDD checkout"):
        update(upstream, git)
    assert git.calls == []
    assert sentinel.read_bytes() == b"keep"

    put(cache, f".git/{sync.CACHE_MARKER}", sync.SOURCE_URL.encode())
    wrong_origin = OfflineGit(source, url="https://example.com/other")
    with pytest.raises(ValueError, match="origin or worktree"):
        update(upstream, wrong_origin)
    assert len(wrong_origin.calls) == 1


def test_cache_lock_default_partition_and_invalid_state(upstream, monkeypatch):
    source, project, cache = upstream
    monkeypatch.setattr(Path, "home", lambda: project.parent)
    assert sync._cache_path(project, sync.SOURCE_URL, None) == project.parent / ".mdd/cache/conn2flow-ai-workspace"
    assert sync._cache_path(project, "https://example.com/other", None).parent == project.parent / ".mdd/cache"
    reservation = cache.with_name(f".{cache.name}.mdd-lock")
    reservation.mkdir()
    git = OfflineGit(source)
    with pytest.raises(ValueError, match="in use"):
        update(upstream, git)
    reservation.rmdir()
    put(project, sync.STATE, b"[]")
    with pytest.raises(ValueError, match="Invalid JSON object"):
        update(upstream, git)
    assert not reservation.exists()
    put(project, sync.STATE, b'{"version": 9, "files": {}}')
    with pytest.raises(ValueError, match="Invalid remote skill state"):
        update(upstream, git)
    (project / sync.STATE).unlink()
    with pytest.raises(ValueError, match="Unknown remote domain"):
        update(upstream, git, domain="missing")


def test_cli_alias_remote_flags_and_real_runner_contract(upstream, monkeypatch):
    source, project, cache = upstream
    offline = OfflineGit(source)
    monkeypatch.setattr(sync, "remote_sync", lambda *args, **kwargs: real_sync(*args, **kwargs, git=offline))
    runner = CliRunner()
    result = runner.invoke(app, ["update", "--path", str(project), "--cache-dir", str(cache), "--check-only", "--json"])
    assert result.exit_code == 0 and json.loads(result.output)["check_only"] is True
    result = runner.invoke(app, ["sync", "--remote", "--path", str(project), "--cache-dir", str(cache), "--apply", "--json"])
    assert result.exit_code == 0 and json.loads(result.output)["updated"]
    result = runner.invoke(app, ["sync", "--remote", "--apply", "--check-only"])
    assert result.exit_code == 1 and "cannot combine" in result.output
    result = runner.invoke(app, ["sync", "--check-only"])
    assert result.exit_code == 1 and "require --remote" in result.output

    def fake_run(command, **options):
        assert command[:3] == ["git", "-c", "protocol.file.allow=never"]
        assert options["cwd"] == cache
        assert options["env"]["GIT_TERMINAL_PROMPT"] == "0"
        assert "GIT_DIR" not in options["env"]
        return SimpleNamespace(returncode=0, stdout=" revision\n", stderr="")
    monkeypatch.setenv("GIT_DIR", "another project")
    monkeypatch.setattr(sync.subprocess, "run", fake_run)
    assert sync._git(cache, ["rev-parse", "HEAD"]) == "revision"
    monkeypatch.setattr(sync.subprocess, "run", lambda *args, **kwargs:
                        SimpleNamespace(returncode=1, stdout="", stderr="fetch failed"))
    with pytest.raises(ValueError, match="fetch failed"):
        sync._git(cache, ["fetch"])


real_sync = sync.remote_sync


def test_missing_project_errors_before_git(tmp_path):
    with pytest.raises(ValueError, match="Project directory does not exist"):
        sync.remote_sync(tmp_path / "missing")


def test_linked_paths_report_conflicts_without_blocking_other_kits(upstream, monkeypatch):
    source, project, _ = upstream
    (project / ".gemini/skills").mkdir(parents=True)
    (project / ".github/skills").mkdir(parents=True)
    original = sync.contained

    def guarded(root, target):
        if root == project and (target == project / ".gemini/skills" or target == project / KIT / CORE / "SKILL.md"):
            raise ValueError("linked fixture")
        return original(root, target)

    monkeypatch.setattr(sync, "contained", guarded)
    report = update(upstream, OfflineGit(source))
    assert report["conflicts"] == [
        {"path": ".gemini/skills", "reason": "linked_path"},
        {"path": f"{KIT}/{CORE}", "reason": "linked_path"},
    ]
    assert report["updated"] == [f".github/skills/{CORE}/SKILL.md"]


def test_apply_rechecks_project_bytes_before_each_write(upstream, monkeypatch):
    source, project, _ = upstream
    git = OfflineGit(source)
    update(upstream, git)
    relative = f"{KIT}/{CORE}/SKILL.md"
    target = project / relative
    put(source, f".gemini/skills/{CORE}/SKILL.md", b"remote update")
    plan = sync._plan_skill

    def concurrent_edit(*args):
        result = plan(*args)
        target.write_bytes(b"local editor saved")
        return result

    monkeypatch.setattr(sync, "_plan_skill", concurrent_edit)
    with pytest.raises(ValueError, match="changed during update"):
        update(upstream, git)
    assert target.read_bytes() == b"local editor saved"
