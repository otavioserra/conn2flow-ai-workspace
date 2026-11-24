"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_MDD_PORT = exports.FEEDBACK_GROUP_ORDER = exports.FEEDBACK_VERDICTS = void 0;
exports.buildMddEnv = buildMddEnv;
exports.isHubCommandLine = isHubCommandLine;
exports.buildProcessListCommand = buildProcessListCommand;
exports.parseHubProcesses = parseHubProcesses;
exports.resolveExternalHubStatus = resolveExternalHubStatus;
exports.normalizePort = normalizePort;
exports.buildMddClientSpec = buildMddClientSpec;
exports.buildHubSpec = buildHubSpec;
exports.buildStopCommand = buildStopCommand;
exports.resolveServerStatus = resolveServerStatus;
exports.describeServerStatus = describeServerStatus;
exports.serverContextValue = serverContextValue;
exports.buildHubHandshake = buildHubHandshake;
exports.isHubHandshakeReply = isHubHandshakeReply;
exports.buildFeedbackListArgs = buildFeedbackListArgs;
exports.validateTriage = validateTriage;
exports.buildTriageArgs = buildTriageArgs;
exports.parseFeedbackList = parseFeedbackList;
exports.groupFeedback = groupFeedback;
exports.describeFeedback = describeFeedback;
exports.canTriage = canTriage;
const path = require("path");
exports.FEEDBACK_VERDICTS = ['ACCEPT', 'NEEDS_EVIDENCE', 'QUARANTINE', 'REJECT', 'LOCAL_ONLY'];
exports.FEEDBACK_GROUP_ORDER = ['PENDING', ...exports.FEEDBACK_VERDICTS];
const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };
exports.DEFAULT_MDD_PORT = 8765;
/**
 * Environment for every `mdd` call. Python on Windows writes piped stdout in the ANSI code page
 * (cp1252), so accents in FB-XXX titles arrived corrupted; UTF-8 mode fixes both ends.
 */
