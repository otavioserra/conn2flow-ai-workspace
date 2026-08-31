"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const util_1 = require("util");
const actionFormPanel_1 = require("./actionFormPanel");
const commandRunner_1 = require("./commandRunner");
const localizationManager_1 = require("./localizationManager");
const shellHelper_1 = require("./shellHelper");
const workspaceLocator_1 = require("./workspaceLocator");
const releasePolicy_1 = require("../releasePolicy");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
class ReleaseManager {
    static permission = 'unknown';
    static viewerPermission = '';
    static repositoryUrl;
    static context;
    static executionGates = new Map();
    static initialize(context) {
        this.context = context;
        this.executionGates.clear();
    }
    static get permissionState() {
        return this.permission;
    }
    static get permissionLabel() {
        return this.viewerPermission || localizationManager_1.LocalizationManager.t('common.unknown');
    }
    static canExecute(product) {
        return this.executionGates.get(product)?.canExecute === true;
    }
    static executionBlockerLabel(product) {
        const blockers = this.executionGates.get(product)?.blockers;
        return blockers?.length
            ? blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
            : localizationManager_1.LocalizationManager.t('release.notPrepared');
    }
    static async verifyPermission(onChanged, silent = false) {
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!root) {
            this.permission = 'unknown';
            if (!silent) {
                vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionUnknown', { reason: localizationManager_1.LocalizationManager.t('release.coreMissing') }));
            }
            onChanged?.();
            return;
        }
        if (!silent)
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('release.permissionChecking'), 2500);
        try {
            await execFileAsync('gh', ['auth', 'status'], { cwd: root, windowsHide: true });
            const { stdout } = await execFileAsync('gh', ['repo', 'view', '--json', 'viewerPermission,nameWithOwner,url'], { cwd: root, windowsHide: true });
            const info = JSON.parse(stdout);
            this.viewerPermission = String(info.viewerPermission || '').toUpperCase();
            this.permission = (0, releasePolicy_1.classifyViewerPermission)(this.viewerPermission);
            this.repositoryUrl = typeof info.url === 'string' ? info.url : undefined;
            if (!silent && this.permission === 'allowed') {
                vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('release.permissionAllowed', { permission: this.viewerPermission }));
            }
            else if (!silent) {
                vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionDenied', { permission: this.viewerPermission || '?' }));
            }
        }
        catch (error) {
            this.permission = 'unknown';
            this.viewerPermission = '';
            if (!silent) {
                vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.permissionUnknown', { reason: error?.message || String(error) }));
            }
        }
        finally {
            onChanged?.();
        }
    }
    static async prepare(product, onChanged) {
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        if (!root || !this.context) {
            vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.coreMissing'));
            return;
        }
        const definition = this.definition(product);
        vscode.window.setStatusBarMessage(`$(sync~spin) ${localizationManager_1.LocalizationManager.t('release.preparingFeedback', { product: definition.label })}`, 3000);
        await this.verifyPermission(undefined, true);
        const currentVersion = this.readVersion(root, definition);
        if (!currentVersion) {
            vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.preflightFailed', { reason: definition.versionFile }));
            return;
        }
        const existing = this.loadDraft(product);
        const generated = (0, releasePolicy_1.createReleaseDraftSuggestion)(product, currentVersion, existing?.increment || 'patch', await this.recentCommits(root), this.activeBatch());
        const initial = {
            ...generated,
            ...(existing?.currentVersion === currentVersion ? existing : {}),
            documentationFingerprint: '',
            preparedAt: new Date().toISOString()
        };
        const initialDiagnostics = await this.diagnose(root, definition, initial.increment, false);
        initial.documentationFingerprint = initialDiagnostics.documentation.fingerprint;
        await this.saveDraft(initial);
        this.executionGates.set(product, initialDiagnostics.gate);
        onChanged?.();
        const shell = shellHelper_1.ShellHelper.getActiveShellType();
        const commandTemplate = `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} {type} <tag-message> <commit-message> <mode>`;
        const changedFiles = initialDiagnostics.dirtyFiles.length > 0
            ? initialDiagnostics.dirtyFiles.join(', ')
            : localizationManager_1.LocalizationManager.t('release.cleanTree');
        const documentationLabel = initialDiagnostics.documentation.ready
            ? localizationManager_1.LocalizationManager.t('release.docsReady', { count: initialDiagnostics.documentation.files.length })
            : localizationManager_1.LocalizationManager.t('release.docsBlocked', {
                issues: [...initialDiagnostics.documentation.missing, ...initialDiagnostics.documentation.issues].join(', ')
            });
        const submission = await actionFormPanel_1.ActionFormPanel.show({
            id: `release-prepare-${product}`,
            title: localizationManager_1.LocalizationManager.t('release.prepareTitle', { product: definition.label }),
            description: localizationManager_1.LocalizationManager.t('release.prepareDescription'),
            impactSummary: localizationManager_1.LocalizationManager.t('release.prepareImpact'),
            submitLabel: localizationManager_1.LocalizationManager.t('release.saveDraft'),
            saveAndExecuteLabel: localizationManager_1.LocalizationManager.t('release.saveAndExecute'),
            cancelLabel: localizationManager_1.LocalizationManager.t('common.cancel'),
            validationErrorLabel: localizationManager_1.LocalizationManager.t('common.invalidForm'),
            language: localizationManager_1.LocalizationManager.currentLocale,
            fields: [
                { id: 'currentVersion', label: localizationManager_1.LocalizationManager.t('release.currentVersion'), type: 'readonly', value: currentVersion },
                { id: 'branch', label: localizationManager_1.LocalizationManager.t('release.branch'), type: 'readonly', value: initialDiagnostics.branch || '-' },
                { id: 'permission', label: localizationManager_1.LocalizationManager.t('release.permission'), type: 'readonly', value: this.permissionLabel },
                { id: 'modifiedFiles', label: localizationManager_1.LocalizationManager.t('release.modifiedFiles'), type: 'readonly', value: changedFiles },
                { id: 'documentation', label: localizationManager_1.LocalizationManager.t('release.documentation'), type: 'readonly', value: documentationLabel },
                {
                    id: 'releaseType',
                    label: localizationManager_1.LocalizationManager.t('release.type'),
                    type: 'select',
                    required: true,
                    value: initial.increment,
                    options: ['patch', 'minor', 'major'].map(value => ({ label: value, value }))
                },
                { id: 'nextVersion', label: localizationManager_1.LocalizationManager.t('release.nextVersion'), type: 'readonly', value: initial.nextVersion },
                { id: 'tag', label: localizationManager_1.LocalizationManager.t('release.tag'), type: 'readonly', value: initial.tag },
                { id: 'tagMessage', label: localizationManager_1.LocalizationManager.t('release.tagMessage'), type: 'text', required: true, value: initial.tagMessage },
                { id: 'commitMessage', label: localizationManager_1.LocalizationManager.t('release.commitMessage'), type: 'textarea', required: true, value: initial.commitMessage },
                { id: 'releaseNotes', label: localizationManager_1.LocalizationManager.t('release.releaseNotes'), type: 'textarea', required: true, value: initial.releaseNotes },
                {
                    id: 'mode',
                    label: localizationManager_1.LocalizationManager.t('release.mode'),
                    type: 'select',
                    required: true,
                    value: initial.mode,
                    options: [
                        { label: localizationManager_1.LocalizationManager.t('release.modeAutomatic'), value: 'automatic' },
                        { label: localizationManager_1.LocalizationManager.t('release.modeManual'), value: 'manual' }
                    ]
                },
                { id: 'command', label: localizationManager_1.LocalizationManager.t('release.command'), type: 'readonly', value: commandTemplate.replace('{type}', initial.increment) }
            ],
            semverPreview: {
                currentVersion,
                typeFieldId: 'releaseType',
                nextFieldId: 'nextVersion',
                tagFieldId: 'tag',
                commandFieldId: 'command',
                messageFieldIds: ['tagMessage', 'commitMessage', 'releaseNotes'],
                tagPrefix: definition.tagPrefix,
                commandTemplate
            }
        });
        if (!submission)
            return;
        const values = submission.values || submission;
        const increment = values.releaseType;
        const recalculated = (0, releasePolicy_1.createReleaseDraftSuggestion)(product, currentVersion, increment);
        const draft = {
            ...recalculated,
            tagMessage: String(values.tagMessage),
            commitMessage: String(values.commitMessage),
            releaseNotes: String(values.releaseNotes),
            mode: values.mode === 'manual' ? 'manual' : 'automatic',
            documentationFingerprint: initialDiagnostics.documentation.fingerprint,
            preparedAt: new Date().toISOString()
        };
        await this.saveDraft(draft);
        const diagnostics = await this.diagnose(root, definition, increment, true, draft.documentationFingerprint);
        this.executionGates.set(product, diagnostics.gate);
        onChanged?.();
        if (submission.action === 'save_and_execute') {
            if (!diagnostics.gate.canExecute) {
                await this.showBlockedActions(product, localizationManager_1.LocalizationManager.t('release.executionBlocked', {
                    blockers: diagnostics.gate.blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
                }));
                return;
            }
            await this.execute(product, new commandRunner_1.CommandRunner(), onChanged);
            return;
        }
        const resultMessage = diagnostics.gate.canExecute
            ? localizationManager_1.LocalizationManager.t('release.executeReady')
            : localizationManager_1.LocalizationManager.t('release.executionBlocked', { blockers: diagnostics.gate.blockers.join(', ') });
        vscode.window.showInformationMessage(`${localizationManager_1.LocalizationManager.t('release.draftSaved')} ${resultMessage}`);
        if (diagnostics.dirtyFiles.length > 0) {
            await this.offerSourceControl();
        }
    }
    static async execute(product, runner, onChanged) {
        const root = workspaceLocator_1.WorkspaceLocator.getCoreRoot();
        const draft = this.loadDraft(product);
        if (!root) {
            await this.showBlockedActions(product, localizationManager_1.LocalizationManager.t('release.coreMissing'));
            return;
        }
        if (!draft) {
            await this.showBlockedActions(product, localizationManager_1.LocalizationManager.t('release.executionBlocked', {
                blockers: this.blockerLabel('draft-missing')
            }));
            return;
        }
        await this.verifyPermission(undefined, true);
        const definition = this.definition(product);
        const diagnostics = await this.diagnose(root, definition, draft.increment, true, draft.documentationFingerprint);
        this.executionGates.set(product, diagnostics.gate);
        onChanged?.();
        if (!diagnostics.gate.canExecute || !diagnostics.version) {
            await this.showBlockedActions(product, localizationManager_1.LocalizationManager.t('release.executionBlocked', {
                blockers: diagnostics.gate.blockers.map(blocker => this.blockerLabel(blocker)).join('; ')
            }));
            return;
        }
        const next = (0, releasePolicy_1.bumpSemver)(diagnostics.version, draft.increment);
        const tag = definition.tagPrefix + next;
        const finalConfirmation = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.confirm', {
            product: definition.label,
            current: diagnostics.version,
            next,
            tag,
            mode: draft.mode
        }), { modal: true }, localizationManager_1.LocalizationManager.t('command.confirmButton'));
        if (!finalConfirmation)
            return;
        const shell = shellHelper_1.ShellHelper.getActiveShellType();
        const args = [draft.increment, draft.tagMessage, draft.commitMessage, draft.mode]
            .map(value => (0, releasePolicy_1.quoteShellArg)(value, shell)).join(' ');
        const triggeredAfter = new Date();
        const result = await runner.run({
            command: `${shell === 'bash' ? './c2f' : 'php cli/c2f.php'} ${definition.command} ${args}`,
            cwd: root,
            label: localizationManager_1.LocalizationManager.t(product === 'manager' ? 'release.executeManager' : 'release.executeInstaller'),
            impact: 'remote',
            target: tag,
            exclusive: true,
            confirmationSatisfied: true,
            notifySuccess: false
        });
        if (result.succeeded && draft.mode === 'automatic') {
            const workflowRun = await this.findWorkflowRun(root, definition.workflow, tag, triggeredAfter);
            if (!workflowRun) {
                vscode.window.showErrorMessage(localizationManager_1.LocalizationManager.t('release.preflightFailed', { reason: localizationManager_1.LocalizationManager.t('release.workflowMissing') }));
                return;
            }
            if (!(workflowRun.status.toLocaleLowerCase('en-US') === 'completed' &&
                workflowRun.conclusion?.toLocaleLowerCase('en-US') === 'success')) {
                const workflow = await runner.run({
                    command: `gh run watch ${workflowRun.databaseId} --exit-status`,
                    cwd: root,
                    label: `${definition.label} · GitHub Actions`,
                    impact: 'read-only',
                    target: tag,
                    exclusive: true
                });
                if (!workflow.succeeded)
                    return;
            }
        }
        if (result.succeeded) {
            await this.context?.workspaceState.update(this.draftKey(product), undefined);
            this.executionGates.delete(product);
            onChanged?.();
            const open = await vscode.window.showInformationMessage(localizationManager_1.LocalizationManager.t('release.completed', { product: definition.label }), localizationManager_1.LocalizationManager.t('release.openActions'));
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
            catch {
                // no-op
            }
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
    static async diagnose(root, definition, increment, draftReady, expectedDocumentationFingerprint) {
        const required = [definition.workflow, definition.versionFile, 'c2f'];
        const requiredFilesReady = required.every(file => fs.existsSync(path.join(root, file)));
        const version = this.readVersion(root, definition);
        let dirtyFiles = [];
        let branch;
        let remote = '';
        try {
            dirtyFiles = (await this.git(root, ['status', '--porcelain', '--untracked-files=all']))
                .split(/\r?\n/)
                .filter(Boolean)
                .map(line => line.slice(3).trim());
            branch = (await this.git(root, ['symbolic-ref', '--short', '-q', 'HEAD'])).trim() || undefined;
            remote = (await this.git(root, ['remote', 'get-url', 'origin'])).trim();
        }
        catch {
            dirtyFiles = ['git-status'];
        }
        const tag = version ? definition.tagPrefix + (0, releasePolicy_1.bumpSemver)(version, increment) : '';
        let tagCollision = !tag;
        if (tag) {
            try {
                const local = await this.git(root, ['tag', '--list', tag]);
                const remoteTag = await this.git(root, ['ls-remote', '--tags', 'origin', `refs/tags/${tag}`]);
                tagCollision = Boolean(local.trim() || remoteTag.trim());
            }
            catch {
                tagCollision = true;
            }
        }
        let workflowIdle = false;
        if (this.permission === 'allowed') {
            try {
                workflowIdle = true;
                for (const status of ['in_progress', 'queued']) {
                    const { stdout } = await execFileAsync('gh', ['run', 'list', '--workflow', path.basename(definition.workflow), '--status', status, '--json', 'databaseId', '--limit', '1'], { cwd: root, windowsHide: true });
                    if (JSON.parse(stdout).length > 0)
                        workflowIdle = false;
                }
            }
            catch {
                workflowIdle = false;
            }
        }
        const documentation = this.inspectDocumentation(root);
        const documentationReady = documentation.ready &&
            (!expectedDocumentationFingerprint || documentation.fingerprint === expectedDocumentationFingerprint);
        const gate = (0, releasePolicy_1.evaluateReleaseGate)({
            workspaceTrusted: vscode.workspace.isTrusted,
            permission: this.permission,
            dirtyFiles,
            branch,
            githubRemote: Boolean((0, releasePolicy_1.githubRepositoryUrl)(remote)),
            tagCollision,
            documentationReady,
            draftReady,
            requiredFilesReady,
            workflowIdle
        });
        return {
            version,
            branch,
            dirtyFiles,
            githubRemote: Boolean((0, releasePolicy_1.githubRepositoryUrl)(remote)),
            tag,
            tagCollision,
            requiredFilesReady,
            workflowIdle,
            documentation,
            gate
        };
    }
    static inspectDocumentation(root) {
        const workflowsDir = path.join(root, '.github', 'workflows');
        const workflowFiles = fs.existsSync(workflowsDir)
            ? fs.readdirSync(workflowsDir)
                .filter(file => /\.ya?ml$/i.test(file))
                .map(file => path.posix.join('.github', 'workflows', file))
            : [];
        const candidateFiles = ['README.md', 'README-PT-BR.md', 'CHANGELOG.md', ...workflowFiles];
        const inventory = (0, releasePolicy_1.inspectReleaseDocumentPaths)(candidateFiles.filter(file => fs.existsSync(path.join(root, file))));
        const files = [...inventory.required, ...inventory.workflows].sort();
        const contents = new Map();
        for (const file of files)
            contents.set(file, fs.readFileSync(path.join(root, file), 'utf8'));
        const managerVersion = this.readVersion(root, this.definition('manager'));
        const installerVersion = this.readVersion(root, this.definition('installer'));
        const issues = (0, releasePolicy_1.inspectReleaseDocumentContents)(Object.fromEntries(contents), managerVersion, installerVersion);
        const hash = (0, crypto_1.createHash)('sha256');
        for (const file of files) {
            hash.update(file.replace(/\\/g, '/'));
            hash.update('\0');
            hash.update(contents.get(file) || '');
            hash.update('\0');
        }
        return {
            files,
            missing: inventory.missing,
            issues,
            fingerprint: hash.digest('hex'),
            ready: inventory.ready && issues.length === 0
        };
    }
    static readVersion(root, definition) {
        const fullPath = path.join(root, definition.versionFile);
        if (!fs.existsSync(fullPath))
            return undefined;
        return fs.readFileSync(fullPath, 'utf8').match(definition.versionPattern)?.[1];
    }
    static async recentCommits(root) {
        try {
            return (await this.git(root, ['log', '-5', '--pretty=format:%s']))
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean);
        }
        catch {
            return [];
        }
    }
    static activeBatch() {
        const aiRoot = workspaceLocator_1.WorkspaceLocator.getAiWorkspaceRoot();
        if (!aiRoot)
            return '';
        const current = path.join(aiRoot, 'sdd', 'human-requests', 'CURRENT.md');
        if (!fs.existsSync(current))
            return '';
        return fs.readFileSync(current, 'utf8').match(/BATCH-\d+/i)?.[0].toUpperCase() || '';
    }
    static draftKey(product) {
        return `conn2flow.release.draft.${product}`;
    }
    static loadDraft(product) {
        return this.context?.workspaceState.get(this.draftKey(product));
    }
    static async saveDraft(draft) {
        await this.context?.workspaceState.update(this.draftKey(draft.product), draft);
    }
    static async offerSourceControl() {
        const action = localizationManager_1.LocalizationManager.t('release.openScm');
        const selected = await vscode.window.showWarningMessage(localizationManager_1.LocalizationManager.t('release.cleanRequired'), action);
        if (selected === action)
            await vscode.commands.executeCommand('workbench.view.scm');
    }
    static blockerLabel(blocker) {
        return localizationManager_1.LocalizationManager.t(`release.blocker.${blocker}`);
    }
    static async showBlockedActions(product, message) {
        const openPreparation = localizationManager_1.LocalizationManager.t('release.openPreparation');
        const openSourceControl = localizationManager_1.LocalizationManager.t('release.openScm');
        const selected = await vscode.window.showWarningMessage(message, openPreparation, openSourceControl);
        if (selected === openPreparation) {
            await vscode.commands.executeCommand(product === 'manager' ? 'conn2flow.release.manager' : 'conn2flow.release.installer');
        }
        else if (selected === openSourceControl) {
            await vscode.commands.executeCommand('workbench.view.scm');
        }
    }
    static async git(root, args) {
        const { stdout } = await execFileAsync('git', ['-c', `safe.directory=${root.replace(/\\/g, '/')}`, '-C', root, ...args], { windowsHide: true });
        return stdout;
    }
    static async findWorkflowRun(root, workflow, tag, triggeredAfter) {
        for (let attempt = 0; attempt < 20; attempt++) {
            const { stdout } = await execFileAsync('gh', [
                'run', 'list',
                '--workflow', path.basename(workflow),
                '--json', 'databaseId,headBranch,status,conclusion,createdAt',
                '--limit', '20'
            ], { cwd: root, windowsHide: true });
            const run = (0, releasePolicy_1.selectWorkflowRun)(JSON.parse(stdout), tag, triggeredAfter);
            if (run)
                return run;
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        return undefined;
    }
}
exports.ReleaseManager = ReleaseManager;
//# sourceMappingURL=releaseManager.js.map