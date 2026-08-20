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
exports.resolveConn2FlowRoot = resolveConn2FlowRoot;
exports.executeC2fCommand = executeC2fCommand;
const node_child_process_1 = require("node:child_process");
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
/**
 * Locate the conn2flow root repository path.
 */
function resolveConn2FlowRoot(customPath) {
    if (customPath && fs.existsSync(customPath)) {
        return path.resolve(customPath);
    }
    // Look in parent directory or adjacent folders
    const candidates = [
        path.resolve(process.cwd(), '../conn2flow'),
        path.resolve(process.cwd(), '../../conn2flow'),
        path.resolve(process.cwd(), 'conn2flow'),
        'C:\\Users\\otavi\\OneDrive\\Documentos\\GIT\\conn2flow',
        '/workspace/conn2flow'
    ];
    for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'cli/c2f.php'))) {
            return candidate;
        }
    }
    return path.resolve(process.cwd(), '../conn2flow');
}
/**
 * Execute a Conn2Flow CLI (c2f) command.
 */
async function executeC2fCommand(args) {
    const startTime = Date.now();
    const repoRoot = resolveConn2FlowRoot(args.repoPath);
    const cliScript = path.join(repoRoot, 'cli/c2f.php');
    const fullArgs = [cliScript, args.command, ...(args.args || [])];
    return new Promise((resolve) => {
        let stdout = '';
        let stderr = '';
        const proc = (0, node_child_process_1.spawn)('php', fullArgs, {
            cwd: repoRoot,
            env: { ...process.env, NO_COLOR: '1' }
        });
        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        proc.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        proc.on('close', (code) => {
            const durationMs = Date.now() - startTime;
            resolve({
                command: `c2f ${args.command} ${(args.args || []).join(' ')}`.trim(),
                exitCode: code ?? 1,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                durationMs,
                success: (code === 0)
            });
        });
        proc.on('error', (err) => {
            const durationMs = Date.now() - startTime;
            resolve({
                command: `c2f ${args.command}`,
                exitCode: 1,
                stdout: '',
                stderr: `Process spawn error: ${err.message}`,
                durationMs,
                success: false
            });
        });
    });
}
