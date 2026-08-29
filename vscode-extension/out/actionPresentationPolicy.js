"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectPresentation = selectPresentation;
function selectPresentation(input) {
    if (input.override === 'quick')
        return input.fieldCount === 0 ? 'direct' : 'quick';
    if (input.override === 'form')
        return 'form';
    if (input.impact === 'remote' || input.impact === 'destructive') {
        return 'form';
    }
    if (input.fieldCount <= 0)
        return 'direct';
    if (input.fieldCount === 1)
        return 'quick';
    if (input.fieldCount === 2)
        return input.hasDependentFields ? 'quick' : 'form';
    return 'form';
}
//# sourceMappingURL=actionPresentationPolicy.js.map