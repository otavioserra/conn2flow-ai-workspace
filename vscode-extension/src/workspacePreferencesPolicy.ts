/**
 * Persistência externa de escopo, projeto alvo, topologia e autonomia
 * (REQ-049 / BATCH-051).
 *
 * Módulo puro: sem dependência de `vscode` ou de I/O, para permitir testes
 * unitários diretos sobre `out/workspacePreferencesPolicy.js`.
 */

export type TopologyMode = 'duplo' | 'triade';
export type AutonomyLevel = 'supervisionado' | 'autonomo_monitorado' | 'autonomo_headless';

export interface SddModePreferences {
  topology: TopologyMode;
  autonomy: AutonomyLevel;
}

/** Seção de configuração do VS Code que hospeda as preferências persistidas. */
export const PREFERENCE_SECTION = 'conn2flow';

/** Chaves relativas à seção, usadas em `settings.json` e em `contributes.configuration`. */
export const PREFERENCE_KEYS = {
  scopeId: 'sdd.scopeId',
  activeProjectId: 'projects.activeId',
  topology: 'agents.topology',
  autonomy: 'agents.autonomy'
} as const;

export const DEFAULT_TOPOLOGY: TopologyMode = 'triade';
export const DEFAULT_AUTONOMY: AutonomyLevel = 'supervisionado';
export const DEFAULT_SCOPE_ID = 'core';

/**
 * Vocabulário aceito nos artefatos SDD escritos por humanos. O tipo interno
 * permanece `duplo`/`triade`, mas `CURRENT.md` e as requisições usam `dupla`,
 * e ambos precisam resolver para a mesma topologia.
 */
const TOPOLOGY_ALIASES: Record<string, TopologyMode> = {
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

const AUTONOMY_ALIASES: Record<string, AutonomyLevel> = {
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
export const TOPOLOGY_DOCUMENT_TOKEN: Record<TopologyMode, string> = {
  duplo: 'dupla',
  triade: 'triade'
};

export const AUTONOMY_DOCUMENT_TOKEN: Record<AutonomyLevel, string> = {
  supervisionado: 'supervisionado',
  autonomo_monitorado: 'autonomo_monitorado',
  autonomo_headless: 'autonomo_headless'
};

function aliasKey(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/^`+|`+$/g, '')
    .toLocaleLowerCase('pt-BR');
}

/**
 * Reconhecedores: devolvem `undefined` para valor ausente ou não suportado, o
 * que separa "o usuário não escolheu" de "o usuário escolheu o padrão".
 */
export function recognizeTopology(value: unknown): TopologyMode | undefined {
  return TOPOLOGY_ALIASES[aliasKey(value)];
}

export function recognizeAutonomy(value: unknown): AutonomyLevel | undefined {
  return AUTONOMY_ALIASES[aliasKey(value)];
}

/** Escopos válidos: `core`, `ai-workspace` ou `project:<id>`. */
export function recognizeScopeId(value: unknown): string | undefined {
  const raw = String(value ?? '').trim();
  return /^(core|ai-workspace|project:[A-Za-z0-9._-]+)$/.test(raw) ? raw : undefined;
}

export function recognizeProjectId(value: unknown): string | undefined {
  const raw = String(value ?? '').trim();
  return /^[A-Za-z0-9._-]+$/.test(raw) ? raw : undefined;
}

export function normalizeTopology(value: unknown, fallback: TopologyMode = DEFAULT_TOPOLOGY): TopologyMode {
  return recognizeTopology(value) ?? fallback;
}

export function normalizeAutonomy(value: unknown, fallback: AutonomyLevel = DEFAULT_AUTONOMY): AutonomyLevel {
  return recognizeAutonomy(value) ?? fallback;
}

export function normalizeScopeId(value: unknown, fallback: string = DEFAULT_SCOPE_ID): string {
  return recognizeScopeId(value) ?? fallback;
}

export function normalizeProjectId(value: unknown, fallback = ''): string {
  return recognizeProjectId(value) ?? fallback;
}

/**
 * Precedência de leitura: `settings.json` primeiro, `workspaceState` legado em
 * seguida (migração transparente dos workspaces já em uso) e por fim o valor
 * inferido do ambiente. Garante que um reload nunca reverta a seleção.
 */
export function resolvePersistedPreference<T>(
  sources: { settings?: unknown; workspaceState?: unknown; inferred?: unknown },
  recognize: (value: unknown) => T | undefined,
  fallback: T
): T {
  for (const candidate of [sources.settings, sources.workspaceState, sources.inferred]) {
    const recognized = recognize(candidate);
    if (recognized !== undefined) return recognized;
  }

  return fallback;
}

const TOPOLOGY_PATTERN = /(\*\*Topologia de Agentes\*\*:\s*)`?[^`\n]*`?/i;
const AUTONOMY_PATTERN = /(\*\*N[íi]vel de Autonomia\*\*:\s*)`?[^`\n]*`?/i;

/** Lê os metadados de topologia/autonomia declarados em `CURRENT.md`. */
export function parseModesFromCurrentMarkdown(content: string): Partial<SddModePreferences> {
  const parsed: Partial<SddModePreferences> = {};

  const topology = recognizeTopology(content.match(/\*\*Topologia de Agentes\*\*:\s*`?([^`\n]+)`?/i)?.[1]);
  if (topology) parsed.topology = topology;

  const autonomy = recognizeAutonomy(content.match(/\*\*N[íi]vel de Autonomia\*\*:\s*`?([^`\n]+)`?/i)?.[1]);
  if (autonomy) parsed.autonomy = autonomy;

  return parsed;
}

/**
 * Sincroniza os metadados no `CURRENT.md`, atualizando a linha existente ou
 * inserindo-a logo após `Status` (ou após o primeiro item de lista) quando
 * o arquivo ainda não declara o campo.
 */
export function applyModesToCurrentMarkdown(content: string, modes: Partial<SddModePreferences>): string {
  let updated = content;

  if (modes.topology) {
    const token = TOPOLOGY_DOCUMENT_TOKEN[modes.topology];
    const line = `**Topologia de Agentes**: \`${token}\``;
    updated = TOPOLOGY_PATTERN.test(updated)
      ? updated.replace(TOPOLOGY_PATTERN, `$1\`${token}\``)
      : insertMetadataLine(updated, line, /(^[*-]\s+\*\*Status\*\*:[^\n]*\n)/im);
  }

  if (modes.autonomy) {
    const token = AUTONOMY_DOCUMENT_TOKEN[modes.autonomy];
    const line = `**Nível de Autonomia**: \`${token}\``;
    updated = AUTONOMY_PATTERN.test(updated)
      ? updated.replace(AUTONOMY_PATTERN, `$1\`${token}\``)
      : insertMetadataLine(updated, line, /(^[*-]\s+\*\*Topologia de Agentes\*\*:[^\n]*\n)/im);
  }

  return updated;
}

function insertMetadataLine(content: string, line: string, anchor: RegExp): string {
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
