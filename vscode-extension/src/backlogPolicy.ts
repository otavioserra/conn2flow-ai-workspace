export interface BacklogItem {
  id: string;
  fileName: string;
  type: string;
  indexStatus: string;
  fileStatus?: string;
  title: string;
  nextAction: string;
  updatedAt: string;
}

export function parseBacklogIndex(markdown: string): BacklogItem[] {
  const items: BacklogItem[] = [];
  const rowPattern = /^\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+?)\s*\|\s*`?([^|`]+?)`?\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$/gm;
  for (const match of markdown.matchAll(rowPattern)) {
    items.push({
      id: match[1].trim(),
      fileName: match[2].trim(),
      type: match[3].trim(),
      indexStatus: match[4].trim(),
      title: match[5].trim(),
      nextAction: match[6].trim(),
      updatedAt: match[7].trim()
    });
  }
  return items;
}

export function parseBacklogFileStatus(markdown: string): string | undefined {
  return markdown.match(/\*\*Status\*\*\s*:\s*`?([A-Z][A-Z_-]*)`?/i)?.[1]?.toUpperCase();
}

export function hasBacklogStatusDrift(item: BacklogItem): boolean {
  return Boolean(item.fileStatus && item.fileStatus !== item.indexStatus);
}
