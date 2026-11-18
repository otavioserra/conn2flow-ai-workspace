/**
 * REQ-080 / BATCH-082 — Editor Isolado de Dados do Projeto.
 *
 * Funções puras (sem dependência de `vscode`) para extrair somente
 * `devProjects[projectId]` do `environment.json` e devolver o nó editado
 * preservando todos os demais projetos e chaves globais intactos.
 */

export type ScopedMergeResult =
    | { ok: true; data: any; text: string }
    | { ok: false; reason: 'invalidJson' | 'notObject' | 'projectMissing' | 'environmentInvalid'; message?: string };

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Devolve apenas o objeto do projeto (cópia profunda) ou `undefined`. */
export function extractProjectConfig(environment: unknown, projectId: string): Record<string, unknown> | undefined {
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)) {
        return undefined;
    }
    const project = (environment.devProjects as Record<string, unknown>)[projectId];
    return isPlainObject(project) ? JSON.parse(JSON.stringify(project)) : undefined;
}

/** Texto exibido no buffer isolado: somente o JSON do projeto, indentado com 2 espaços. */
export function serializeProjectConfig(project: Record<string, unknown>): string {
    return `${JSON.stringify(project, null, 2)}\n`;
}

/** Nome de arquivo seguro para o buffer temporário (sem separadores de caminho). */
export function scopedConfigFileName(projectId: string): string {
    const safe = projectId.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '_') || 'project';
    return `${safe}.project.json`;
}

/**
 * Substitui exclusivamente `devProjects[projectId]` no texto completo do
 * `environment.json`. Qualquer falha retorna `ok: false` sem produzir texto,
 * garantindo que o arquivo original nunca seja corrompido.
 */
export function mergeProjectConfig(environmentText: string, projectId: string, editedText: string): ScopedMergeResult {
    let edited: unknown;
    try {
        edited = JSON.parse(editedText);
    } catch (error: any) {
        return { ok: false, reason: 'invalidJson', message: error?.message };
    }
    if (!isPlainObject(edited)) {
        return { ok: false, reason: 'notObject' };
    }

    let environment: unknown;
    try {
        environment = JSON.parse(environmentText);
    } catch (error: any) {
        return { ok: false, reason: 'environmentInvalid', message: error?.message };
    }
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)
        || !Object.prototype.hasOwnProperty.call(environment.devProjects, projectId)) {
        return { ok: false, reason: 'projectMissing' };
    }

    (environment.devProjects as Record<string, unknown>)[projectId] = edited;
    const trailingNewline = /\r?\n$/.test(environmentText) ? '\n' : '';
    return { ok: true, data: environment, text: `${JSON.stringify(environment, null, 2)}${trailingNewline}` };
}

export type ProjectRemovalResult =
    | { ok: true; data: any; text: string; wasTarget: boolean }
    | { ok: false; reason: 'projectMissing' | 'environmentInvalid'; message?: string };

/**
 * Remove exclusivamente `devProjects[projectId]` do `environment.json`.
 * Se o projeto removido era o `devEnvironment.projectTarget`, o alvo é limpo
 * para que nenhum comando contextual aponte para um projeto inexistente.
 */
export function removeProjectConfig(environmentText: string, projectId: string): ProjectRemovalResult {
    let environment: unknown;
    try {
        environment = JSON.parse(environmentText);
    } catch (error: any) {
        return { ok: false, reason: 'environmentInvalid', message: error?.message };
    }
    if (!isPlainObject(environment) || !isPlainObject(environment.devProjects)
        || !Object.prototype.hasOwnProperty.call(environment.devProjects, projectId)) {
        return { ok: false, reason: 'projectMissing' };
    }

    delete (environment.devProjects as Record<string, unknown>)[projectId];
    const devEnvironment = environment.devEnvironment;
    const wasTarget = isPlainObject(devEnvironment) && devEnvironment.projectTarget === projectId;
    if (wasTarget) {
        delete (devEnvironment as Record<string, unknown>).projectTarget;
    }
    const trailingNewline = /\r?\n$/.test(environmentText) ? '\n' : '';
    return { ok: true, data: environment, text: `${JSON.stringify(environment, null, 2)}${trailingNewline}`, wasTarget };
}
