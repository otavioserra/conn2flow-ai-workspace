import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { TranslationKey } from '../localizationCatalog';
import {
    buildConflictDetailsArgs,
    buildConflictListArgs,
    buildResolveConflictArgs,
    ConflictPolicyError,
    DeliveryConflict,
    DeliveryConflictAction,
    DeliveryConflictFiles,
    parseCliSuccess,
    parseConflictDetails,
    parseConflictList,
    requiredConflictFilePaths
} from '../projectConflictsPolicy';
import { LocalizationManager } from './localizationManager';
import { DevProject, ProjectsManager } from './projectsManager';
import { WorkspaceLocator } from './workspaceLocator';

const actionLabels: Record<DeliveryConflictAction, TranslationKey> = {
    sobrescrever: 'projects.conflictAction.overwrite',
    manter: 'projects.conflictAction.keep',
    mesclar: 'projects.conflictAction.merge'
};

export class ProjectConflictsManager {
    public static async openForProject(projectId?: string, onResolved?: () => void): Promise<void> {
        if (!vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(LocalizationManager.t('command.trustRequired'));
            return;
        }

        const project = await this.selectProject(projectId);
        if (!project) return;

        try {
            const result = await this.runCli(
                buildConflictListArgs(project.id),
                parseConflictList
            );
            if (result.choques.length === 0) {
                vscode.window.setStatusBarMessage(
                    LocalizationManager.t('projects.conflictsEmpty', { project: project.name }),
                    4000
                );
                return;
            }

            const selected = await vscode.window.showQuickPick(
                result.choques.map(conflict => ({
                    label: conflict.caminho,
                    description: conflict.motivo,
                    detail: conflict.acoes.map(action => LocalizationManager.t(actionLabels[action])).join(', '),
                    conflict
                })),
                { placeHolder: LocalizationManager.t('projects.conflictsSelect', { project: project.name }) }
            );
            if (!selected) return;

            const details = await this.runCli(
                buildConflictDetailsArgs(project.id, selected.conflict.id),
                parseConflictDetails
            );
            await this.openConflict(project, details.choque, details.arquivos);

            if (details.choque.acoes.includes('mesclar')) {
                const continueLabel = LocalizationManager.t('projects.conflictContinue');
                const choice = await vscode.window.showWarningMessage(
                    LocalizationManager.t('projects.conflictMergeOpened', { path: details.choque.caminho }),
                    continueLabel
                );
                if (choice !== continueLabel) return;
            }

            await this.resolveConflict(project, details.choque, details.arquivos.mesclado, onResolved);
        } catch (error) {
            vscode.window.showErrorMessage(
                LocalizationManager.t('projects.conflictError', { message: this.errorMessage(error) })
            );
        }
    }

    private static async selectProject(projectId?: string): Promise<DevProject | undefined> {
        const projects = ProjectsManager.getProjectsList();
        if (projectId) {
            const project = projects.find(candidate => candidate.id === projectId);
            if (!project) {
                vscode.window.showErrorMessage(LocalizationManager.t('projects.conflictProjectMissing', { project: projectId }));
            }
            return project;
        }

        if (projects.length === 0) {
            vscode.window.showWarningMessage(LocalizationManager.t('projects.conflictNoProjects'));
            return undefined;
        }

        const selected = await vscode.window.showQuickPick(
            projects.map(project => ({ label: project.name, description: project.id, project })),
            { placeHolder: LocalizationManager.t('projects.selectPrompt') }
        );
        return selected?.project;
    }

