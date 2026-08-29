"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const child_process_1 = require("child_process");
const util_1 = require("util");
const actionFormPanel_1 = require("./actionFormPanel");
const localizationManager_1 = require("./localizationManager");
const shellHelper_1 = require("./shellHelper");
const workspaceLocator_1 = require("./workspaceLocator");
const releasePolicy_1 = require("../releasePolicy");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class ReleaseManager {
    static permission = 'unknown';
    static viewerPermission = '';
    static repositoryUrl;
    static get permissionState() {
        return this.permission;
    }
    static get permissionLabel() {
        return this.viewerPermission || localizationManager_1.LocalizationManager.t('common.unknown');
    }
    static async verifyPermission(onChanged) {
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!root) {
            this.permission = 'unknown';
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionUnknown', { reason: 'Core repository not found' }));
            onChanged?.();
            return;
        }
        vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('release.permissionChecking'), 2500);
        try {
            await execFileAsync('gh', ['auth', 'status'], { cwd: root, windowsHide: true });
            const { stdout } = await execFileAsync('gh', ['repo', 'view', '--json', 'viewerPermission,nameWithOwner,url'], { cwd: root, windowsHide: true });
            const info = JSON.parse(stdout);
            this.viewerPermission = String(info.viewerPermission || '').toUpperCase();
            this.permission = (0, releasePolicy_1.classifyViewerPermission)(this.viewerPermission);
            this.repositoryUrl = typeof info.url === 'string' ? info.url : undefined;
            if (this.permission === 'allowed') {
                vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('release.permissionAllowed', { permission: this.viewerPermission }));
            }
            else {
                vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionDenied', { permission: this.viewerPermission || '?' }));
            }
        }
        catch (error) {
            this.permission = 'unknown';
            this.viewerPermission = '';
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionUnknown', { reason: error?.message || String(error) }));
        }
        finally {
            onChanged?.();
        }
    }
    static async create(product, runner, onChanged) {
        if (this.permission !== 'allowed') {
            await this.verifyPermission(onChanged);
            if (this.permissionState !== 'allowed')
                return;
        }
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!root)
            return;
        const definition = this.definition(product);
        const preflight = await this.preflight(root, definition);
        if (!preflight.ok || !preflight.version) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.preflightFailed', { reason: preflight.reason || '?' }));
            return;
        }
        const initialNext = (0, releasePolicy_1.bumpSemver)(preflight.version, 'patch');
        const shell = shellHelper_1.ShellHelper.getActiveShellType();
        const commandTemplate = `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} {type} <tag-message> <commit-message> <mode>`;
        const values = await actionFormPanel_1.ActionFormPanel.show({
            id: `release-${product}`,
            title: localizationManager_1.LocalizationManager.t('release.formTitle', { product: definition.label }),
            description: `${localizationManager_1.LocalizationManager.t('release.formDescription')} ${localizationManager_1.LocalizationManager.t('release.workflow', { workflow: definition.workflow })}`,
            impactSummary: localizationManager_1.LocalizationManager.t('release.impact'),
            submitLabel: localizationManager_1.LocalizationManager.t('common.submit'),
            cancelLabel: localizationManager_1.LocalizationManager.t('common.cancel'),
            validationErrorLabel: localizationManager_1.LocalizationManager.t('common.invalidForm'),
            language: localizationManager_1.LocalizationManager.currentLocale,
            fields: [
                { id: 'currentVersion', label: localizationManager_1.LocalizationManager.t('release.currentVersion'), type: 'readonly', value: preflight.version },
                { id: 'releaseType', label: localizationManager_1.LocalizationManager.t('release.type'), type: 'select', required: true, value: 'patch', options: ['patch', 'minor', 'major'].map(value => ({ label: value, value })) },
                { id: 'nextVersion', label: localizationManager_1.LocalizationManager.t('release.nextVersion'), type: 'readonly', value: initialNext },
                { id: 'tag', label: localizationManager_1.LocalizationManager.t('release.tag'), type: 'readonly', value: definition.tagPrefix + initialNext },
                { id: 'tagMessage', label: localizationManager_1.LocalizationManager.t('release.tagMessage'), type: 'text', required: true },
                { id: 'commitMessage', label: localizationManager_1.LocalizationManager.t('release.commitMessage'), type: 'textarea', required: true },
                { id: 'mode', label: localizationManager_1.LocalizationManager.t('release.mode'), type: 'select', required: true, value: 'automatic', options: [
                        { label: localizationManager_1.LocalizationManager.t('release.modeAutomatic'), value: 'automatic' },
                        { label: localizationManager_1.LocalizationManager.t('release.modeManual'), value: 'manual' }
                    ] },
                { id: 'command', label: localizationManager_1.LocalizationManager.t('release.command'), type: 'readonly', value: commandTemplate.replace('{type}', 'patch') }
            ],
            semverPreview: {
                currentVersion: preflight.version,
                typeFieldId: 'releaseType',
                nextFieldId: 'nextVersion',
                tagFieldId: 'tag',
                commandFieldId: 'command',
                tagPrefix: definition.tagPrefix,
                commandTemplate
            }
        });
        if (!values)
            return;
        const increment = values.releaseType;
        const next = (0, releasePolicy_1.bumpSemver)(preflight.version, increment);
        const tag = definition.tagPrefix + next;
        const collision = await this.git(root, ['tag', '--list', tag]);
        let remoteCollision = '';
        try {
            remoteCollision = await this.git(root, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
        }
        catch (error) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.preflightFailed', { reason: error?.message || String(error) }));
            return;
        }
        if (collision.trim() || remoteCollision.trim()) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.tagExists', { tag }));
            return;
        }
        const finalConfirmation = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.confirm', {
            product: definition.label,
            current: preflight.version,
            next,
            tag,
            mode: String(values.mode)
        }), { modal: true }, localizationManager_1.LocalizationManager.t('command.confirmButton'));
        if (!finalConfirmation)
            return;
        const args = [increment, String(values.tagMessage), String(values.commitMessage), String(values.mode)]
            .map(value => (0, releasePolicy_1.quoteShellArg)(value, shell)).join(' ');
        const result = await runner.run({
            command: `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} ${args}`,
            cwd: root,
            label: localizationManager_1.LocalizationManager.t(product === 'manager' ? 'release.manager' : 'release.installer'),
            impact: 'remote',
            target: tag,
            exclusive: true,
            confirmationSatisfied: true,
            notifySuccess: false
        });
        if (result.succeeded && values.mode === 'automatic') {
            const runId = await this.findWorkflowRun(root, definition.workflow, tag);
            if (!runId) {
                vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.preflightFailed', { reason: 'GitHub Actions run was not found after tag push' }));
                return;
            }
            const workflow = await runner.run({
                command: `gh run watch ${runId} --exit-status`,
                cwd: root,
                label: `${definition.label} · GitHub Actions`,
                impact: 'read-only',
                target: tag,
                exclusive: true
            });
            if (!workflow.succeeded)
                return;
        }
        if (result.succeeded) {
            const open = await vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('release.openActions'), localizationManager_1.LocalizationManager.t('release.openActions'));
            if (open)
                await this.openActions();
        }
    }
    static async openActions() {
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        let base = this.repositoryUrl;
        if (!base && root) {
            try {
                base = (0, releasePolicy_1.githubRepositoryUrl)(await this.git(root, ['remote', 'get-url', 'origin']));
            }
            catch { /* no-op */ }
        }
        if (base)
            await vscode.env.openExternal(vscode.Uri.parse(`${base}/actions`));
    }
    static definition(product) {
        return product === 'manager' ? {
            product,
            label: localizationManager_1.LocalizationManager.t('release.productManager'),
            command: 'manager:release',
            versionFile: path.join('gestor', 'config.php'),
            versionPattern: /\$_GESTOR\[['"]versao['"]\]\s*=\s*['"](\d+\.\d+\.\d+)['"]/,
            tagPrefix: 'gestor-v',
            workflow: '.github/workflows/release-gestor.yml'
        } : {
            product,
            label: localizationManager_1.LocalizationManager.t('release.productInstaller'),
            command: 'installer:release',
            versionFile: path.join('gestor-instalador', 'index.php'),
            versionPattern: /\$_GESTOR_INSTALADOR\[['"]versao['"]\]\s*=\s*['"](\d+\.\d+\.\d+)['"]/,
            tagPrefix: 'instalador-v',
            workflow: '.github/workflows/release-instalador.yml'
        };
    }
    static async preflight(root, definition) {
        if (!vscode.workspace.isTrusted)
            return { ok: false, reason: localizationManager_1.LocalizationManager.t('command.trustRequired') };
        const required = [definition.workflow, definition.versionFile, 'c2f'];
        for (const file of required)
            if (!fs.existsSync(path.join(root, file)))
                return { ok: false, reason: `${file} missing` };
        if ((await this.git(root, ['status', '--porcelain'])).trim())
            return { ok: false, reason: localizationManager_1.LocalizationManager.t('release.cleanRequired') };
        const branch = (await this.git(root, ['symbolic-ref', '--short', '-q', 'HEAD'])).trim();
        if (!branch)
            return { ok: false, reason: 'detached HEAD' };
        const remote = (await this.git(root, ['remote', 'get-url', 'origin'])).trim();
        if (!(0, releasePolicy_1.githubRepositoryUrl)(remote))
            return { ok: false, reason: 'origin is not a GitHub repository' };
        try {
            for (const status of ['in_progress', 'queued']) {
                const { stdout } = await execFileAsync('gh', ['run', 'list', '--workflow', path.basename(definition.workflow), '--status', status, '--json', 'databaseId', '--limit', '1'], { cwd: root, windowsHide: true });
                if (JSON.parse(stdout).length > 0)
                    return { ok: false, reason: `release workflow is ${status}` };
            }
        }
        catch (error) {
            return { ok: false, reason: error?.message || String(error) };
        }
        const content = fs.readFileSync(path.join(root, definition.versionFile), 'utf8');
        const version = content.match(definition.versionPattern)?.[1];
        return version ? { ok: true, version } : { ok: false, reason: `version not found in ${definition.versionFile}` };
    }
    static async git(root, args) {
        const { stdout } = await execFileAsync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, '-C', root, ...args], { windowsHide: true });
        return stdout;
    }
    static async findWorkflowRun(root, workflow, tag) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const { stdout } = await execFileAsync('gh', ['run', 'list', '--workflow', path.basename(workflow), '--json', 'databaseId,headBranch', '--limit', '20'], { cwd: root, windowsHide: true });
            const run = JSON.parse(stdout).find((item) => item.headBranch === tag);
            if (typeof run?.databaseId === 'number')
                return run.databaseId;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        return undefined;
    }
}
exports.ReleaseManager = ReleaseManager;
//# sourceMappingURL=releaseManager.js.map