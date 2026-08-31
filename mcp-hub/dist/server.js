"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpServer = void 0;
const readline = __importStar(require("node:readline"));
const c2fCommand_js_1 = require("./tools/c2fCommand.js");
const dispatchTask_js_1 = require("./tools/dispatchTask.js");
const reportCompletion_js_1 = require("./tools/reportCompletion.js");
const logSessionEvent_js_1 = require("./tools/logSessionEvent.js");
class McpServer {
    tools = new Map();
    constructor() {
        this.registerTools();
    }
    registerTools() {
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
    }
    async handleRequest(request) {
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
                    let contentResult;
                    if (toolName === 'c2f_run_command') {
                        contentResult = await (0, c2fCommand_js_1.executeC2fCommand)(toolArgs);
                    }
                    else if (toolName === 'dispatch_task') {
                        contentResult = await (0, dispatchTask_js_1.dispatchTask)(toolArgs);
                    }
                    else if (toolName === 'report_completion') {
                        contentResult = await (0, reportCompletion_js_1.reportCompletion)(toolArgs);
                    }
                    else if (toolName === 'log_session_event') {
                        contentResult = await (0, logSessionEvent_js_1.logSessionEvent)(toolArgs);
                    }
                    else {
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
                }
                catch (err) {
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
    startStdio() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        rl.on('line', async (line) => {
            if (!line.trim())
                return;
            try {
                const request = JSON.parse(line);
                const response = await this.handleRequest(request);
                if (response.id !== undefined || response.error !== undefined) {
                    process.stdout.write(JSON.stringify(response) + '\n');
                }
            }
            catch (err) {
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
exports.McpServer = McpServer;
