const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildAgentPromptIdentity } = require('../out/agentPromptPolicy.js');
const { buildMemorySyncArgs, parseMemorySyncReport } = require('../out/projectConflictsPolicy.js');
const { en, ptBR } = require('../out/localizationCatalog.js');

test('memory scope determines repository identity even with another workspace root', () => {
    const root = path.resolve('C:/repos/conn2flow-home');
    const identity = buildAgentPromptIdentity({ sddRoot: path.join(root, 'memory'), workspaceRoot: path.resolve('C:/repos/conn2flow') });
    assert.equal(identity.root, root);
    assert.equal(identity.repo, 'conn2flow-home');
});

test('MDD labels replace legacy visual labels and preserve command identifiers', () => {
    const manifest = require('../package.json');
    assert.equal(manifest.contributes.views['conn2flow-view-container'][0].name, '%view.mddExplorer%');
    for (const locale of [en, ptBR]) {
        assert.match(locale['section.sdd'], /MDD/);
        assert.doesNotMatch(Object.values(locale).join('\n'), /\bSDD\b/);
        assert.match(locale['mdd.conflictHashes'], /\{seed\}.*\{local\}/);
    }
    assert.ok(manifest.contributes.commands.some(c => c.command === 'conn2flow.sdd.selectScope'));
});

test('sync conflict adapter keeps SHA-256 identities and builds separated arguments', () => {
    const conflict = { path: '.claude/skills/example/SKILL.md', skill: 'example', motivo: 'local differs', local_sha256: 'a'.repeat(64), seed_sha256: 'b'.repeat(64) };
    assert.deepEqual(parseMemorySyncReport(JSON.stringify({ status: 'FAIL', divergentes: [conflict] })), [conflict]);
    const missing = { path: '.codex/skills/example/SKILL.md', skill: 'example', motivo: 'ausente' };
    assert.deepEqual(parseMemorySyncReport(JSON.stringify({ status: 'FAIL', divergentes: [missing, conflict] })), [missing, conflict]);
    assert.deepEqual(buildMemorySyncArgs('C:/repo with spaces'), ['sync', '--path', 'C:/repo with spaces', '--audit']);
    assert.deepEqual(buildMemorySyncArgs('C:/repo', conflict.path), ['sync', '--path', 'C:/repo', '--customize', conflict.path]);
    assert.throws(() => parseMemorySyncReport('{'));
    assert.throws(() => parseMemorySyncReport('{"status":"PASS"}'));
    assert.throws(() => parseMemorySyncReport('{"status":"FAIL","divergentes":[{}]}'));
    assert.throws(() => buildMemorySyncArgs(''));
});

test('MDD conflict UI delegates hash decisions to Python and requires trust', () => {
    const source = fs.readFileSync(path.join(__dirname, '../src/providers/mddConflictsManager.ts'), 'utf8');
    assert.match(source, /if \(!vscode\.workspace\.isTrusted\)/);
    assert.match(source, /execFile\(command, args/);
    assert.match(source, /buildMemorySyncArgs\(root, selected\.conflict\.path, selected\.conflict\)/);
    assert.doesNotMatch(source, /createHash|writeFile/);
});
