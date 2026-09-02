import * as path from 'path';
import type { TranslationKey } from './localizationCatalog';

/**
 * Identificação obrigatória do repositório alvo injetada em todos os prompts
 * gerados pela ponte de agentes (REQ-044 / BATCH-046).
 *
 * Módulo puro: sem dependência de `vscode` ou de I/O, para permitir testes
 * unitários diretos sobre `out/agentPromptPolicy.js`.
 */
export interface AgentPromptIdentityInput {
  /** Raiz absoluta do `sdd/` do escopo ativo (SddScopeManager.getActiveSddRoot). */
  sddRoot?: string;
  /** Raiz absoluta do workspace, usada como fallback quando o SDD não resolve. */
  workspaceRoot?: string;
  /** Caminho absoluto de `sdd/human-requests/CURRENT.md`. */
  currentPath?: string;
  /** Caminho absoluto da requisição ativa (`req-XXX.md`). */
  reqPath?: string;
  /** Ponteiro da requisição ativa (ex.: `req-044.md`). */
  request?: string;
}

export interface AgentPromptIdentity {
  repo: string;
  root: string;
  sddRoot: string;
  currentPath: string;
  reqPath: string;
  request: string;
}

const SDD_DIRECTORY = 'sdd';
const CURRENT_RELATIVE = ['human-requests', 'CURRENT.md'];

function normalize(value: string | undefined): string {
  const trimmed = (value || '').trim();
  return trimmed ? path.resolve(trimmed) : '';
}

function resolveSddRoot(input: AgentPromptIdentityInput): string {
  const explicit = normalize(input.sddRoot);
  if (explicit) return explicit;

  const workspaceRoot = normalize(input.workspaceRoot);
  return workspaceRoot ? path.join(workspaceRoot, SDD_DIRECTORY) : '';
}

function resolveRepositoryRoot(sddRoot: string, input: AgentPromptIdentityInput): string {
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
export function buildAgentPromptIdentity(
  input: AgentPromptIdentityInput = {},
  fallbackLabel = 'unknown'
): AgentPromptIdentity {
  const sddRoot = resolveSddRoot(input);
  const root = resolveRepositoryRoot(sddRoot, input);

  const currentPath =
    normalize(input.currentPath) || (sddRoot ? path.join(sddRoot, ...CURRENT_RELATIVE) : '');
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

/**
 * Chaves de catálogo que descrevem a topologia e a autonomia ativas dentro do
 * prompt gerado (REQ-049 / BATCH-051). Manter a resolução aqui — e não no
 * provider — permite testar a sincronização sem carregar `vscode`.
 */
export interface AgentPromptModeKeys {
  topologyKey: TranslationKey;
  rolesKey: TranslationKey;
  autonomyKey: TranslationKey;
}

const TOPOLOGY_LABEL_KEYS: Record<string, TranslationKey> = {
  duplo: 'mode.dual',
  triade: 'mode.triad'
};

const TOPOLOGY_ROLE_KEYS: Record<string, TranslationKey> = {
  duplo: 'agents.roles.dual',
  triade: 'agents.roles.triad'
};

const AUTONOMY_LABEL_KEYS: Record<string, TranslationKey> = {
  supervisionado: 'mode.supervised',
  autonomo_monitorado: 'mode.monitored',
  autonomo_headless: 'mode.headless'
};

export function resolvePromptModeKeys(modes: { topology?: string; autonomy?: string } = {}): AgentPromptModeKeys {
  const topology = modes.topology === 'duplo' ? 'duplo' : 'triade';
  const autonomy = AUTONOMY_LABEL_KEYS[modes.autonomy || ''] ? (modes.autonomy as string) : 'supervisionado';

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
export function findOrphanPlaceholders(text: string): string[] {
  const matches = text.match(/\{[a-zA-Z0-9_]+\}/g);
  return matches ? Array.from(new Set(matches)) : [];
}
