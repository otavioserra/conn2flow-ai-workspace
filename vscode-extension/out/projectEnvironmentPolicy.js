"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVmProject = isVmProject;
function isVmProject(data, projectId) {
    if (!data || !projectId)
        return false;
    const deployMode = data.devProjects?.[projectId]?.deploy_mode;
    return typeof deployMode === 'string' && deployMode.trim().toLocaleLowerCase('en-US') === 'ssh';
}
//# sourceMappingURL=projectEnvironmentPolicy.js.map