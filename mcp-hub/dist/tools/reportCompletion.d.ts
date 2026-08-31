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
/**
 * Record and report task completion back to the orchestrator.
 */
export declare function reportCompletion(args: ReportCompletionArgs, workspaceRoot?: string): Promise<CompletionReceipt>;
