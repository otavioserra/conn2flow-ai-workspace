"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPE_VIEW_TYPE = void 0;
exports.runPreviewLifecycle = runPreviewLifecycle;
exports.normalizePreviewPath = normalizePreviewPath;
exports.getPreviewCloseReason = getPreviewCloseReason;
exports.isTargetMpePreview = isTargetMpePreview;
exports.MPE_VIEW_TYPE = 'markdown-preview-enhanced';
async function runPreviewLifecycle(lifecycle) {
    await lifecycle.closePreviousManagedPreview();
    await lifecycle.openPreview();
    const focused = await lifecycle.waitUntilPreviewIsActive();
    await lifecycle.closeTargetSource();
    return focused;
}
function normalizePreviewPath(value) {
    return value.replace(/\//g, '\\').toLocaleLowerCase('en-US');
}
function getPreviewCloseReason(tab, targetPath, managedPreviewPath) {
    if (!tab.uriPath) {
        return undefined;
    }
    const tabPath = normalizePreviewPath(tab.uriPath);
    const target = normalizePreviewPath(targetPath);
    if (tab.kind === 'text' && tabPath === target) {
        return 'target-source';
    }
    if (tab.kind === 'custom' &&
        tab.viewType === exports.MPE_VIEW_TYPE &&
        managedPreviewPath &&
        tabPath === normalizePreviewPath(managedPreviewPath) &&
        tabPath !== target) {
        return 'managed-preview';
    }
    return undefined;
}
function isTargetMpePreview(tab, targetPath) {
    return Boolean(tab.kind === 'custom' &&
        tab.viewType === exports.MPE_VIEW_TYPE &&
        tab.uriPath &&
        normalizePreviewPath(tab.uriPath) === normalizePreviewPath(targetPath));
}
//# sourceMappingURL=markdownPreviewPolicy.js.map