import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TaskRecord } from './dispatchTask.js';

export type CompletionRole = 'executor' | 'reviewer' | 'architect';

export interface ReportCompletionArgs {
  batch_id: string;
  logs: string;
  status: 'success' | 'failed';
  summary?: string;
  task_id?: string;
  req_id?: string;
  role?: CompletionRole;
}

export interface CompletionReceipt {
  receiptId: string;
  batchId: string;
  taskId: string | null;
  reqId: string | null;
  role: CompletionRole | null;
  status: 'success' | 'failed';
  timestamp: string;
  logSize: number;
  acknowledgement: string;
}

interface ResolvedTask {
  file: string;
  record: TaskRecord;
}

function assertIdentifier(label: string, value: string, pattern: RegExp): void {
  if (!pattern.test(value)) {
    throw new Error(`Invalid ${label}: '${value}'`);
  }
}

function readTaskFile(taskFile: string): TaskRecord {
  const parsed = JSON.parse(fs.readFileSync(taskFile, 'utf-8')) as TaskRecord;
  if (!parsed || typeof parsed !== 'object' || typeof parsed.taskId !== 'string' || typeof parsed.reqId !== 'string') {
    throw new Error(`Invalid task record: ${taskFile}`);
  }
  return parsed;
}

function resolveTask(args: ReportCompletionArgs, workspaceRoot: string): ResolvedTask | null {
  if (!args.task_id && !args.req_id) {
    return null;
  }

  const tasksDir = path.join(workspaceRoot, 'tasks');
  if (!fs.existsSync(tasksDir)) {
    throw new Error(`Task directory not found: ${tasksDir}`);
  }

  if (args.req_id) {
    assertIdentifier('req_id', args.req_id, /^REQ-\d+$/);
    const taskFile = path.join(tasksDir, `${args.req_id}.json`);
    if (!fs.existsSync(taskFile)) {
      throw new Error(`Task record not found for ${args.req_id}`);
    }
    const record = readTaskFile(taskFile);
    if (args.task_id && record.taskId !== args.task_id) {
      throw new Error(`task_id '${args.task_id}' does not match ${args.req_id}`);
    }
    return { file: taskFile, record };
  }

  assertIdentifier('task_id', args.task_id as string, /^task-\d+-[a-z0-9]+$/);
  for (const name of fs.readdirSync(tasksDir)) {
    if (!/^REQ-\d+\.json$/.test(name)) continue;
    const taskFile = path.join(tasksDir, name);
    const record = readTaskFile(taskFile);
    if (record.taskId === args.task_id) {
      return { file: taskFile, record };
    }
  }

  throw new Error(`Task record not found for ${args.task_id}`);
}

/**
 * Record and report task completion back to the orchestrator.
 */
export async function reportCompletion(
  args: ReportCompletionArgs,
  workspaceRoot = path.resolve(__dirname, '../../../')
): Promise<CompletionReceipt> {
  assertIdentifier('batch_id', args.batch_id, /^BATCH-\d+$/);
  if (args.task_id) {
    assertIdentifier('task_id', args.task_id, /^task-\d+-[a-z0-9]+$/);
  }
  if (args.role && !['executor', 'reviewer', 'architect'].includes(args.role)) {
    throw new Error(`Invalid role: '${args.role}'`);
  }

  const resolvedTask = resolveTask(args, workspaceRoot);
  const taskId = resolvedTask?.record.taskId || args.task_id || null;
  const reqId = resolvedTask?.record.reqId || args.req_id || null;
  const now = new Date().toISOString();
  const receiptId = `rec_${Date.now()}`;
  const completionsDir = path.join(workspaceRoot, 'completions');

  if (!fs.existsSync(completionsDir)) {
    fs.mkdirSync(completionsDir, { recursive: true });
  }

  const receipt: CompletionReceipt = {
    receiptId,
    batchId: args.batch_id,
    taskId,
    reqId,
    role: args.role || null,
    status: args.status,
    timestamp: now,
    logSize: args.logs.length,
    acknowledgement: `Batch ${args.batch_id} marked as ${args.status.toUpperCase()} by MCP Hub Orchestrator.`
  };

  const serializedReceipt = JSON.stringify({
    ...receipt,
    summary: args.summary || '',
    logs: args.logs
  }, null, 2);

  if (args.role) {
    const roleReceiptFile = path.join(completionsDir, `${args.batch_id}-${args.role}-receipt.json`);
    fs.writeFileSync(roleReceiptFile, serializedReceipt, 'utf-8');
  }

  const canonicalReceiptFile = path.join(completionsDir, `${args.batch_id}-receipt.json`);
  fs.writeFileSync(canonicalReceiptFile, serializedReceipt, 'utf-8');

  if (resolvedTask && (!args.role || args.role === 'executor')) {
    resolvedTask.record.status = args.status === 'success' ? 'completed' : 'failed';
    resolvedTask.record.completedAt = now;
    fs.writeFileSync(resolvedTask.file, JSON.stringify(resolvedTask.record, null, 2), 'utf-8');
  }

  return receipt;
}
