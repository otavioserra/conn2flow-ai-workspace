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
exports.reportCompletion = reportCompletion;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function assertIdentifier(label, value, pattern) {
    if (!pattern.test(value)) {
        throw new Error(`Invalid ${label}: '${value}'`);
    }
}
function readTaskFile(taskFile) {
    const parsed = JSON.parse(fs.readFileSync(taskFile, 'utf-8'));
    if (!parsed || typeof parsed !== 'object' || typeof parsed.taskId !== 'string' || typeof parsed.reqId !== 'string') {
        throw new Error(`Invalid task record: ${taskFile}`);
    }
    return parsed;
}
function resolveTask(args, workspaceRoot) {
    if (!args.task_id && !args.req_id) {
        return null;
    }
    const tasksDir = path.join(workspaceRoot, 'tasks');
    if (!fs.existsSync(tasksDir)) {
        throw new Error(`Task directory not found: ${tasksDir}`);
    }
    if (args.req_id) {
        assertIdentifier('req_id', args.req_id, /^REQ-\d+$/);
        const taskFile = path.join(tasksDir, `${args.req_id}.json`);
        if (!fs.existsSync(taskFile)) {
            throw new Error(`Task record not found for ${args.req_id}`);
        }
        const record = readTaskFile(taskFile);
        if (args.task_id && record.taskId !== args.task_id) {
            throw new Error(`task_id '${args.task_id}' does not match ${args.req_id}`);
        }
        return { file: taskFile, record };
    }
    assertIdentifier('task_id', args.task_id, /^task-\d+-[a-z0-9]+$/);
    for (const name of fs.readdirSync(tasksDir)) {
        if (!/^REQ-\d+\.json$/.test(name))
            continue;
        const taskFile = path.join(tasksDir, name);
        const record = readTaskFile(taskFile);
        if (record.taskId === args.task_id) {
            return { file: taskFile, record };
        }
    }
    throw new Error(`Task record not found for ${args.task_id}`);
}
/**
 * Record and report task completion back to the orchestrator.
 */
async function reportCompletion(args, workspaceRoot = path.resolve(__dirname, '../../../')) {
    assertIdentifier('batch_id', args.batch_id, /^BATCH-\d+$/);
    if (args.task_id) {
        assertIdentifier('task_id', args.task_id, /^task-\d+-[a-z0-9]+$/);
    }
    if (args.role && !['executor', 'reviewer', 'architect'].includes(args.role)) {
        throw new Error(`Invalid role: '${args.role}'`);
    }
    const resolvedTask = resolveTask(args, workspaceRoot);
    const taskId = resolvedTask?.record.taskId || args.task_id || null;
    const reqId = resolvedTask?.record.reqId || args.req_id || null;
    const now = new Date().toISOString();
    const receiptId = `rec_${Date.now()}`;
    const completionsDir = path.join(workspaceRoot, 'completions');
    if (!fs.existsSync(completionsDir)) {
        fs.mkdirSync(completionsDir, { recursive: true });
    }
    const receipt = {
        receiptId,
        batchId: args.batch_id,
        taskId,
        reqId,
        role: args.role || null,
        status: args.status,
        timestamp: now,
        logSize: args.logs.length,
        acknowledgement: `Batch ${args.batch_id} marked as ${args.status.toUpperCase()} by MCP Hub Orchestrator.`
    };
    const serializedReceipt = JSON.stringify({
        ...receipt,
        summary: args.summary || '',
        logs: args.logs
    }, null, 2);
    if (args.role) {
        const roleReceiptFile = path.join(completionsDir, `${args.batch_id}-${args.role}-receipt.json`);
        fs.writeFileSync(roleReceiptFile, serializedReceipt, 'utf-8');
    }
    const canonicalReceiptFile = path.join(completionsDir, `${args.batch_id}-receipt.json`);
    fs.writeFileSync(canonicalReceiptFile, serializedReceipt, 'utf-8');
    if (resolvedTask && (!args.role || args.role === 'executor')) {
        resolvedTask.record.status = args.status === 'success' ? 'completed' : 'failed';
        resolvedTask.record.completedAt = now;
        fs.writeFileSync(resolvedTask.file, JSON.stringify(resolvedTask.record, null, 2), 'utf-8');
    }
    return receipt;
}
