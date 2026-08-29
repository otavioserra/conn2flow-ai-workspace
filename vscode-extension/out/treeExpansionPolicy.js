"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTreeExpansionVersion = normalizeTreeExpansionVersion;
exports.nextTreeExpansionVersion = nextTreeExpansionVersion;
exports.treeSectionId = treeSectionId;
function normalizeTreeExpansionVersion(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}
function nextTreeExpansionVersion(current) {
    const normalized = normalizeTreeExpansionVersion(current);
    return normalized < Number.MAX_SAFE_INTEGER ? normalized + 1 : 0;
}
function treeSectionId(section, version) {
    return `conn2flow.section.${section}.${normalizeTreeExpansionVersion(version)}`;
}
//# sourceMappingURL=treeExpansionPolicy.js.map