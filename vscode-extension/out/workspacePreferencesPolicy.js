"use strict";
/**
 * Persistência externa de escopo, projeto alvo, topologia e autonomia
 * (REQ-049 / BATCH-051).
 *
 * Módulo puro: sem dependência de `vscode` ou de I/O, para permitir testes
 * unitários diretos sobre `out/workspacePreferencesPolicy.js`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTONOMY_DOCUMENT_TOKEN = exports.TOPOLOGY_DOCUMENT_TOKEN = exports.DEFAULT_SCOPE_ID = exports.DEFAULT_AUTONOMY = exports.DEFAULT_TOPOLOGY = exports.PREFERENCE_KEYS = exports.PREFERENCE_SECTION = void 0;
exports.recognizeTopology = recognizeTopology;
exports.recognizeAutonomy = recognizeAutonomy;
exports.recognizeScopeId = recognizeScopeId;
exports.recognizeProjectId = recognizeProjectId;
exports.normalizeTopology = normalizeTopology;
exports.normalizeAutonomy = normalizeAutonomy;
exports.normalizeScopeId = normalizeScopeId;
exports.normalizeProjectId = normalizeProjectId;
exports.resolvePersistedPreference = resolvePersistedPreference;
exports.parseModesFromCurrentMarkdown = parseModesFromCurrentMarkdown;
exports.applyModesToCurrentMarkdown = applyModesToCurrentMarkdown;
/** Seção de configuração do VS Code que hospeda as preferências persistidas. */
exports.PREFERENCE_SECTION = 'conn2flow';
/** Chaves relativas à seção, usadas em `settings.json` e em `contributes.configuration`. */
exports.PREFERENCE_KEYS = {
    scopeId: 'sdd.scopeId',
    activeProjectId: 'projects.activeId',
    topology: 'agents.topology',
    autonomy: 'agents.autonomy'
};
exports.DEFAULT_TOPOLOGY = 'triade';
exports.DEFAULT_AUTONOMY = 'supervisionado';
exports.DEFAULT_SCOPE_ID = 'core';
/**
 * Vocabulário aceito nos artefatos SDD escritos por humanos. O tipo interno
 * permanece `duplo`/`triade`, mas `CURRENT.md` e as requisições usam `dupla`,
 * e ambos precisam resolver para a mesma topologia.
 */
const TOPOLOGY_ALIASES = {
    duplo: 'duplo',
    dupla: 'duplo',
    dual: 'duplo',
    duo: 'duplo',
    '2': 'duplo',
    triade: 'triade',
    'tríade': 'triade',
    triad: 'triade',
    trio: 'triade',
    '3': 'triade'
};
const AUTONOMY_ALIASES = {
    supervisionado: 'supervisionado',
    supervisionada: 'supervisionado',
    supervised: 'supervisionado',
    '1': 'supervisionado',
    autonomo_monitorado: 'autonomo_monitorado',
    'autônomo_monitorado': 'autonomo_monitorado',
    'autonomo-monitorado': 'autonomo_monitorado',
    monitorado: 'autonomo_monitorado',
    monitored: 'autonomo_monitorado',
    '2': 'autonomo_monitorado',
    autonomo_headless: 'autonomo_headless',
    'autônomo_headless': 'autonomo_headless',
    'autonomo-headless': 'autonomo_headless',
    headless: 'autonomo_headless',
    '3': 'autonomo_headless'
};
/** Token gravado nos artefatos SDD, preservando o vocabulário do Arquiteto. */
exports.TOPOLOGY_DOCUMENT_TOKEN = {
    duplo: 'dupla',
    triade: 'triade'
};
exports.AUTONOMY_DOCUMENT_TOKEN = {
    supervisionado: 'supervisionado',
    autonomo_monitorado: 'autonomo_monitorado',
    autonomo_headless: 'autonomo_headless'
};
function aliasKey(value) {
    return String(value ?? '')
        .trim()
        .replace(/^`+|`+$/g, '')
        .toLocaleLowerCase('pt-BR');
}
/**
 * Reconhecedores: devolvem `undefined` para valor ausente ou não suportado, o
 * que separa "o usuário não escolheu" de "o usuário escolheu o padrão".
 */
