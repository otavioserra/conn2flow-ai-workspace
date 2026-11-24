"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MddHubManager = exports.MDD_SERVER_IDS = void 0;
const child_process_1 = require("child_process");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const vscode = require("vscode");
const mddHubPolicy_1 = require("../mddHubPolicy");
const projectConflictsPolicy_1 = require("../projectConflictsPolicy");
const localizationManager_1 = require("./localizationManager");
const sddScopeManager_1 = require("./sddScopeManager");
const workspaceLocator_1 = require("./workspaceLocator");
exports.MDD_SERVER_IDS = ['mdd-client', 'conn2flow-hub'];
/**
 * Orchestrates mdd-client and conn2flow-hub processes and the `mdd feedback`
 * commands for the MDD Hub view. No feedback or memory rule lives here: every
 * decision is delegated to the CLI, so the view never edits FB-XXX files.
 */
class MddHubManager {
    static processesKey = 'conn2flow.mddHub.processes';
    static githubKey = 'conn2flow.mddHub.includeGithub';
    static storage;
    static output;
    static children = new Map();
    static busy = new Set();
    static feedback = [];
    static feedbackError;
    static statuses = new Map();
    static initialize(context) {
        this.storage = context.workspaceState;
        this.output = vscode.window.createOutputChannel('Conn2Flow MDD Hub');
        return {
            dispose: () => {
                // stdio children belong to this window; ending stdin lets them exit cleanly.
                for (const child of this.children.values())
                    child.stdin?.end();
                this.children.clear();
                this.output?.dispose();
            }
        };
    }
    static serverLabel(id) {
        return localizationManager_1.LocalizationManager.t(id === 'mdd-client' ? 'mddHub.server.mddClient' : 'mddHub.server.hub');
    }
    static isBusy(id) { return this.busy.has(id); }
    static getCachedStatus(id) { return this.statuses.get(id) || { id, state: 'STOPPED' }; }
    static getFeedback() { return this.feedback; }
    static getFeedbackError() {
        const error = this.feedbackError;
        if (error)
            return 'key' in error ? localizationManager_1.LocalizationManager.t(error.key) : error.message;
    }
    static includeGithub() { return this.storage?.get(this.githubKey, false) ?? false; }
    static async toggleGithub() {
        await this.storage?.update(this.githubKey, !this.includeGithub());
    }
    // ── Servers ──────────────────────────────────────────────────────────────
    static async refreshStatuses() {
        for (const id of exports.MDD_SERVER_IDS)
            this.statuses.set(id, await this.probe(id));
    }
    static async start(id) {
        if (!this.ensureTrusted() || this.busy.has(id))
            return;
        this.busy.add(id);
        try {
            if ((await this.probe(id)).state === 'RUNNING') {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.alreadyRunning', { server: this.serverLabel(id) }), 3000);
                return;
            }
            const spec = this.buildSpec(id);
            if (!spec)
                return;
            const record = spec.stdio ? await this.startStdio(spec) : await this.startDaemon(spec);
            await this.saveRecord(id, record);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.started', { server: this.serverLabel(id) }), 4000);
        }
        catch (error) {
            this.log(`[${id}] start failed: ${this.message(error)}`);
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('mddHub.startFailed', {
                server: this.serverLabel(id), message: this.message(error)
            }));
        }
        finally {
            this.busy.delete(id);
            this.statuses.set(id, await this.probe(id));
        }
    }
    static async stop(id, quiet = false) {
        if (!this.ensureTrusted() || (this.busy.has(id) && !quiet))
            return;
        const record = this.records()[id];
        const child = this.children.get(id);
        if (!record && !child) {
            const cached = this.statuses.get(id);
            if (!quiet && cached?.external) {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.externalNotManaged', {
                    server: this.serverLabel(id), pid: String(cached.pid ?? '?')
                }), 6000);
            }
            else if (!quiet) {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.notRunning', { server: this.serverLabel(id) }), 3000);
            }
            return;
        }
        if (!quiet)
            this.busy.add(id);
        try {
            if (child && child.exitCode === null) {
                child.stdin?.end();
                await this.waitForExit(child, 1500);
            }
            this.children.delete(id);
            if (record && this.pidAlive(record.pid))
                await this.killTree(record.pid);
            await this.saveRecord(id, undefined);
            this.log(`[${id}] stopped (PID ${record?.pid ?? child?.pid ?? '?'})`);
            if (!quiet)
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.stopped', { server: this.serverLabel(id) }), 4000);
        }
        finally {
            if (!quiet)
                this.busy.delete(id);
            this.statuses.set(id, await this.probe(id));
        }
    }
    static async restart(id) {
        if (!this.ensureTrusted() || this.busy.has(id))
            return;
        await this.stop(id, true);
        await this.start(id);
    }
    static async pickServer(placeHolder) {
        const picked = await vscode.window.showQuickPick(exports.MDD_SERVER_IDS.map(id => ({ label: this.serverLabel(id), id })), { placeHolder });
        return picked?.id;
    }
    static buildSpec(id) {
        const aiRoot = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        if (id === 'conn2flow-hub') {
            if (!aiRoot)
                return this.fail('mddHub.matrixMissing');
            const spec = (0, mddHubPolicy_1.buildHubSpec)(aiRoot, process.platform === 'win32' ? 'node.exe' : 'node');
            if (!fs.existsSync(spec.args[0]))
                return this.fail('mddHub.hubDistMissing', { path: spec.args[0] });
            return spec;
        }
        const memoryRoot = sddScopeManager_1.SddScopeManager.getActiveSddRoot();
        const projectRoot = memoryRoot && path.basename(memoryRoot).toLowerCase() === 'memory' ? path.dirname(memoryRoot) : aiRoot;
        if (!projectRoot)
            return this.fail('mddHub.matrixMissing');
        const config = vscode.workspace.getConfiguration('conn2flow');
        return (0, mddHubPolicy_1.buildMddClientSpec)((0, projectConflictsPolicy_1.resolveMddExecutable)(aiRoot, config.get('mddExecutable')), projectRoot, (0, mddHubPolicy_1.normalizePort)(config.get('mddHub.port')));
    }
    static async startDaemon(spec) {
        this.log(`[${spec.id}] ${spec.command} ${spec.args.join(' ')}`);
        if (spec.port && await this.portOpen(spec.port)) {
            throw new Error(localizationManager_1.LocalizationManager.t('mddHub.portBusy', { port: spec.port }));
        }
        const logFile = this.logFile(spec.id);
        const fd = logFile ? fs.openSync(logFile, 'a') : 'ignore';
        const child = (0, child_process_1.spawn)(spec.command, spec.args, {
            cwd: spec.cwd, detached: true, windowsHide: true, shell: false, stdio: ['ignore', fd, fd], env: (0, mddHubPolicy_1.buildMddEnv)()
        });
        if (typeof fd === 'number')
            fs.closeSync(fd);
        const pid = await this.spawned(child);
        child.unref();
        const deadline = Date.now() + 15000;
        while (Date.now() < deadline) {
            if (child.exitCode !== null || !this.pidAlive(pid)) {
                throw new Error(localizationManager_1.LocalizationManager.t('mddHub.exitedEarly', { log: logFile || '-' }));
            }
            if (spec.port && await this.portOpen(spec.port))
                return { pid, port: spec.port, startedAt: new Date().toISOString() };
            await new Promise(resolve => setTimeout(resolve, 250));
        }
        await this.killTree(pid);
        throw new Error(localizationManager_1.LocalizationManager.t('mddHub.startTimeout', { log: logFile || '-' }));
    }
    static async startStdio(spec) {
        this.log(`[${spec.id}] ${spec.command} ${spec.args.join(' ')}`);
        const child = (0, child_process_1.spawn)(spec.command, spec.args, { cwd: spec.cwd, windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
        const pid = await this.spawned(child);
        child.stderr?.on('data', chunk => this.log(`[${spec.id}] ${String(chunk).trimEnd()}`));
        const ready = await new Promise(resolve => {
            let buffer = '';
            const timer = setTimeout(() => resolve(false), 5000);
            const onData = (chunk) => {
                buffer += chunk.toString('utf8');
                if ((0, mddHubPolicy_1.isHubHandshakeReply)(buffer)) {
                    clearTimeout(timer);
                    child.stdout?.off('data', onData);
                    child.stdout?.resume(); // later replies are drained, never buffered.
                    resolve(true);
                }
            };
            child.stdout?.on('data', onData);
            child.once('exit', () => { clearTimeout(timer); resolve(false); });
            child.stdin?.write((0, mddHubPolicy_1.buildHubHandshake)());
        });
        if (!ready) {
            child.stdin?.end();
            if (child.exitCode === null)
                await this.killTree(pid);
            throw new Error(localizationManager_1.LocalizationManager.t('mddHub.handshakeFailed'));
        }
        child.once('exit', code => {
            this.children.delete(spec.id);
            this.log(`[${spec.id}] exited (${code ?? 'signal'})`);
        });
        this.children.set(spec.id, child);
        return { pid, startedAt: new Date().toISOString() };
    }
    static async probe(id) {
        const record = this.records()[id];
        const alive = !!record && this.pidAlive(record.pid);
        if (id === 'conn2flow-hub') {
            // A stdio hub only runs while this window holds its stdin.
            const child = this.children.get(id);
            const own = (0, mddHubPolicy_1.resolveServerStatus)(id, record, alive && !!child && child.exitCode === null);
            if (own.state === 'RUNNING')
                return own;
            // Hubs started by another client (VS Code MCP, Claude Code…) are shown, never stopped.
            return (0, mddHubPolicy_1.resolveExternalHubStatus)(own, await this.externalHubPids(child?.pid));
        }
        return (0, mddHubPolicy_1.resolveServerStatus)(id, record, alive, record?.port ? await this.portOpen(record.port) : undefined);
    }
    static externalHubPids(ownPid) {
        const listing = (0, mddHubPolicy_1.buildProcessListCommand)();
        return new Promise(resolve => (0, child_process_1.execFile)(listing.command, listing.args, {
            windowsHide: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 8000
        }, (error, stdout) => {
            if (error) {
                // A failed listing is "unknown", not "zero processes": log it instead of hiding it.
                this.log(`[conn2flow-hub] process listing failed: ${this.message(error)}`);
                resolve([]);
                return;
            }
            try {
                resolve((0, mddHubPolicy_1.parseHubProcesses)(stdout, process.platform, ownPid ? [ownPid] : []));
            }
            catch (parseError) {
                this.log(`[conn2flow-hub] process listing unreadable: ${this.message(parseError)}`);
                resolve([]);
            }
        }));
    }
    // ── Feedback ─────────────────────────────────────────────────────────────
    static async loadFeedback() {
        const matrix = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        if (!matrix) {
            this.feedback = [];
            this.feedbackError = { key: 'mddHub.matrixMissing' };
            return;
        }
        if (!vscode.workspace.isTrusted) {
            this.feedback = [];
            this.feedbackError = { key: 'command.trustRequired' };
            return;
        }
        try {
            this.feedback = (0, mddHubPolicy_1.parseFeedbackList)(await this.runMdd((0, mddHubPolicy_1.buildFeedbackListArgs)(matrix, this.includeGithub()), matrix));
            this.feedbackError = undefined;
        }
        catch (error) {
            this.feedback = [];
            const message = this.message(error);
            this.feedbackError = { message };
            this.log(`[feedback] list failed: ${message}`);
        }
    }
    static async triage(record) {
        if (!this.ensureTrusted())
            return false;
        const matrix = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        if (!matrix) {
            this.fail('mddHub.matrixMissing');
            return false;
        }
        const target = record || await this.pickFeedback();
        if (!target)
            return false;
        if (target.source !== 'inbox') {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('mddHub.githubOnly'));
            return false;
        }
        const verdict = await vscode.window.showQuickPick(mddHubPolicy_1.FEEDBACK_VERDICTS.map(value => ({
            label: (0, mddHubPolicy_1.feedbackLabel)(localizationManager_1.LocalizationManager.currentLocale, 'group', value), description: localizationManager_1.LocalizationManager.t(`mddHub.verdict.${value}`), value
        })), { placeHolder: localizationManager_1.LocalizationManager.t('mddHub.triageVerdict', { id: target.id }) });
        if (!verdict)
            return false;
        const reason = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('mddHub.triageReason', { id: target.id, verdict: verdict.label }),
            validateInput: value => value.trim() ? undefined : localizationManager_1.LocalizationManager.t('mddHub.reasonRequired')
        });
        if (!reason?.trim())
            return false;
        try {
            await this.runMdd((0, mddHubPolicy_1.buildTriageArgs)(matrix, target.id, verdict.value, reason), matrix);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('mddHub.triaged', { id: target.id, verdict: verdict.label }), 4000);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: this.message(error) }));
            return false;
        }
    }
    static async open(record) {
        const matrix = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        if (record.path && matrix) {
            const file = path.resolve(matrix, record.path);
            if (file.startsWith(path.resolve(matrix) + path.sep) && fs.existsSync(file)) {
                await vscode.window.showTextDocument(vscode.Uri.file(file), { preview: true });
                return;
            }
        }
        if (record.githubIssue?.startsWith('https://'))
            await vscode.env.openExternal(vscode.Uri.parse(record.githubIssue));
    }
    static async pickFeedback() {
        if (!this.feedback.length)
            await this.loadFeedback();
        const picked = await vscode.window.showQuickPick(this.feedback.filter(item => item.source === 'inbox').map(item => ({
            label: item.id, description: [(0, mddHubPolicy_1.feedbackLabel)(localizationManager_1.LocalizationManager.currentLocale, 'group', item.verdict), (0, mddHubPolicy_1.describeFeedback)(item, localizationManager_1.LocalizationManager.currentLocale)].filter(Boolean).join(' · '), detail: item.summary, item
        })), { placeHolder: localizationManager_1.LocalizationManager.t('mddHub.selectFeedback') });
        return picked?.item;
    }
    // ── Helpers ──────────────────────────────────────────────────────────────
    /** Runs `mdd` with explicit argv in UTF-8 mode (no shell). Shared with the bootstrap command. */
    static runMdd(args, cwd, timeout = 120000) {
        const command = (0, projectConflictsPolicy_1.resolveMddExecutable)(workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot(), vscode.workspace.getConfiguration('conn2flow').get('mddExecutable'));
        return new Promise((resolve, reject) => (0, child_process_1.execFile)(command, args, {
            cwd, windowsHide: true, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout, env: (0, mddHubPolicy_1.buildMddEnv)()
        }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr.trim() || stdout.trim() || error.message));
                return;
            }
            resolve(stdout);
        }));
    }
    static records() {
        return this.storage?.get(this.processesKey, {}) || {};
    }
    static async saveRecord(id, record) {
        const next = { ...this.records() };
        if (record)
            next[id] = record;
        else
            delete next[id];
        await this.storage?.update(this.processesKey, next);
    }
    static pidAlive(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch (error) {
            return error?.code === 'EPERM';
        }
    }
    static portOpen(port) {
        return new Promise(resolve => {
            const socket = net.connect({ host: '127.0.0.1', port });
            const done = (open) => { socket.destroy(); resolve(open); };
            socket.setTimeout(500, () => done(false));
            socket.once('connect', () => done(true));
            socket.once('error', () => done(false));
        });
    }
    static spawned(child) {
        return new Promise((resolve, reject) => {
            child.once('error', reject);
            child.once('spawn', () => child.pid ? resolve(child.pid) : reject(new Error('spawn without PID')));
        });
    }
    static waitForExit(child, timeout) {
        return new Promise(resolve => {
            if (child.exitCode !== null) {
                resolve();
                return;
            }
            const timer = setTimeout(resolve, timeout);
            child.once('exit', () => { clearTimeout(timer); resolve(); });
        });
    }
    static killTree(pid) {
        const stop = (0, mddHubPolicy_1.buildStopCommand)(pid);
        if (!stop)
            return Promise.resolve();
        return new Promise(resolve => (0, child_process_1.execFile)(stop.command, stop.args, { windowsHide: true }, () => resolve()));
    }
    static logFile(id) {
        try {
            const dir = path.join(os.tmpdir(), 'conn2flow-mdd-hub');
            fs.mkdirSync(dir, { recursive: true });
            return path.join(dir, `${id}.log`);
        }
        catch {
            return undefined;
        }
    }
    static ensureTrusted() {
        if (vscode.workspace.isTrusted)
            return true;
        vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'));
        return false;
    }
    static fail(key, values = {}) {
        vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t(key, values));
        return undefined;
    }
    static log(message) { this.output?.appendLine(`${new Date().toISOString()} ${message}`); }
    static message(error) { return error instanceof Error ? error.message : String(error); }
}
exports.MddHubManager = MddHubManager;
//# sourceMappingURL=mddHubManager.js.map