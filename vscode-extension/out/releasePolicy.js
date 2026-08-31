"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_RELEASE_DOCUMENTS = void 0;
exports.selectWorkflowRun = selectWorkflowRun;
exports.inspectReleaseDocumentPaths = inspectReleaseDocumentPaths;
exports.inspectReleaseDocumentContents = inspectReleaseDocumentContents;
exports.evaluateReleaseGate = evaluateReleaseGate;
exports.createReleaseDraftSuggestion = createReleaseDraftSuggestion;
exports.bumpSemver = bumpSemver;
exports.replaceReleaseVersionMentions = replaceReleaseVersionMentions;
exports.classifyViewerPermission = classifyViewerPermission;
exports.githubRepositoryUrl = githubRepositoryUrl;
exports.quoteShellArg = quoteShellArg;
exports.REQUIRED_RELEASE_DOCUMENTS = ['README.md', 'README-PT-BR.md', 'CHANGELOG.md'];
function normalizeWorkflowRunValue(value) {
    return String(value || '').toLocaleLowerCase('en-US');
}
function selectWorkflowRun(runs, tag, triggeredAfter) {
    const threshold = triggeredAfter.getTime();
    const eligible = runs
        .filter(run => {
        const createdAt = Date.parse(run.createdAt);
        const status = normalizeWorkflowRunValue(run.status);
        const conclusion = normalizeWorkflowRunValue(run.conclusion);
        return Number.isInteger(run.databaseId) &&
            run.headBranch === tag &&
            Number.isFinite(createdAt) &&
            createdAt >= threshold &&
            !(status === 'completed' && conclusion === 'failure');
    })
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
    const latest = eligible[0];
    if (!latest)
        return undefined;
    if (normalizeWorkflowRunValue(latest.status) === 'completed' &&
        normalizeWorkflowRunValue(latest.conclusion) === 'success') {
        return latest;
    }
    return eligible.find(run => {
        const status = normalizeWorkflowRunValue(run.status);
        return status === 'in_progress' || status === 'queued';
    });
}
function normalizeReleasePath(value) {
    return value.replace(/\\/g, '/').replace(/^\.\//, '').toLocaleLowerCase('en-US');
}
function inspectReleaseDocumentPaths(paths) {
    const normalized = new Map(paths.map(file => [normalizeReleasePath(file), file]));
    const required = exports.REQUIRED_RELEASE_DOCUMENTS.filter(file => normalized.has(normalizeReleasePath(file)));
    const missing = exports.REQUIRED_RELEASE_DOCUMENTS.filter(file => !normalized.has(normalizeReleasePath(file)));
    const workflows = paths.filter(file => /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(normalizeReleasePath(file)));
    if (workflows.length === 0)
        missing.push('.github/workflows/*.yml');
    return { required: [...required], workflows, missing, ready: missing.length === 0 };
}
function inspectReleaseDocumentContents(documents, managerVersion, installerVersion) {
    const normalized = new Map(Object.entries(documents).map(([file, content]) => [normalizeReleasePath(file), content]));
    const readme = normalized.get('readme.md') || '';
    const readmePt = normalized.get('readme-pt-br.md') || '';
    const changelog = normalized.get('changelog.md') || '';
    const issues = [];
    if (managerVersion && (!readme.includes(`v${managerVersion}`) || !readmePt.includes(`v${managerVersion}`))) {
        issues.push('README:manager-version');
    }
    if (installerVersion &&
        (!readme.includes(`instalador-v${installerVersion}`) || !readmePt.includes(`instalador-v${installerVersion}`))) {
        issues.push('README:installer-version');
    }
    if (managerVersion && !changelog.includes(`[${managerVersion}]`)) {
        issues.push('CHANGELOG:manager-version');
    }
    for (const [file, content] of normalized) {
        if (/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(file) &&
            (!/^name:\s*\S+/m.test(content) || !/^on:\s*$/m.test(content))) {
            issues.push(`${file}:header`);
        }
    }
    return issues;
}
function evaluateReleaseGate(input) {
    const blockers = [];
    if (!input.workspaceTrusted)
        blockers.push('workspace-untrusted');
    if (input.permission === 'denied')
        blockers.push('permission-denied');
    if (input.permission === 'unknown')
        blockers.push('permission-unknown');
    if (input.dirtyFiles.length > 0)
        blockers.push('dirty-tree');
    if (!input.branch)
        blockers.push('detached-head');
    if (!input.githubRemote)
        blockers.push('non-github-remote');
    if (input.tagCollision)
        blockers.push('tag-collision');
    if (!input.documentationReady)
        blockers.push('documentation-outdated');
    if (!input.draftReady)
        blockers.push('draft-missing');
    if (input.requiredFilesReady === false)
        blockers.push('required-file-missing');
    if (input.workflowIdle === false)
        blockers.push('workflow-busy');
    return { canPrepare: true, canExecute: blockers.length === 0, blockers };
}
function createReleaseDraftSuggestion(product, currentVersion, increment, recentCommits = [], activeBatch = '') {
    const nextVersion = bumpSemver(currentVersion, increment);
    const tag = `${product === 'manager' ? 'gestor-v' : 'instalador-v'}${nextVersion}`;
    const notes = recentCommits.length > 0
        ? recentCommits.map(commit => `- ${commit}`).join('\n')
        : `- ${activeBatch || tag}`;
    const batchLine = activeBatch ? `\n\nSDD: ${activeBatch}` : '';
    return {
        product,
        increment,
        currentVersion,
        nextVersion,
        tag,
        tagMessage: tag,
        commitMessage: `chore(release): publish ${product} ${nextVersion}`,
        releaseNotes: `## ${tag}\n\n${notes}${batchLine}`,
        mode: 'automatic'
    };
}
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
function replaceReleaseVersionMentions(value, previousVersions, nextVersion, previousTags, nextTag) {
    let updated = value;
    const replacements = [
        ...previousTags.map(previous => [previous, nextTag]),
        ...previousVersions.map(previous => [previous, nextVersion])
    ];
    for (const [previous, next] of replacements) {
        if (!previous || previous === next)
            continue;
        updated = updated.split(previous).join(next);
    }
    return updated;
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