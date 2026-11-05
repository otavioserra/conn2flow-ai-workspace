import json
import time

import pytest
from mdd_client.cli import app
from mdd_client.db import SQLiteMDDDriver, learn, sync
from typer.testing import CliRunner


def test_storage_wal_fts_scope_and_update(tmp_path):
    with SQLiteMDDDriver(tmp_path / "memory.sqlite") as db:
        assert db.connection.execute("PRAGMA journal_mode").fetchone()[0] == "wal"
        assert db.connection.execute("PRAGMA foreign_keys").fetchone()[0] == 1
        record = dict(doc_id="REQ-001", layer="normative", title="Câmera", content="vídeo memória câmera")
        db.upsert(record)
        db.upsert({**record, "workspace_slug": "private"})
        db.upsert({**record, "target": "video-factory", "layer": "raw"})
        assert len(db.query("camera", layer="normative")) == 1
        assert len(db.query("camera", target="video-factory")) == 1
        db.upsert({**record, "content": "changed", "title": "New"})
        assert not db.query("camera", layer="normative")
        assert db.query("changed")[0]["rank"] < 0
        with pytest.raises(ValueError):
            db.upsert({**record, "layer": "invalid"})


def test_sync_incremental_graph_and_preservation(tmp_path):
    folder = tmp_path / "memory" / "human-requests"
    folder.mkdir(parents=True)
    doc = folder / "req-001.md"
    doc.write_text('---\nid: "REQ-001"\ntitle: "Video"\nbatch: "BATCH-001"\n---\n[DEC-001](../decisions/dec-001.md) camera', encoding="utf-8")
    with SQLiteMDDDriver(tmp_path / "memory" / ".mdd.sqlite") as db:
        assert sync(tmp_path, db) == {"changed": 1, "unchanged": 0}
        start = time.perf_counter()
        assert sync(tmp_path, db) == {"changed": 0, "unchanged": 1}
        assert time.perf_counter() - start < .2
        assert len(db.graph("REQ-001")) == 2
        assert not db.graph("REQ-001", workspace_slug="other")
        # An incomplete source never retires a memory.
        doc.rename(folder / "preserved.txt")
        sync(tmp_path, db)
        assert db.query("camera")


def test_learn_jsonl_and_cli(tmp_path):
    with SQLiteMDDDriver(tmp_path / "memory" / ".mdd.sqlite") as db:
        learn(db, tmp_path, dict(doc_id="RULE-1", layer="procedural", target="global", title="Rule", content="headless render"), write_md=True)
        rows = db.export_records()
        assert (tmp_path / "memory/raw/RULE-1.md").exists()
        with SQLiteMDDDriver(tmp_path / "other.sqlite") as other:
            assert other.import_jsonl("\n".join(json.dumps(r) for r in rows)) == 1
            assert other.query("headless")[0]["doc_id"] == "RULE-1"
        with pytest.raises(ValueError):
            learn(db, tmp_path, dict(doc_id="../../bad", layer="raw", target="global", title="Bad", content=""), write_md=True)
    runner = CliRunner()
    result = runner.invoke(app, ["db", "query", "headless", "--workspace", str(tmp_path), "--json"])
    assert result.exit_code == 0, result.output
    assert json.loads(result.output)[0]["doc_id"] == "RULE-1"


def test_learn_markdown_update_preserves_original_and_layer(tmp_path):
    record = dict(doc_id='RULE-1',layer='procedural',target='global',title='Rule',content='old')
    with SQLiteMDDDriver(tmp_path / 'memory/.mdd.sqlite') as db:
        learn(db,tmp_path,record,write_md=True)
        learn(db,tmp_path,{**record,'content':'new'},write_md=True)
        backups = list((tmp_path / 'memory/raw').glob('*.bak'))
        assert len(backups) == 1 and 'old' in backups[0].read_text()
        sync(tmp_path,db)
        assert db.query('new',layer='procedural')
        assert not db.query('old')


def test_import_transaction_and_web_aliases(tmp_path):
    with SQLiteMDDDriver(tmp_path / 'db.sqlite') as db:
        row = dict(doc_key='RULE-1',layer='procedural',title='Rule',content_md='camera',workspace_slug='untrusted',target='video-factory')
        assert db.import_jsonl(json.dumps(row),workspace_slug='trusted') == 1
        assert db.query('camera',workspace_slug='trusted')
        assert not db.query('camera',workspace_slug='untrusted')
        valid = {**row,'doc_key':'RULE-2'}
        invalid = {**row,'doc_key':'RULE-3','content_md':[]}
        with pytest.raises(ValueError):
            db.import_jsonl(json.dumps(valid)+'\n'+json.dumps(invalid),workspace_slug='trusted')
        assert [r['doc_id'] for r in db.export_records(workspace_slug='trusted')] == ['RULE-1']


def test_archives_skills_and_bm25(tmp_path):
    memory = tmp_path / 'memory'
    (memory/'decisions').mkdir(parents=True)
    (memory/'decisions/dec-1.md').write_text('---\nid: "DEC-1"\ntitle: "camera"\n---\ncamera camera camera')
    archived = memory/'decisions/archive/original'
    archived.mkdir(parents=True)
    (archived/'dec-1.md').write_text('---\nid: "DEC-1"\ntitle: "Old"\n---\nobsolete')
    for name in ['one','two']:
        folder = tmp_path / '.gemini/skills' / name
        folder.mkdir(parents=True)
        (folder/'SKILL.md').write_text(f'---\nname: "{name}"\n---\nCamera procedures')
    with SQLiteMDDDriver(memory/'.mdd.sqlite') as db:
        sync(tmp_path,db,include_skills=True)
        records = db.export_records()
        assert len(records) == 4
        assert {r['doc_id'] for r in records if r['layer']=='procedural'} == {'SKILL-one','SKILL-two'}
        assert next(r for r in records if r['doc_id']=='DEC-1')['content'].strip() == 'camera camera camera'
        results = db.query('camera')
        assert results[0]['doc_id']=='DEC-1' and len(results)==3


def test_cli_roundtrip_commands(tmp_path):
    runner = CliRunner()
    workspace = ['--workspace',str(tmp_path)]
    args = ['db','learn','--layer','raw','--doc-id','EP-1','--title','Episode','--content','camera','--write-md',*workspace]
    assert runner.invoke(app,args).exit_code == 0
    for command in [['db','sync'],['db','graph','EP-1','--json']]:
        result = runner.invoke(app,[*command,*workspace])
        assert result.exit_code == 0, result.output
    exported = tmp_path/'export.jsonl'
    assert runner.invoke(app,['db','export','--output',str(exported),*workspace]).exit_code == 0
    result = runner.invoke(app,['db','import',str(exported),'--workspace',str(tmp_path/'other')])
    assert result.exit_code == 0,result.output
