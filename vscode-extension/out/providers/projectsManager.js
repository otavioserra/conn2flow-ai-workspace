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
    static async syncWithTemplate(onUpdated) {
        const templatePath = this.getEnvironmentTemplatePath();
        const envPath = this.getEnvironmentFilePath();
        if (!templatePath || !fs.existsSync(templatePath)) {
            vscode.window.showErrorMessage('Template de environment.json não encontrado em dev-environment/templates/environment/.');
            return;
        }
        if (!envPath) {
            vscode.window.showErrorMessage('Arquivo ativo environment.json não encontrado.');
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
            vscode.window.showInformationMessage('Estrutura de environment.json sincronizada com o template canônico do Core com sucesso!');
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Falha ao sincronizar com template: ${err.message}`);
        }
    }
    static async openActiveEnvironment() {
        const envPath = this.getEnvironmentFilePath();
        if (envPath && fs.existsSync(envPath)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(envPath));
            await vscode.window.showTextDocument(doc);
        }
        else {
            vscode.window.showErrorMessage('environment.json ativo não encontrado.');
        }
    }
    static async openTemplateEnvironment() {
        const tmplPath = this.getEnvironmentTemplatePath();
        if (tmplPath && fs.existsSync(tmplPath)) {
            const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmplPath));
            await vscode.window.showTextDocument(doc);
        }
        else {
            vscode.window.showErrorMessage('Template de environment.json não encontrado.');
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
    static async cloneMissingRepository(runInTerminal, onUpdated) {
        const repos = this.checkAdjacentRepositories();
        const missing = repos.filter(r => !r.exists);
        if (missing.length === 0) {
            vscode.window.showInformationMessage('✔ Todos os repositórios oficiais já estão clonados ao lado do workspace!');
            return;
        }
        const items = missing.map(m => ({
            label: `📥 Clonar ${m.name}`,
            description: `https://github.com/otavioserra/${m.name}.git`,
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
            placeHolder: 'Selecione qual repositório oficial deseja clonar:'
        });
        if (!sel)
            return;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0)
            return;
        const parentPath = path.join(workspaceFolders[0].uri.fsPath, '..');
        if (sel.repo === '__all__') {
            const commands = missing
                .map(m => `git clone https://github.com/otavioserra/${m.name}.git`)
                .join('; ');
            runInTerminal(`powershell -NoProfile -Command "Set-Location '${parentPath}'; ${commands}; Write-Host '✔ Todos os repositórios foram clonados!' -ForegroundColor Green"`);
        }
        else {
            runInTerminal(`powershell -NoProfile -Command "Set-Location '${parentPath}'; git clone https://github.com/otavioserra/${sel.repo}.git; Write-Host '✔ Repositório ${sel.repo} clonado com sucesso!' -ForegroundColor Green"`);
        }
        vscode.window.showInformationMessage(`Comando de clonagem disparado no terminal para: ${sel.label}`);
        if (onUpdated) {
            setTimeout(() => onUpdated(), 5000);
        }
    }
    static async scaffoldNewSatelliteProject(onUpdated) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Nenhum workspace aberto.');
            return;
        }
        const id = await vscode.window.showInputBox({
            prompt: 'Identificador do novo projeto (slug em minúsculas):',
            placeHolder: 'ex: meu-satelite'
        });
        if (!id)
            return;
        const name = await vscode.window.showInputBox({
            prompt: 'Nome de exibição do projeto:',
            placeHolder: 'ex: Meu Projeto Satélite'
        });
        if (!name)
            return;
        const url = await vscode.window.showInputBox({
            prompt: 'URL do site (local ou remota):',
            placeHolder: `ex: http://localhost/${id}/`
        });
        const isLocalChoice = await vscode.window.showQuickPick(['Sim (Ambiente de Testes Local)', 'Não (Produção Remota)'], {
            placeHolder: 'O projeto roda no ambiente local Docker?'
        });
        const isLocal = isLocalChoice ? isLocalChoice.startsWith('Sim') : true;
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
                data.devProjects[id] = {
                    name,
                    path: `/c/Users/otavi/OneDrive/Documentos/GIT/${id}/gestor`,
                    path_tests: isLocal ? `/c/Users/otavi/OneDrive/Documentos/GIT/conn2flow/dev-environment/data/sites/localhost/${id}/` : '',
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
            vscode.window.showInformationMessage(`✨ Projeto Satélite '${name}' (${id}) provisionado com sucesso em ../${id}!`);
            if (onUpdated) {
                onUpdated();
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(`Falha ao criar scaffold do projeto: ${err.message}`);
        }
    }
}
exports.ProjectsManager = ProjectsManager;
//# sourceMappingURL=projectsManager.js.map