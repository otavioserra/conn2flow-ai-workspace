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
export declare function resolveConn2FlowRoot(customPath?: string): string;
/**
 * Execute a Conn2Flow CLI (c2f) command.
 */
export declare function executeC2fCommand(args: C2fRunCommandArgs): Promise<C2fCommandResult>;