function buildMddEnv(base = process.env) {
    return { ...base, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
}
const HUB_ENTRY = /mcp-hub[\\/]+dist[\\/]+index\.js/i;
const NODE_BINARY = /(^|[\\/"'\s])node(\.exe)?["'\s]/i;
/** A conn2flow-hub process is `node … mcp-hub/dist/index.js` (any client may have started it). */
function isHubCommandLine(commandLine) {
    if (!commandLine)
        return false;
    return HUB_ENTRY.test(commandLine) && NODE_BINARY.test(` ${commandLine} `);
}
/** Read-only process listing, explicit argv, no shell. */
function buildProcessListCommand(platform = process.platform) {
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
function parseHubProcesses(output, platform = process.platform, ownPids = []) {
    const rows = [];
    if (platform === 'win32') {
        const text = output.trim();
        if (!text)
            return [];
        const parsed = JSON.parse(text);
        for (const item of Array.isArray(parsed) ? parsed : [parsed]) {
            if (item && typeof item === 'object')
                rows.push({ pid: Number(item.ProcessId), commandLine: String(item.CommandLine ?? '') });
        }
    }
    else {
        for (const line of output.split(/\r?\n/)) {
            const match = /^\s*(\d+)\s+(.*)$/.exec(line);
            if (match)
                rows.push({ pid: Number(match[1]), commandLine: match[2] });
        }
    }
    const own = new Set(ownPids);
    return rows.filter(row => Number.isInteger(row.pid) && row.pid > 0 && !own.has(row.pid) && isHubCommandLine(row.commandLine))
        .map(row => row.pid).sort((a, b) => a - b);
}
/** Status for a hub that this window does not own but is running elsewhere. */
function resolveExternalHubStatus(own, externalPids) {
    if (own.state === 'RUNNING' || !externalPids.length)
        return own;
    return { id: own.id, state: 'RUNNING', pid: externalPids[0], external: true };
}
function normalizePort(value) {
    const port = typeof value === 'number' ? value : Number(value);
    return Number.isInteger(port) && port >= 1 && port <= 65535 ? port : exports.DEFAULT_MDD_PORT;
}
/** mdd-client: MCP over SSE on 127.0.0.1 plus the memory monitor (`mdd daemon --mcp`). */
function buildMddClientSpec(mddExecutable, projectRoot, port) {
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
function buildHubSpec(aiWorkspaceRoot, nodeExecutable = 'node') {
    return {
        id: 'conn2flow-hub',
        command: nodeExecutable,
        args: [path.join(aiWorkspaceRoot, 'mcp-hub', 'dist', 'index.js')],
        cwd: aiWorkspaceRoot,
        stdio: true
    };
}
/** Deterministic stop: Windows kills the whole tree (mdd.exe launches Python). */
function buildStopCommand(pid, platform = process.platform) {
    if (!Number.isInteger(pid) || pid <= 0)
        return undefined;
    if (platform === 'win32')
        return { command: 'taskkill', args: ['/PID', String(pid), '/T', '/F'] };
    return { command: 'kill', args: ['-TERM', String(pid)] };
}
function resolveServerStatus(id, record, pidAlive, portOpen) {
    if (record && pidAlive && portOpen !== false) {
        return { id, state: 'RUNNING', pid: record.pid, port: record.port };
    }
    return { id, state: 'STOPPED', port: record?.port };
}
function describeServerStatus(status, externalLabel = 'external') {
    if (status.state !== 'RUNNING')
        return 'STOPPED';
    const parts = [`PID ${status.pid}`];
    if (status.port)
        parts.push(`127.0.0.1:${status.port}`);
    return `${status.external ? `RUNNING (${externalLabel})` : 'RUNNING'} · ${parts.join(' · ')}`;
}
/** Tree context value: external processes expose no Start/Stop/Restart. */
function serverContextValue(status) {
    if (status.external)
        return 'mddHubServer.external';
    return status.state === 'RUNNING' ? 'mddHubServer.running' : 'mddHubServer.stopped';
}
/** JSON-RPC initialize line used to confirm the hub answers before reporting RUNNING. */
function buildHubHandshake(id = 1) {
    return JSON.stringify({
        jsonrpc: '2.0', id, method: 'initialize',
        params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'conn2flow-vscode', version: '1' } }
    }) + '\n';
}
function isHubHandshakeReply(output, id = 1) {
    for (const line of output.split(/\r?\n/)) {
        if (!line.trim())
            continue;
        try {
            const reply = JSON.parse(line);
            if (reply?.id === id && reply?.result?.serverInfo?.name)
                return true;
        }
        catch { /* not JSON yet */ }
    }
    return false;
}
function buildFeedbackListArgs(matrix, includeGithub = false) {
    const args = ['feedback', 'list', '--json', '--matrix', matrix];
    if (includeGithub)
        args.push('--include-github');
    return args;
}
function validateTriage(feedbackId, verdict, reason) {
    if (!/^FB-\d{3,}$/i.test(feedbackId))
        return 'invalidId';
    if (!exports.FEEDBACK_VERDICTS.includes(verdict))
        return 'invalidVerdict';
    if (!reason.trim())
        return 'reasonRequired';
    return undefined;
}
function buildTriageArgs(matrix, feedbackId, verdict, reason, reviewer = 'curator') {
    const problem = validateTriage(feedbackId, verdict, reason);
    if (problem)
        throw new Error(problem);
    return ['feedback', 'triage', feedbackId.toUpperCase(), '--verdict', verdict,
        '--reason', reason.trim().replace(/\s+/g, ' '), '--reviewer', reviewer, '--matrix', matrix, '--json'];
}
/** Parses `mdd feedback list --json` (last JSON line wins, tolerating log noise). */
function parseFeedbackList(stdout) {
    const lines = stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean).reverse();
    let raw;
    for (const line of lines) {
        try {
            raw = JSON.parse(line);
            break;
        }
        catch { /* keep looking */ }
    }
    if (!Array.isArray(raw))
        throw new Error('mdd feedback list did not return a JSON array');
    return raw.filter(item => item && typeof item === 'object').map((item) => ({
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
function groupFeedback(records) {
    const buckets = new Map();
    for (const record of records) {
        const verdict = record.verdict || 'PENDING';
        if (!buckets.has(verdict))
            buckets.set(verdict, []);
        buckets.get(verdict).push(record);
    }
    const known = exports.FEEDBACK_GROUP_ORDER;
    const order = [...known, ...[...buckets.keys()].filter(key => !known.includes(key)).sort()];
    return order.filter(verdict => buckets.has(verdict)).map(verdict => ({
        verdict,
        items: buckets.get(verdict).sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) || a.id.localeCompare(b.id))
    }));
}
function describeFeedback(record) {
    return [record.severity, record.skill, record.repo].filter(Boolean).join(' · ');
}
/** Triage only applies to inbox records (GitHub-only items have no FB file yet). */
function canTriage(record) {
    return record.source === 'inbox' && /^FB-\d{3,}$/i.test(record.id);
}
//# sourceMappingURL=mddHubPolicy.js.map