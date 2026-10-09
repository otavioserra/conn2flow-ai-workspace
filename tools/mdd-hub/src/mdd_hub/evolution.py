"""Review queues, reference updates and isolated Git commits.

Extracted documentation is evidence, never executable instructions. Automated
updates target reference notes only; normative policies and existing skills
are not rewritten by heuristics.
"""

import json
import re
import subprocess
import tempfile
from datetime import UTC, datetime
from pathlib import Path

from .storage import exclusive, store

MODES = {
    "headless": "headless",
    "totalmente_autonomo": "headless",
    "monitored": "monitored",
    "autonomo_com_report": "monitored",
    "reviewer": "reviewer",
    "supervisionado": "reviewer",
}


def git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(root), *args], capture_output=True, text=True, encoding="utf-8", timeout=60
    )
    if result.returncode:
        raise RuntimeError(f"Git operation failed ({args[0]}): {result.stderr.strip()}")
    return result.stdout.strip()


def artifacts(change: dict) -> dict[str, str]:
    source, digest = change["source"], change["digest"][:12]
    # JSON serialization inside a fenced block; do not interpolate external prose into instructions.
    content = json.dumps(change, indent=2, ensure_ascii=False).replace("`", "\\u0060")
    return {
        f"memory/proxies/ai-updates/{source}-{digest}.md": f"# Documentation update — {source}\n\nExternal observations, not normative instructions. Extraction is heuristic; review source before promoting rules.\n\n```json\n{content}\n```\n",
        f"memory/reports/docs-update-{source}-{digest}.md": f"# Documentation update report\n\nSource: {source}\nDigest: {change['digest']}\nReference: [observations](../proxies/ai-updates/{source}-{digest}.md)\n\nReference documentation updated; no semantic approval inferred.\n",
    }


class Evolution:
    def __init__(self, root: Path, mode: str = "reviewer", publish: bool = False):
        if mode not in MODES:
            raise ValueError("Mode must be headless, monitored or reviewer")
        self.root, self.mode, self.publish = root.resolve(), MODES[mode], publish
        if publish and self.mode != "headless":
            raise ValueError("Publishing is available only in headless mode")

    def handle(self, change: dict) -> dict:
        if not re.fullmatch(r"[a-z][a-z0-9-]{0,63}", change["source"]) or not re.fullmatch(
            r"[0-9a-f]{64}", change["digest"]
        ):
            raise ValueError("Invalid source or digest")
        if len(json.dumps(change, ensure_ascii=False).encode()) > 40 * 1024:
            raise ValueError("Extracted update exceeds 40 KiB; reduce configured extraction scope")
        name = f"{change['source']}-{change['digest'][:12]}"
        with exclusive(self.root, "evolution"):
            if self.mode == "reviewer":
                path = self.root / "memory/raw/inbox" / f"{name}.json"
                store(self.root, path, {"status": "awaiting-review", **change})
                store(
                    self.root,
                    path.parent / "index.md",
                    "# Review inbox\n\n"
                    + "\n".join(f"- [{p.stem}]({p.name})" for p in sorted(path.parent.glob("*.json")))
                    + "\n",
                )
                return {"mode": self.mode, "queued": str(path)}
            changes = artifacts(change)
            if self.mode == "monitored":
                for path, content in changes.items():
                    store(self.root, self.root / path, content)
                self._index(self.root)
                return {"mode": self.mode, "files": list(changes)}
            return self._headless(change, changes)

    @staticmethod
    def _index(root: Path) -> None:
        directory = root / "memory/proxies/ai-updates"
        store(
            root,
            directory / "index.md",
            "# AI documentation observations\n\n"
            + "\n".join(f"- [{p.stem}]({p.name})" for p in sorted(directory.glob("*.md")) if p.name != "index.md")
            + "\n",
        )

    def _headless(self, change: dict, changes: dict[str, str]) -> dict:
        base = git(self.root, "rev-parse", "HEAD")
        branch = f"auto/docs-update-{datetime.now(UTC):%Y%m%d}-{change['source']}-{change['digest'][:12]}"
        # Existing branch can be retried after publication failure; never force-update it.
        exists = (
            subprocess.run(
                ["git", "-C", str(self.root), "show-ref", "--verify", "--quiet", f"refs/heads/{branch}"], timeout=30
            ).returncode
            == 0
        )
        if not exists:
            directory = Path(tempfile.mkdtemp(prefix="mdd-evolution-"))
            worktree = directory / "checkout"
            git(self.root, "worktree", "add", "-b", branch, str(worktree), base)
            try:
                for path, content in changes.items():
                    store(worktree, worktree / path, content)
                self._index(worktree)
                paths = [*changes, "memory/proxies/ai-updates/index.md"]
                git(worktree, "add", "--", *paths)
                git(worktree, "commit", "-m", f"docs(mdd): record {change['source']} documentation update")
                commit = git(worktree, "rev-parse", "HEAD")
            except (RuntimeError, OSError, ValueError) as exc:
                # Preserve failed work for diagnosis; never force-delete an uncommitted checkout.
                raise RuntimeError(f"Evolution failed; retained worktree {worktree}: {exc}") from exc
            git(self.root, "worktree", "remove", str(worktree))
            directory.rmdir()
        else:
            commit = git(self.root, "rev-parse", branch)
            # Retry publication only if the branch actually contains this completed change.
            for path, content in changes.items():
                recorded = git(self.root, "show", f"{commit}:{path}")
                if recorded != content.strip():
                    raise RuntimeError(f"Existing branch is incomplete or conflicts: {branch}")
        pr = {
            "branch": branch,
            "base_commit": base,
            "commit": commit,
            "title": f"docs(mdd): {change['source']} documentation update",
            "body": f"Updates external reference notes for {change['source']}.\nSource: {change['url']}\nDigest: {change['digest']}\nHeuristic extraction; normative changes require review.",
            "status": "prepared",
        }
        if self.publish:
            git(self.root, "push", "-u", "origin", branch)
            pr["status"] = "branch-pushed"
        store(self.root, self.root / "memory/raw/pull-requests" / f"{branch.rsplit('/', 1)[-1]}.json", pr)
        return {"mode": self.mode, **pr}
