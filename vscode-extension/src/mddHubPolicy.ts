import * as path from 'path';

/**
 * Pure policy for the "MDD Hub & Skills Control" view (REQ-090 / BATCH-092).
 * The extension stays a visual client: feedback rules live in `mdd feedback`
 * (mdd-client) and tool logic in conn2flow-hub. This module only builds argv,
 * parses JSON and decides presentation, so it is unit-tested without VS Code.
 */

export type MddServerId = 'mdd-client' | 'conn2flow-hub';
export type MddServerState = 'RUNNING' | 'STOPPED';

export const FEEDBACK_VERDICTS = ['ACCEPT', 'NEEDS_EVIDENCE', 'QUARANTINE', 'REJECT', 'LOCAL_ONLY'] as const;
export type FeedbackVerdict = typeof FEEDBACK_VERDICTS[number];
export const FEEDBACK_GROUP_ORDER = ['PENDING', ...FEEDBACK_VERDICTS] as const;
const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const DEFAULT_MDD_PORT = 8765;

export interface MddServerSpec {
  id: MddServerId;
  command: string;
  args: string[];
  cwd: string;
  /** TCP port probed for liveness (SSE daemon only). */
  port?: number;
  /** stdio servers keep stdin open; closing it ends the process. */
  stdio: boolean;
}

export interface ManagedProcessRecord {
  pid: number;
  startedAt: string;
  port?: number;
}

export interface MddServerStatus {
  id: MddServerId;
  state: MddServerState;
  pid?: number;
  port?: number;
  /** Running process not started by this window (e.g. the VS Code MCP client). Never stopped by the view. */
  external?: boolean;
}

/**
 * Environment for every `mdd` call. Python on Windows writes piped stdout in the ANSI code page
 * (cp1252), so accents in FB-XXX titles arrived corrupted; UTF-8 mode fixes both ends.
 */
export function buildMddEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  return { ...base, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
}

const HUB_ENTRY = /mcp-hub[\\/]+dist[\\/]+index\.js/i;
const NODE_BINARY = /(^|[\\/"'\s])node(\.exe)?["'\s]/i;

/** A conn2flow-hub process is `node … mcp-hub/dist/index.js` (any client may have started it). */
export function isHubCommandLine(commandLine: string | null | undefined): boolean {
  if (!commandLine) return false;
  return HUB_ENTRY.test(commandLine) && NODE_BINARY.test(` ${commandLine} `);
}

/** Read-only process listing, explicit argv, no shell. */
export function buildProcessListCommand(platform = process.platform): { command: string; args: string[] } {
  if (platform === 'win32') {
    return {
      command: 'powershell.exe',
      args: ['-NoProfile', '-NonInteractive', '-Command',
        "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"]
    };
  }
  return { command: 'ps', args: ['-eo', 'pid=,args='] };
}

/** PIDs of hub processes in a process listing, minus the ones this window owns. */
export function parseHubProcesses(output: string, platform = process.platform, ownPids: readonly number[] = []): number[] {
  const rows: Array<{ pid: number; commandLine: string }> = [];
  if (platform === 'win32') {
    const text = output.trim();
    if (!text) return [];
    const parsed = JSON.parse(text);
    for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
      if (item && typeof item === 'object') rows.push({ pid: Number(item.ProcessId), commandLine: String(item.CommandLine ?? '') });
    }
  } else {
    for (const line of output.split(/\r?\n/)) {
      const match = /^\s*(\d+)\s+(.*)$/.exec(line);
      if (match) rows.push({ pid: Number(match[1]), commandLine: match[2] });
    }
  }
  const own = new Set(ownPids);
  return rows.filter(row => Number.isInteger(row.pid) && row.pid > 0 && !own.has(row.pid) && isHubCommandLine(row.commandLine))
    .map(row => row.pid).sort((a, b) => a - b);
}

/** Status for a hub that this window does not own but is running elsewhere. */
export function resolveExternalHubStatus(own: MddServerStatus, externalPids: readonly number[]): MddServerStatus {
  if (own.state === 'RUNNING' || !externalPids.length) return own;
  return { id: own.id, state: 'RUNNING', pid: externalPids[0], external: true };
}

export interface FeedbackRecord {
  id: string;
  title: string;
  status: string;
  verdict: string;
  skill: string;
  kind: string;
  severity: string;
  repo: string;
  summary: string;
  path?: string;
  githubIssue?: string;
  source: 'inbox' | 'github';
}

export interface FeedbackGroup {
  verdict: string;
  items: FeedbackRecord[];
}

export function normalizePort(value: unknown): number {
  const port = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : DEFAULT_MDD_PORT;
}

/** mdd-client: MCP over SSE on 127.0.0.1 plus the memory monitor (`mdd daemon --mcp`). */
export function buildMddClientSpec(mddExecutable: string, projectRoot: string, port: number): MddServerSpec {
  const safePort = normalizePort(port);
  return {
    id: 'mdd-client',
    command: mddExecutable,
    args: ['daemon', '--mcp', '--transport', 'sse', '--port', String(safePort), '--path', projectRoot],
    cwd: projectRoot,
    port: safePort,
    stdio: false
  };
}

/** conn2flow-hub: the TypeScript MCP server (stdio) compiled in mcp-hub/dist. */
export function buildHubSpec(aiWorkspaceRoot: string, nodeExecutable = 'node'): MddServerSpec {
  return {
    id: 'conn2flow-hub',
    command: nodeExecutable,
    args: [path.join(aiWorkspaceRoot, 'mcp-hub', 'dist', 'index.js')],
    cwd: aiWorkspaceRoot,
    stdio: true
  };
}

/** Deterministic stop: Windows kills the whole tree (mdd.exe launches Python). */
export function buildStopCommand(pid: number, platform = process.platform): { command: string; args: string[] } | undefined {
  if (!Number.isInteger(pid) || pid <= 0) return undefined;
  if (platform === 'win32') return { command: 'taskkill', args: ['/PID', String(pid), '/T', '/F'] };
  return { command: 'kill', args: ['-TERM', String(pid)] };
}

export function resolveServerStatus(
  id: MddServerId,
  record: ManagedProcessRecord | undefined,
  pidAlive: boolean,
  portOpen?: boolean
): MddServerStatus {
  if (record && pidAlive && portOpen !== false) {
    return { id, state: 'RUNNING', pid: record.pid, port: record.port };
  }
  return { id, state: 'STOPPED', port: record?.port };
}

export function describeServerStatus(status: MddServerStatus, externalLabel = 'external'): string {
  if (status.state !== 'RUNNING') return 'STOPPED';
  const parts = [`PID ${status.pid}`];
  if (status.port) parts.push(`127.0.0.1:${status.port}`);
  return `${status.external ? `RUNNING (${externalLabel})` : 'RUNNING'} · ${parts.join(' · ')}`;
}

/** Tree context value: external processes expose no Start/Stop/Restart. */
export function serverContextValue(status: MddServerStatus): string {
  if (status.external) return 'mddHubServer.external';
  return status.state === 'RUNNING' ? 'mddHubServer.running' : 'mddHubServer.stopped';
}

/** JSON-RPC initialize line used to confirm the hub answers before reporting RUNNING. */
export function buildHubHandshake(id = 1): string {
  return JSON.stringify({
    jsonrpc: '2.0', id, method: 'initialize',
    params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'conn2flow-vscode', version: '1' } }
  }) + '\n';
}

