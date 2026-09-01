export type ReleaseIncrement = 'patch' | 'minor' | 'major';
export type ReleasePermission = 'unknown' | 'denied' | 'allowed';
export type ReleaseProduct = 'manager' | 'installer';
export type ReleaseBlocker =
  | 'workspace-untrusted'
  | 'permission-denied'
  | 'permission-unknown'
  | 'dirty-tree'
  | 'detached-head'
  | 'non-github-remote'
  | 'tag-collision'
  | 'documentation-outdated'
  | 'draft-missing'
  | 'required-file-missing'
  | 'workflow-busy';

export const REQUIRED_RELEASE_DOCUMENTS = ['README.md', 'README-PT-BR.md', 'CHANGELOG.md'] as const;

export interface ProductVersionSource {
  /** Caminho POSIX relativo à raiz do repositório Core. */
  file: string;
  /** Padrão cujo primeiro grupo de captura é a versão semântica. */
  pattern: RegExp;
}

export interface ResolvedProductVersion {
  version?: string;
  file?: string;
  candidates: string[];
}

/**
 * Fontes de versão por produto, em ordem de precedência.
 *
 * O instalador v2 concentra a versão canônica em `InstallerGuard::VERSION`; o `index.php`
 * apenas referencia a constante (`$_GESTOR_INSTALADOR['versao'] = InstallerGuard::VERSION;`),
 * por isso ele permanece somente como fallback retrocompatível para instaladores v1, onde a
 * versão ainda era um literal na atribuição.
 */
