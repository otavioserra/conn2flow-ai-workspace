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
exports.resolveMddCommand = resolveMddCommand;
exports.submitSkillFeedback = submitSkillFeedback;
exports.listSkillFeedback = listSkillFeedback;
const node_child_process_1 = require("node:child_process");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const workspaceDefault = path.resolve(__dirname, '../../../');
/** Resolve the mdd executable: MDD_CLI (path or JSON argv) > matrix .venv-mdd > PATH. */
function resolveMddCommand(workspaceRoot = workspaceDefault) {
    const configured = process.env.MDD_CLI?.trim();
    if (configured) {
        if (configured.startsWith('[')) {
            const parsed = JSON.parse(configured);
            if (!Array.isArray(parsed) || !parsed.length || parsed.some((item) => typeof item !== 'string')) {
                throw new Error('MDD_CLI must be a path or a JSON array of strings');
            }
            return parsed;
        }
        return [configured];
    }
    for (const candidate of [
        path.join(workspaceRoot, '.venv-mdd', 'Scripts', 'mdd.exe'),
        path.join(workspaceRoot, '.venv-mdd', 'bin', 'mdd')
    ]) {
        if (fs.existsSync(candidate)) {
            return [candidate];
        }
    }
    return ['mdd'];
}
function matrixRoot(explicit, options) {
    return path.resolve(explicit || process.env.MDD_MATRIX || options.workspaceRoot || workspaceDefault);
}
function runMdd(args, options) {
    const [executable, ...prefix] = options.command || resolveMddCommand(options.workspaceRoot);
    return new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        const proc = (0, node_child_process_1.spawn)(executable, [...prefix, ...args], {
            env: { ...process.env, NO_COLOR: '1', PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
        });
        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });
        proc.on('error', (err) => reject(new Error(`mdd spawn error: ${err.message}`)));
        proc.on('close', (code) => {
            const output = stdout.trim();
            if (code !== 0) {
                reject(new Error((stderr.trim() || output || `mdd exited with ${code}`)));
                return;
            }
            try {
                resolve(JSON.parse(output.split(/\r?\n/).pop() || 'null'));
            }
            catch {
                reject(new Error(`mdd returned non-JSON output: ${output}`));
            }
        });
    });
}
function option(argv, flag, value) {
    if (value !== undefined && value !== null && value !== '') {
        if (typeof value !== 'string') {
            throw new Error(`${flag} must be a string`);
        }
        argv.push(flag, value);
    }
}
async function submitSkillFeedback(args, options = {}) {
    for (const field of ['persona', 'skill', 'kind', 'severity', 'summary', 'evidence']) {
        if (typeof args[field] !== 'string' || !args[field].trim()) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    const argv = ['feedback', 'submit', '--json'];
    if (args.scope !== 'local') {
        argv.push('--matrix', matrixRoot(args.matrix, options));
    }
    else {
        option(argv, '--path', args.repo_path);
    }
    option(argv, '--persona', args.persona);
    option(argv, '--skill', args.skill);
    option(argv, '--kind', args.kind);
    option(argv, '--severity', args.severity);
    option(argv, '--summary', args.summary);
    option(argv, '--evidence', args.evidence);
    option(argv, '--proposal', args.proposal);
    option(argv, '--repo', args.repo);
    option(argv, '--req', args.req);
    option(argv, '--batch', args.batch);
    option(argv, '--scope', args.scope);
    option(argv, '--github-repo', args.github_repo);
    if (args.github === true) {
        argv.push('--github');
    }
    return runMdd(argv, options);
}
async function listSkillFeedback(args = {}, options = {}) {
    const argv = ['feedback', 'list', '--json', '--matrix', matrixRoot(args.matrix, options)];
    option(argv, '--status', args.status);
    option(argv, '--verdict', args.verdict);
    option(argv, '--skill', args.skill);
    option(argv, '--repo', args.repo);
    option(argv, '--severity', args.severity);
    if (args.include_github === true) {
        argv.push('--include-github');
    }
    return runMdd(argv, options);
}
