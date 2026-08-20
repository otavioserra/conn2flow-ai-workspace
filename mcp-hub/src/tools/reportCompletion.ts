import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ReportCompletionArgs {
  batch_id: string;
  logs: string;
  status: 'success' | 'failed';
  summary?: string;
}

export interface CompletionReceipt {
  receiptId: string;
  batchId: string;
  status: 'success' | 'failed';
  timestamp: string;
  logSize: number;
  acknowledgement: string;
}

/**
 * Record and report task completion back to the orchestrator.
 */
export async function reportCompletion(args: ReportCompletionArgs): Promise<CompletionReceipt> {
  const now = new Date().toISOString();
  const receiptId = `rec_${Date.now()}`;
  const completionsDir = path.resolve(process.cwd(), 'completions');

  if (!fs.existsSync(completionsDir)) {
    fs.mkdirSync(completionsDir, { recursive: true });
  }

  const receipt: CompletionReceipt = {
    receiptId,
    batchId: args.batch_id,
    status: args.status,
    timestamp: now,
    logSize: args.logs.length,
    acknowledgement: `Batch ${args.batch_id} marked as ${args.status.toUpperCase()} by MCP Hub Orchestrator.`
  };

  const receiptFile = path.join(completionsDir, `${args.batch_id}-receipt.json`);
  fs.writeFileSync(receiptFile, JSON.stringify({
    ...receipt,
    summary: args.summary || '',
    logs: args.logs
  }, null, 2), 'utf-8');

  return receipt;
}
