const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');

let state;
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
    if (request === 'vscode') return {
        workspace: { get isTrusted() { return state.trusted; }, getConfiguration: () => ({ get: () => '/trusted/mdd' }) },
        window: {
            showWarningMessage: async (message, ...args) => { state.warnings.push(message); return state.confirm ? args.at(-1) : undefined; },
            showQuickPick: async items => state.select ? items[0] : undefined,
            showErrorMessage: message => state.errors.push(message),
            setStatusBarMessage: message => state.status.push(message)
        }
    };
    if (request === './localizationManager') return { LocalizationManager: { t: key => key } };
    if (request === './sddScopeManager') return { SddScopeManager: { getActiveSddRoot: () => state.root, getScopeLabel: () => 'test' } };
    if (request === './workspaceLocator') return { WorkspaceLocator: { getAiWorkspaceRoot: () => undefined } };
    if (request === 'child_process') return { execFile: (command, args, options, callback) => {
        state.calls.push({ command, args, options });
        if (args.includes('--audit')) {
            callback(Object.assign(new Error('audit conflicts'), { code: 1 }), JSON.stringify({ status: 'FAIL', divergentes: state.conflicts }), '');
        } else if (state.stale) {
            callback(new Error('changed since audit'), '', 'changed since audit');
        } else {
            callback(null, '{"status":"PASS"}', '');
        }
    } };
    return originalLoad.call(this, request, parent, isMain);
};
const { MddConflictsManager } = require('../out/providers/mddConflictsManager.js');
Module._load = originalLoad;

function reset() {
    state = { trusted: true, root: path.resolve('project/memory'), confirm: true, select: true,
        calls: [], errors: [], warnings: [], status: [], conflicts: [{
            path: '.claude/skills/example/SKILL.md', skill: 'example', motivo: 'local change',
            local_sha256: 'a'.repeat(64), seed_sha256: 'b'.repeat(64)
        }] };
}

test('MDD UI confirms customization and sends the displayed hash pair to Python', async () => {
    reset();
    await MddConflictsManager.open();
    assert.equal(state.errors.length, 0);
    assert.equal(state.calls.length, 2);
    assert.equal(state.calls[0].command, '/trusted/mdd');
    assert.ok(state.calls[0].args.includes('--audit'));
    assert.deepEqual(state.calls[1].args.slice(-4), ['--local-sha256', 'a'.repeat(64), '--seed-sha256', 'b'.repeat(64)]);
    assert.equal(state.calls[1].options.windowsHide, true);
    assert.equal(state.status.at(-1), 'mdd.customized');
});

test('MDD UI blocks untrusted workspaces and does not write after cancellation', async () => {
    reset();
    state.trusted = false;
    await MddConflictsManager.open();
    assert.equal(state.calls.length, 0);
    reset();
    state.confirm = false;
    await MddConflictsManager.open();
    assert.equal(state.calls.length, 1);
    assert.equal(state.status.length, 0);
});

test('MDD UI surfaces changed conflicts and cannot customize a missing local skill', async () => {
    reset();
    state.stale = true;
    await MddConflictsManager.open();
    assert.deepEqual(state.errors, ['projects.conflictError']);
    assert.equal(state.status.length, 0);
    reset();
    delete state.conflicts[0].local_sha256;
    await MddConflictsManager.open();
    assert.equal(state.calls.length, 1);
});
