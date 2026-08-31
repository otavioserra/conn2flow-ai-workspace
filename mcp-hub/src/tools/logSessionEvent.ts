import * as fs from 'node:fs';
import * as path from 'node:path';

export type SessionRole = 'architect' | 'executor' | 'reviewer' | 'human';

export interface LogSessionEventArgs {
  batch_id: string;
  agent_id: string;
  role: SessionRole;
  summary: string;
  details?: string;
  timestamp?: string;
}

export interface SessionEventRecord {
  batchId: string;
  agentId: string;
  role: SessionRole;
  summary: string;
  details?: string;
  timestamp: string;
  sessionFile: string;
}

/**
 * Append a structured event to the shared batch session timeline in sdd/sessions/
 */
export async function logSessionEvent(
  args: LogSessionEventArgs,
  workspaceRoot = path.resolve(__dirname, '../../../')
): Promise<SessionEventRecord> {
  if (!args.batch_id || !/^BATCH-\d+$/i.test(args.batch_id)) {
    throw new Error(`Invalid batch_id: '${args.batch_id}'`);
  }
  if (!args.agent_id || typeof args.agent_id !== 'string') {
    throw new Error('agent_id is required');
  }
  if (!['architect', 'executor', 'reviewer', 'human'].includes(args.role)) {
    throw new Error(`Invalid role: '${args.role}'`);
  }
  if (!args.summary || typeof args.summary !== 'string') {
    throw new Error('summary is required');
  }

  const batchNormalized = args.batch_id.toUpperCase();
  const sessionsDir = path.join(workspaceRoot, 'sdd', 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  const fileName = `${batchNormalized.toLowerCase()}-stream.md`;
  const sessionFile = path.join(sessionsDir, fileName);
  const now = args.timestamp || new Date().toISOString();

  if (!fs.existsSync(sessionFile)) {
    const initialHeader = `# Sessão Compartilhada — ${batchNormalized}\n\n* **Início**: ${now}\n* **Lote**: ${batchNormalized}\n\n## Timeline da Sessão\n\n`;
    fs.writeFileSync(sessionFile, initialHeader, 'utf-8');
  }

  let entry = `### [${now}] ${args.agent_id} (${args.role})\n\n- **Resumo**: ${args.summary}\n`;
  if (args.details && args.details.trim().length > 0) {
    entry += `- **Detalhes**:\n${args.details.trim()}\n`;
  }
  entry += '\n';

  fs.appendFileSync(sessionFile, entry, 'utf-8');

  return {
    batchId: batchNormalized,
    agentId: args.agent_id,
    role: args.role,
    summary: args.summary,
    details: args.details,
    timestamp: now,
    sessionFile: path.relative(workspaceRoot, sessionFile).replace(/\\/g, '/')
  };
}
