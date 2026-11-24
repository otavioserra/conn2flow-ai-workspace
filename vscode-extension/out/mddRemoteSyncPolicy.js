"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REMOTE_SKILLS_COMMAND = exports.DEFAULT_REMOTE_MATRIX = void 0;
exports.buildRemoteSyncArgs = buildRemoteSyncArgs;
exports.remoteSyncDue = remoteSyncDue;
exports.parseRemoteSyncReport = parseRemoteSyncReport;
const domainPolicy_1 = require("./domainPolicy");
exports.DEFAULT_REMOTE_MATRIX = 'https://github.com/otavioserra/conn2flow-ai-workspace.git';
exports.REMOTE_SKILLS_COMMAND = 'conn2flow.mddHub.syncRemoteSkills';
function buildRemoteSyncArgs(folder, domain, source, checkOnly) {
    return ['sync', '--remote', checkOnly ? '--check-only' : '--apply', '--json',
        '--path', folder, '--domain', (0, domainPolicy_1.normalizeProjectDomain)(domain), '--source-url', source];
}
function remoteSyncDue(mode, intervalHours, lastAttempt, now) {
    const hours = Number.isFinite(intervalHours) ? Math.max(1, intervalHours) : 24;
    return (mode === 'notify' || mode === 'auto') &&
        (lastAttempt === undefined || lastAttempt > now || now - lastAttempt >= hours * 3_600_000);
}
function parseRemoteSyncReport(stdout) {
    const result = JSON.parse(stdout);
    if (result?.status !== 'PASS' || !Array.isArray(result.available) || !Array.isArray(result.updated) ||
        !Array.isArray(result.conflicts) || !Array.isArray(result.customized) ||
        typeof result.domain !== 'string' || typeof result.revision !== 'string') {
        throw new Error('Invalid remote skill sync response');
    }
    return result;
}
//# sourceMappingURL=mddRemoteSyncPolicy.js.map