export function isHubHandshakeReply(output: string, id = 1): boolean {
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const reply = JSON.parse(line);
      if (reply?.id === id && reply?.result?.serverInfo?.name) return true;
    } catch { /* not JSON yet */ }
  }
  return false;
}

export function buildFeedbackListArgs(matrix: string, includeGithub = false): string[] {
  const args = ['feedback', 'list', '--json', '--matrix', matrix];
  if (includeGithub) args.push('--include-github');
  return args;
}

export function validateTriage(feedbackId: string, verdict: string, reason: string): string | undefined {
  if (!/^FB-\d{3,}$/i.test(feedbackId)) return 'invalidId';
  if (!(FEEDBACK_VERDICTS as readonly string[]).includes(verdict)) return 'invalidVerdict';
  if (!reason.trim()) return 'reasonRequired';
  return undefined;
}

export function buildTriageArgs(matrix: string, feedbackId: string, verdict: FeedbackVerdict, reason: string, reviewer = 'curator'): string[] {
  const problem = validateTriage(feedbackId, verdict, reason);
  if (problem) throw new Error(problem);
  return ['feedback', 'triage', feedbackId.toUpperCase(), '--verdict', verdict,
    '--reason', reason.trim().replace(/\s+/g, ' '), '--reviewer', reviewer, '--matrix', matrix, '--json'];
}

/** Parses `mdd feedback list --json` (last JSON line wins, tolerating log noise). */
export function parseFeedbackList(stdout: string): FeedbackRecord[] {
  const lines = stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean).reverse();
  let raw: unknown;
  for (const line of lines) {
    try { raw = JSON.parse(line); break; } catch { /* keep looking */ }
  }
  if (!Array.isArray(raw)) throw new Error('mdd feedback list did not return a JSON array');
  return raw.filter(item => item && typeof item === 'object').map((item: any): FeedbackRecord => ({
    id: String(item.id || ''),
    title: String(item.title || ''),
    status: String(item.status || ''),
    verdict: String(item.verdict || 'PENDING').toUpperCase(),
    skill: String(item.skill || ''),
    kind: String(item.kind || ''),
    severity: String(item.severity || '').toLowerCase(),
    repo: String(item.repo || ''),
    summary: String(item.summary_short || item.title || ''),
    path: item.path ? String(item.path) : undefined,
    githubIssue: item.github_issue ? String(item.github_issue) : undefined,
    source: item.source === 'github' ? 'github' : 'inbox'
  })).filter(record => record.id);
}

/** Groups by verdict in triage order (PENDING first), severity then ID inside each group. */
export function groupFeedback(records: readonly FeedbackRecord[]): FeedbackGroup[] {
  const buckets = new Map<string, FeedbackRecord[]>();
  for (const record of records) {
    const verdict = record.verdict || 'PENDING';
    if (!buckets.has(verdict)) buckets.set(verdict, []);
    buckets.get(verdict)!.push(record);
  }
  const known = FEEDBACK_GROUP_ORDER as readonly string[];
  const order = [...known, ...[...buckets.keys()].filter(key => !known.includes(key)).sort()];
  return order.filter(verdict => buckets.has(verdict)).map(verdict => ({
    verdict,
    items: buckets.get(verdict)!.sort((a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) || a.id.localeCompare(b.id))
  }));
}

export function describeFeedback(record: FeedbackRecord): string {
  return [record.severity, record.skill, record.repo].filter(Boolean).join(' · ');
}

/** Triage only applies to inbox records (GitHub-only items have no FB file yet). */
export function canTriage(record: FeedbackRecord): boolean {
  return record.source === 'inbox' && /^FB-\d{3,}$/i.test(record.id);
}
