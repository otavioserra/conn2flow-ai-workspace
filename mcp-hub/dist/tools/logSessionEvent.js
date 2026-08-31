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
exports.logSessionEvent = logSessionEvent;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
/**
 * Append a structured event to the shared batch session timeline in sdd/sessions/
 */
async function logSessionEvent(args, workspaceRoot = path.resolve(__dirname, '../../../')) {
    if (!args.batch_id || !/^BATCH-\d+$/i.test(args.batch_id)) {
        throw new Error(`Invalid batch_id: '${args.batch_id}'`);
    }
    if (!args.agent_id || typeof args.agent_id !== 'string') {
        throw new Error('agent_id is required');
    }
    if (!['architect', 'executor', 'reviewer', 'human'].includes(args.role)) {
        throw new Error(`Invalid role: '${args.role}'`);
    }
    if (!args.summary || typeof args.summary !== 'string') {
        throw new Error('summary is required');
    }
    const batchNormalized = args.batch_id.toUpperCase();
    const sessionsDir = path.join(workspaceRoot, 'sdd', 'sessions');
    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
    }
    const fileName = `${batchNormalized.toLowerCase()}-stream.md`;
    const sessionFile = path.join(sessionsDir, fileName);
    const now = args.timestamp || new Date().toISOString();
    if (!fs.existsSync(sessionFile)) {
        const initialHeader = `# Sessão Compartilhada — ${batchNormalized}\n\n* **Início**: ${now}\n* **Lote**: ${batchNormalized}\n\n## Timeline da Sessão\n\n`;
        fs.writeFileSync(sessionFile, initialHeader, 'utf-8');
    }
    let entry = `### [${now}] ${args.agent_id} (${args.role})\n\n- **Resumo**: ${args.summary}\n`;
    if (args.details && args.details.trim().length > 0) {
        entry += `- **Detalhes**:\n${args.details.trim()}\n`;
    }
    entry += '\n';
    fs.appendFileSync(sessionFile, entry, 'utf-8');
    return {
        batchId: batchNormalized,
        agentId: args.agent_id,
        role: args.role,
        summary: args.summary,
        details: args.details,
        timestamp: now,
        sessionFile: path.relative(workspaceRoot, sessionFile).replace(/\\/g, '/')
    };
}
