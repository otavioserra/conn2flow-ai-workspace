import json
import os
import shutil
import subprocess
from pathlib import Path
from urllib.parse import unquote

import pytest
import yaml
from mdd_client.cli import app
from mdd_client.core import indexer
from mdd_client.storage import lock
from typer.testing import CliRunner

MATRIX = Path(__file__).resolve().parents[3]
PHP_CLI = MATRIX.parent / "conn2flow/cli/c2f.php"
HAS_PHP = PHP_CLI.is_file() and bool(shutil.which("php")) and not os.environ.get("MDD_TEST_NO_PHP")


def php(root, command, *args, ok=True):
    if not HAS_PHP:
        return ""
    result = subprocess.run(
        ["php", str(PHP_CLI), command, *args, f"--repo={root}"], capture_output=True, text=True, encoding="utf-8"
    )
    assert (result.returncode == 0) is ok, result.stdout + result.stderr
    return result.stdout.strip()


@pytest.fixture
def pair(tmp_path):
    roots = [tmp_path / name / "project" for name in ("py", "php")]
    for root in roots:
        area = root / "memory/human-requests"
        (area / "archive").mkdir(parents=True)
        (area / "index.md").write_text("# Broken old table\n", encoding="utf-8")
        (area / "archive/index.md").write_text("# Archive\n", encoding="utf-8")
        (area / "req-001.md").write_text(
            '---\nid: "REQ-001"\ntitle: "Olá | [mundo] <script>"\nstatus: APPROVED # comment\n'
            'date: 2026-10-09\nauthor: architect\ntarget_repo: project\n'
            "summary_short: 'Resumo com ''aspas'' | & links'\nsummary_medium: >-\n  Primeiro bloco\n  Segundo bloco\n"
            '# keep comment\ncustom_field: "001"\n---\n\n# Heading\n\nOriginal body.\n', encoding="utf-8"
        )
        (area / "req-002 espaço.md").write_text(
            "# REQ-002 — Legado\n\n* **Status**: `IN-PROGRESS`\n\n```text\nIgnore this code\n```\n\n"
            + "Texto histórico com acentos e emoji 🐙 " * 5 + "\nsegunda linha.\n\nOutro parágrafo.\n", encoding="utf-8"
        )
        (area / "req-003.md").write_bytes(b'\xef\xbb\xbf# CRLF\r\n\r\nPreserve bytes.\r\n')
        (area / "req-004.md").write_text('---\nstatus: [bad YAML]\n---\n# Invalid\n\nFallback.\n', encoding="utf-8")
        (area / "archive/req-005.md").write_text("# Archived\n\nOld prose.\n", encoding="utf-8")
    return roots


def compare(pair, relative):
    first = (pair[0] / relative).read_bytes()
    if HAS_PHP:
        second = (pair[1] / relative).read_bytes()
        assert first == second
    return first.decode("utf-8")


def test_default_index_parity_idempotent_links_and_no_document_mutation(pair):
    root, other = pair
    before = {p: p.read_bytes() for p in (root / "memory").rglob("*.md") if p.name != "index.md"}
    generated = indexer.index(root)
    if HAS_PHP:
        php(other, "memory:index")
        compare(pair, "memory/human-requests/index.md")
        compare(pair, "memory/human-requests/archive/index.md")
    assert len(generated) == 2
    table = compare(pair, "memory/human-requests/index.md")
    assert "Olá &#124; &#91;mundo&#93; &lt;script&gt;" in table
    assert "Resumo com 'aspas' &#124; &amp; links" in table
    assert "IN-PROGRESS" in table
    assert "archived" in (generated[0] if generated[0].parent.name == "archive" else generated[1]).read_text()
    assert "Ignore this code" not in table
    assert "..." in table
    import re
    for link in re.findall(r"\]\(<([^>]+)>\)", table):
        assert (root / "memory/human-requests" / unquote(link)).is_file()
    saved = [p.read_bytes() for p in generated]
    indexer.index(root)
    assert saved == [p.read_bytes() for p in generated]
    assert all(p.read_bytes() == content for p, content in before.items())


