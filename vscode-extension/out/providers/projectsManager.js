"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class ProjectsManager {
    static getEnvironmentFilePath() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }
        // Procura no workspace ou em ../conn2flow/dev-environment/data/environment.json
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
    static getTargetProject() {
        const data = this.getEnvironmentData();
        if (data && data.devEnvironment && data.devEnvironment.projectTarget) {
            return data.devEnvironment.projectTarget;
        }
        return 'conn2flow-site';
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
                    url: proj.url
                });
            }
        }
        return list;
    }
    static async setTargetProject(projectId, onUpdated) {
        const envPath = this.getEnvironmentFilePath();
        if (!envPath || !fs.existsSync(envPath)) {
            vscode.window.showErrorMessage('environment.json não encontrado para atualizar projeto alvo.');
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
            vscode.window.showInformationMessage(`Projeto Alvo padrão alterado para: ${projectId}`);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Erro ao salvar environment.json: ${err.message}`);
        }
    }
    static async addNewProject(onUpdated) {
        const envPath = this.getEnvironmentFilePath();
        if (!envPath || !fs.existsSync(envPath)) {
            vscode.window.showErrorMessage('environment.json não encontrado.');
            return;
        }
        const id = await vscode.window.showInputBox({
            prompt: 'Identificador único do projeto (slug em minúsculas):',
            placeHolder: 'ex: meu-novo-projeto'
        });
        if (!id)
            return;
        const name = await vscode.window.showInputBox({
            prompt: 'Nome de exibição do projeto:',
            placeHolder: 'ex: Meu Novo Projeto'
        });
        if (!name)
            return;
        const url = await vscode.window.showInputBox({
            prompt: 'URL base do projeto (local ou remota):',
            placeHolder: 'ex: http://localhost/meu-novo-projeto/ ou https://meusite.com/'
        });
        const isLocalChoice = await vscode.window.showQuickPick(['Sim (Ambiente de Testes Local)', 'Não (Produção Remota)'], {
            placeHolder: 'O projeto roda no ambiente local Docker?'
        });
        const isLocal = isLocalChoice ? isLocalChoice.startsWith('Sim') : true;
        try {
            const data = this.getEnvironmentData();
            if (!data)
                return;
            if (!data.devProjects) {
                data.devProjects = {};
            }
            data.devProjects[id] = {
                name,
                path: `/c/Users/otavi/OneDrive/Documentos/GIT/${id}/gestor`,
                path_tests: isLocal ? `/c/Users/otavi/OneDrive/Documentos/GIT/conn2flow/dev-environment/data/sites/localhost/${id}/` : '',
                local: isLocal,
                gitDeploy: false,
                gitDeployBaseRef: 'HEAD',
                url: url || `http://localhost/${id}/`,
                api: {}
            };
            fs.writeFileSync(envPath, JSON.stringify(data, null, 2), 'utf8');
            vscode.window.showInformationMessage(`Projeto '${name}' (${id}) cadastrado com sucesso no environment.json!`);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Falha ao adicionar projeto: ${err.message}`);
        }
    }
    static checkAdjacentRepositories() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return [];
        const rootParent = path.join(workspaceFolders[0].uri.fsPath, '..');
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
}
exports.ProjectsManager = ProjectsManager;
//# sourceMappingURL=projectsManager.js.map