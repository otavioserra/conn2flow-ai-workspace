"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const localizationManager_1 = require("./localizationManager");
const workspacePreferencesPolicy_1 = require("../workspacePreferencesPolicy");
const projectEnvironmentPolicy_1 = require("../projectEnvironmentPolicy");
class ProjectsManager {
    static toGitPath(value) {
        return value.replace(/^([A-Za-z]):[\\/]/, (_, drive) => `/${drive.toLowerCase()}/`).replace(/\\/g, '/');
    }
    static getCoreRoot() {
        const envPath = this.getEnvironmentFilePath();
        return envPath ? path.resolve(path.dirname(envPath), '..', '..') : undefined;
    }
    static getRepositoryParent() {
        const root = this.getCoreRoot() || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        return root ? path.dirname(root) : undefined;
    }
    static getGithubOwner() {
        const configured = vscode.workspace.getConfiguration('conn2flow').get('githubOwner', '').trim();
        if (configured)
            return configured;
        const root = this.getCoreRoot();
        const configPath = root ? path.join(root, '.git', 'config') : undefined;
        if (!configPath || !fs.existsSync(configPath))
            return undefined;
        const config = fs.readFileSync(configPath, 'utf8');
        return config.match(/github\.com[/:]([^/\s]+)\//i)?.[1];
    }
    static getEnvironmentFilePath() {
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
    static getEnvironmentTemplatePath() {
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
    static getEnvironmentData() {
        const envPath = this.getEnvironmentFilePath();
        if (!envPath || !fs.existsSync(envPath)) {
            return undefined;
        }
        try {
            const raw = fs.readFileSync(envPath, 'utf8');
            return JSON.parse(raw);
        }
        catch {
            return undefined;
        }
    }
    /**
     * `environment.json` continua sendo a fonte da verdade do pipeline; a
     * configuração `conn2flow.projects.activeId` só entra quando o arquivo não é
     * alcançável a partir do workspace aberto (REQ-049 / BATCH-051), evitando que
     * a seleção do operador se perca no reload da janela.
     */
    static getTargetProject() {
        const data = this.getEnvironmentData();
        const target = data?.devEnvironment?.projectTarget;
        if (typeof target === 'string' && data?.devProjects?.[target]) {
            return target;
        }
        const persisted = (0, workspacePreferencesPolicy_1.recognizeProjectId)(vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION).get(workspacePreferencesPolicy_1.PREFERENCE_KEYS.activeProjectId));
        if (persisted && (!data?.devProjects || data.devProjects[persisted])) {
            return persisted;
        }
        return undefined;
    }
    static getProject(projectId) {
        return projectId ? this.getProjectsList().find(project => project.id === projectId) : undefined;
    }
    static isTargetVm() {
        const data = this.getEnvironmentData();
        return (0, projectEnvironmentPolicy_1.isVmProject)(data, this.getTargetProject());
    }
    static getProjectsList() {
        const data = this.getEnvironmentData();
        const list = [];
        if (data && data.devProjects) {
            for (const [id, proj] of Object.entries(data.devProjects)) {
                list.push({
                    id,
                    name: proj.name || id,
                    path: proj.path || '',
                    path_tests: proj.path_tests,
                    local: proj.local,
                    url: proj.url,
                    deploy_mode: proj.deploy_mode
                });
            }
        }
        return list;
    }
    static async setTargetProject(projectId, onUpdated) {
        const envPath = this.getEnvironmentFilePath();
        if (!envPath || !fs.existsSync(envPath)) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.environmentMissing'));
            return;
        }
        try {
            const data = this.getEnvironmentData();
            if (!data)
                return;
            if (!data.devEnvironment) {
                data.devEnvironment = {};
            }
            data.devEnvironment.projectTarget = projectId;
            fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
            await this.persistActiveProjectId(projectId);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('projects.targetChanged', { target: projectId }), 2000);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: err.message }));
        }
    }
    /** Espelha o projeto alvo em `settings.json` para sobreviver ao reload. */
    static async persistActiveProjectId(projectId) {
        const config = vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION);
        const target = vscode.workspace.workspaceFolders?.length
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
        try {
            await config.update(workspacePreferencesPolicy_1.PREFERENCE_KEYS.activeProjectId, projectId, target);
        }
        catch {
            // environment.json permanece como fonte da verdade
        }
    }
    static async addNewProject(onUpdated) {
        const envPath = this.getEnvironmentFilePath();
        if (!envPath || !fs.existsSync(envPath)) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.environmentMissing'));
            return;
        }
        const id = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.idPrompt'),
            placeHolder: 'ex: meu-novo-projeto'
        });
        if (!id)
            return;
        const name = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.namePrompt'),
            placeHolder: 'ex: Meu Novo Projeto'
        });
        if (!name)
            return;
        const url = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.urlPrompt'),
            placeHolder: 'ex: http://localhost/meu-novo-projeto/ ou https://meusite.com/'
        });
        const isLocalChoice = await vscode.window.showQuickPick([localizationManager_1.LocalizationManager.t('common.yesLocal'), localizationManager_1.LocalizationManager.t('common.noRemote')], {
            placeHolder: localizationManager_1.LocalizationManager.t('projects.localPrompt')
        });
        const isLocal = isLocalChoice ? isLocalChoice === localizationManager_1.LocalizationManager.t('common.yesLocal') : true;
        try {
            const data = this.getEnvironmentData();
            if (!data)
                return;
            if (!data.devProjects) {
                data.devProjects = {};
            }
            const coreRoot = this.getCoreRoot();
            const parent = this.getRepositoryParent();
            if (!coreRoot || !parent)
                throw new Error('Raiz dos repositórios não encontrada.');
            data.devProjects[id] = {
                name,
                path: this.toGitPath(path.join(parent, id, 'gestor')),
                path_tests: isLocal ? this.toGitPath(path.join(coreRoot, 'dev-environment', 'data', 'sites', 'localhost', id)) + '/' : '',
                local: isLocal,
                gitDeploy: false,
                gitDeployBaseRef: 'HEAD',
                url: url || `http://localhost/${id}/`,
                api: {}
            };
            fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
            vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('projects.saved', { name, id }));
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: err.message }));
        }
    }
    static async syncWithTemplate(onUpdated) {
        const templatePath = this.getEnvironmentTemplatePath();
        const envPath = this.getEnvironmentFilePath();
        if (!templatePath || !fs.existsSync(templatePath)) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.templateMissing'));
            return;
        }
        if (!envPath) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.environmentMissing'));
            return;
        }
        try {
            const templateRaw = fs.readFileSync(templatePath, 'utf8');
            const template = JSON.parse(templateRaw);
            let targetData = {};
            if (fs.existsSync(envPath)) {
                targetData = JSON.parse(fs.readFileSync(envPath, 'utf8'));
            }
            // Função de deep merge preservando dados existentes
            const mergeMissing = (tmpl, target) => {
                for (const key of Object.keys(tmpl)) {
                    if (key === 'devProjects')
                        continue; // Projetos reais não são sobrescritos
                    if (target[key] === undefined) {
                        target[key] = tmpl[key];
                    }
                    else if (typeof tmpl[key] === 'object' && tmpl[key] !== null && !Array.isArray(tmpl[key])) {
                        mergeMissing(tmpl[key], target[key]);
                    }
                }
            };
            mergeMissing(template, targetData);
            fs.writeFileSync(envPath, JSON.stringify(targetData, null, 2), 'utf8');
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('projects.syncSucceeded'), 2000);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: err.message }));
        }
    }
    static async openActiveEnvironment() {
        const envPath = this.getEnvironmentFilePath();
        if (envPath && fs.existsSync(envPath)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(envPath));
            await vscode.window.showTextDocument(doc);
        }
        else {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.environmentMissing'));
        }
    }
    static async openTemplateEnvironment() {
        const tmplPath = this.getEnvironmentTemplatePath();
        if (tmplPath && fs.existsSync(tmplPath)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmplPath));
            await vscode.window.showTextDocument(doc);
        }
        else {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.templateMissing'));
        }
    }
    static checkAdjacentRepositories() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return [];
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
    static async cloneMissingRepository(runInTerminal, onUpdated) {
        const repos = this.checkAdjacentRepositories();
        const missing = repos.filter(r => !r.exists);
        if (missing.length === 0) {
            vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('projects.allPresent'));
            return;
        }
        let owner = this.getGithubOwner();
        if (!owner) {
            owner = await vscode.window.showInputBox({ prompt: localizationManager_1.LocalizationManager.t('projects.githubOwnerPrompt') });
        }
        if (!owner || !/^[A-Za-z0-9_.-]+$/.test(owner))
            return;
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
            placeHolder: localizationManager_1.LocalizationManager.t('projects.clonePrompt')
        });
        if (!sel)
            return;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return;
        const parentPath = this.getRepositoryParent() || path.join(workspaceFolders[0].uri.fsPath, '..');
        const clone = (repo) => `git -C '${parentPath.replace(/'/g, "''")}' clone 'https://github.com/${owner}/${repo}.git'; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }`;
        if (sel.repo === '__all__') {
            const commands = missing.map(m => clone(m.name)).join('; ');
            runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${commands}"`);
        }
        else {
            runInTerminal(`powershell -NoProfile -Command "$ErrorActionPreference = 'Stop'; ${clone(sel.repo)}"`);
        }
        onUpdated?.();
    }
    static async scaffoldNewSatelliteProject(onUpdated) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.noWorkspace'));
            return;
        }
        const id = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.idPrompt'),
            placeHolder: 'ex: meu-satelite'
        });
        if (!id)
            return;
        const name = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.namePrompt'),
            placeHolder: 'ex: Meu Projeto Satélite'
        });
        if (!name)
            return;
        const url = await vscode.window.showInputBox({
            prompt: localizationManager_1.LocalizationManager.t('projects.urlPrompt'),
            placeHolder: `ex: http://localhost/${id}/`
        });
        const isLocalChoice = await vscode.window.showQuickPick([localizationManager_1.LocalizationManager.t('common.yesLocal'), localizationManager_1.LocalizationManager.t('common.noRemote')], {
            placeHolder: localizationManager_1.LocalizationManager.t('projects.localPrompt')
        });
        const isLocal = isLocalChoice ? isLocalChoice === localizationManager_1.LocalizationManager.t('common.yesLocal') : true;
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
                if (!data.devProjects)
                    data.devProjects = {};
                const coreRoot = this.getCoreRoot();
                if (!coreRoot)
                    throw new Error('Raiz do Core não encontrada.');
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
            vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('projects.scaffolded', { name, id }));
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('common.error', { message: err.message }));
        }
    }
}
exports.ProjectsManager = ProjectsManager;
//# sourceMappingURL=projectsManager.js.map