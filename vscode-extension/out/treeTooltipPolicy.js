"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.treeTooltipKeys = void 0;
exports.treeTooltipKey = treeTooltipKey;
exports.treeTooltipKeys = [
    'section.overview', 'section.sdd', 'section.core', 'section.projects', 'section.diagnostics', 'section.agents', 'section.custom',
    'overview.scope', 'overview.target', 'overview.noTarget', 'overview.language', 'overview.topology', 'overview.autonomy', 'agents.hubWatcherActive', 'agents.hubWatcherPaused',
    'agents.launchClaude', 'agents.copyPrompt', 'agents.recordHandoff', 'agents.prepareReview',
    'sdd.selectScope', 'sdd.viewMode', 'sdd.openCurrent', 'sdd.openSpec', 'sdd.openChecklist', 'sdd.browseRequests', 'sdd.browseBatches', 'sdd.browseBacklog', 'sdd.browseDecisions', 'sdd.browseHandoffs', 'sdd.autoGardening', 'sdd.runGardening', 'sdd.createGardening',
    'core.updateAll', 'core.syncResources', 'core.cssRebuild', 'core.cssAudit', 'release.verify', 'release.manager', 'release.installer', 'release.executeManager', 'release.executeInstaller', 'release.openActions',
    'projects.setTarget', 'projects.updateAll', 'projects.syncCore', 'projects.syncFiles', 'projects.deploy', 'projects.updateSelect', 'projects.deploySelect', 'projects.scaffold', 'projects.register', 'projects.clone', 'projects.syncTemplate',
    'diagnostics.dockerStatus', 'diagnostics.apacheLogs', 'diagnostics.phpLogs', 'diagnostics.truncatePhp', 'diagnostics.aiSync', 'diagnostics.syncAll',
    'docs.index', 'docs.panel', 'docs.cli', 'docs.orchestration', 'docs.architecture', 'docs.skills', 'docs.roadmap', 'custom.edit'
];
function treeTooltipKey(key) {
    return `tooltip.${key}`;
}
//# sourceMappingURL=treeTooltipPolicy.js.map