export type ReleaseIncrement = 'patch' | 'minor' | 'major';
export type ReleasePermission = 'unknown' | 'denied' | 'allowed';

export function bumpSemver(version: string, increment: ReleaseIncrement): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid semantic version: ${version}`);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (increment === 'major') return `${major + 1}.0.0`;
  if (increment === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function classifyViewerPermission(permission: string | undefined): ReleasePermission {
  if (!permission) return 'unknown';
  return ['WRITE', 'MAINTAIN', 'ADMIN'].includes(permission.toUpperCase()) ? 'allowed' : 'denied';
}

export function githubRepositoryUrl(remote: string): string | undefined {
  const match = remote.trim().match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
  return match ? `https://github.com/${match[1]}/${match[2]}` : undefined;
}

export function quoteShellArg(value: string, shell: 'bash' | 'powershell' | 'cmd'): string {
  if (shell === 'bash') return `'${value.replace(/'/g, `'"'"'`)}'`;
  if (shell === 'powershell') return `'${value.replace(/'/g, "''")}'`;
  return `"${value.replace(/"/g, '""')}"`;
}
