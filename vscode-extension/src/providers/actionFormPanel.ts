import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import { replaceReleaseVersionMentions } from '../releasePolicy';

export type ActionFormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'readonly';

export interface ActionFormOption {
  label: string;
  value: string;
}

export interface ActionFormField {
  id: string;
  label: string;
  type: ActionFormFieldType;
  value?: string | boolean;
  required?: boolean;
  description?: string;
  options?: readonly ActionFormOption[];
}

export interface ActionFormSchema {
  id: string;
  title: string;
  description?: string;
  impactSummary?: string;
  submitLabel: string;
  saveAndExecuteLabel?: string;
  cancelLabel: string;
  validationErrorLabel: string;
  language: string;
  fields: readonly ActionFormField[];
  semverPreview?: {
    currentVersion: string;
    typeFieldId: string;
    nextFieldId: string;
    tagFieldId: string;
    commandFieldId: string;
    messageFieldIds: readonly string[];
    tagPrefix: string;
    commandTemplate: string;
  };
}

export type ActionFormValues = Record<string, string | boolean>;

export interface ActionFormSubmission {
  action: 'submit' | 'save_and_execute';
  values: ActionFormValues;
  [key: string]: unknown;
}

export class ActionFormPanel {
  public static async show(schema: ActionFormSchema): Promise<ActionFormSubmission | undefined> {
    const panel = vscode.window.createWebviewPanel(
      `conn2flow.actionForm.${schema.id}`,
      schema.title,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: []
      }
    );
    const nonce = randomBytes(18).toString('base64');
    panel.webview.html = this.render(schema, nonce);

