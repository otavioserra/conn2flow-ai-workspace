"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeVmConnection = normalizeVmConnection;
exports.buildVmLogCommand = buildVmLogCommand;
exports.describeVmConnection = describeVmConnection;
const USER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const HOST_PATTERN = /^(?:[A-Za-z0-9.-]+|\[[0-9A-Fa-f:]+\])$/;
const REMOTE_PATH_PATTERN = /^\/[A-Za-z0-9._/-]+$/;
function normalizeVmConnection(value) {
    const user = typeof value?.user === 'string' ? value.user.trim() : '';
    const host = typeof value?.host === 'string' ? value.host.trim() : '';
    const targetPath = typeof value?.targetPath === 'string'
        ? value.targetPath.trim().replace(/\\/g, '/').replace(/\/+$/, '')
        : '';
    const port = Number(value?.port ?? 22);
    if (!USER_PATTERN.test(user) || !HOST_PATTERN.test(host))
        return undefined;
    if (!Number.isInteger(port) || port < 1 || port > 65535)
        return undefined;
    const pathSegments = targetPath.split('/');
    if (!REMOTE_PATH_PATTERN.test(targetPath)
        || targetPath === '/'
        || pathSegments.some(segment => segment === '.' || segment === '..'))
        return undefined;
    return { user, host, port, targetPath };
}
function buildVmLogCommand(connection, logName) {
    const normalized = normalizeVmConnection(connection);
    if (!normalized)
        throw new Error('Invalid VM SSH configuration.');
    const remoteLog = `${normalized.targetPath}/logs/${logName}`;
    return `ssh -o BatchMode=yes -o ConnectTimeout=15 -p ${normalized.port} "${normalized.user}@${normalized.host}" "tail -n 100 -- '${remoteLog}'"`;
}
function describeVmConnection(connection) {
    const normalized = normalizeVmConnection(connection);
    return normalized ? `${normalized.user}@${normalized.host}:${normalized.port}` : undefined;
}
//# sourceMappingURL=vmDiagnosticsPolicy.js.map