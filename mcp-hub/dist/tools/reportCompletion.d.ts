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
export declare function reportCompletion(args: ReportCompletionArgs): Promise<CompletionReceipt>;
