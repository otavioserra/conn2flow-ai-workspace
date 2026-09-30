"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictPolicyError = exports.DELIVERY_CONFLICT_ACTIONS = void 0;
exports.parseCliSuccess = parseCliSuccess;
exports.buildConflictListArgs = buildConflictListArgs;
exports.buildConflictDetailsArgs = buildConflictDetailsArgs;
exports.buildResolveConflictArgs = buildResolveConflictArgs;
exports.parseConflictList = parseConflictList;
exports.parseConflictDetails = parseConflictDetails;
exports.requiredConflictFilePaths = requiredConflictFilePaths;
exports.DELIVERY_CONFLICT_ACTIONS = ['sobrescrever', 'manter', 'mesclar'];
class ConflictPolicyError extends Error {
    code;
    constructor(code) {
        super(code);
        this.code = code;
        this.name = 'ConflictPolicyError';
    }
}
exports.ConflictPolicyError = ConflictPolicyError;
function parseSuccessfulResponse(output) {
    let value;
    try {
        value = JSON.parse(output);
    }
    catch {
        throw new ConflictPolicyError('invalid-json');
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ConflictPolicyError('invalid-response');
    }
    const response = value;
    if (response.ok === false) {
        if (typeof response.erro === 'string')
            throw new Error(response.erro);
        throw new ConflictPolicyError('invalid-response');
    }
    if (response.ok !== true) {
        throw new ConflictPolicyError('invalid-response');
    }
    return response;
}
function parseCliSuccess(output) {
    return parseSuccessfulResponse(output);
}
function parseConflict(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ConflictPolicyError('invalid-response');
    }
    const conflict = value;
    if ((typeof conflict.id !== 'string' && !(typeof conflict.id === 'number' && Number.isSafeInteger(conflict.id))) ||
        typeof conflict.caminho !== 'string' ||
        typeof conflict.motivo !== 'string' ||
        !Array.isArray(conflict.acoes)) {
        throw new ConflictPolicyError('invalid-response');
    }
    return {
        id: String(conflict.id),
        caminho: conflict.caminho,
        motivo: conflict.motivo,
        acoes: conflict.acoes.filter((action) => exports.DELIVERY_CONFLICT_ACTIONS.includes(action))
    };
}
function requireProjectId(projectId) {
    if (!projectId.trim())
        throw new ConflictPolicyError('invalid-response');
}
function buildConflictListArgs(projectId) {
    requireProjectId(projectId);
    return ['update:conflicts', projectId, '--json'];
}
function buildConflictDetailsArgs(projectId, conflictId) {
    requireProjectId(projectId);
    if (!conflictId.trim())
        throw new ConflictPolicyError('invalid-response');
    return ['update:conflicts', projectId, conflictId, '--json'];
}
function buildResolveConflictArgs(projectId, conflictId, action, local) {
    requireProjectId(projectId);
    if (!conflictId.trim() || !exports.DELIVERY_CONFLICT_ACTIONS.includes(action)) {
        throw new ConflictPolicyError('invalid-response');
    }
    return [
        'update:resolve',
        projectId,
        conflictId,
        `--acao=${action}`,
        ...(local ? ['--local'] : []),
        '--json'
    ];
}
function parseConflictList(output) {
    const response = parseSuccessfulResponse(output);
    if (typeof response.projeto !== 'string' || !Array.isArray(response.choques)) {
        throw new ConflictPolicyError('invalid-response');
    }
    return {
        projeto: response.projeto,
        choques: response.choques.map(conflict => parseConflict(conflict))
    };
}
function parseConflictDetails(output) {
    const response = parseSuccessfulResponse(output);
    if (typeof response.projeto !== 'string' ||
        !response.arquivos ||
        typeof response.arquivos !== 'object' ||
        // O PHP serializa o array vazio como `[]` (choque de registro, sem arquivo): vale como objeto vazio.
        (Array.isArray(response.arquivos) && response.arquivos.length > 0)) {
        throw new ConflictPolicyError('invalid-response');
    }
    const files = response.arquivos;
    const arquivos = {};
    for (const key of ['no-ar', 'nova', 'mesclado']) {
        const value = files[key];
        if (value === undefined || value === null)
            continue;
        if (typeof value !== 'string')
            throw new ConflictPolicyError('invalid-response');
        arquivos[key] = value;
    }
    const choque = parseConflict(response.choque);
    // Sem a versão no ar não há o que mesclar (o CLI cria o `mesclado` a partir dela).
    if (!arquivos.mesclado)
        choque.acoes = choque.acoes.filter(action => action !== 'mesclar');
    return { projeto: response.projeto, choque, arquivos };
}
function requiredConflictFilePaths(conflict, files) {
    const paths = [files['no-ar'], files.nova, conflict.acoes.includes('mesclar') ? files.mesclado : undefined];
    return paths.filter((value) => typeof value === 'string');
}
//# sourceMappingURL=projectConflictsPolicy.js.map