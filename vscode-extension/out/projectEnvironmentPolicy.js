"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVmProject = isVmProject;
exports.isLocalVmProject = isLocalVmProject;
function isVmProject(data, projectId) {
    if (!data || !projectId)
        return false;
    const deployMode = data.devProjects?.[projectId]?.deploy_mode;
    return typeof deployMode === 'string' && deployMode.trim().toLocaleLowerCase('en-US') === 'ssh';
}
function isLocalVmProject(data, projectId) {
    if (!isVmProject(data, projectId) || !projectId)
        return false;
    const local = data?.devProjects?.[projectId]?.local;
    return local === true || (typeof local === 'string' && local.trim().toLocaleLowerCase('en-US') === 'true');
}
//# sourceMappingURL=projectEnvironmentPolicy.js.map