    return await new Promise<ActionFormSubmission | undefined>(resolve => {
      let resolved = false;
      let messageDisposable: vscode.Disposable | undefined;
      const finish = (submission?: ActionFormSubmission) => {
        if (resolved) return;
        resolved = true;
        messageDisposable?.dispose();
        resolve(submission);
      };

      messageDisposable = panel.webview.onDidReceiveMessage(message => {
        if (message?.type === 'cancel') {
          finish(undefined);
          panel.dispose();
          return;
        }
        if (message?.type !== 'submit' || typeof message.values !== 'object') return;
        const values = this.validate(schema, message.values as ActionFormValues);
        if (!values) {
          void panel.webview.postMessage({ type: 'validation-error' });
          return;
        }
        const action = message.action === 'save_and_execute' ? 'save_and_execute' : 'submit';
        finish({ action, values, ...values });
        panel.dispose();
      });

      panel.onDidDispose(() => finish(undefined));
    });
  }

  private static validate(schema: ActionFormSchema, submitted: ActionFormValues): ActionFormValues | undefined {
    const values: ActionFormValues = {};
    for (const field of schema.fields) {
      const raw = submitted[field.id];
      if (field.type === 'checkbox') {
        const checked = Boolean(raw);
        if (field.required && !checked) return undefined;
        values[field.id] = checked;
        continue;
      }
      if (typeof raw !== 'string') return undefined;
      const value = raw.trim();
      if (field.required && value.length === 0) return undefined;
      if (field.type === 'select' && !field.options?.some(option => option.value === value)) {
        return undefined;
      }
      values[field.id] = field.type === 'readonly' ? String(field.value ?? '') : value;
    }
    return values;
  }

  private static render(schema: ActionFormSchema, nonce: string): string {
    const fields = schema.fields.map(field => this.renderField(field)).join('\n');
    const semverPreview = JSON.stringify(schema.semverPreview || null).replace(/</g, '\\u003c');
    const replaceVersionMentions = replaceReleaseVersionMentions.toString();
    return `<!DOCTYPE html>
<html lang="${this.escape(schema.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
  <style nonce="${nonce}">
    body { color: var(--vscode-foreground); background: var(--vscode-editor-background); font-family: var(--vscode-font-family); padding: 24px; max-width: 760px; margin: 0 auto; }
    h1 { font-size: 1.45rem; margin: 0 0 8px; }
    .description { color: var(--vscode-descriptionForeground); margin-bottom: 20px; }
    .impact { border-left: 3px solid var(--vscode-notificationsWarningIcon-foreground); background: var(--vscode-textBlockQuote-background); padding: 10px 12px; margin: 16px 0 20px; }
    .field { margin-bottom: 16px; }
    label { display: block; font-weight: 600; margin-bottom: 6px; }
    input[type="text"], textarea, select { box-sizing: border-box; width: 100%; color: var(--vscode-input-foreground); background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border, transparent); padding: 8px 10px; font: inherit; }
    textarea { min-height: 90px; resize: vertical; }
    input:focus, textarea:focus, select:focus { outline: 1px solid var(--vscode-focusBorder); }
    input[readonly] { color: var(--vscode-descriptionForeground); }
    .help { color: var(--vscode-descriptionForeground); font-size: .9rem; margin-top: 5px; }
    .actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }
    button { border: 0; padding: 8px 16px; font: inherit; cursor: pointer; }
    button.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); font-weight: 600; }
    button.secondary { color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
    #error { color: var(--vscode-errorForeground); min-height: 1.2em; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>${this.escape(schema.title)}</h1>
  ${schema.description ? `<div class="description">${this.escape(schema.description)}</div>` : ''}
  ${schema.impactSummary ? `<div class="impact">${this.escape(schema.impactSummary)}</div>` : ''}
  <form id="action-form">
    ${fields}
    <div id="error" role="alert" aria-live="polite"></div>
    <div class="actions">
      <button class="secondary" type="button" id="cancel">${this.escape(schema.cancelLabel)}</button>
      <button class="${schema.saveAndExecuteLabel ? 'secondary' : 'primary'}" type="button" id="submit-btn">${this.escape(schema.submitLabel)}</button>
      ${schema.saveAndExecuteLabel ? `<button class="primary" type="button" id="save-and-execute-btn">${this.escape(schema.saveAndExecuteLabel)}</button>` : ''}
    </div>
  </form>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const semverPreview = ${semverPreview};
    const replaceReleaseVersionMentions = ${replaceVersionMentions};
    const form = document.getElementById('action-form');
    const error = document.getElementById('error');
    
    const submitForm = (action) => {
      if (!form.reportValidity()) return;
      const values = {};
      for (const element of form.elements) {
        if (!element.name) continue;
        values[element.name] = element.type === 'checkbox' ? element.checked : element.value;
      }
      vscode.postMessage({ type: 'submit', action, values });
    };

    document.getElementById('cancel')?.addEventListener('click', () => vscode.postMessage({ type: 'cancel' }));
    document.getElementById('submit-btn')?.addEventListener('click', () => submitForm('submit'));
    document.getElementById('save-and-execute-btn')?.addEventListener('click', () => submitForm('save_and_execute'));
    
    const computeNextVersion = (current, type) => {
      const parts = current.split('.').map(Number);
      if (parts.length !== 3 || parts.some(Number.isNaN)) return current;
      if (type === 'major') return String(parts[0] + 1) + '.0.0';
      if (type === 'minor') return parts[0] + '.' + String(parts[1] + 1) + '.0';
      return parts[0] + '.' + parts[1] + '.' + String(parts[2] + 1);
    };
    let previousNext = semverPreview
      ? document.getElementById(semverPreview.nextFieldId)?.value || semverPreview.currentVersion
      : '';
    const updateSemverPreview = () => {
      if (!semverPreview) return;
      const type = document.getElementById(semverPreview.typeFieldId)?.value || 'patch';
      const next = computeNextVersion(semverPreview.currentVersion, type);
      const tag = semverPreview.tagPrefix + next;
      const previousTag = document.getElementById(semverPreview.tagFieldId)?.value || semverPreview.tagPrefix + previousNext;
      const values = { next, tag, type };
      for (const fieldId of semverPreview.messageFieldIds) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        field.value = replaceReleaseVersionMentions(
          field.value,
          [semverPreview.currentVersion, previousNext],
          next,
          [semverPreview.tagPrefix + semverPreview.currentVersion, previousTag],
          tag
        );
      }
      for (const [fieldId, value] of [[semverPreview.nextFieldId, next], [semverPreview.tagFieldId, tag]]) {
        const field = document.getElementById(fieldId);
        if (field) field.value = value;
      }
      const command = document.getElementById(semverPreview.commandFieldId);
      if (command) command.value = semverPreview.commandTemplate
        .replace('{type}', values.type).replace('{next}', values.next).replace('{tag}', values.tag);
      previousNext = next;
    };
    if (semverPreview) {
      document.getElementById(semverPreview.typeFieldId)?.addEventListener('change', updateSemverPreview);
      updateSemverPreview();
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      submitForm('submit');
    });
    window.addEventListener('message', event => {
      if (event.data?.type === 'validation-error') error.textContent = ${JSON.stringify(schema.validationErrorLabel)};
    });
  </script>
</body>
</html>`;
  }

  private static renderField(field: ActionFormField): string {
    const id = this.escape(field.id);
    const label = this.escape(field.label);
    const required = field.required ? ' required' : '';
    const description = field.description
      ? `<div class="help" id="${id}-help">${this.escape(field.description)}</div>`
      : '';
    const describedBy = field.description ? ` aria-describedby="${id}-help"` : '';
    let control = '';

    if (field.type === 'textarea') {
      control = `<textarea id="${id}" name="${id}"${required}${describedBy}>${this.escape(String(field.value ?? ''))}</textarea>`;
    } else if (field.type === 'select') {
      const options = (field.options || []).map(option => {
        const selected = option.value === field.value ? ' selected' : '';
        return `<option value="${this.escape(option.value)}"${selected}>${this.escape(option.label)}</option>`;
      }).join('');
      control = `<select id="${id}" name="${id}"${required}${describedBy}>${options}</select>`;
    } else if (field.type === 'checkbox') {
      control = `<input id="${id}" name="${id}" type="checkbox"${field.value ? ' checked' : ''}${required}${describedBy}>`;
    } else {
      const readonly = field.type === 'readonly' ? ' readonly' : '';
      control = `<input id="${id}" name="${id}" type="text" value="${this.escape(String(field.value ?? ''))}"${required}${readonly}${describedBy}>`;
    }

    return `<div class="field"><label for="${id}">${label}</label>${control}${description}</div>`;
  }

  private static escape(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
