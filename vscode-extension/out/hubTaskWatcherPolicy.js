"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateTaskEvent = evaluateTaskEvent;
exports.evaluateCompletionEvent = evaluateCompletionEvent;
exports.parseHubPayload = parseHubPayload;
function evaluateTaskEvent(watcherEnabled, task) {
    if (!watcherEnabled || !task) {
        return { shouldHandle: false };
    }
    if (task.status === 'dispatched') {
        return {
            shouldHandle: true,
            reqId: task.reqId,
            status: task.status
        };
    }
    return {
        shouldHandle: false,
        status: task.status
    };
}
function evaluateCompletionEvent(watcherEnabled, completion) {
    if (!watcherEnabled || !completion) {
        return { shouldHandle: false };
    }
    if (completion.status === 'success' && completion.role === 'executor') {
        return {
            shouldHandle: true,
            batchId: completion.batchId,
            role: completion.role,
            status: completion.status
        };
    }
    return {
        shouldHandle: false,
        role: completion.role,
        status: completion.status
    };
}
function parseHubPayload(rawContent) {
    try {
        return JSON.parse(rawContent);
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=hubTaskWatcherPolicy.js.map