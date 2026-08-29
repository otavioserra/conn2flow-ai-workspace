export const MPE_VIEW_TYPE = 'markdown-preview-enhanced';

export type PreviewTabKind = 'text' | 'custom' | 'other';
export type PreviewCloseReason = 'target-source' | 'managed-preview' | undefined;

export interface PreviewTabDescriptor {
  kind: PreviewTabKind;
  uriPath?: string;
  viewType?: string;
}

export function normalizePreviewPath(value: string): string {
  return value.replace(/\//g, '\\').toLocaleLowerCase('en-US');
}

export function getPreviewCloseReason(
  tab: PreviewTabDescriptor,
  targetPath: string,
  managedPreviewPath?: string
): PreviewCloseReason {
  if (!tab.uriPath) {
    return undefined;
  }

  const tabPath = normalizePreviewPath(tab.uriPath);
  const target = normalizePreviewPath(targetPath);

  if (tab.kind === 'text' && tabPath === target) {
    return 'target-source';
  }

  if (
    tab.kind === 'custom' &&
    tab.viewType === MPE_VIEW_TYPE &&
    managedPreviewPath &&
    tabPath === normalizePreviewPath(managedPreviewPath) &&
    tabPath !== target
  ) {
    return 'managed-preview';
  }

  return undefined;
}
