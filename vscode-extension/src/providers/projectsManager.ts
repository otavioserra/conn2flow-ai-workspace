import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { LocalizationManager } from './localizationManager';
import { PREFERENCE_KEYS, PREFERENCE_SECTION, recognizeProjectId } from '../workspacePreferencesPolicy';
import { isLocalVmProject, isVmProject } from '../projectEnvironmentPolicy';
import { normalizeVmConnection, VmConnection } from '../vmDiagnosticsPolicy';
import { extractProjectConfig, mergeProjectConfig, removeProjectConfig, scopedConfigFileName, serializeProjectConfig } from '../projectConfigEditorPolicy';

export interface DevProject {
  id: string;
  name: string;
  path: string;
  path_tests?: string;
  local?: boolean;
  url?: string;
  deploy_mode?: string;
  ssh_user?: string;
  ssh_host?: string;
  ssh_port?: number;
  ssh_target_path?: string;
}

interface ScopedConfigSession {
  projectId: string;
  envPath: string;
  filePath: string;
  dir: string;
}

export class ProjectsManager {
  /** Buffers temporários do Editor Isolado de Dados do Projeto (REQ-080). */
  private static readonly scopedConfigSessions = new Map<string, ScopedConfigSession>();

  private static readonly targetProjectChangedEmitter = new vscode.EventEmitter<string>();
  public static readonly onTargetProjectChanged = this.targetProjectChangedEmitter.event;

  private static toGitPath(value: string): string {
    return value.replace(/^([A-Za-z]):[\\/]/, (_, drive: string) => `/${drive.toLowerCase()}/`).replace(/\\/g, '/');
  }

  private static getCoreRoot(): string | undefined {
    const envPath = this.getEnvironmentFilePath();
    return envPath ? path.resolve(path.dirname(envPath), '..', '..') : undefined;
  }

  private static getRepositoryParent(): string | undefined {
    const root = this.getCoreRoot() || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    return root ? path.dirname(root) : undefined;
  }