export const PRODUCT_VERSION_SOURCES: Readonly<Record<ReleaseProduct, readonly ProductVersionSource[]>> = {
  manager: [
    {
      file: 'gestor/config.php',
      pattern: /\$_GESTOR\[['"]versao['"]\]\s*=\s*['"](\d+\.\d+\.\d+)['"]/
    }
  ],
  installer: [
    {
      file: 'gestor-instalador/src/InstallerGuard.php',
      pattern: /const\s+VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/
    },
    {
      file: 'gestor-instalador/index.php',
      pattern: /(?:const\s+VERSION|\$_GESTOR_INSTALADOR\[['"]versao['"]\])\s*=\s*['"]?(\d+\.\d+\.\d+)['"]?/
    }
  ]
};

export function productVersionCandidates(sources: readonly ProductVersionSource[]): string[] {
  return sources.map(source => source.file);
}

/**
 * Percorre as fontes na ordem declarada e devolve a primeira versão encontrada.
 * `readSource` devolve `undefined` quando o arquivo não existe, o que faz a resolução
 * degradar para a próxima fonte em vez de falhar o preflight.
 */
export function resolveProductVersion(
  sources: readonly ProductVersionSource[],
  readSource: (file: string) => string | undefined
): ResolvedProductVersion {
  const candidates = productVersionCandidates(sources);
  for (const source of sources) {
    const content = readSource(source.file);
    if (typeof content !== 'string') continue;
    const version = content.match(source.pattern)?.[1];
    if (version) return { version, file: source.file, candidates };
  }
  return { candidates };
}

export interface ReleaseGateInput {
  workspaceTrusted: boolean;
  permission: ReleasePermission;
  dirtyFiles: readonly string[];
  branch?: string;
  githubRemote: boolean;
  tagCollision: boolean;
  documentationReady: boolean;
  draftReady: boolean;
  requiredFilesReady?: boolean;
  workflowIdle?: boolean;
}

export interface ReleaseGateResult {
  canPrepare: true;
  canExecute: boolean;
  blockers: ReleaseBlocker[];
}

export interface ReleaseDraftSuggestion {
  product: ReleaseProduct;
  increment: ReleaseIncrement;
  currentVersion: string;
  nextVersion: string;
  tag: string;
  tagMessage: string;
  commitMessage: string;
  releaseNotes: string;
  mode: 'automatic' | 'manual';
}

export interface WorkflowRun {
  databaseId: number;
  headBranch: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
}

function normalizeWorkflowRunValue(value: string | null | undefined): string {
  return String(value || '').toLocaleLowerCase('en-US');
}

export function selectWorkflowRun(
  runs: readonly WorkflowRun[],
  tag: string,
  triggeredAfter: Date
): WorkflowRun | undefined {
  const threshold = triggeredAfter.getTime();
  const eligible = runs
    .filter(run => {
      const createdAt = Date.parse(run.createdAt);
      const status = normalizeWorkflowRunValue(run.status);
      const conclusion = normalizeWorkflowRunValue(run.conclusion);
      return Number.isInteger(run.databaseId) &&
        run.headBranch === tag &&
        Number.isFinite(createdAt) &&
        createdAt >= threshold &&
        !(status === 'completed' && conclusion === 'failure');
    })
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));

  const latest = eligible[0];
  if (!latest) return undefined;
  if (
    normalizeWorkflowRunValue(latest.status) === 'completed' &&
    normalizeWorkflowRunValue(latest.conclusion) === 'success'
  ) {
    return latest;
  }

  return eligible.find(run => {
    const status = normalizeWorkflowRunValue(run.status);
    return status === 'in_progress' || status === 'queued';
  });
}

function normalizeReleasePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\.\//, '').toLocaleLowerCase('en-US');
}

export function inspectReleaseDocumentPaths(paths: readonly string[]): {
  required: string[];
  workflows: string[];
  missing: string[];
  ready: boolean;
} {
  const normalized = new Map(paths.map(file => [normalizeReleasePath(file), file]));
  const required = REQUIRED_RELEASE_DOCUMENTS.filter(file => normalized.has(normalizeReleasePath(file)));
  const missing: string[] = REQUIRED_RELEASE_DOCUMENTS.filter(file => !normalized.has(normalizeReleasePath(file)));
  const workflows = paths.filter(file => /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(normalizeReleasePath(file)));
  if (workflows.length === 0) missing.push('.github/workflows/*.yml');
  return { required: [...required], workflows, missing, ready: missing.length === 0 };
}

export function inspectReleaseDocumentContents(
  documents: Readonly<Record<string, string>>,
  managerVersion?: string,
  installerVersion?: string
): string[] {
  const normalized = new Map(
    Object.entries(documents).map(([file, content]) => [normalizeReleasePath(file), content])
  );
  const readme = normalized.get('readme.md') || '';
  const readmePt = normalized.get('readme-pt-br.md') || '';
  const changelog = normalized.get('changelog.md') || '';
  const issues: string[] = [];

  const managerCandidates = managerVersion
    ? [managerVersion, bumpSemver(managerVersion, 'patch'), bumpSemver(managerVersion, 'minor'), bumpSemver(managerVersion, 'major')]
    : [];
  const installerCandidates = installerVersion
    ? [installerVersion, bumpSemver(installerVersion, 'patch'), bumpSemver(installerVersion, 'minor'), bumpSemver(installerVersion, 'major')]
    : [];

  if (managerCandidates.length > 0) {
    const hasReadme = managerCandidates.some(v => readme.includes(`v${v}`));
    const hasReadmePt = managerCandidates.some(v => readmePt.includes(`v${v}`));
    if (!hasReadme || !hasReadmePt) {
      issues.push('README:manager-version');
    }
  }

  if (installerCandidates.length > 0) {
    const hasReadme = installerCandidates.some(v => readme.includes(`instalador-v${v}`));
    const hasReadmePt = installerCandidates.some(v => readmePt.includes(`instalador-v${v}`));
    if (!hasReadme || !hasReadmePt) {
      issues.push('README:installer-version');
    }
  }

  if (managerCandidates.length > 0) {
    const hasChangelog = managerCandidates.some(v => changelog.includes(`[${v}]`));
    if (!hasChangelog) {
      issues.push('CHANGELOG:manager-version');
    }
  }

  for (const [file, content] of normalized) {
    if (/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(file) &&
      (!/^name:\s*\S+/m.test(content) || !/^on:\s*$/m.test(content))) {
      issues.push(`${file}:header`);
    }
  }
  return issues;
}

export function evaluateReleaseGate(input: ReleaseGateInput): ReleaseGateResult {
  const blockers: ReleaseBlocker[] = [];
  if (!input.workspaceTrusted) blockers.push('workspace-untrusted');
  if (input.permission === 'denied') blockers.push('permission-denied');
  if (input.permission === 'unknown') blockers.push('permission-unknown');
  if (input.dirtyFiles.length > 0) blockers.push('dirty-tree');
  if (!input.branch) blockers.push('detached-head');
  if (!input.githubRemote) blockers.push('non-github-remote');
  if (input.tagCollision) blockers.push('tag-collision');
  if (!input.documentationReady) blockers.push('documentation-outdated');
  if (!input.draftReady) blockers.push('draft-missing');
  if (input.requiredFilesReady === false) blockers.push('required-file-missing');
  if (input.workflowIdle === false) blockers.push('workflow-busy');
  return { canPrepare: true, canExecute: blockers.length === 0, blockers };
}

export function createReleaseDraftSuggestion(
  product: ReleaseProduct,
  currentVersion: string,
  increment: ReleaseIncrement,
  recentCommits: readonly string[] = [],
  activeBatch = ''
): ReleaseDraftSuggestion {
  const nextVersion = bumpSemver(currentVersion, increment);
  const tag = `${product === 'manager' ? 'gestor-v' : 'instalador-v'}${nextVersion}`;
  const notes = recentCommits.length > 0
    ? recentCommits.map(commit => `- ${commit}`).join('\n')
    : `- ${activeBatch || tag}`;
  const batchLine = activeBatch ? `\n\nSDD: ${activeBatch}` : '';
  return {
    product,
    increment,
    currentVersion,
    nextVersion,
    tag,
    tagMessage: tag,
    commitMessage: `chore(release): publish ${product} ${nextVersion}`,
    releaseNotes: `## ${tag}\n\n${notes}${batchLine}`,
    mode: 'automatic'
  };
}

export function bumpSemver(version: string, increment: ReleaseIncrement): string {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Invalid semantic version: ${version}`);
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (increment === 'major') return `${major + 1}.0.0`;
  if (increment === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export function replaceReleaseVersionMentions(
  value: string,
  previousVersions: readonly string[],
  nextVersion: string,
  previousTags: readonly string[],
  nextTag: string
): string {
  let updated = value;
  const replacements = [
    ...previousTags.map(previous => [previous, nextTag] as const),
    ...previousVersions.map(previous => [previous, nextVersion] as const)
  ];

  for (const [previous, next] of replacements) {
    if (!previous || previous === next) continue;
    updated = updated.split(previous).join(next);
  }
  return updated;
}

export function classifyViewerPermission(permission: string | undefined): ReleasePermission {
  if (!permission) return 'unknown';
  return ['WRITE', 'MAINTAIN', 'ADMIN'].includes(permission.toUpperCase()) ? 'allowed' : 'denied';
}

export function githubRepositoryUrl(remote: string): string | undefined {
  const match = remote.trim().match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/i);
  return match ? `https://github.com/${match[1]}/${match[2]}` : undefined;
}

export function quoteShellArg(value: string, shell: 'bash' | 'powershell' | 'cmd'): string {
  if (shell === 'bash') return `'${value.replace(/'/g, `'"'"'`)}'`;
  if (shell === 'powershell') return `'${value.replace(/'/g, "''")}'`;
  return `"${value.replace(/"/g, '""')}"`;
}
