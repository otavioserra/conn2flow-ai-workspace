import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Skill-feedback tools (ARCH-018 Phase 2). All rules live in the Python `mdd feedback`
 * CLI; this adapter only maps MCP arguments to explicit argv (never a shell).
 */
export interface SubmitSkillFeedbackArgs {
  persona: string;
  skill: string;
  kind: string;
  severity: string;
  summary: string;
  evidence: string;
  proposal?: string;
  repo?: string;
  req?: string;
  batch?: string;
  scope?: string;
  matrix?: string;
  repo_path?: string;
  github?: boolean;
  github_repo?: string;
  force_ready?: boolean;
}

export interface ListSkillFeedbackArgs {
  status?: string;
  verdict?: string;
  skill?: string;
  repo?: string;
  severity?: string;
  include_github?: boolean;
  matrix?: string;
}

export interface FeedbackOptions {
  workspaceRoot?: string;
  command?: string[];
}

const workspaceDefault = path.resolve(__dirname, '../../../');

/** Resolve the mdd executable: MDD_CLI (path or JSON argv) > matrix .venv-mdd > PATH. */
export function resolveMddCommand(workspaceRoot: string = workspaceDefault): string[] {
  const configured = process.env.MDD_CLI?.trim();
  if (configured) {
    if (configured.startsWith('[')) {
      const parsed = JSON.parse(configured);
      if (!Array.isArray(parsed) || !parsed.length || parsed.some((item) => typeof item !== 'string')) {
        throw new Error('MDD_CLI must be a path or a JSON array of strings');
      }
      return parsed;
    }
    return [configured];
  }
  for (const candidate of [
    path.join(workspaceRoot, '.venv-mdd', 'Scripts', 'mdd.exe'),
    path.join(workspaceRoot, '.venv-mdd', 'bin', 'mdd')
  ]) {
    if (fs.existsSync(candidate)) {
      return [candidate];
    }
  }
  return ['mdd'];
}

function matrixRoot(explicit: string | undefined, options: FeedbackOptions): string {
  return path.resolve(explicit || process.env.MDD_MATRIX || options.workspaceRoot || workspaceDefault);
}

function runMdd(args: string[], options: FeedbackOptions): Promise<unknown> {
  const [executable, ...prefix] = options.command || resolveMddCommand(options.workspaceRoot);
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const proc = spawn(executable, [...prefix, ...args], {
      env: { ...process.env, NO_COLOR: '1', PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
    });
    proc.stdout.on('data', (data) => { stdout += data.toString(); });
    proc.stderr.on('data', (data) => { stderr += data.toString(); });
    proc.on('error', (err) => reject(new Error(`mdd spawn error: ${err.message}`)));
    proc.on('close', (code) => {
      const output = stdout.trim();
      if (code !== 0) {
        reject(new Error((stderr.trim() || output || `mdd exited with ${code}`)));
        return;
      }
      try {
        resolve(JSON.parse(output.split(/\r?\n/).pop() || 'null'));
      } catch {
        reject(new Error(`mdd returned non-JSON output: ${output}`));
      }
    });
  });
}

function option(argv: string[], flag: string, value: unknown): void {
  if (value !== undefined && value !== null && value !== '') {
    if (typeof value !== 'string') {
      throw new Error(`${flag} must be a string`);
    }
    argv.push(flag, value);
  }
}

export async function submitSkillFeedback(args: SubmitSkillFeedbackArgs, options: FeedbackOptions = {}): Promise<unknown> {
  for (const field of ['persona', 'skill', 'kind', 'severity', 'summary', 'evidence'] as const) {
    if (typeof args[field] !== 'string' || !args[field].trim()) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  const argv = ['feedback', 'submit', '--json'];
  if (args.scope !== 'local') {
    argv.push('--matrix', matrixRoot(args.matrix, options));
  } else {
    option(argv, '--path', args.repo_path);
  }
  option(argv, '--persona', args.persona);
  option(argv, '--skill', args.skill);
  option(argv, '--kind', args.kind);
  option(argv, '--severity', args.severity);
  option(argv, '--summary', args.summary);
  option(argv, '--evidence', args.evidence);
  option(argv, '--proposal', args.proposal);
  option(argv, '--repo', args.repo);
  option(argv, '--req', args.req);
  option(argv, '--batch', args.batch);
  option(argv, '--scope', args.scope);
  option(argv, '--github-repo', args.github_repo);
  if (args.github === true) {
    argv.push('--github');
  }
  if (args.force_ready === true) {
    argv.push('--force-ready');
  }
  return runMdd(argv, options);
}

export async function listSkillFeedback(args: ListSkillFeedbackArgs = {}, options: FeedbackOptions = {}): Promise<unknown> {
  const argv = ['feedback', 'list', '--json', '--matrix', matrixRoot(args.matrix, options)];
  option(argv, '--status', args.status);
  option(argv, '--verdict', args.verdict);
  option(argv, '--skill', args.skill);
  option(argv, '--repo', args.repo);
  option(argv, '--severity', args.severity);
  if (args.include_github === true) {
    argv.push('--include-github');
  }
  return runMdd(argv, options);
}
