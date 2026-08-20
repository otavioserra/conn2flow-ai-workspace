export interface DispatchTaskArgs {
    repo: string;
    req_id: string;
    prompt: string;
    mode?: 'supervised' | 'headless';
    priority?: 'normal' | 'high';
}
export interface TaskRecord {
    taskId: string;
    reqId: string;
    repo: string;
    mode: 'supervised' | 'headless';
    priority: 'normal' | 'high';
    prompt: string;
    createdAt: string;
    status: 'dispatched' | 'running' | 'completed' | 'failed';
    executionToken: string;
}
/**
 * Dispatch a new task to the orchestration queue.
 */
export declare function dispatchTask(args: DispatchTaskArgs): Promise<TaskRecord>;
