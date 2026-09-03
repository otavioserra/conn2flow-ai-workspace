export interface ProjectEnvironmentEntry {
  deploy_mode?: unknown;
  local?: unknown;
}

export interface ProjectEnvironmentData {
  devProjects?: Record<string, ProjectEnvironmentEntry>;
}

export function isVmProject(
  data: ProjectEnvironmentData | undefined,
  projectId: string | undefined
): boolean {
  if (!data || !projectId) return false;
  const deployMode = data.devProjects?.[projectId]?.deploy_mode;
  return typeof deployMode === 'string' && deployMode.trim().toLocaleLowerCase('en-US') === 'ssh';
}

export function isLocalVmProject(
  data: ProjectEnvironmentData | undefined,
  projectId: string | undefined
): boolean {
  if (!isVmProject(data, projectId) || !projectId) return false;
  const local = data?.devProjects?.[projectId]?.local;
  return local === true || (typeof local === 'string' && local.trim().toLocaleLowerCase('en-US') === 'true');
}
