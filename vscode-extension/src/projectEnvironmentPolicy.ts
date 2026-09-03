export interface ProjectEnvironmentEntry {
  deploy_mode?: unknown;
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
