"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMORY_GARDENING_LIMITS = void 0;
exports.classifyMemoryHealth = classifyMemoryHealth;
exports.MEMORY_GARDENING_LIMITS = Object.freeze({
    warningBytes: 50 * 1024,
    warningLines: 200,
    criticalBytes: 75 * 1024,
    criticalLines: 300,
    targetBytes: 25 * 1024,
    recentTasksMin: 20,
    recentTasksMax: 25
});
function classifyMemoryHealth(sizeBytes, lineCount) {
    if (sizeBytes >= exports.MEMORY_GARDENING_LIMITS.criticalBytes ||
        lineCount >= exports.MEMORY_GARDENING_LIMITS.criticalLines) {
        return 'critical';
    }
    if (sizeBytes >= exports.MEMORY_GARDENING_LIMITS.warningBytes ||
        lineCount >= exports.MEMORY_GARDENING_LIMITS.warningLines) {
        return 'warning';
    }
    return 'healthy';
}
//# sourceMappingURL=gardeningPolicy.js.map