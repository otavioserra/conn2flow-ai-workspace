/**
 * Pure policy for "Initialize MDD in this Project" (ARCH-019 Phase 1 / REQ-093).
 * Domains come from `mdd bootstrap --list-domains --json`, which reads domains/<id>/domain.json
 * at runtime: the extension never hard-codes a closed list, so a domain added by PR shows up here.
 */

export const AUTO_DOMAIN = 'auto';
export const CONN2FLOW_DOMAIN = 'conn2flow';
const DOMAIN_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

export interface DomainInfo {
  id: string;
  name: string;
  description: string;
  skillsMode: string;
  localGuide: boolean;
}

export interface DomainDetection {
  id: string;
  evidence: string[];
  fallback: boolean;
}

export interface DomainCatalog {
  domains: DomainInfo[];
  detected?: DomainDetection;
  errors: Array<{ domain: string; error: string }>;
}

export interface DomainPickItem {
  label: string;
  description?: string;
  detail?: string;
  domainId: string;
  picked?: boolean;
}

export interface DomainPickLabels {
  auto: (detected: string) => string;
  autoDetail: (evidence: string) => string;
  fallback: string;
  current: string;
}

export interface BootstrapSummary {
  domain: string;
  installed: number;
  preserved: number;
  memoryCreated: number;
  memoryPreserved: boolean;
  localSkills: string[];
}

/** Any well-formed id is accepted (open setting); anything else means auto. */
export function normalizeProjectDomain(value: unknown): string {
  const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return DOMAIN_ID.test(id) ? id : AUTO_DOMAIN;
}

/** Conn2Flow sections (Core, Projects, Diagnostics) stay visible for auto and conn2flow only. */
export function isConn2FlowDomain(configured: unknown): boolean {
  const id = normalizeProjectDomain(configured);
  return id === AUTO_DOMAIN || id === CONN2FLOW_DOMAIN;
}

function withMatrix(args: string[], matrix?: string): string[] {
  return matrix ? [...args, '--matrix', matrix] : args;
}

export function buildListDomainsArgs(projectRoot: string, matrix?: string): string[] {
  return withMatrix(['bootstrap', '--list-domains', '--json', '--path', projectRoot], matrix);
}

export function buildBootstrapArgs(projectRoot: string, domain: string, matrix?: string): string[] {
  return withMatrix(['bootstrap', '--path', projectRoot, '--domain', normalizeProjectDomain(domain), '--json'], matrix);
}

function lastJson(stdout: string): any {
  for (const line of stdout.split(/\r?\n/).map(item => item.trim()).filter(Boolean).reverse()) {
    try { return JSON.parse(line); } catch { /* log noise */ }
  }
  throw new Error('mdd bootstrap did not return JSON');
}

export function parseDomainList(stdout: string): DomainCatalog {
  const raw = lastJson(stdout);
  if (!raw || !Array.isArray(raw.domains)) throw new Error('mdd bootstrap --list-domains returned no domains');
  const domains = raw.domains.filter((item: any) => item && DOMAIN_ID.test(String(item.id))).map((item: any): DomainInfo => ({
    id: String(item.id),
    name: String(item.name || item.id),
    description: String(item.description || ''),
    skillsMode: String(item.skills_mode || ''),
    localGuide: !!item.generate_local_project_skill
  }));
  const detected = raw.detected && DOMAIN_ID.test(String(raw.detected.id)) ? {
    id: String(raw.detected.id),
    evidence: Array.isArray(raw.detected.evidence) ? raw.detected.evidence.map(String) : [],
    fallback: !!raw.detected.fallback
  } : undefined;
  const errors = Array.isArray(raw.errors) ? raw.errors.map((item: any) => ({ domain: String(item?.domain ?? '?'), error: String(item?.error ?? '') })) : [];
  return { domains, detected, errors };
}

/** `auto` first (with what it would pick), then every discovered domain; the saved one is pre-selected. */
export function buildDomainPickItems(catalog: DomainCatalog, configured: unknown, labels: DomainPickLabels): DomainPickItem[] {
  const current = normalizeProjectDomain(configured);
  const detected = catalog.detected;
  const items: DomainPickItem[] = [{
    label: AUTO_DOMAIN,
    description: labels.auto(detected?.id || '?'),
    detail: detected ? (detected.fallback ? labels.fallback : labels.autoDetail(detected.evidence.join(', '))) : undefined,
    domainId: AUTO_DOMAIN
  }];
  for (const domain of catalog.domains) {
    items.push({ label: domain.id, description: domain.name, detail: domain.description, domainId: domain.id });
  }
  for (const item of items) {
    if (item.domainId === current) {
      item.picked = true;
      item.description = [item.description, labels.current].filter(Boolean).join(' · ');
    }
  }
  return items;
}

export function parseBootstrapReport(stdout: string): BootstrapSummary {
  const raw = lastJson(stdout);
  if (!raw || typeof raw.domain !== 'string') throw new Error('mdd bootstrap returned no report');
  const count = (value: unknown) => Array.isArray(value) ? value.length : 0;
  return {
    domain: raw.domain,
    installed: count(raw.skills?.installed),
    preserved: count(raw.skills?.preserved),
    memoryCreated: count(raw.memory?.created),
    memoryPreserved: !!raw.memory?.preserved,
    localSkills: Array.isArray(raw.local_skill?.created) ? raw.local_skill.created.map(String) : []
  };
}
