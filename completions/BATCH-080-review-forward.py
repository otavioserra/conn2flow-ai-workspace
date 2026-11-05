"""Independent forward test of the multilingual-governance skill in an isolated matrix."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
name = 'c2f-multilingual-skills-governance'
results = []
with tempfile.TemporaryDirectory(prefix='batch080-review-') as temporary:
    matrix = Path(temporary) / 'matrix'
    scripts = matrix / 'scripts/skills'
    scripts.mkdir(parents=True)
    for filename in ['sync-skills.cjs', 'translations.cjs', 'skill-customizations.cjs', 'translated.json']:
        shutil.copyfile(root / 'scripts/skills' / filename, scripts / filename)
    shutil.copytree(root / '.gemini/skills', matrix / '.gemini/skills')
    kit_path = Path('templates/en/templates/spec-driven-project-gemini-kit/.gemini/skills')
    shutil.copytree(root / kit_path, matrix / kit_path)
    translated = matrix / kit_path / name / 'SKILL.md'
    original_translation = translated.read_bytes()
    registry = scripts / 'translated.json'
    initial_registry = json.loads(registry.read_text())

    def run(*arguments):
        report = matrix / 'report.json'
        if report.exists():
            report.unlink()
        process = subprocess.run(['node', str(scripts / 'sync-skills.cjs'), *arguments,
                                  '--repos', 'no-satellite-fixture', '--report', str(report)],
                                 capture_output=True, text=True, encoding='utf-8')
        return process, json.loads(report.read_text()) if report.exists() else None

    process, baseline = run()
    assert process.returncode == 0 and baseline['status'] == 'PASS', process.stdout + process.stderr
    source = matrix / '.gemini/skills' / name / 'SKILL.md'
    source.write_bytes(source.read_bytes() + b'\nReview fixture: source correction after translation.\n')
    before_audit = registry.read_bytes()
    process, drift = run()
    assert process.returncode == 0 and drift['status'] == 'DRIFT_WARNING'
    assert '[DRIFT-WARNING]' in process.stderr
    assert registry.read_bytes() == before_audit and translated.read_bytes() == original_translation
    process, applied = run('--apply', '--all')
    assert process.returncode == 0 and applied['status'] == 'DRIFT_WARNING'
    assert registry.read_bytes() == before_audit and translated.read_bytes() == original_translation
    process, _ = run('--update-translation-hash', name, 'en', '--translator', 'independent-review-fixture')
    assert process.returncode == 0, process.stdout + process.stderr
    updated = json.loads(registry.read_text())
    assert updated['en'][name]['source_sha256'] == hashlib.sha256(source.read_bytes()).hexdigest()
    assert updated['en'][name]['translator'] == 'independent-review-fixture'
    for language, entries in initial_registry.items():
        for other_name, entry in entries.items():
            if (language, other_name) != ('en', name):
                assert updated[language][other_name] == entry
    process, final = run()
    assert process.returncode == 0 and final['status'] == 'PASS'
    assert translated.read_bytes() == original_translation
    results = {'status': 'PASS', 'baseline': baseline['status'], 'audit_after_source_mutation': drift['status'],
               'apply_after_source_mutation': applied['status'], 'acknowledged_audit': final['status'],
               'translation_preserved': True, 'other_registry_entries_preserved': True,
               'scope': 'isolated temporary matrix; no live source/translation mutation'}
(root / 'completions/BATCH-080-review-forward.json').write_text(json.dumps(results, indent=2) + '\n')
print(json.dumps(results))