    private static async openConflict(
        project: DevProject,
        conflict: DeliveryConflict,
        files: DeliveryConflictFiles
    ): Promise<void> {
        const coreRoot = WorkspaceLocator.getCoreRoot();
        if (!coreRoot) throw new Error(LocalizationManager.t('projects.coreMissing'));

        const resolve = (filePath?: string) => filePath ? this.resolveCliPath(coreRoot, filePath) : undefined;
        const paths = { 'no-ar': resolve(files['no-ar']), nova: resolve(files.nova), mesclado: resolve(files.mesclado) };
        const requiredPaths = requiredConflictFilePaths(conflict, files)
            .map(filePath => this.resolveCliPath(coreRoot, filePath));
        for (const filePath of requiredPaths) {
            if (!fs.existsSync(filePath)) {
                throw new Error(LocalizationManager.t('projects.conflictFileMissing', { path: filePath }));
            }
        }

        if (paths['no-ar'] && paths.nova) {
            await vscode.commands.executeCommand(
                'vscode.diff',
                vscode.Uri.file(paths['no-ar']),
                vscode.Uri.file(paths.nova),
                LocalizationManager.t('projects.conflictDiffTitle', {
                    project: project.name,
                    path: conflict.caminho
                })
            );
        } else if (paths['no-ar']) {
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

    private static async resolveConflict(
        project: DevProject,
        conflict: DeliveryConflict,
        mergedFile: string | undefined,
        onResolved?: () => void
    ): Promise<void> {
        if (conflict.acoes.length === 0) {
            vscode.window.showWarningMessage(
                LocalizationManager.t('projects.conflictNoActions', { path: conflict.caminho })
            );
            return;
        }

        const selected = await vscode.window.showQuickPick(
            conflict.acoes.map(action => ({
                label: LocalizationManager.t(actionLabels[action]),
                action
            })),
            { placeHolder: LocalizationManager.t('projects.conflictActionPrompt', { path: conflict.caminho }) }
        );
        if (!selected) return;

        let local = false;
        if (selected.action === 'mesclar') {
            const coreRoot = WorkspaceLocator.getCoreRoot();
            if (!coreRoot) throw new Error(LocalizationManager.t('projects.coreMissing'));
            if (!mergedFile) throw new ConflictPolicyError('invalid-response');
            const mergePath = this.resolveCliPath(coreRoot, mergedFile);
            const mergeDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(mergePath));
            if (mergeDocument.isDirty && !(await mergeDocument.save())) return;

            const confirmation = await vscode.window.showWarningMessage(
                LocalizationManager.t('projects.conflictMergeConfirm', { path: conflict.caminho }),
                { modal: true },
                LocalizationManager.t('projects.conflictMergeContinue')
            );
            if (confirmation !== LocalizationManager.t('projects.conflictMergeContinue')) return;

            const localChoice = await vscode.window.showQuickPick([
                {
                    label: LocalizationManager.t('projects.conflictApplyLive'),
                    local: false
                },
                {
                    label: LocalizationManager.t('projects.conflictApplyLocal'),
                    local: true
                }
            ], { placeHolder: LocalizationManager.t('projects.conflictLocalPrompt') });
            if (!localChoice) return;
            local = localChoice.local;
        }

        await this.runCli(
            buildResolveConflictArgs(project.id, conflict.id, selected.action, local),
            parseCliSuccess
        );
        vscode.window.setStatusBarMessage(
            LocalizationManager.t('projects.conflictResolved', {
                path: conflict.caminho,
                action: LocalizationManager.t(actionLabels[selected.action])
            }),
            4000
        );
        onResolved?.();
    }

    private static resolveCliPath(coreRoot: string, filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.resolve(coreRoot, filePath);
    }

    private static runCli<T>(args: string[], parseOutput: (output: string) => T): Promise<T> {
        const coreRoot = WorkspaceLocator.getCoreRoot();
        if (!coreRoot) return Promise.reject(new Error(LocalizationManager.t('projects.coreMissing')));

        const command = process.platform === 'win32' ? 'php' : './c2f';
        const commandArgs = process.platform === 'win32' ? ['cli/c2f.php', ...args] : args;

        return new Promise((resolve, reject) => {
            execFile(command, commandArgs, {
                cwd: coreRoot,
                windowsHide: true,
                encoding: 'utf8',
                maxBuffer: 1024 * 1024
            }, (error, stdout, stderr) => {
                if (error && !stdout.trim()) {
                    reject(new Error(stderr.trim() || error.message));
                    return;
                }

                let result: T;
                try {
                    result = parseOutput(stdout);
                } catch (parseError) {
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

    private static errorMessage(error: unknown): string {
        if (error instanceof ConflictPolicyError) {
            return LocalizationManager.t(
                error.code === 'invalid-json'
                    ? 'projects.conflictInvalidJson'
                    : 'projects.conflictInvalidResponse'
            );
        }
        return error instanceof Error ? error.message : String(error);
    }
}
