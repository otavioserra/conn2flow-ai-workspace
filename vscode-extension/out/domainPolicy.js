"use strict";
/**
 * Pure policy for "Initialize MDD in this Project" (ARCH-019 Phase 1 / REQ-093).
 * Domains come from `mdd bootstrap --list-domains --json`, which reads domains/<id>/domain.json
 * at runtime: the extension never hard-codes a closed list, so a domain added by PR shows up here.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONN2FLOW_DOMAIN = exports.AUTO_DOMAIN = void 0;
exports.normalizeProjectDomain = normalizeProjectDomain;
exports.isConn2FlowDomain = isConn2FlowDomain;
exports.buildListDomainsArgs = buildListDomainsArgs;
exports.buildBootstrapArgs = buildBootstrapArgs;
exports.parseDomainList = parseDomainList;
exports.buildDomainPickItems = buildDomainPickItems;
exports.parseBootstrapReport = parseBootstrapReport;
exports.AUTO_DOMAIN = 'auto';
exports.CONN2FLOW_DOMAIN = 'conn2flow';
const DOMAIN_ID = /^[a-z0-9][a-z0-9-]{0,63}$/;
/** Any well-formed id is accepted (open setting); anything else means auto. */
function normalizeProjectDomain(value) {
    const id = typeof value === 'string' ? value.trim().toLowerCase() : '';
    return DOMAIN_ID.test(id) ? id : exports.AUTO_DOMAIN;
}
/** Conn2Flow sections (Core, Projects, Diagnostics) stay visible for auto and conn2flow only. */
function isConn2FlowDomain(configured) {
    const id = normalizeProjectDomain(configured);
    return id === exports.AUTO_DOMAIN || id === exports.CONN2FLOW_DOMAIN;
}
function withMatrix(args, matrix) {
    return matrix ? [...args, '--matrix', matrix] : args;
}
function buildListDomainsArgs(projectRoot, matrix) {
    return withMatrix(['bootstrap', '--list-domains', '--json', '--path', projectRoot], matrix);
}
function buildBootstrapArgs(projectRoot, domain, matrix) {
    return withMatrix(['bootstrap', '--path', projectRoot, '--domain', normalizeProjectDomain(domain), '--json'], matrix);
}
function lastJson(stdout) {
    for (const line of stdout.split(/\r?\n/).map(item => item.trim()).filter(Boolean).reverse()) {
        try {
            return JSON.parse(line);
        }
        catch { /* log noise */ }
    }
    throw new Error('mdd bootstrap did not return JSON');
}
function parseDomainList(stdout) {
    const raw = lastJson(stdout);
    if (!raw || !Array.isArray(raw.domains))
        throw new Error('mdd bootstrap --list-domains returned no domains');
    const domains = raw.domains.filter((item) => item && DOMAIN_ID.test(String(item.id))).map((item) => ({
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
    const errors = Array.isArray(raw.errors) ? raw.errors.map((item) => ({ domain: String(item?.domain ?? '?'), error: String(item?.error ?? '') })) : [];
    return { domains, detected, errors };
}
/** `auto` first (with what it would pick), then every discovered domain; the saved one is pre-selected. */
function buildDomainPickItems(catalog, configured, labels) {
    const current = normalizeProjectDomain(configured);
    const detected = catalog.detected;
    const items = [{
            label: exports.AUTO_DOMAIN,
            description: labels.auto(detected?.id || '?'),
            detail: detected ? (detected.fallback ? labels.fallback : labels.autoDetail(detected.evidence.join(', '))) : undefined,
            domainId: exports.AUTO_DOMAIN
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
function parseBootstrapReport(stdout) {
    const raw = lastJson(stdout);
    if (!raw || typeof raw.domain !== 'string')
        throw new Error('mdd bootstrap returned no report');
    const count = (value) => Array.isArray(value) ? value.length : 0;
    return {
        domain: raw.domain,
        installed: count(raw.skills?.installed),
        preserved: count(raw.skills?.preserved),
        memoryCreated: count(raw.memory?.created),
        memoryPreserved: !!raw.memory?.preserved,
        localSkills: Array.isArray(raw.local_skill?.created) ? raw.local_skill.created.map(String) : []
    };
}
//# sourceMappingURL=domainPolicy.js.map