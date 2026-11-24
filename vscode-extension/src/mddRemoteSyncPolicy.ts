import { normalizeProjectDomain } from './domainPolicy';

export const DEFAULT_REMOTE_MATRIX = 'https://github.com/otavioserra/conn2flow-ai-workspace.git';
export const REMOTE_SKILLS_COMMAND = 'conn2flow.mddHub.syncRemoteSkills';

export function buildRemoteSyncArgs(folder: string, domain: string | undefined, source: string, checkOnly: boolean): string[] {
  return ['sync', '--remote', checkOnly ? '--check-only' : '--apply', '--json',
    '--path', folder, '--domain', normalizeProjectDomain(domain), '--source-url', source];
}

export function remoteSyncDue(mode: unknown, intervalHours: number, lastAttempt: number | undefined, now: number): boolean {
  const hours = Number.isFinite(intervalHours) ? Math.max(1, intervalHours) : 24;
  return (mode === 'notify' || mode === 'auto') &&
    (lastAttempt === undefined || lastAttempt > now || now - lastAttempt >= hours * 3_600_000);
}

export interface RemoteSyncReport {
  available: string[];
  updated: string[];
  conflicts: { path: string; reason: string }[];
  customized: string[];
  metadata_changed: boolean;
  revision: string;
  domain: string;
}

export function parseRemoteSyncReport(stdout: string): RemoteSyncReport {
  const result = JSON.parse(stdout) as RemoteSyncReport & { status: string };
  if (result?.status !== 'PASS' || !Array.isArray(result.available) || !Array.isArray(result.updated) ||
      !Array.isArray(result.conflicts) || !Array.isArray(result.customized) ||
      typeof result.domain !== 'string' || typeof result.revision !== 'string') {
    throw new Error('Invalid remote skill sync response');
  }
  return result;
}