@pytest.mark.parametrize("target", ["req-001", "req-002 espaço", "req-003", "memory/human-requests/req-001.md"])
def test_set_get_byte_parity_body_and_bom(pair, target):
    root, other = pair
    path = indexer.resolve(root, target)
    before = path.read_bytes().decode("utf-8")
    original_body = indexer.parse(before)[1]
    updates = {"status": "READY: | 🐙", "summary_medium": 'Line one\nLine two "quoted"\\', "custom_field": "001"}
    indexer.set_metadata(root, target, updates)
    if HAS_PHP:
        php(other, "memory:set", target, *(f"--{key}={value}" for key, value in updates.items()))
    relative = path.relative_to(root)
    updated = compare(pair, relative)
    assert indexer.parse(updated)[1] == original_body
    assert updated.startswith("\ufeff") == before.startswith("\ufeff")
    if "\r\n" in before:
        assert "\n" not in updated.replace("\r\n", "")
    compare(pair, "memory/human-requests/index.md")
    if HAS_PHP:
        assert indexer.get(root, target) == json.loads(php(other, "memory:get", target, "--json"))
        assert indexer.get(root, target, "status") == json.loads(php(other, "memory:get", target, "status", "--json"))
    if target.endswith("001") or target.endswith("001.md"):
        assert "# keep comment" in updated
        assert 'date: 2026-10-09' in updated


@pytest.mark.parametrize("broken", ["---\nstatus: [object]\n---\n# Heading\n", "---\nstatus: a\nstatus: b\n---\n", "---\nstatus: missing delimiter\n# Heading\n"])
def test_malformed_mutation_is_noop_and_read_tolerant(pair, broken):
    for root in pair:
        (root / "memory/human-requests/req-bad.md").write_text(broken, encoding="utf-8")
    before = [(root / "memory/human-requests/index.md").read_bytes() for root in pair]
    with pytest.raises(ValueError, match="safely mutate"):
        indexer.set_metadata(pair[0], "req-bad", {"status": "NEW"})
    if HAS_PHP:
        php(pair[1], "memory:set", "req-bad", "--status=NEW", ok=False)
    for i, root in enumerate(pair):
        if not HAS_PHP and i == 1:
            continue
        assert (root / "memory/human-requests/req-bad.md").read_text() == broken
        assert (root / "memory/human-requests/index.md").read_bytes() == before[i]
    if HAS_PHP:
        assert indexer.get(pair[0], "req-bad") == json.loads(php(pair[1], "memory:get", "req-bad", "--json"))


def test_lock_blocks_both_languages_and_failed_index_restores(pair, monkeypatch):
    root, _ = pair
    with lock(root):
        with pytest.raises(ValueError, match="Another MDD"):
            indexer.set_metadata(root, "req-001", {"status": "NEW"})
        if HAS_PHP:
            php(root, "memory:set", "req-001", "--status=NEW", ok=False)
            php(root, "memory:index", ok=False)
    path = root / "memory/human-requests/req-001.md"
    before = path.read_bytes()
    original = indexer.write

    def fail(repo, destination, content):
        if destination.name == "index.md":
            raise OSError("Injected index failure")
        original(repo, destination, content)

    monkeypatch.setattr(indexer, "write", fail)
    with pytest.raises(OSError, match="Injected"):
        indexer.set_metadata(root, "req-001", {"status": "NEW"})
    assert path.read_bytes() == before
    assert not (root / "memory/.mdd.lock").exists()
    if HAS_PHP:
        # Real filesystem error exercises the PHP rollback path.
        (root / "memory/human-requests/index.md").unlink()
        (root / "memory/human-requests/index.md").mkdir()
        php(root, "memory:set", "req-001", "--status=NEW", ok=False)
        assert path.read_bytes() == before


def test_ambiguous_ids_missing_fields_and_escape(pair):
    root, other = pair
    for repo in pair:
        shutil.copyfile(repo / "memory/human-requests/req-001.md", repo / "memory/human-requests/archive/req-001.md")
    with pytest.raises(ValueError, match="unique"):
        indexer.get(root, "req-001")
    if HAS_PHP:
        php(other, "memory:get", "req-001", ok=False)
    with pytest.raises(ValueError, match="Unknown"):
        indexer.get(root, "req-003", "missing")
    if HAS_PHP:
        php(other, "memory:get", "req-003", "missing", ok=False)
    for repo in pair:
        (repo / "outside.md").write_text("# Outside\n", encoding="utf-8")
    with pytest.raises(ValueError):
        indexer.set_metadata(root, "outside.md", {"status": "NEW"})
    if HAS_PHP:
        php(other, "memory:set", "outside.md", "--status=NEW", ok=False)
    assert (root / "outside.md").read_text() == "# Outside\n"


