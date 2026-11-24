import { ChildProcess, execFile, spawn } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  buildFeedbackListArgs,
  buildHubHandshake,
  buildHubSpec,
  buildMddClientSpec,
  buildMddEnv,
  buildProcessListCommand,
  buildStopCommand,
  buildTriageArgs,
  FeedbackRecord,
  FeedbackVerdict,
  describeFeedback,
  feedbackLabel,
  FEEDBACK_VERDICTS,
  isHubHandshakeReply,
  ManagedProcessRecord,
  MddServerId,
  MddServerSpec,
  MddServerStatus,
  normalizePort,
  parseFeedbackList,
  parseHubProcesses,
  resolveExternalHubStatus,
  resolveServerStatus
} from '../mddHubPolicy';
import { TranslationKey } from '../localizationCatalog';
import { resolveMddExecutable } from '../projectConflictsPolicy';
import { LocalizationManager } from './localizationManager';
import { SddScopeManager } from './sddScopeManager';
import { WorkspaceLocator } from './workspaceLocator';

export const MDD_SERVER_IDS: readonly MddServerId[] = ['mdd-client', 'conn2flow-hub'];

/**
 * Orchestrates mdd-client and conn2flow-hub processes and the `mdd feedback`
 * commands for the MDD Hub view. No feedback or memory rule lives here: every
 * decision is delegated to the CLI, so the view never edits FB-XXX files.
 */
export class MddHubManager {
  private static readonly processesKey = 'conn2flow.mddHub.processes';
  private static readonly githubKey = 'conn2flow.mddHub.includeGithub';
  private static storage: vscode.Memento | undefined;
  private static output: vscode.OutputChannel | undefined;
  private static readonly children = new Map<MddServerId, ChildProcess>();
  private static busy = new Set<MddServerId>();
  private static feedback: FeedbackRecord[] = [];
  private static feedbackError: { message: string } | { key: 'mddHub.matrixMissing' | 'command.trustRequired' } | undefined;
  private static statuses = new Map<MddServerId, MddServerStatus>();

  public static initialize(context: vscode.ExtensionContext): vscode.Disposable {
    this.storage = context.workspaceState;
    this.output = vscode.window.createOutputChannel('Conn2Flow MDD Hub');
    return {
      dispose: () => {
        // stdio children belong to this window; ending stdin lets them exit cleanly.
        for (const child of this.children.values()) child.stdin?.end();
        this.children.clear();
        this.output?.dispose();
      }
    };
  }

  public static serverLabel(id: MddServerId): string {
    return LocalizationManager.t(id === 'mdd-client' ? 'mddHub.server.mddClient' : 'mddHub.server.hub');
  }

  public static isBusy(id: MddServerId): boolean { return this.busy.has(id); }
  public static getCachedStatus(id: MddServerId): MddServerStatus { return this.statuses.get(id) || { id, state: 'STOPPED' }; }
  public static getFeedback(): readonly FeedbackRecord[] { return this.feedback; }
  public static getFeedbackError(): string | undefined {
    const error = this.feedbackError;
    if (error) return 'key' in error ? LocalizationManager.t(error.key) : error.message;
  }
  public static includeGithub(): boolean { return this.storage?.get<boolean>(this.githubKey, false) ?? false; }

  public static async toggleGithub(): Promise<void> {
    await this.storage?.update(this.githubKey, !this.includeGithub());
  }

  // ── Servers ──────────────────────────────────────────────────────────────

  public static async refreshStatuses(): Promise<void> {
    for (const id of MDD_SERVER_IDS) this.statuses.set(id, await this.probe(id));
  }

  public static async start(id: MddServerId): Promise<void> {
    if (!this.ensureTrusted() || this.busy.has(id)) return;
    this.busy.add(id);
    try {
      if ((await this.probe(id)).state === 'RUNNING') {
        vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.alreadyRunning', { server: this.serverLabel(id) }), 3000);
        return;
      }
      const spec = this.buildSpec(id);
      if (!spec) return;
      const record = spec.stdio ? await this.startStdio(spec) : await this.startDaemon(spec);
      await this.saveRecord(id, record);
      vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.started', { server: this.serverLabel(id) }), 4000);
    } catch (error) {
      this.log(`[${id}] start failed: ${this.message(error)}`);
      vscode.window.showErrorMessage(LocalizationManager.t('mddHub.startFailed', {
        server: this.serverLabel(id), message: this.message(error)
      }));
    } finally {
      this.busy.delete(id);
      this.statuses.set(id, await this.probe(id));
    }
  }

