import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface C2fRunCommandArgs {
  command: string;
  args?: string[];
  repoPath?: string;
}

export interface C2fCommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  success: boolean;
}

/**
 * Locate the conn2flow root repository path.
 */
export function resolveConn2FlowRoot(customPath?: string): string {
  if (customPath && fs.existsSync(customPath)) {
    return path.resolve(customPath);
  }

  // Look in parent directory or adjacent folders
  const candidates = [
    path.resolve(process.cwd(), '../conn2flow'),
    path.resolve(process.cwd(), '../../conn2flow'),
    path.resolve(process.cwd(), 'conn2flow'),
    'C:\\Users\\otavi\\OneDrive\\Documentos\\GIT\\conn2flow',
    '/workspace/conn2flow'
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'cli/c2f.php'))) {
      return candidate;
    }
  }

  return path.resolve(process.cwd(), '../conn2flow');
}

/**
 * Execute a Conn2Flow CLI (c2f) command.
 */
export async function executeC2fCommand(args: C2fRunCommandArgs): Promise<C2fCommandResult> {
  const startTime = Date.now();
  const repoRoot = resolveConn2FlowRoot(args.repoPath);
  const cliScript = path.join(repoRoot, 'cli/c2f.php');

  const fullArgs = [cliScript, args.command, ...(args.args || [])];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const proc = spawn('php', fullArgs, {
      cwd: repoRoot,
      env: { ...process.env, NO_COLOR: '1' }
    });

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      const durationMs = Date.now() - startTime;
      resolve({
        command: `c2f ${args.command} ${(args.args || []).join(' ')}`.trim(),
        exitCode: code ?? 1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs,
        success: (code === 0)
      });
    });

    proc.on('error', (err) => {
      const durationMs = Date.now() - startTime;
      resolve({
        command: `c2f ${args.command}`,
        exitCode: 1,
        stdout: '',
        stderr: `Process spawn error: ${err.message}`,
        durationMs,
        success: false
      });
    });
  });
}