  private static getGithubOwner(): string | undefined {
    const configured = vscode.workspace.getConfiguration('conn2flow').get<string>('githubOwner', '').trim();
    if (configured) return configured;
    const root = this.getCoreRoot();
    const configPath = root ? path.join(root, '.git', 'config') : undefined;
    if (!configPath || !fs.existsSync(configPath)) return undefined;
    const config = fs.readFileSync(configPath, 'utf8');
    return config.match(/github\.com[/:]([^/\s]+)\//i)?.[1];
  }
  public static getEnvironmentFilePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const candidates = [
        path.join(folder.uri.fsPath, 'dev-environment', 'data', 'environment.json'),
        path.join(folder.uri.fsPath, '..', 'conn2flow', 'dev-environment', 'data', 'environment.json'),
        path.join(folder.uri.fsPath, 'environment.json')
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return cand;
        }
      }
    }

    return undefined;
  }

  public static getEnvironmentTemplatePath(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const candidates = [
        path.join(folder.uri.fsPath, '..', 'conn2flow', 'dev-environment', 'templates', 'environment', 'environment.json'),
        path.join(folder.uri.fsPath, 'dev-environment', 'templates', 'environment', 'environment.json')
      ];

      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          return cand;
        }
      }
    }

    return undefined;
  }

  public static getEnvironmentData(): any | undefined {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      return undefined;
    }

    try {
      const raw = fs.readFileSync(envPath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  /**
   * `environment.json` continua sendo a fonte da verdade do pipeline; a
   * configuração `conn2flow.projects.activeId` só entra quando o arquivo não é
   * alcançável a partir do workspace aberto (REQ-049 / BATCH-051), evitando que
   * a seleção do operador se perca no reload da janela.
   */
  public static getTargetProject(): string | undefined {
    const data = this.getEnvironmentData();
    const target = data?.devEnvironment?.projectTarget;
    if (typeof target === 'string' && data?.devProjects?.[target]) {
      return target;
    }

    const persisted = recognizeProjectId(
      vscode.workspace.getConfiguration(PREFERENCE_SECTION).get<string>(PREFERENCE_KEYS.activeProjectId)
    );
    if (persisted && (!data?.devProjects || data.devProjects[persisted])) {
      return persisted;
    }

    return undefined;
  }

  public static getProject(projectId: string | undefined): DevProject | undefined {
    return projectId ? this.getProjectsList().find(project => project.id === projectId) : undefined;
  }

  public static isTargetVm(): boolean {
    const data = this.getEnvironmentData();
    return isVmProject(data, this.getTargetProject());
  }

  public static isProjectVmLocal(projectId: string | undefined): boolean {
    return isLocalVmProject(this.getEnvironmentData(), projectId);
  }

  public static remoteConfirmationArgument(projectId: string | undefined): string {
    return this.isProjectVmLocal(projectId) ? ' --confirmar-remoto' : '';
  }

  public static getTargetVmConnection(): VmConnection | undefined {
    const project = this.getProject(this.getTargetProject());
    return normalizeVmConnection(project ? {
      user: project.ssh_user,
      host: project.ssh_host,
      port: project.ssh_port ?? 22,
      targetPath: project.ssh_target_path
    } : undefined);
  }

  public static getProjectsList(): DevProject[] {
    const data = this.getEnvironmentData();
    const list: DevProject[] = [];

    if (data && data.devProjects) {
      for (const [id, proj] of Object.entries<any>(data.devProjects)) {
        list.push({
          id,
          name: proj.name || id,
          path: proj.path || '',
          path_tests: proj.path_tests,
          local: proj.local,
          url: proj.url,
          deploy_mode: proj.deploy_mode,
          ssh_user: proj.ssh_user,
          ssh_host: proj.ssh_host,
          ssh_port: proj.ssh_port,
          ssh_target_path: proj.ssh_target_path
        });
      }
    }

    return list;
  }

  public static async setTargetProject(projectId: string, onUpdated?: () => void): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    try {
      const data = this.getEnvironmentData();
      if (!data) return;

      if (!data.devEnvironment) {
        data.devEnvironment = {};
      }

      data.devEnvironment.projectTarget = projectId;
      fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      await this.persistActiveProjectId(projectId);
      this.targetProjectChangedEmitter.fire(projectId);

      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.targetChanged', { target: projectId }), 3000);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  /** Espelha o projeto alvo em `settings.json` para sobreviver ao reload. */
  private static async persistActiveProjectId(projectId: string): Promise<void> {
    const config = vscode.workspace.getConfiguration(PREFERENCE_SECTION);
    const target = vscode.workspace.workspaceFolders?.length
      ? vscode.ConfigurationTarget.Workspace
      : vscode.ConfigurationTarget.Global;

    try {
      await config.update(PREFERENCE_KEYS.activeProjectId, projectId, target);
    } catch {
      // environment.json permanece como fonte da verdade
    }
  }

  public static async addNewProject(onUpdated?: () => void): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    const coreRoot = this.getCoreRoot();
    const parent = this.getRepositoryParent();
    if (!coreRoot || !parent) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: 'Raiz dos repositórios não encontrada.' }));
      return;
    }
    const existingIds = new Set(Object.keys(this.getEnvironmentData()?.devProjects || {}));

    // REQ-080 / BATCH-082: todas as caixas usam ignoreFocusOut para sobreviver
    // ao Alt+Tab (copiar/colar de outra janela) e chegam pré-preenchidas e editáveis.
    const id = (await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.idPrompt'),
      placeHolder: 'ex: meu-novo-projeto',
      ignoreFocusOut: true,
      validateInput: value => {
        const trimmed = value.trim();
        if (!trimmed) return LocalizationManager.t('projects.fieldRequired');
        if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) return LocalizationManager.t('projects.idInvalid');
        if (existingIds.has(trimmed)) return LocalizationManager.t('projects.idExists', { id: trimmed });
        return undefined;
      }
    }))?.trim();
    if (!id) return;

    const name = (await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.namePrompt'),
      placeHolder: 'ex: Meu Novo Projeto',
      value: id,
      ignoreFocusOut: true,
      validateInput: value => value.trim() ? undefined : LocalizationManager.t('projects.fieldRequired')
    }))?.trim();
    if (!name) return;

    const isLocalChoice = await vscode.window.showQuickPick([LocalizationManager.t('common.yesLocal'), LocalizationManager.t('common.noRemote')], {
      placeHolder: LocalizationManager.t('projects.localPrompt'),
      ignoreFocusOut: true
    });
    if (!isLocalChoice) return;
    const isLocal = isLocalChoice === LocalizationManager.t('common.yesLocal');

    const defaultUrl = `http://localhost/${id}/`;
    const url = (await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.urlPrompt'),
      placeHolder: 'ex: http://localhost/meu-novo-projeto/ ou https://meusite.com/',
      value: defaultUrl,
      ignoreFocusOut: true,
      validateInput: value => value.trim() ? undefined : LocalizationManager.t('projects.fieldRequired')
    }))?.trim();
    if (!url) return;

    const projectPath = (await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.pathPrompt'),
      value: this.toGitPath(path.join(parent, id, 'gestor')),
      ignoreFocusOut: true,
      validateInput: value => value.trim() ? undefined : LocalizationManager.t('projects.fieldRequired')
    }))?.trim();
    if (!projectPath) return;

    let pathTests = '';
    if (isLocal) {
      const answer = await vscode.window.showInputBox({
        prompt: LocalizationManager.t('projects.pathTestsPrompt'),
        value: this.toGitPath(path.join(coreRoot, 'dev-environment', 'data', 'sites', 'localhost', id)) + '/',
        ignoreFocusOut: true
      });
      if (answer === undefined) return;
      pathTests = answer.trim();
    }

    try {
      const data = this.getEnvironmentData();
      if (!data) return;

      if (!data.devProjects) {
        data.devProjects = {};
      }

      data.devProjects[id] = {
        name,
        path: projectPath,
        path_tests: pathTests,
        local: isLocal,
        gitDeploy: false,
        gitDeployBaseRef: 'HEAD',
        url,
        api: {}
      };

      fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.saved', { name, id }), 3000);

      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  public static async syncWithTemplate(onUpdated?: () => void): Promise<void> {
    const templatePath = this.getEnvironmentTemplatePath();
    const envPath = this.getEnvironmentFilePath();

    if (!templatePath || !fs.existsSync(templatePath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.templateMissing'));
      return;
    }

    if (!envPath) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    try {
      const templateRaw = fs.readFileSync(templatePath, 'utf8');
      const template = JSON.parse(templateRaw);

      let targetData: any = {};
      if (fs.existsSync(envPath)) {
        targetData = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      }

      // Função de deep merge preservando dados existentes
      const mergeMissing = (tmpl: any, target: any) => {
        for (const key of Object.keys(tmpl)) {
          if (key === 'devProjects') continue; // Projetos reais não são sobrescritos

          if (target[key] === undefined) {
            target[key] = tmpl[key];
          } else if (typeof tmpl[key] === 'object' && tmpl[key] !== null && !Array.isArray(tmpl[key])) {
            mergeMissing(tmpl[key], target[key]);
          }
        }
      };

      mergeMissing(template, targetData);
      fs.writeFileSync(envPath, JSON.stringify(targetData, null, 2), 'utf8');

      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.syncSucceeded'), 3000);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  private static sessionKey(filePath: string): string {
    const normalized = path.normalize(filePath);
    return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
  }

  /**
   * REQ-080 / BATCH-082: abre um JSON temporário contendo somente
   * `devProjects[projectId]`, sem expor outros projetos nem chaves globais.
   */
  public static async openScopedProjectConfig(projectId: string | undefined): Promise<void> {
    if (!projectId) {
      vscode.window.showWarningMessage(LocalizationManager.t('projects.noTargetWarning'));
      return;
    }
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return;
    }

    let project: Record<string, unknown> | undefined;
    try {
      project = extractProjectConfig(JSON.parse(fs.readFileSync(envPath, 'utf8')), projectId);
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.configEnvironmentInvalid', { message: err.message }));
      return;
    }
    if (!project) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.conflictProjectMissing', { project: projectId }));
      return;
    }

    try {
      let session = [...this.scopedConfigSessions.values()].find(item => item.projectId === projectId && fs.existsSync(item.filePath));
      const openDoc = session && vscode.workspace.textDocuments.find(doc => this.sessionKey(doc.uri.fsPath) === this.sessionKey(session!.filePath));
      if (!session) {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'c2f-project-config-'));
        const filePath = path.join(dir, scopedConfigFileName(projectId));
        session = { projectId, envPath, filePath, dir };
        this.scopedConfigSessions.set(this.sessionKey(filePath), session);
        fs.writeFileSync(filePath, serializeProjectConfig(project), 'utf8');
      } else if (!openDoc?.isDirty) {
        session.envPath = envPath;
        fs.writeFileSync(session.filePath, serializeProjectConfig(project), 'utf8');
      }

      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(session.filePath));
      await vscode.window.showTextDocument(doc, { preview: false });
      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.configOpened', { project: projectId }), 4000);
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }

  /** Registra a sincronização ao salvar (Ctrl+S) e a limpeza ao fechar a aba. */
  public static registerScopedProjectConfigEditor(onUpdated?: () => void): vscode.Disposable {
    const onSave = vscode.workspace.onDidSaveTextDocument(doc => {
      const session = this.scopedConfigSessions.get(this.sessionKey(doc.uri.fsPath));
      if (session) {
        this.applyScopedProjectConfig(session, doc.getText(), onUpdated);
      }
    });
    const onClose = vscode.workspace.onDidCloseTextDocument(doc => {
      const key = this.sessionKey(doc.uri.fsPath);
      const session = this.scopedConfigSessions.get(key);
      if (session) {
        this.scopedConfigSessions.delete(key);
        this.removeScopedSessionFiles(session);
      }
    });
    return vscode.Disposable.from(onSave, onClose, { dispose: () => this.disposeScopedProjectConfigSessions() });
  }

  private static applyScopedProjectConfig(session: ScopedConfigSession, editedText: string, onUpdated?: () => void): boolean {
    let environmentText: string;
    try {
      environmentText = fs.readFileSync(session.envPath, 'utf8');
    } catch {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return false;
    }

    const result = mergeProjectConfig(environmentText, session.projectId, editedText);
    if (!result.ok) {
      const key = result.reason === 'invalidJson' ? 'projects.configInvalidJson'
        : result.reason === 'notObject' ? 'projects.configNotObject'
          : result.reason === 'environmentInvalid' ? 'projects.configEnvironmentInvalid'
            : 'projects.conflictProjectMissing';
      vscode.window.showErrorMessage(LocalizationManager.t(key, { project: session.projectId, message: result.message || '' }));
      return false;
    }

    try {
      fs.writeFileSync(session.envPath, result.text, 'utf8');
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
      return false;
    }
    vscode.window.setStatusBarMessage(LocalizationManager.t('projects.configSaved', { project: session.projectId }), 4000);
    if (onUpdated) {
      onUpdated();
    }
    return true;
  }

  private static removeScopedSessionFiles(session: ScopedConfigSession): void {
    try {
      fs.rmSync(session.dir, { recursive: true, force: true });
    } catch {
      // Limpeza best-effort: o diretório fica em os.tmpdir() e contém apenas o próprio buffer.
    }
  }

  public static disposeScopedProjectConfigSessions(): void {
    for (const session of this.scopedConfigSessions.values()) {
      this.removeScopedSessionFiles(session);
    }
    this.scopedConfigSessions.clear();
  }

  /**
   * REQ-080 / BATCH-082 (pedido iterativo do operador): remove somente
   * `devProjects[projectId]` do `environment.json`, após confirmação modal.
   * Arquivos e repositórios do projeto no disco não são tocados.
   */
  public static async deleteProject(projectId: string | undefined, onUpdated?: () => void): Promise<boolean> {
    if (!projectId) {
      return false;
    }
    const envPath = this.getEnvironmentFilePath();
    if (!envPath || !fs.existsSync(envPath)) {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
      return false;
    }

    const confirmLabel = LocalizationManager.t('projects.deleteConfirmButton');
    const answer = await vscode.window.showWarningMessage(
      LocalizationManager.t('projects.deleteConfirm', { project: projectId }),
      { modal: true, detail: LocalizationManager.t('projects.deleteConfirmDetail', { project: projectId }) },
      confirmLabel
    );
    if (answer !== confirmLabel) {
      return false;
    }

    try {
      const result = removeProjectConfig(fs.readFileSync(envPath, 'utf8'), projectId);
      if (!result.ok) {
        const key = result.reason === 'environmentInvalid' ? 'projects.configEnvironmentInvalid' : 'projects.conflictProjectMissing';
        vscode.window.showErrorMessage(LocalizationManager.t(key, { project: projectId, message: result.message || '' }));
        return false;
      }
      fs.writeFileSync(envPath, result.text, 'utf8');
      if (result.wasTarget) {
        this.targetProjectChangedEmitter.fire('');
      }
      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.deleted', { project: projectId }), 5000);
      if (onUpdated) {
        onUpdated();
      }
      return true;
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
      return false;
    }
  }

  public static async openActiveEnvironment(): Promise<void> {
    const envPath = this.getEnvironmentFilePath();
    if (envPath && fs.existsSync(envPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(envPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.environmentMissing'));
    }
  }

  public static async openTemplateEnvironment(): Promise<void> {
    const tmplPath = this.getEnvironmentTemplatePath();
    if (tmplPath && fs.existsSync(tmplPath)) {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmplPath));
      await vscode.window.showTextDocument(doc);
    } else {
      vscode.window.showErrorMessage(LocalizationManager.t('projects.templateMissing'));
    }
  }

  public static checkAdjacentRepositories(): { name: string; exists: boolean; path: string }[] {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return [];

    const rootParent = this.getRepositoryParent() || path.join(workspaceFolders[0].uri.fsPath, '..');
    const repos = ['conn2flow', 'lumix', 'transformamp', 'conn2flow-site'];

    return repos.map(repo => {
      const full = path.join(rootParent, repo);
      return {
        name: repo,
        exists: fs.existsSync(full),
        path: full
      };
    });
  }

  public static async cloneMissingRepository(runInTerminal: (cmd: string) => void, onUpdated?: () => void): Promise<void> {
    const repos = this.checkAdjacentRepositories();
    const missing = repos.filter(r => !r.exists);

    if (missing.length === 0) {
      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.allPresent'), 3000);
      return;
    }

    let owner = this.getGithubOwner();
    if (!owner) {
      owner = await vscode.window.showInputBox({ prompt: LocalizationManager.t('projects.githubOwnerPrompt') });
    }
    if (!owner || !/^[A-Za-z0-9_.-]+$/.test(owner)) return;

    const items = missing.map(m => ({
      label: `📥 Clonar ${m.name}`,
      description: `https://github.com/${owner}/${m.name}.git`,
      repo: m.name
    }));

    if (missing.length > 1) {
      items.unshift({
        label: '🚀 Clonar TODOS os Repositórios Faltantes',
        description: missing.map(m => m.name).join(', '),
        repo: '__all__'
      });
    }

    const sel = await vscode.window.showQuickPick(items, {
      placeHolder: LocalizationManager.t('projects.clonePrompt')
    });
    if (!sel) return;

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;
    const parentPath = this.getRepositoryParent() || path.join(workspaceFolders[0].uri.fsPath, '..');
    const clone = (repo: string) => `git -C '${parentPath.replace(/'/g, "''")}' clone 'https://github.com/${owner}/${repo}.git'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`;

    if (sel.repo === '__all__') {
      const commands = missing.map(m => clone(m.name)).join('; ');
      runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${commands}"`);
    } else {
      runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${clone(sel.repo)}"`);
    }
    onUpdated?.();
  }

  public static async scaffoldNewSatelliteProject(onUpdated?: () => void): Promise<void> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.noWorkspace'));
      return;
    }

    const id = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.idPrompt'),
      placeHolder: 'ex: meu-satelite'
    });
    if (!id) return;

    const name = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.namePrompt'),
      placeHolder: 'ex: Meu Projeto Satélite'
    });
    if (!name) return;

    const url = await vscode.window.showInputBox({
      prompt: LocalizationManager.t('projects.urlPrompt'),
      placeHolder: `ex: http://localhost/${id}/`
    });

    const isLocalChoice = await vscode.window.showQuickPick([LocalizationManager.t('common.yesLocal'), LocalizationManager.t('common.noRemote')], {
      placeHolder: LocalizationManager.t('projects.localPrompt')
    });
    const isLocal = isLocalChoice ? isLocalChoice === LocalizationManager.t('common.yesLocal') : true;

    try {
      const parentDir = path.join(workspaceFolders[0].uri.fsPath, '..');
      const projectDir = path.join(parentDir, id);

      // Criar pastas físicas do scaffold
      const subdirs = [
        path.join(projectDir, 'gestor', 'modulos'),
        path.join(projectDir, 'gestor', 'assets'),
        path.join(projectDir, 'gestor', 'resources'),
        path.join(projectDir, 'docs')
      ];

      for (const d of subdirs) {
        if (!fs.existsSync(d)) {
          fs.mkdirSync(d, { recursive: true });
        }
      }

      // Criar README.md básico
      const readmePath = path.join(projectDir, 'README.md');
      if (!fs.existsSync(readmePath)) {
        const readmeContent = `# ${name}\n\nProjeto satélite Conn2Flow provisionado via Conn2Flow Dev Tools.\n\n- **Identificador**: \`${id}\`\n- **URL**: ${url || `http://localhost/${id}/`}\n- **Criado em**: ${new Date().toISOString()}\n`;
        fs.writeFileSync(readmePath, readmeContent, 'utf8');
      }

      // Cadastrar no environment.json ativo
      const envPath = this.getEnvironmentFilePath();
      if (envPath && fs.existsSync(envPath)) {
        const data = JSON.parse(fs.readFileSync(envPath, 'utf8'));
        if (!data.devProjects) data.devProjects = {};

        const coreRoot = this.getCoreRoot();
        if (!coreRoot) throw new Error('Raiz do Core não encontrada.');
        data.devProjects[id] = {
          name,
          path: this.toGitPath(path.join(projectDir, 'gestor')),
          path_tests: isLocal ? this.toGitPath(path.join(coreRoot, 'dev-environment', 'data', 'sites', 'localhost', id)) + '/' : '',
          local: isLocal,
          gitDeploy: false,
          gitDeployBaseRef: 'HEAD',
          url: url || `http://localhost/${id}/`,
          api: {
            access_token: '',
            refresh_token: '',
            token_type: 'Bearer',
            expires_in: 3600,
            scope: 'read write'
          }
        };

        fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
      }

      vscode.window.setStatusBarMessage(LocalizationManager.t('projects.scaffolded', { name, id }), 3000);
      if (onUpdated) {
        onUpdated();
      }
    } catch (err: any) {
      vscode.window.showErrorMessage(LocalizationManager.t('common.error', { message: err.message }));
    }
  }
}
