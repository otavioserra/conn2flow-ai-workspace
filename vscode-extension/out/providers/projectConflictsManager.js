"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectConflictsManager = void 0;
const child_process_1 = require("child_process");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const projectConflictsPolicy_1 = require("../projectConflictsPolicy");
const localizationManager_1 = require("./localizationManager");
const projectsManager_1 = require("./projectsManager");
const workspaceLocator_1 = require("./workspaceLocator");
const actionLabels = {
    sobrescrever: 'projects.conflictAction.overwrite',
    manter: 'projects.conflictAction.keep',
    mesclar: 'projects.conflictAction.merge'
};
class ProjectConflictsManager {
    static async openForProject(projectId, onResolved) {
        if (!vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'));
            return;
        }
        const project = await this.selectProject(projectId);
        if (!project)
            return;
        try {
            const result = await this.runCli((0, projectConflictsPolicy_1.buildConflictListArgs)(project.id), projectConflictsPolicy_1.parseConflictList);
            if (result.choques.length === 0) {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('projects.conflictsEmpty', { project: project.name }), 4000);
                return;
            }
            const selected = await vscode.window.showQuickPick(result.choques.map(conflict => ({
                label: conflict.caminho,
                description: conflict.motivo,
                detail: conflict.acoes.map(action => localizationManager_1.LocalizationManager.t(actionLabels[action])).join(', '),
                conflict
            })), { placeHolder: localizationManager_1.LocalizationManager.t('projects.conflictsSelect', { project: project.name }) });
            if (!selected)
                return;
            const details = await this.runCli((0, projectConflictsPolicy_1.buildConflictDetailsArgs)(project.id, selected.conflict.id), projectConflictsPolicy_1.parseConflictDetails);
            await this.openConflict(project, details.choque, details.arquivos);
            if (details.choque.acoes.includes('mesclar')) {
                const continueLabel = localizationManager_1.LocalizationManager.t('projects.conflictContinue');
                const choice = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.conflictMergeOpened', { path: details.choque.caminho }), continueLabel);
                if (choice !== continueLabel)
                    return;
            }
            await this.resolveConflict(project, details.choque, details.arquivos.mesclado, onResolved);
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.conflictError', { message: this.errorMessage(error) }));
        }
    }
    static async selectProject(projectId) {
        const projects = projectsManager_1.ProjectsManager.getProjectsList();
        if (projectId) {
            const project = projects.find(candidate => candidate.id === projectId);
            if (!project) {
                vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('projects.conflictProjectMissing', { project: projectId }));
            }
            return project;
        }
        if (projects.length === 0) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.conflictNoProjects'));
            return undefined;
        }
        const selected = await vscode.window.showQuickPick(projects.map(project => ({ label: project.name, description: project.id, project })), { placeHolder: localizationManager_1.LocalizationManager.t('projects.selectPrompt') });
        return selected?.project;
    }
    static async openConflict(project, conflict, files) {
        const coreRoot = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!coreRoot)
            throw new Error(localizationManager_1.LocalizationManager.t('projects.coreMissing'));
        const resolve = (filePath) => filePath ? this.resolveCliPath(coreRoot, filePath) : undefined;
        const paths = { 'no-ar': resolve(files['no-ar']), nova: resolve(files.nova), mesclado: resolve(files.mesclado) };
        const requiredPaths = (0, projectConflictsPolicy_1.requiredConflictFilePaths)(conflict, files)
            .map(filePath => this.resolveCliPath(coreRoot, filePath));
        for (const filePath of requiredPaths) {
            if (!fs.existsSync(filePath)) {
                throw new Error(localizationManager_1.LocalizationManager.t('projects.conflictFileMissing', { path: filePath }));
            }
        }
        if (paths['no-ar'] && paths.nova) {
            await vscode.commands.executeCommand('vscode.diff', vscode.Uri.file(paths['no-ar']), vscode.Uri.file(paths.nova), localizationManager_1.LocalizationManager.t('projects.conflictDiffTitle', {
                project: project.name,
                path: conflict.caminho
            }));
        }
        else if (paths['no-ar']) {
            // Retirada: só existe a versão no ar para conferir antes de decidir.
            await vscode.window.showTextDocument(vscode.Uri.file(paths['no-ar']), { preview: true });
        }
        // Sem arquivo nenhum (choque de registro do banco), segue direto para a decisão.
        if (conflict.acoes.includes('mesclar') && paths.mesclado) {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(paths.mesclado));
            await vscode.window.showTextDocument(document, {
                preview: false,
                viewColumn: vscode.ViewColumn.Three
            });
        }
    }
    static async resolveConflict(project, conflict, mergedFile, onResolved) {
        if (conflict.acoes.length === 0) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.conflictNoActions', { path: conflict.caminho }));
            return;
        }
        const selected = await vscode.window.showQuickPick(conflict.acoes.map(action => ({
            label: localizationManager_1.LocalizationManager.t(actionLabels[action]),
            action
        })), { placeHolder: localizationManager_1.LocalizationManager.t('projects.conflictActionPrompt', { path: conflict.caminho }) });
        if (!selected)
            return;
        let local = false;
        if (selected.action === 'mesclar') {
            const coreRoot = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
            if (!coreRoot)
                throw new Error(localizationManager_1.LocalizationManager.t('projects.coreMissing'));
            if (!mergedFile)
                throw new projectConflictsPolicy_1.ConflictPolicyError('invalid-response');
            const mergePath = this.resolveCliPath(coreRoot, mergedFile);
            const mergeDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(mergePath));
            if (mergeDocument.isDirty && !(await mergeDocument.save()))
                return;
            const confirmation = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('projects.conflictMergeConfirm', { path: conflict.caminho }), { modal: true }, localizationManager_1.LocalizationManager.t('projects.conflictMergeContinue'));
            if (confirmation !== localizationManager_1.LocalizationManager.t('projects.conflictMergeContinue'))
                return;
            const localChoice = await vscode.window.showQuickPick([
                {
                    label: localizationManager_1.LocalizationManager.t('projects.conflictApplyLive'),
                    local: false
                },
                {
                    label: localizationManager_1.LocalizationManager.t('projects.conflictApplyLocal'),
                    local: true
                }
            ], { placeHolder: localizationManager_1.LocalizationManager.t('projects.conflictLocalPrompt') });
            if (!localChoice)
                return;
            local = localChoice.local;
        }
        await this.runCli((0, projectConflictsPolicy_1.buildResolveConflictArgs)(project.id, conflict.id, selected.action, local), projectConflictsPolicy_1.parseCliSuccess);
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('projects.conflictResolved', {
            path: conflict.caminho,
            action: localizationManager_1.LocalizationManager.t(actionLabels[selected.action])
        }), 4000);
        onResolved?.();
    }
    static resolveCliPath(coreRoot, filePath) {
        return path.isAbsolute(filePath) ? filePath : path.resolve(coreRoot, filePath);
    }
    static runCli(args, parseOutput) {
        const coreRoot = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!coreRoot)
            return Promise.reject(new Error(localizationManager_1.LocalizationManager.t('projects.coreMissing')));
        const command = process.platform === 'win32' ? 'php' : './c2f';
        const commandArgs = process.platform === 'win32' ? ['cli/c2f.php', ...args] : args;
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(command, commandArgs, {
                cwd: coreRoot,
                windowsHide: true,
                encoding: 'utf8',
                maxBuffer: 1024 * 1024
            }, (error, stdout, stderr) => {
                if (error && !stdout.trim()) {
                    reject(new Error(stderr.trim() || error.message));
                    return;
                }
                let result;
                try {
                    result = parseOutput(stdout);
                }
                catch (parseError) {
                    reject(parseError);
                    return;
                }
                if (error) {
                    reject(new Error(stderr.trim() || error.message));
                    return;
                }
                resolve(result);
            });
        });
    }
    static errorMessage(error) {
        if (error instanceof projectConflictsPolicy_1.ConflictPolicyError) {
            return localizationManager_1.LocalizationManager.t(error.code === 'invalid-json'
                ? 'projects.conflictInvalidJson'
                : 'projects.conflictInvalidResponse');
        }
        return error instanceof Error ? error.message : String(error);
    }
}
exports.ProjectConflictsManager = ProjectConflictsManager;
//# sourceMappingURL=projectConflictsManager.js.map