function recognizeTopology(value) {
    return TOPOLOGY_ALIASES[aliasKey(value)];
}
function recognizeAutonomy(value) {
    return AUTONOMY_ALIASES[aliasKey(value)];
}
/** Escopos válidos: `core`, `ai-workspace` ou `project:<id>`. */
function recognizeScopeId(value) {
    const raw = String(value ?? '').trim();
    return /^(core|ai-workspace|project:[A-Za-z0-9._-]+)$/.test(raw) ? raw : undefined;
}
function recognizeProjectId(value) {
    const raw = String(value ?? '').trim();
    return /^[A-Za-z0-9._-]+$/.test(raw) ? raw : undefined;
}
function normalizeTopology(value, fallback = exports.DEFAULT_TOPOLOGY) {
    return recognizeTopology(value) ?? fallback;
}
function normalizeAutonomy(value, fallback = exports.DEFAULT_AUTONOMY) {
    return recognizeAutonomy(value) ?? fallback;
}
function normalizeScopeId(value, fallback = exports.DEFAULT_SCOPE_ID) {
    return recognizeScopeId(value) ?? fallback;
}
function normalizeProjectId(value, fallback = '') {
    return recognizeProjectId(value) ?? fallback;
}
/**
 * Precedência de leitura: `settings.json` primeiro, `workspaceState` legado em
 * seguida (migração transparente dos workspaces já em uso) e por fim o valor
 * inferido do ambiente. Garante que um reload nunca reverta a seleção.
 */
function resolvePersistedPreference(sources, recognize, fallback) {
    for (const candidate of [sources.settings, sources.workspaceState, sources.inferred]) {
        const recognized = recognize(candidate);
        if (recognized !== undefined)
            return recognized;
    }
    return fallback;
}
const TOPOLOGY_PATTERN = /(\*\*Topologia de Agentes\*\*:\s*)`?[^`\n]*`?/i;
const AUTONOMY_PATTERN = /(\*\*N[íi]vel de Autonomia\*\*:\s*)`?[^`\n]*`?/i;
/** Lê os metadados de topologia/autonomia declarados em `CURRENT.md`. */
function parseModesFromCurrentMarkdown(content) {
    const parsed = {};
    const topology = recognizeTopology(content.match(/\*\*Topologia de Agentes\*\*:\s*`?([^`\n]+)`?/i)?.[1]);
    if (topology)
        parsed.topology = topology;
    const autonomy = recognizeAutonomy(content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([^`\n]+)`?/i)?.[1]);
    if (autonomy)
        parsed.autonomy = autonomy;
    return parsed;
}
/**
 * Sincroniza os metadados no `CURRENT.md`, atualizando a linha existente ou
 * inserindo-a logo após `Status` (ou após o primeiro item de lista) quando
 * o arquivo ainda não declara o campo.
 */
function applyModesToCurrentMarkdown(content, modes) {
    let updated = content;
    if (modes.topology) {
        const token = exports.TOPOLOGY_DOCUMENT_TOKEN[modes.topology];
        const line = `**Topologia de Agentes**: \`${token}\``;
        updated = TOPOLOGY_PATTERN.test(updated)
            ? updated.replace(TOPOLOGY_PATTERN, `$1\`${token}\``)
            : insertMetadataLine(updated, line, /(^[*-]\s+\*\*Status\*\*:[^\n]*\n)/im);
    }
    if (modes.autonomy) {
        const token = exports.AUTONOMY_DOCUMENT_TOKEN[modes.autonomy];
        const line = `**Nível de Autonomia**: \`${token}\``;
        updated = AUTONOMY_PATTERN.test(updated)
            ? updated.replace(AUTONOMY_PATTERN, `$1\`${token}\``)
            : insertMetadataLine(updated, line, /(^[*-]\s+\*\*Topologia de Agentes\*\*:[^\n]*\n)/im);
    }
    return updated;
}
function insertMetadataLine(content, line, anchor) {
    const anchorMatch = content.match(anchor);
    if (anchorMatch) {
        const bullet = anchorMatch[1].match(/^([*-]\s+)/)?.[1] ?? '* ';
        return content.replace(anchor, `$1${bullet}${line}\n`);
    }
    const firstBullet = content.match(/^([*-]\s+)\*\*[^\n]*\n/m);
    if (firstBullet) {
        return content.replace(firstBullet[0], `${firstBullet[0]}${firstBullet[1]}${line}\n`);
    }
    return content;
}
//# sourceMappingURL=workspacePreferencesPolicy.js.map