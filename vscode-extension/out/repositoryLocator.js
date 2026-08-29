"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRepositoryRootCandidates = buildRepositoryRootCandidates;
exports.buildRepositorySddCandidates = buildRepositorySddCandidates;
exports.inferScopeIdFromWorkspace = inferScopeIdFromWorkspace;
const path = require("path");
function normalizeName(value) {
    return value.trim().replace(/[\\/]+$/, '').toLocaleLowerCase('en-US');
}
function buildRepositoryRootCandidates(workspacePaths, repoName) {
    const expectedName = normalizeName(repoName);
    const candidates = [];
    const seen = new Set();
    const add = (candidate) => {
        const normalized = path.resolve(candidate);
        const key = normalizeName(normalized);
        if (!seen.has(key)) {
            seen.add(key);
            candidates.push(normalized);
        }
    };
    for (const workspacePath of workspacePaths) {
        const resolvedWorkspace = path.resolve(workspacePath);
        if (normalizeName(path.basename(resolvedWorkspace)) === expectedName) {
            add(resolvedWorkspace);
        }
        add(path.join(resolvedWorkspace, '..', repoName));
        add(path.join(resolvedWorkspace, repoName));
    }
    return candidates;
}
function buildRepositorySddCandidates(workspacePaths, repoName) {
    return buildRepositoryRootCandidates(workspacePaths, repoName).map(root => path.join(root, 'sdd'));
}
function inferScopeIdFromWorkspace(workspacePaths) {
    const names = workspacePaths.map(workspacePath => normalizeName(path.basename(path.resolve(workspacePath))));
    if (names.includes('conn2flow-ai-workspace')) {
        return 'ai-workspace';
    }
    if (names.includes('conn2flow')) {
        return 'core';
    }
    return 'core';
}
//# sourceMappingURL=repositoryLocator.js.map