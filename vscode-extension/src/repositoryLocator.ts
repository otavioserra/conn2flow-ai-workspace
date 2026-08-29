import * as path from 'path';

function normalizeName(value: string): string {
  return value.trim().replace(/[\\/]+$/, '').toLocaleLowerCase('en-US');
}

export function buildRepositoryRootCandidates(workspacePaths: readonly string[], repoName: string): string[] {
  const expectedName = normalizeName(repoName);
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (candidate: string) => {
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

export function buildRepositorySddCandidates(workspacePaths: readonly string[], repoName: string): string[] {
  return buildRepositoryRootCandidates(workspacePaths, repoName).map(root => path.join(root, 'sdd'));
}

export function inferScopeIdFromWorkspace(workspacePaths: readonly string[]): string {
  const names = workspacePaths.map(workspacePath => normalizeName(path.basename(path.resolve(workspacePath))));
  if (names.includes('conn2flow-ai-workspace')) {
    return 'ai-workspace';
  }
  if (names.includes('conn2flow')) {
    return 'core';
  }
  return 'core';
}
