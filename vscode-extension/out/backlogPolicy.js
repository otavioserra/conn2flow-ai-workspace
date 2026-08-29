"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBacklogIndex = parseBacklogIndex;
exports.parseBacklogFileStatus = parseBacklogFileStatus;
exports.hasBacklogStatusDrift = hasBacklogStatusDrift;
function parseBacklogIndex(markdown) {
    const items = [];
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
function parseBacklogFileStatus(markdown) {
    return markdown.match(/\*\*Status\*\*\s*:\s*`?([A-Z][A-Z_-]*)`?/i)?.[1]?.toUpperCase();
}
function hasBacklogStatusDrift(item) {
    return Boolean(item.fileStatus && item.fileStatus !== item.indexStatus);
}
//# sourceMappingURL=backlogPolicy.js.map