def test_cli_equivalence_and_creation_of_explicit_index(pair):
    root, other = pair
    runner = CliRunner()
    result = runner.invoke(app, ["meta", "set", "req-003", "status", "IN-PROGRESS", "--path", str(root)])
    assert result.exit_code == 0, result.output
    if HAS_PHP:
        php(other, "memory:set", "req-003", "--status=IN-PROGRESS")
        compare(pair, "memory/human-requests/req-003.md")
    result = runner.invoke(app, ["meta", "get", "req-003", "status", "--json", "--path", str(root)])
    assert result.exit_code == 0, result.output
    assert json.loads(result.output) == "IN-PROGRESS"
    for repo in pair:
        (repo / "memory/new-area").mkdir()
    result = runner.invoke(app, ["index", "new-area", "--path", str(root)])
    assert result.exit_code == 0, result.output
    if HAS_PHP:
        php(other, "memory:index", "new-area")
        compare(pair, "memory/new-area/index.md")
    result = runner.invoke(app, ["meta", "get", "absent", "--path", str(root)])
    assert result.exit_code == 1


def test_junction_or_symlink_targets_rejected(pair, tmp_path):
    outside = tmp_path / "outside"
    outside.mkdir()
    (outside / "doc.md").write_text("# Protected\n", encoding="utf-8")
    links = []
    try:
        for root in pair:
            link = root / "memory/linked"
            if os.name == "nt":
                subprocess.run(["cmd", "/c", "mklink", "/J", str(link), str(outside)], check=True, capture_output=True)
            else:
                link.symlink_to(outside, target_is_directory=True)
            links.append(link)
        with pytest.raises(ValueError):
            indexer.set_metadata(pair[0], "memory/linked/doc.md", {"status": "NEW"})
        if HAS_PHP:
            php(pair[1], "memory:set", "memory/linked/doc.md", "--status=NEW", ok=False)
        assert (outside / "doc.md").read_text() == "# Protected\n"
    finally:
        for link in links:
            os.rmdir(link) if os.name == "nt" else link.unlink()


@pytest.mark.parametrize("style", ["|", "|-", "|+", ">", ">-", ">+"])
@pytest.mark.parametrize("block", ["  First\n\n  Second\n", "  First\n\n\n", "\n  First\n    Indented\n  Second\n", "  First\n\n    Indented\n  Second\n", "\n\n"])
def test_real_yaml_block_values_and_safe_replacement(pair, style, block):
    source = f"---\nid: REQ-010\nsummary_medium: {style}\n{block}status: old\n  # independent comment\n---\nBody\n"
    for root in pair:
        (root / "memory/human-requests/req-010.md").write_bytes(source.encode())
    header = indexer.HEADER.match(source)[1]
    expected = yaml.safe_load(header)["summary_medium"]
    assert indexer.get(pair[0], "req-010", "summary_medium") == expected
    if HAS_PHP:
        assert json.loads(php(pair[1], "memory:get", "req-010", "summary_medium", "--json")) == expected
    indexer.set_metadata(pair[0], "req-010", {"summary_medium": "NEW", "status": "READY"})
    if HAS_PHP:
        php(pair[1], "memory:set", "req-010", "--summary_medium=NEW", "--status=READY")
    after = compare(pair, "memory/human-requests/req-010.md")
    assert yaml.safe_load(indexer.HEADER.match(after)[1])["summary_medium"] == "NEW"
    assert "  # independent comment" in after


@pytest.mark.parametrize("raw", ["alpha: beta", "@invalid", "`invalid", "- list", "a\x00b"])
def test_invalid_plain_yaml_cannot_be_mutated(pair, raw):
    source = f"---\nstatus: {raw}\n---\nBody\n"
    for root in pair:
        (root / "memory/human-requests/req-011.md").write_bytes(source.encode())
    with pytest.raises(ValueError, match="safely mutate"):
        indexer.set_metadata(pair[0], "req-011", {"author": "reviewer"})
    if HAS_PHP:
        php(pair[1], "memory:set", "req-011", "--author=reviewer", ok=False)
    assert compare(pair, "memory/human-requests/req-011.md") == source


def test_line_separator_encoding_parity_and_yaml_roundtrip(pair):
    value = "a\u2028b\u2029c"
    indexer.set_metadata(pair[0], "req-003", {"summary_medium": value})
    if HAS_PHP:
        php(pair[1], "memory:set", "req-003", f"--summary_medium={value}")
    after = compare(pair, "memory/human-requests/req-003.md")
    assert yaml.safe_load(indexer.HEADER.match(after)[1])["summary_medium"] == value
