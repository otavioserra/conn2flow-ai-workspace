export interface VmConnection {
  user: string;
  host: string;
  port: number;
  targetPath: string;
}

export type VmLogName = 'php-error.log' | 'nginx-error.log';

const USER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const HOST_PATTERN = /^(?:[A-Za-z0-9.-]+|\[[0-9A-Fa-f:]+\])$/;
const REMOTE_PATH_PATTERN = /^\/[A-Za-z0-9._/-]+$/;

export function normalizeVmConnection(value: Partial<VmConnection> | undefined): VmConnection | undefined {
  const user = typeof value?.user === 'string' ? value.user.trim() : '';
  const host = typeof value?.host === 'string' ? value.host.trim() : '';
  const targetPath = typeof value?.targetPath === 'string'
    ? value.targetPath.trim().replace(/\\/g, '/').replace(/\/+$/, '')
    : '';
  const port = Number(value?.port ?? 22);

  if (!USER_PATTERN.test(user) || !HOST_PATTERN.test(host)) return undefined;
  if (!Number.isInteger(port) || port < 1 || port > 65535) return undefined;
  const pathSegments = targetPath.split('/');
  if (
    !REMOTE_PATH_PATTERN.test(targetPath)
    || targetPath === '/'
    || pathSegments.some(segment => segment === '.' || segment === '..')
  ) return undefined;

  return { user, host, port, targetPath };
}

export function buildVmLogCommand(connection: VmConnection, logName: VmLogName): string {
  const normalized = normalizeVmConnection(connection);
  if (!normalized) throw new Error('Invalid VM SSH configuration.');

  const remoteLog = `${normalized.targetPath}/logs/${logName}`;
  return `ssh -o BatchMode=yes -o ConnectTimeout=15 -p ${normalized.port} "${normalized.user}@${normalized.host}" "tail -n 100 -- '${remoteLog}'"`;
}

export function describeVmConnection(connection: VmConnection | undefined): string | undefined {
  const normalized = normalizeVmConnection(connection);
  return normalized ? `${normalized.user}@${normalized.host}:${normalized.port}` : undefined;
}
