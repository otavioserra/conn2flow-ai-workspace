import * as readline from 'node:readline';
import { executeC2fCommand, type C2fRunCommandArgs } from './tools/c2fCommand.js';
import { dispatchTask, type DispatchTaskArgs } from './tools/dispatchTask.js';
import { reportCompletion, type ReportCompletionArgs } from './tools/reportCompletion.js';
import { logSessionEvent, type LogSessionEventArgs } from './tools/logSessionEvent.js';
import {
  listSkillFeedback,
  submitSkillFeedback,
  type ListSkillFeedbackArgs,
  type SubmitSkillFeedbackArgs
} from './tools/skillFeedback.js';

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
            enum: ['supervised', 'live_autonomous', 'headless_autonomous'],
            description: 'supervised (human review gate), live_autonomous (live visible autopilot in chat), or headless_autonomous (silent background worktree execution)'
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
          },
          task_id: {
            type: 'string',
            description: 'Optional taskId returned by dispatch_task for structured correlation'
          },
          req_id: {
            type: 'string',
            description: 'Optional REQ identifier used to locate and transition the task record'
          },
          role: {
            type: 'string',
            enum: ['executor', 'reviewer', 'architect'],
            description: 'Optional emitting role; creates a role-specific receipt alongside the canonical receipt'
          }
        },
        required: ['batch_id', 'status', 'logs']
      }
    });

    this.tools.set('log_session_event', {
      name: 'log_session_event',
      description: 'Append a structured event to the shared batch session timeline in sdd/sessions/.',
      inputSchema: {
        type: 'object',
        properties: {
          batch_id: {
            type: 'string',
            description: 'Batch identifier (e.g. "BATCH-044")'
          },
          agent_id: {
            type: 'string',
            description: 'Structured identity of the emitting agent (e.g. "antigravity-architect", "codex-executor", "claude-reviewer")'
          },
          role: {
            type: 'string',
            enum: ['architect', 'executor', 'reviewer', 'human'],
            description: 'Role of the emitting participant'
          },
          summary: {
            type: 'string',
            description: 'Actionable summary of the event or milestone'
          },
          details: {
            type: 'string',
            description: 'Optional detailed description, code diffs or test logs'
          },
          timestamp: {
            type: 'string',
            description: 'Optional ISO 8601 timestamp'
          }
        },
        required: ['batch_id', 'agent_id', 'role', 'summary']
      }
    });

    this.tools.set('submit_skill_feedback', {
      name: 'submit_skill_feedback',
      description: 'Record structured skill feedback (FB-XXX) in the matrix inbox memory/inbox/feedback/ via `mdd feedback submit`; optionally opens a GitHub Issue labelled skill-feedback.',
      inputSchema: {
        type: 'object',
        properties: {
          persona: { type: 'string', enum: ['architect', 'executor', 'reviewer', 'curator', 'optimizer'] },
          skill: { type: 'string', description: 'Canonical skill name (e.g. "c2f-persona-executor")' },
          kind: { type: 'string', enum: ['gap', 'bug', 'bloat', 'proposal', 'learning'] },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          summary: { type: 'string', description: 'One-line summary of the finding' },
          evidence: { type: 'string', description: 'Verifiable evidence: file:line, command, measurement or test' },
          proposal: { type: 'string', description: 'Optional concrete change proposal' },
          repo: { type: 'string', description: 'Origin repository (e.g. "conn2flow-site")' },
          req: { type: 'string', description: 'Origin request (e.g. "REQ-089")' },
          batch: { type: 'string', description: 'Origin batch (e.g. "BATCH-091")' },
          scope: { type: 'string', enum: ['global', 'local'], description: 'global (matrix inbox, default) or local (repo_path inbox)' },
          matrix: { type: 'string', description: 'Optional matrix root; defaults to MDD_MATRIX or this workspace' },
          repo_path: { type: 'string', description: 'Repository root for scope=local' },
          github: { type: 'boolean', description: 'Also create a GitHub Issue (label skill-feedback) via gh CLI' },
          github_repo: { type: 'string', description: 'Optional owner/name for the GitHub Issue' }
        },
        required: ['persona', 'skill', 'kind', 'severity', 'summary', 'evidence']
      }
    });

    this.tools.set('list_skill_feedback', {
      name: 'list_skill_feedback',
      description: 'List skill feedback from memory/inbox/feedback/ as JSON (filters: status, verdict, skill, repo, severity) for the Curator persona and dashboards.',
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', description: 'e.g. PENDING or TRIAGED' },
          verdict: { type: 'string', enum: ['PENDING', 'ACCEPT', 'NEEDS_EVIDENCE', 'QUARANTINE', 'REJECT', 'LOCAL_ONLY'] },
          skill: { type: 'string' },
          repo: { type: 'string' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          include_github: { type: 'boolean', description: 'Also list GitHub Issues labelled skill-feedback via gh CLI' },
          matrix: { type: 'string', description: 'Optional matrix root; defaults to MDD_MATRIX or this workspace' }
        }
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
          } else if (toolName === 'log_session_event') {
            contentResult = await logSessionEvent(toolArgs as LogSessionEventArgs);
          } else if (toolName === 'submit_skill_feedback') {
            contentResult = await submitSkillFeedback(toolArgs as SubmitSkillFeedbackArgs);
          } else if (toolName === 'list_skill_feedback') {
            contentResult = await listSkillFeedback(toolArgs as ListSkillFeedbackArgs);
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

  /**
   * Processes one stdin line and returns the serialized response (or null for
   * notifications/blank lines). Parse errors become JSON-RPC -32700 replies.
   */
  public async processLine(line: string): Promise<string | null> {
    if (!line.trim()) return null;
    let request: Record<string, any>;
    try {
      request = JSON.parse(line);
    } catch (err: any) {
      return JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: `Parse error: ${err.message}`
        }
      });
    }
    const response = await this.handleRequest(request);
    if (response.id !== undefined || response.error !== undefined) {
      return JSON.stringify(response);
    }
    return null;
  }

  /**
   * Starts the stdio transport. Lines are handled through a serial queue
   * (REQ-090 / REP-011): each request finishes, and its response is written,
   * before the next line starts, so `submit_skill_feedback` followed by
   * `list_skill_feedback` on the same stdin always observes the write.
   */
  public startStdio(
    input: NodeJS.ReadableStream = process.stdin,
    output: NodeJS.WritableStream = process.stdout
  ): Promise<void> {
    const rl = readline.createInterface({ input, terminal: false });
    let queue: Promise<void> = Promise.resolve();

    rl.on('line', (line) => {
      queue = queue.then(async () => {
        try {
          const serialized = await this.processLine(line);
          if (serialized !== null) output.write(serialized + '\n');
        } catch (err: any) {
          output.write(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: `Internal error: ${err?.message ?? String(err)}` }
          }) + '\n');
        }
      });
    });

    process.stderr.write('[MCP Hub] Conn2Flow MCP Server running on stdio.\n');
    return new Promise(resolve => rl.on('close', () => { void queue.then(() => resolve()); }));
  }
}
