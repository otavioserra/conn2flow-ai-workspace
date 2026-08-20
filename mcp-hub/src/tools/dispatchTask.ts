import * as fs from 'node:fs';
import * as path from 'node:path';

export interface DispatchTaskArgs {
  repo: string;
  req_id: string;
  prompt: string;
  mode?: 'supervised' | 'live_autonomous' | 'headless_autonomous';
  priority?: 'normal' | 'high';
}

export interface TaskRecord {
  taskId: string;
  reqId: string;
  repo: string;
  mode: 'supervised' | 'live_autonomous' | 'headless_autonomous';
  priority: 'normal' | 'high';
  prompt: string;
  createdAt: string;
  status: 'dispatched' | 'running' | 'completed' | 'failed';
  executionToken: string;
}

/**
 * Dispatch a new task to the orchestration queue with 3-tier autonomy support.
 */
export async function dispatchTask(args: DispatchTaskArgs): Promise<TaskRecord> {
  const mode = args.mode || 'supervised';
  const priority = args.priority || 'normal';
  const now = new Date().toISOString();
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const executionToken = `tok_${Buffer.from(`${taskId}:${args.req_id}`).toString('base64url')}`;

  const taskDir = path.resolve(process.cwd(), 'tasks');
  if (!fs.existsSync(taskDir)) {
    fs.mkdirSync(taskDir, { recursive: true });
  }

  const record: TaskRecord = {
    taskId,
    reqId: args.req_id,
    repo: args.repo,
    mode,
    priority,
    prompt: args.prompt,
    createdAt: now,
    status: 'dispatched',
    executionToken
  };

  const taskFile = path.join(taskDir, `${args.req_id}.json`);
  fs.writeFileSync(taskFile, JSON.stringify(record, null, 2), 'utf-8');

  return record;
}
