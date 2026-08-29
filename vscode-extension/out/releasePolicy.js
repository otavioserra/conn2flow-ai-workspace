"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bumpSemver = bumpSemver;
exports.classifyViewerPermission = classifyViewerPermission;
exports.githubRepositoryUrl = githubRepositoryUrl;
exports.quoteShellArg = quoteShellArg;
function bumpSemver(version, increment) {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match)
        throw new Error(`Invalid semantic version: ${version}`);
    const major = Number(match[1]);
    const minor = Number(match[2]);
    const patch = Number(match[3]);
    if (increment === 'major')
        return `${major + 1}.0.0`;
    if (increment === 'minor')
        return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
}
function classifyViewerPermission(permission) {
    if (!permission)
        return 'unknown';
    return ['WRITE', 'MAINTAIN', 'ADMIN'].includes(permission.toUpperCase()) ? 'allowed' : 'denied';
}
function githubRepositoryUrl(remote) {
    const match = remote.trim().match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
    return match ? `https://github.com/${match[1]}/${match[2]}` : undefined;
}
function quoteShellArg(value, shell) {
    if (shell === 'bash')
        return `'${value.replace(/'/g, `'"'"'`)}'`;
    if (shell === 'powershell')
        return `'${value.replace(/'/g, "''")}'`;
    return `"${value.replace(/"/g, '""')}"`;
}
//# sourceMappingURL=releasePolicy.js.map