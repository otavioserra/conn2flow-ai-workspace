export function normalizeTreeExpansionVersion(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function nextTreeExpansionVersion(current: unknown): number {
  const normalized = normalizeTreeExpansionVersion(current);
  return normalized < Number.MAX_SAFE_INTEGER ? normalized + 1 : 0;
}

export function treeSectionId(section: string, version: unknown): string {
  return `conn2flow.section.${section}.${normalizeTreeExpansionVersion(version)}`;
}
