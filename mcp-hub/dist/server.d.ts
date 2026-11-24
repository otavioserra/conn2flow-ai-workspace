export interface McpTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
}
export declare class McpServer {
    private tools;
    constructor();
    private registerTools;
    handleRequest(request: Record<string, any>): Promise<Record<string, any>>;
    /**
     * Processes one stdin line and returns the serialized response (or null for
     * notifications/blank lines). Parse errors become JSON-RPC -32700 replies.
     */
    processLine(line: string): Promise<string | null>;
    /**
     * Starts the stdio transport. Lines are handled through a serial queue
     * (REQ-090 / REP-011): each request finishes, and its response is written,
     * before the next line starts, so `submit_skill_feedback` followed by
     * `list_skill_feedback` on the same stdin always observes the write.
     */
    startStdio(input?: NodeJS.ReadableStream, output?: NodeJS.WritableStream): Promise<void>;
}
