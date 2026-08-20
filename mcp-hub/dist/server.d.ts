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
    startStdio(): void;
}
