import * as readline from 'node:readline';
import { executeC2fCommand, type C2fRunCommandArgs } from './tools/c2fCommand.js';
import { dispatchTask, type DispatchTaskArgs } from './tools/dispatchTask.js';
import { reportCompletion, type ReportCompletionArgs } from './tools/reportCompletion.js';

export interface McpTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export class McpServer {
  private tools: Map<string, McpTool> = new Map();

  constructor() {
    this.registerTools();
  }

  private registerTools(): void {
    this.tools.set('c2f_run_command', {
      name: 'c2f_run_command',
      description: 'Execute modern Conn2Flow CLI (c2f) commands such as resources:sync, ai:sync, module:create, db:test, docker:status.',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'The c2f command to run (e.g. "resources:sync", "ai:sync", "module:create", "db:test", "docker:status")'
          },
          args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional arguments or flags (e.g. ["meu-modulo", "--table=custom_table"])'
          },
          repoPath: {
            type: 'string',
            description: 'Optional absolute path to the conn2flow root repository'
          }
        },
        required: ['command']
      }
    });

    this.tools.set('dispatch_task', {
      name: 'dispatch_task',
      description: 'Dispatch a development task to the multi-agent orchestration queue with Dual-Mode support (supervised in VS Code or headless background).',
      inputSchema: {
        type: 'object',
        properties: {
          repo: {
            type: 'string',
            description: 'Target repository (e.g. "conn2flow", "lumix", "transformamp", "conn2flow-site")'
          },
          req_id: {
            type: 'string',
            description: 'Requirement / Batch identifier (e.g. "REQ-012", "BATCH-015")'
          },
          prompt: {
            type: 'string',
            description: 'Detailed actionable prompt and instructions for the executor agent'
          },
          mode: {
            type: 'string',
            enum: ['supervised', 'headless'],
            description: 'Supervised (opens in IDE chat) or Headless (executes in background)'
          }
        },
        required: ['repo', 'req_id', 'prompt']
      }
    });

    this.tools.set('report_completion', {
      name: 'report_completion',
      description: 'Notify the Chief Architect of batch execution completion and log evidence receipts.',
      inputSchema: {
        type: 'object',
        properties: {
          batch_id: {
            type: 'string',
            description: 'Batch identifier (e.g. "BATCH-015")'
          },
          status: {
            type: 'string',
            enum: ['success', 'failed'],
            description: 'Execution outcome status'
          },
          logs: {
            type: 'string',
            description: 'Console output and test verification logs'
          },
          summary: {
            type: 'string',
            description: 'Optional executive summary of accomplishments'
          }
        },
        required: ['batch_id', 'status', 'logs']
      }
    });
  }

  public async handleRequest(request: Record<string, any>): Promise<Record<string, any>> {
    const { id, method, params } = request;

    switch (method) {
      case 'initialize':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'conn2flow-mcp-hub',
              version: '1.0.0'
            }
          }
        };

      case 'notifications/initialized':
        return { jsonrpc: '2.0' };

      case 'tools/list':
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: Array.from(this.tools.values())
          }
        };

      case 'tools/call': {
        const toolName = params?.name;
        const toolArgs = params?.arguments || {};

        try {
          let contentResult: any;

          if (toolName === 'c2f_run_command') {
            contentResult = await executeC2fCommand(toolArgs as C2fRunCommandArgs);
          } else if (toolName === 'dispatch_task') {
            contentResult = await dispatchTask(toolArgs as DispatchTaskArgs);
          } else if (toolName === 'report_completion') {
            contentResult = await reportCompletion(toolArgs as ReportCompletionArgs);
          } else {
            return {
              jsonrpc: '2.0',
              id,
              error: {
                code: -32601,
                message: `Tool '${toolName}' not found`
              }
            };
          }

          return {
            jsonrpc: '2.0',
            id,
            result: {
              content: [
                {
                  type: 'text',
                  text: typeof contentResult === 'string' ? contentResult : JSON.stringify(contentResult, null, 2)
                }
              ]
            }
          };
        } catch (err: any) {
          return {
            jsonrpc: '2.0',
            id,
            result: {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: `Execution failed: ${err.message}`
                }
              ]
            }
          };
        }
      }

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method '${method}' not implemented`
          }
        };
    }
  }

  public startStdio(): void {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', async (line) => {
      if (!line.trim()) return;
      try {
        const request = JSON.parse(line);
        const response = await this.handleRequest(request);
        if (response.id !== undefined || response.error !== undefined) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (err: any) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${err.message}`
          }
        }) + '\n');
      }
    });

    process.stderr.write('[MCP Hub] Conn2Flow MCP Server running on stdio.\n');
  }
}