  public static async stop(id: MddServerId, quiet = false): Promise<void> {
    if (!this.ensureTrusted() || (this.busy.has(id) && !quiet)) return;
    const record = this.records()[id];
    const child = this.children.get(id);
    if (!record && !child) {
      const cached = this.statuses.get(id);
      if (!quiet && cached?.external) {
        vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.externalNotManaged', {
          server: this.serverLabel(id), pid: String(cached.pid ?? '?')
        }), 6000);
      } else if (!quiet) {
        vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.notRunning', { server: this.serverLabel(id) }), 3000);
      }
      return;
    }
    if (!quiet) this.busy.add(id);
    try {
      if (child && child.exitCode === null) {
        child.stdin?.end();
        await this.waitForExit(child, 1500);
      }
      this.children.delete(id);
      if (record && this.pidAlive(record.pid)) await this.killTree(record.pid);
      await this.saveRecord(id, undefined);
      this.log(`[${id}] stopped (PID ${record?.pid ?? child?.pid ?? '?'})`);
      if (!quiet) vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.stopped', { server: this.serverLabel(id) }), 4000);
    } finally {
      if (!quiet) this.busy.delete(id);
      this.statuses.set(id, await this.probe(id));
    }
  }

  public static async restart(id: MddServerId): Promise<void> {
    if (!this.ensureTrusted() || this.busy.has(id)) return;
    await this.stop(id, true);
    await this.start(id);
  }

  public static async pickServer(placeHolder: string): Promise<MddServerId | undefined> {
    const picked = await vscode.window.showQuickPick(MDD_SERVER_IDS.map(id => ({ label: this.serverLabel(id), id })), { placeHolder });
    return picked?.id;
  }

  private static buildSpec(id: MddServerId): MddServerSpec | undefined {
    const aiRoot = WorkspaceLocator.getAiWorkspaceRoot();
    if (id === 'conn2flow-hub') {
      if (!aiRoot) return this.fail('mddHub.matrixMissing');
      const spec = buildHubSpec(aiRoot, process.platform === 'win32' ? 'node.exe' : 'node');
      if (!fs.existsSync(spec.args[0])) return this.fail('mddHub.hubDistMissing', { path: spec.args[0] });
      return spec;
    }
    const memoryRoot = SddScopeManager.getActiveSddRoot();
    const projectRoot = memoryRoot && path.basename(memoryRoot).toLowerCase() === 'memory' ? path.dirname(memoryRoot) : aiRoot;
    if (!projectRoot) return this.fail('mddHub.matrixMissing');
    const config = vscode.workspace.getConfiguration('conn2flow');
    return buildMddClientSpec(resolveMddExecutable(aiRoot, config.get<string>('mddExecutable')), projectRoot,
      normalizePort(config.get<number>('mddHub.port')));
  }

  private static async startDaemon(spec: MddServerSpec): Promise<ManagedProcessRecord> {
    this.log(`[${spec.id}] ${spec.command} ${spec.args.join(' ')}`);
    if (spec.port && await this.portOpen(spec.port)) {
      throw new Error(LocalizationManager.t('mddHub.portBusy', { port: spec.port }));
    }
    const logFile = this.logFile(spec.id);
    const fd = logFile ? fs.openSync(logFile, 'a') : 'ignore';
    const child = spawn(spec.command, spec.args, {
      cwd: spec.cwd, detached: true, windowsHide: true, shell: false, stdio: ['ignore', fd, fd], env: buildMddEnv()
    });
    if (typeof fd === 'number') fs.closeSync(fd);
    const pid = await this.spawned(child);
    child.unref();
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null || !this.pidAlive(pid)) {
        throw new Error(LocalizationManager.t('mddHub.exitedEarly', { log: logFile || '-' }));
      }
      if (spec.port && await this.portOpen(spec.port)) return { pid, port: spec.port, startedAt: new Date().toISOString() };
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    await this.killTree(pid);
    throw new Error(LocalizationManager.t('mddHub.startTimeout', { log: logFile || '-' }));
  }

  private static async startStdio(spec: MddServerSpec): Promise<ManagedProcessRecord> {
    this.log(`[${spec.id}] ${spec.command} ${spec.args.join(' ')}`);
    const child = spawn(spec.command, spec.args, { cwd: spec.cwd, windowsHide: true, shell: false, stdio: ['pipe', 'pipe', 'pipe'] });
    const pid = await this.spawned(child);
    child.stderr?.on('data', chunk => this.log(`[${spec.id}] ${String(chunk).trimEnd()}`));
    const ready = await new Promise<boolean>(resolve => {
      let buffer = '';
      const timer = setTimeout(() => resolve(false), 5000);
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        if (isHubHandshakeReply(buffer)) {
          clearTimeout(timer);
          child.stdout?.off('data', onData);
          child.stdout?.resume(); // later replies are drained, never buffered.
          resolve(true);
        }
      };
      child.stdout?.on('data', onData);
      child.once('exit', () => { clearTimeout(timer); resolve(false); });
      child.stdin?.write(buildHubHandshake());
    });
    if (!ready) {
      child.stdin?.end();
      if (child.exitCode === null) await this.killTree(pid);
      throw new Error(LocalizationManager.t('mddHub.handshakeFailed'));
    }
    child.once('exit', code => {
      this.children.delete(spec.id);
      this.log(`[${spec.id}] exited (${code ?? 'signal'})`);
    });
    this.children.set(spec.id, child);
    return { pid, startedAt: new Date().toISOString() };
  }

  private static async probe(id: MddServerId): Promise<MddServerStatus> {
    const record = this.records()[id];
    const alive = !!record && this.pidAlive(record.pid);
    if (id === 'conn2flow-hub') {
      // A stdio hub only runs while this window holds its stdin.
      const child = this.children.get(id);
      const own = resolveServerStatus(id, record, alive && !!child && child.exitCode === null);
      if (own.state === 'RUNNING') return own;
      // Hubs started by another client (VS Code MCP, Claude Code…) are shown, never stopped.
      return resolveExternalHubStatus(own, await this.externalHubPids(child?.pid));
    }
    return resolveServerStatus(id, record, alive, record?.port ? await this.portOpen(record.port) : undefined);
  }

  private static externalHubPids(ownPid?: number): Promise<number[]> {
    const listing = buildProcessListCommand();
    return new Promise(resolve => execFile(listing.command, listing.args, {
      windowsHide: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, timeout: 8000
    }, (error, stdout) => {
      if (error) {
        // A failed listing is "unknown", not "zero processes": log it instead of hiding it.
        this.log(`[conn2flow-hub] process listing failed: ${this.message(error)}`);
        resolve([]);
        return;
      }
      try {
        resolve(parseHubProcesses(stdout, process.platform, ownPid ? [ownPid] : []));
      } catch (parseError) {
        this.log(`[conn2flow-hub] process listing unreadable: ${this.message(parseError)}`);
        resolve([]);
      }
    }));
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  public static async loadFeedback(): Promise<void> {
    const matrix = WorkspaceLocator.getAiWorkspaceRoot();
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
      this.feedback = parseFeedbackList(await this.runMdd(buildFeedbackListArgs(matrix, this.includeGithub()), matrix));
      this.feedbackError = undefined;
    } catch (error) {
      this.feedback = [];
      const message = this.message(error);
      this.feedbackError = { message };
      this.log(`[feedback] list failed: ${message}`);
    }
  }

  public static async triage(record?: FeedbackRecord): Promise<boolean> {
    if (!this.ensureTrusted()) return false;
    const matrix = WorkspaceLocator.getAiWorkspaceRoot();
    if (!matrix) { this.fail('mddHub.matrixMissing'); return false; }
    const target = record || await this.pickFeedback();
    if (!target) return false;
    if (target.source !== 'inbox') {
      vscode.window.showWarningMessage(LocalizationManager.t('mddHub.githubOnly'));
      return false;
    }
    const verdict = await vscode.window.showQuickPick(FEEDBACK_VERDICTS.map(value => ({
      label: feedbackLabel(LocalizationManager.currentLocale, 'group', value), description: LocalizationManager.t(`mddHub.verdict.${value}` as TranslationKey), value
    })), { placeHolder: LocalizationManager.t('mddHub.triageVerdict', { id: target.id }) });
    if (!verdict) return false;
    const reason = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('mddHub.triageReason', { id: target.id, verdict: verdict.label }),
      validateInput: value => value.trim() ? undefined : LocalizationManager.t('mddHub.reasonRequired')
    });
    if (!reason?.trim()) return false;
    try {
      await this.runMdd(buildTriageArgs(matrix, target.id, verdict.value as FeedbackVerdict, reason), matrix);
      vscode.window.setStatusBarMessage(LocalizationManager.t('mddHub.triaged', { id: target.id, verdict: verdict.label }), 4000);
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: this.message(error) }));
      return false;
    }
  }

  public static async open(record: FeedbackRecord): Promise<void> {
    const matrix = WorkspaceLocator.getAiWorkspaceRoot();
    if (record.path && matrix) {
      const file = path.resolve(matrix, record.path);
      if (file.startsWith(path.resolve(matrix) + path.sep) && fs.existsSync(file)) {
        await vscode.window.showTextDocument(vscode.Uri.file(file), { preview: true });
        return;
      }
    }
    if (record.githubIssue?.startsWith('https://')) await vscode.env.openExternal(vscode.Uri.parse(record.githubIssue));
  }

  private static async pickFeedback(): Promise<FeedbackRecord | undefined> {
    if (!this.feedback.length) await this.loadFeedback();
    const picked = await vscode.window.showQuickPick(this.feedback.filter(item => item.source === 'inbox').map(item => ({
      label: item.id, description: [feedbackLabel(LocalizationManager.currentLocale, 'group', item.verdict), describeFeedback(item, LocalizationManager.currentLocale)].filter(Boolean).join(' · '), detail: item.summary, item
    })), { placeHolder: LocalizationManager.t('mddHub.selectFeedback') });
    return picked?.item;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Runs `mdd` with explicit argv in UTF-8 mode (no shell). Shared with the bootstrap command. */
  public static runMdd(args: string[], cwd: string, timeout = 120000): Promise<string> {
    const command = resolveMddExecutable(WorkspaceLocator.getAiWorkspaceRoot(),
      vscode.workspace.getConfiguration('conn2flow').get<string>('mddExecutable'));
    return new Promise((resolve, reject) => execFile(command, args, {
      cwd, windowsHide: true, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout, env: buildMddEnv()
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr.trim() || stdout.trim() || error.message));
        return;
      }
      resolve(stdout);
    }));
  }

  private static records(): Partial<Record<MddServerId, ManagedProcessRecord>> {
    return this.storage?.get<Partial<Record<MddServerId, ManagedProcessRecord>>>(this.processesKey, {}) || {};
  }

  private static async saveRecord(id: MddServerId, record: ManagedProcessRecord | undefined): Promise<void> {
    const next = { ...this.records() };
    if (record) next[id] = record; else delete next[id];
    await this.storage?.update(this.processesKey, next);
  }

  private static pidAlive(pid: number): boolean {
    try { process.kill(pid, 0); return true; } catch (error: any) { return error?.code === 'EPERM'; }
  }

  private static portOpen(port: number): Promise<boolean> {
    return new Promise(resolve => {
      const socket = net.connect({ host: '127.0.0.1', port });
      const done = (open: boolean) => { socket.destroy(); resolve(open); };
      socket.setTimeout(500, () => done(false));
      socket.once('connect', () => done(true));
      socket.once('error', () => done(false));
    });
  }

  private static spawned(child: ChildProcess): Promise<number> {
    return new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('spawn', () => child.pid ? resolve(child.pid) : reject(new Error('spawn without PID')));
    });
  }

  private static waitForExit(child: ChildProcess, timeout: number): Promise<void> {
    return new Promise(resolve => {
      if (child.exitCode !== null) { resolve(); return; }
      const timer = setTimeout(resolve, timeout);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    });
  }

  private static killTree(pid: number): Promise<void> {
    const stop = buildStopCommand(pid);
    if (!stop) return Promise.resolve();
    return new Promise(resolve => execFile(stop.command, stop.args, { windowsHide: true }, () => resolve()));
  }

  private static logFile(id: MddServerId): string | undefined {
    try {
      const dir = path.join(os.tmpdir(), 'conn2flow-mdd-hub');
      fs.mkdirSync(dir, { recursive: true });
      return path.join(dir, `${id}.log`);
    } catch {
      return undefined;
    }
  }

  private static ensureTrusted(): boolean {
    if (vscode.workspace.isTrusted) return true;
    vscode.window.showWarningMessage(LocalizationManager.t('command.trustRequired'));
    return false;
  }

  private static fail(key: 'mddHub.matrixMissing' | 'mddHub.hubDistMissing', values: Record<string, string> = {}): undefined {
    vscode.window.showErrorMessage(LocalizationManager.t(key, values));
    return undefined;
  }

  private static log(message: string): void { this.output?.appendLine(`${new Date().toISOString()} ${message}`); }
  private static message(error: unknown): string { return error instanceof Error ? error.message : String(error); }
}
