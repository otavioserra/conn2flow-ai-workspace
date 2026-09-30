export const DELIVERY_CONFLICT_ACTIONS = ['sobrescrever', 'manter', 'mesclar'] as const;

export type DeliveryConflictAction = typeof DELIVERY_CONFLICT_ACTIONS[number];
export type ConflictPolicyErrorCode = 'invalid-json' | 'invalid-response';

export class ConflictPolicyError extends Error {
    constructor(public readonly code: ConflictPolicyErrorCode) {
        super(code);
        this.name = 'ConflictPolicyError';
    }
}

export interface DeliveryConflict {
    id: string;
    caminho: string;
    motivo: string;
    acoes: DeliveryConflictAction[];
}

export interface DeliveryConflictList {
    projeto: string;
    choques: DeliveryConflict[];
}

/**
 * Versões baixadas pelo CLI. Todas opcionais: um choque de retirada não tem versão nova, e um choque de
 * registro do banco (`db:<tabela>?<chave>`, req-199 / BATCH-207) não tem arquivo nenhum.
 */
export interface DeliveryConflictFiles {
    'no-ar'?: string;
    nova?: string;
    mesclado?: string;
}

export interface DeliveryConflictDetails {
    projeto: string;
    choque: DeliveryConflict;
    arquivos: DeliveryConflictFiles;
}

function parseSuccessfulResponse(output: string): Record<string, unknown> {
    let value: unknown;
    try {
        value = JSON.parse(output);
    } catch {
        throw new ConflictPolicyError('invalid-json');
    }

    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ConflictPolicyError('invalid-response');
    }

    const response = value as Record<string, unknown>;
    if (response.ok === false) {
        if (typeof response.erro === 'string') throw new Error(response.erro);
        throw new ConflictPolicyError('invalid-response');
    }
    if (response.ok !== true) {
        throw new ConflictPolicyError('invalid-response');
    }

    return response;
}

export function parseCliSuccess(output: string): Record<string, unknown> {
    return parseSuccessfulResponse(output);
}

function parseConflict(value: unknown): DeliveryConflict {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new ConflictPolicyError('invalid-response');
    }

    const conflict = value as Record<string, unknown>;
    if (
        (typeof conflict.id !== 'string' && !(typeof conflict.id === 'number' && Number.isSafeInteger(conflict.id))) ||
        typeof conflict.caminho !== 'string' ||
        typeof conflict.motivo !== 'string' ||
        !Array.isArray(conflict.acoes)
    ) {
        throw new ConflictPolicyError('invalid-response');
    }

    return {
        id: String(conflict.id),
        caminho: conflict.caminho,
        motivo: conflict.motivo,
        acoes: conflict.acoes.filter((action): action is DeliveryConflictAction =>
            DELIVERY_CONFLICT_ACTIONS.includes(action as DeliveryConflictAction)
        )
    };
}

function requireProjectId(projectId: string): void {
    if (!projectId.trim()) throw new ConflictPolicyError('invalid-response');
}

export function buildConflictListArgs(projectId: string): string[] {
    requireProjectId(projectId);
    return ['update:conflicts', projectId, '--json'];
}

export function buildConflictDetailsArgs(projectId: string, conflictId: string): string[] {
    requireProjectId(projectId);
    if (!conflictId.trim()) throw new ConflictPolicyError('invalid-response');
    return ['update:conflicts', projectId, conflictId, '--json'];
}

export function buildResolveConflictArgs(
    projectId: string,
    conflictId: string,
    action: DeliveryConflictAction,
    local: boolean
): string[] {
    requireProjectId(projectId);
    if (!conflictId.trim() || !DELIVERY_CONFLICT_ACTIONS.includes(action)) {
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

export function parseConflictList(output: string): DeliveryConflictList {
    const response = parseSuccessfulResponse(output);
    if (typeof response.projeto !== 'string' || !Array.isArray(response.choques)) {
        throw new ConflictPolicyError('invalid-response');
    }

    return {
        projeto: response.projeto,
        choques: response.choques.map(conflict => parseConflict(conflict))
    };
}

export function parseConflictDetails(output: string): DeliveryConflictDetails {
    const response = parseSuccessfulResponse(output);
    if (
        typeof response.projeto !== 'string' ||
        !response.arquivos ||
        typeof response.arquivos !== 'object' ||
        // O PHP serializa o array vazio como `[]` (choque de registro, sem arquivo): vale como objeto vazio.
        (Array.isArray(response.arquivos) && response.arquivos.length > 0)
    ) {
        throw new ConflictPolicyError('invalid-response');
    }

    const files = response.arquivos as Record<string, unknown>;
    const arquivos: DeliveryConflictFiles = {};
    for (const key of ['no-ar', 'nova', 'mesclado'] as const) {
        const value = files[key];
        if (value === undefined || value === null) continue;
        if (typeof value !== 'string') throw new ConflictPolicyError('invalid-response');
        arquivos[key] = value;
    }

    const choque = parseConflict(response.choque);
    // Sem a versão no ar não há o que mesclar (o CLI cria o `mesclado` a partir dela).
    if (!arquivos.mesclado) choque.acoes = choque.acoes.filter(action => action !== 'mesclar');

    return { projeto: response.projeto, choque, arquivos };
}

export function requiredConflictFilePaths(
    conflict: DeliveryConflict,
    files: DeliveryConflictFiles
): string[] {
    const paths = [files['no-ar'], files.nova, conflict.acoes.includes('mesclar') ? files.mesclado : undefined];
    return paths.filter((value): value is string => typeof value === 'string');
}
