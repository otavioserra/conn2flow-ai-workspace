export const MPE_VIEW_TYPE = 'markdown-preview-enhanced';

export type PreviewTabKind = 'text' | 'custom' | 'other';
export type PreviewCloseReason = 'target-source' | 'managed-preview' | undefined;

export interface PreviewTabDescriptor {
  kind: PreviewTabKind;
  uriPath?: string;
  viewType?: string;
}

export interface PreviewLifecycle {
  closePreviousManagedPreview(): Promise<void>;
  openPreview(): Promise<void>;
  waitUntilPreviewIsActive(): Promise<boolean>;
  closeTargetSource(): Promise<void>;
}

export async function runPreviewLifecycle(lifecycle: PreviewLifecycle): Promise<boolean> {
  await lifecycle.closePreviousManagedPreview();
  await lifecycle.openPreview();
  const focused = await lifecycle.waitUntilPreviewIsActive();
  await lifecycle.closeTargetSource();
  return focused;
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

export function isTargetMpePreview(tab: PreviewTabDescriptor, targetPath: string): boolean {
  return Boolean(
    tab.kind === 'custom' &&
    tab.viewType === MPE_VIEW_TYPE &&
    tab.uriPath &&
    normalizePreviewPath(tab.uriPath) === normalizePreviewPath(targetPath)
  );
}
