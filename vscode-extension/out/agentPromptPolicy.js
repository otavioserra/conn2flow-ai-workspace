"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAgentPromptIdentity = buildAgentPromptIdentity;
exports.resolvePromptModeKeys = resolvePromptModeKeys;
exports.findOrphanPlaceholders = findOrphanPlaceholders;
const path = require("path");
const SDD_DIRECTORY = 'sdd';
const CURRENT_RELATIVE = ['human-requests', 'CURRENT.md'];
function normalize(value) {
    const trimmed = (value || '').trim();
    return trimmed ? path.resolve(trimmed) : '';
}
function resolveSddRoot(input) {
    const explicit = normalize(input.sddRoot);
    if (explicit)
        return explicit;
    const workspaceRoot = normalize(input.workspaceRoot);
    return workspaceRoot ? path.join(workspaceRoot, SDD_DIRECTORY) : '';
}
function resolveRepositoryRoot(sddRoot, input) {
    if (sddRoot && path.basename(sddRoot).toLocaleLowerCase('en-US') === SDD_DIRECTORY) {
        return path.dirname(sddRoot);
    }
    return normalize(input.workspaceRoot);
}
/**
 * Resolve `{ repo, root, sddRoot, currentPath, reqPath, request }` a partir do
 * escopo SDD ativo, degradando para `fallbackLabel` apenas quando um dado não
 * puder ser derivado — nunca deixando o prompt sair com o campo vazio.
 */
function buildAgentPromptIdentity(input = {}, fallbackLabel = 'unknown') {
    const sddRoot = resolveSddRoot(input);
    const root = resolveRepositoryRoot(sddRoot, input);
    const currentPath = normalize(input.currentPath) || (sddRoot ? path.join(sddRoot, ...CURRENT_RELATIVE) : '');
    const reqPath = normalize(input.reqPath) || currentPath;
    const repo = root ? path.basename(root) : '';
    return {
        repo: repo || fallbackLabel,
        root: root || fallbackLabel,
        sddRoot: sddRoot || fallbackLabel,
        currentPath: currentPath || fallbackLabel,
        reqPath: reqPath || fallbackLabel,
        request: (input.request || '').trim() || 'CURRENT.md'
    };
}
const TOPOLOGY_LABEL_KEYS = {
    duplo: 'mode.dual',
    triade: 'mode.triad'
};
const TOPOLOGY_ROLE_KEYS = {
    duplo: 'agents.roles.dual',
    triade: 'agents.roles.triad'
};
const AUTONOMY_LABEL_KEYS = {
    supervisionado: 'mode.supervised',
    autonomo_monitorado: 'mode.monitored',
    autonomo_headless: 'mode.headless'
};
function resolvePromptModeKeys(modes = {}) {
    const topology = modes.topology === 'duplo' ? 'duplo' : 'triade';
    const autonomy = AUTONOMY_LABEL_KEYS[modes.autonomy || ''] ? modes.autonomy : 'supervisionado';
    return {
        topologyKey: TOPOLOGY_LABEL_KEYS[topology],
        rolesKey: TOPOLOGY_ROLE_KEYS[topology],
        autonomyKey: AUTONOMY_LABEL_KEYS[autonomy]
    };
}
/**
 * Retorna os marcadores `{chave}` que sobraram após a interpolação do catálogo.
 * Um prompt válido nunca pode ser entregue ao agente com chaves órfãs.
 */
function findOrphanPlaceholders(text) {
    const matches = text.match(/\{[a-zA-Z0-9_]+\}/g);
    return matches ? Array.from(new Set(matches)) : [];
}
//# sourceMappingURL=agentPromptPolicy.js.map