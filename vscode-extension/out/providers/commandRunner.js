"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRunner = void 0;
const vscode = require("vscode");
const localizationManager_1 = require("./localizationManager");
const actionFormPanel_1 = require("./actionFormPanel");
class CommandRunner {
    exclusiveActive = false;
    async run(request) {
        if (request.impact !== 'read-only' && !vscode.workspace.isTrusted) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.trustRequired'));
            return { started: false, succeeded: false };
        }
        if (request.exclusive && this.exclusiveActive) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.busy'));
            return { started: false, succeeded: false };
        }
        const requiresConfirmation = request.confirm || request.impact === 'remote' || request.impact === 'destructive';
        if (requiresConfirmation && !request.confirmationSatisfied) {
            if (request.impact === 'remote' || request.impact === 'destructive') {
                const values = await actionFormPanel_1.ActionFormPanel.show({
                    id: `confirm-${request.impact}`,
                    title: localizationManager_1.LocalizationManager.t('command.formTitle', { label: request.label }),
                    impactSummary: localizationManager_1.LocalizationManager.t('command.impact', { impact: request.impact }),
                    submitLabel: localizationManager_1.LocalizationManager.t('command.confirmButton'),
                    cancelLabel: localizationManager_1.LocalizationManager.t('common.cancel'),
                    validationErrorLabel: localizationManager_1.LocalizationManager.t('common.invalidForm'),
                    language: localizationManager_1.LocalizationManager.currentLocale,
                    fields: [
                        { id: 'target', label: localizationManager_1.LocalizationManager.t('command.target'), type: 'readonly', value: request.target || request.cwd },
                        { id: 'command', label: localizationManager_1.LocalizationManager.t('command.command'), type: 'readonly', value: request.command },
                        { id: 'acknowledged', label: localizationManager_1.LocalizationManager.t('command.acknowledge'), type: 'checkbox', required: true }
                    ]
                });
                if (!values?.acknowledged)
                    return { started: false, succeeded: false };
            }
            else {
                const confirmed = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('command.confirm', { label: request.label, target: request.target || request.cwd }), { modal: true }, localizationManager_1.LocalizationManager.t('command.confirmButton'));
                if (!confirmed)
                    return { started: false, succeeded: false };
            }
        }
        if (request.exclusive) {
            this.exclusiveActive = true;
        }
        try {
            return await this.executeTask(request);
        }
        finally {
            if (request.exclusive) {
                this.exclusiveActive = false;
            }
        }
    }
    async executeTask(request) {
        const definition = {
            type: 'conn2flow',
            impact: request.impact
        };
        const execution = new vscode.ShellExecution(request.command, { cwd: request.cwd });
        const task = new vscode.Task(definition, vscode.TaskScope.Workspace, request.label, 'Conn2Flow', execution);
        task.presentationOptions = {
            reveal: vscode.TaskRevealKind.Always,
            panel: vscode.TaskPanelKind.Dedicated,
            focus: true,
            echo: true,
            clear: false,
            showReuseMessage: true
        };
        return await new Promise(resolve => {
            let completed = false;
            let processDisposable;
            let taskDisposable;
            const finish = (exitCode) => {
                if (completed)
                    return;
                completed = true;
                processDisposable?.dispose();
                taskDisposable?.dispose();
                const succeeded = exitCode === 0;
                if (succeeded && request.notifySuccess !== false) {
                    vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('command.succeeded', { label: request.label }));
                }
                else if (!succeeded) {
                    vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('command.failed', {
                        label: request.label,
                        code: exitCode ?? 'unknown'
                    }));
                }
                resolve({ started: true, exitCode, succeeded });
            };
            processDisposable = vscode.tasks.onDidEndTaskProcess(event => {
                if (event.execution.task === task) {
                    finish(event.exitCode);
                }
            });
            taskDisposable = vscode.tasks.onDidEndTask(event => {
                if (event.execution.task === task) {
                    setTimeout(() => finish(undefined), 50);
                }
            });
            void vscode.tasks.executeTask(task).then(() => {
                vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('command.started', { label: request.label }), 2500);
            }, error => {
                vscode.window.showErrorMessage(String(error));
                finish(undefined);
            });
        });
    }
}
exports.CommandRunner = CommandRunner;
//# sourceMappingURL=commandRunner.js.map