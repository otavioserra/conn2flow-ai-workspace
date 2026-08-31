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
export declare function logSessionEvent(args: LogSessionEventArgs, workspaceRoot?: string): Promise<SessionEventRecord>;
