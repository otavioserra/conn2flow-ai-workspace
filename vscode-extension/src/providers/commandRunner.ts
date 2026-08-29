import * as vscode from 'vscode';
import { LocalizationManager } from './localizationManager';
import { ActionFormPanel } from './actionFormPanel';

export type CommandImpact = 'read-only' | 'local' | 'mutating' | 'remote' | 'destructive';

export interface CommandRequest {
  command: string;
  cwd: string;
  label: string;
  impact: CommandImpact;
  target?: string;
  confirm?: boolean;
  confirmationSatisfied?: boolean;
  exclusive?: boolean;
  notifySuccess?: boolean;
}

export interface CommandResult {
  started: boolean;
  exitCode?: number;
  succeeded: boolean;
}

export class CommandRunner {
  private exclusiveActive = false;

  public async run(request: CommandRequest): Promise<CommandResult> {
    if (request.impact !== 'read-only' && !vscode.workspace.isTrusted) {
      vscode.window.showWarningMessage(LocalizationManager.t('command.trustRequired'));
      return { started: false, succeeded: false };
    }

    if (request.exclusive && this.exclusiveActive) {
      vscode.window.showWarningMessage(LocalizationManager.t('command.busy'));
      return { started: false, succeeded: false };
    }

    const requiresConfirmation =
      request.confirm || request.impact === 'remote' || request.impact === 'destructive';
    if (requiresConfirmation && !request.confirmationSatisfied) {
      if (request.impact === 'remote' || request.impact === 'destructive') {
        const values = await ActionFormPanel.show({
          id: `confirm-${request.impact}`,
          title: LocalizationManager.t('command.formTitle', { label: request.label }),
          impactSummary: LocalizationManager.t('command.impact', { impact: request.impact }),
          submitLabel: LocalizationManager.t('command.confirmButton'),
          cancelLabel: LocalizationManager.t('common.cancel'),
          validationErrorLabel: LocalizationManager.t('common.invalidForm'),
          language: LocalizationManager.currentLocale,
          fields: [
            { id: 'target', label: LocalizationManager.t('command.target'), type: 'readonly', value: request.target || request.cwd },
            { id: 'command', label: LocalizationManager.t('command.command'), type: 'readonly', value: request.command },
            { id: 'acknowledged', label: LocalizationManager.t('command.acknowledge'), type: 'checkbox', required: true }
          ]
        });
        if (!values?.acknowledged) return { started: false, succeeded: false };
      } else {
        const confirmed = await vscode.window.showWarningMessage(
          LocalizationManager.t('command.confirm', { label: request.label, target: request.target || request.cwd }),
          { modal: true },
          LocalizationManager.t('command.confirmButton')
        );
        if (!confirmed) return { started: false, succeeded: false };
      }
    }

    if (request.exclusive) {
      this.exclusiveActive = true;
    }

    try {
      return await this.executeTask(request);
    } finally {
      if (request.exclusive) {
        this.exclusiveActive = false;
      }
    }
  }

  private async executeTask(request: CommandRequest): Promise<CommandResult> {
    const definition: vscode.TaskDefinition = {
      type: 'conn2flow',
      impact: request.impact
    };
    const execution = new vscode.ShellExecution(request.command, { cwd: request.cwd });
    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      request.label,
      'Conn2Flow',
      execution
    );
    task.presentationOptions = {
      reveal: vscode.TaskRevealKind.Always,
      panel: vscode.TaskPanelKind.Dedicated,
      focus: true,
      echo: true,
      clear: false,
      showReuseMessage: true
    };

    return await new Promise<CommandResult>(resolve => {
      let completed = false;
      let processDisposable: vscode.Disposable | undefined;
      let taskDisposable: vscode.Disposable | undefined;
      const finish = (exitCode?: number) => {
        if (completed) return;
        completed = true;
        processDisposable?.dispose();
        taskDisposable?.dispose();
        const succeeded = exitCode === 0;
        if (succeeded && request.notifySuccess !== false) {
          vscode.window.showInformationMessage(
            LocalizationManager.t('command.succeeded', { label: request.label })
          );
        } else if (!succeeded) {
          vscode.window.showErrorMessage(
            LocalizationManager.t('command.failed', {
              label: request.label,
              code: exitCode ?? 'unknown'
            })
          );
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
        vscode.window.setStatusBarMessage(
          LocalizationManager.t('command.started', { label: request.label }),
          2500
        );
      }, error => {
        vscode.window.showErrorMessage(String(error));
        finish(undefined);
      });
    });
  }
}
