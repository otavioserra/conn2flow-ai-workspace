"use strict";
/**
 * REQ-080 / BATCH-082 — Editor Isolado de Dados do Projeto.
 *
 * Funções puras (sem dependência de `vscode`) para extrair somente
 * `devProjects[projectId]` do `environment.json` e devolver o nó editado
 * preservando todos os demais projetos e chaves globais intactos.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = isPlainObject;
exports.extractProjectConfig = extractProjectConfig;
exports.serializeProjectConfig = serializeProjectConfig;
exports.scopedConfigFileName = scopedConfigFileName;
exports.mergeProjectConfig = mergeProjectConfig;
exports.removeProjectConfig = removeProjectConfig;
function isPlainObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/** Devolve apenas o objeto do projeto (cópia profunda) ou `undefined`. */
function extractProjectConfig(environment, projectId) {
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)) {
        return undefined;
    }
    const project = environment.devProjects[projectId];
    return isPlainObject(project) ? JSON.parse(JSON.stringify(project)) : undefined;
}
/** Texto exibido no buffer isolado: somente o JSON do projeto, indentado com 2 espaços. */
function serializeProjectConfig(project) {
    return `${JSON.stringify(project, null, 2)}\n`;
}
/** Nome de arquivo seguro para o buffer temporário (sem separadores de caminho). */
function scopedConfigFileName(projectId) {
    const safe = projectId.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '_') || 'project';
    return `${safe}.project.json`;
}
/**
 * Substitui exclusivamente `devProjects[projectId]` no texto completo do
 * `environment.json`. Qualquer falha retorna `ok: false` sem produzir texto,
 * garantindo que o arquivo original nunca seja corrompido.
 */
function mergeProjectConfig(environmentText, projectId, editedText) {
    let edited;
    try {
        edited = JSON.parse(editedText);
    }
    catch (error) {
        return { ok: false, reason: 'invalidJson', message: error?.message };
    }
    if (!isPlainObject(edited)) {
        return { ok: false, reason: 'notObject' };
    }
    let environment;
    try {
        environment = JSON.parse(environmentText);
    }
    catch (error) {
        return { ok: false, reason: 'environmentInvalid', message: error?.message };
    }
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)
        || !Object.prototype.hasOwnProperty.call(environment.devProjects, projectId)) {
        return { ok: false, reason: 'projectMissing' };
    }
    environment.devProjects[projectId] = edited;
    const trailingNewline = /\r?\n$/.test(environmentText) ? '\n' : '';
    return { ok: true, data: environment, text: `${JSON.stringify(environment, null, 2)}${trailingNewline}` };
}
/**
 * Remove exclusivamente `devProjects[projectId]` do `environment.json`.
 * Se o projeto removido era o `devEnvironment.projectTarget`, o alvo é limpo
 * para que nenhum comando contextual aponte para um projeto inexistente.
 */
function removeProjectConfig(environmentText, projectId) {
    let environment;
    try {
        environment = JSON.parse(environmentText);
    }
    catch (error) {
        return { ok: false, reason: 'environmentInvalid', message: error?.message };
    }
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)
        || !Object.prototype.hasOwnProperty.call(environment.devProjects, projectId)) {
        return { ok: false, reason: 'projectMissing' };
    }
    delete environment.devProjects[projectId];
    const devEnvironment = environment.devEnvironment;
    const wasTarget = isPlainObject(devEnvironment) && devEnvironment.projectTarget === projectId;
    if (wasTarget) {
        delete devEnvironment.projectTarget;
    }
    const trailingNewline = /\r?\n$/.test(environmentText) ? '\n' : '';
    return { ok: true, data: environment, text: `${JSON.stringify(environment, null, 2)}${trailingNewline}`, wasTarget };
}
//# sourceMappingURL=projectConfigEditorPolicy.js.map