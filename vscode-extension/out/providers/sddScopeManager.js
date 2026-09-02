"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SddScopeManager = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const projectsManager_1 = require("./projectsManager");
const repositoryLocator_1 = require("../repositoryLocator");
const localizationManager_1 = require("./localizationManager");
const workspacePreferencesPolicy_1 = require("../workspacePreferencesPolicy");
class SddScopeManager {
    static _currentScopeId = 'core';
    static storage;
    static storageKey = 'conn2flow.sdd.scopeId';
    /**
     * Precedência de restauração (REQ-049 / BATCH-051): `settings.json` primeiro,
     * `workspaceState` legado em seguida — migrando workspaces já em uso — e por
     * fim a inferência a partir das pastas abertas.
     */
    static initialize(context) {
        this.storage = context.workspaceState;
        const workspacePaths = vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
        this._currentScopeId = (0, workspacePreferencesPolicy_1.resolvePersistedPreference)({
            settings: vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION).get(workspacePreferencesPolicy_1.PREFERENCE_KEYS.scopeId),
            workspaceState: this.storage.get(this.storageKey),
            inferred: (0, repositoryLocator_1.inferScopeIdFromWorkspace)(workspacePaths)
        }, workspacePreferencesPolicy_1.recognizeScopeId, workspacePreferencesPolicy_1.DEFAULT_SCOPE_ID);
    }
    static getCurrentScopeId() {
        return this._currentScopeId;
    }
    static getScopeLabel() {
        const scope = this.getCurrentScope();
        return scope ? scope.label : '🏛️ Core (conn2flow)';
    }
    static getAvailableScopes() {
        const scopes = [];
        // 1. Core (conn2flow)
        const coreSdd = this.findRepoSdd('conn2flow');
        scopes.push({
            id: 'core',
            label: '🏛️ Core (Sistema)',
            description: 'conn2flow/sdd',
            sddPath: coreSdd || ''
        });
        // 2. Projetos Satélites do environment.json
        const projects = projectsManager_1.ProjectsManager.getProjectsList();
        for (const proj of projects) {
            const projSdd = this.findProjectSdd(proj.id, proj.path);
            if (projSdd && fs.existsSync(projSdd)) {
                scopes.push({
                    id: `project:${proj.id}`,
                    label: `🚀 Projeto: ${proj.name}`,
                    description: `${proj.id}/sdd`,
                    sddPath: projSdd
                });
            }
        }
        // 3. AI Workspace
        const aiSdd = this.findRepoSdd('conn2flow-ai-workspace');
        if (aiSdd && fs.existsSync(aiSdd)) {
            scopes.push({
                id: 'ai-workspace',
                label: '📚 AI Workspace Hub',
                description: 'conn2flow-ai-workspace/sdd',
                sddPath: aiSdd
            });
        }
        return scopes;
    }
    static getCurrentScope() {
        const scopes = this.getAvailableScopes();
        const found = scopes.find(s => s.id === this._currentScopeId);
        if (found)
            return found;
        return scopes[0];
    }
    static getActiveSddRoot() {
        const scope = this.getCurrentScope();
        if (scope && scope.sddPath && fs.existsSync(scope.sddPath)) {
            return scope.sddPath;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            for (const f of workspaceFolders) {
                const s = path.join(f.uri.fsPath, 'sdd');
                if (fs.existsSync(s))
                    return s;
            }
        }
        return undefined;
    }
    static resolveSddFile(relativePathInSdd) {
        const sddRoot = this.getActiveSddRoot();
        if (sddRoot) {
            const cleanRel = relativePathInSdd.replace(/^sdd[/\\]/, '');
            const full = path.join(sddRoot, cleanRel);
            if (fs.existsSync(full)) {
                return full;
            }
        }
        return undefined;
    }
    static async selectScope(onChanged) {
        const scopes = this.getAvailableScopes();
        const targetProject = projectsManager_1.ProjectsManager.getTargetProject();
        const items = scopes.map(s => {
            const isActive = s.id === this._currentScopeId;
            const isTarget = s.id === `project:${targetProject}`;
            let extra = '';
            if (isActive)
                extra = ' ● ATIVO';
            if (isTarget)
                extra += ' (Projeto Alvo Atual)';
            return {
                label: `${s.label}${extra}`,
                description: s.description,
                detail: s.id
            };
        });
        const sel = await vscode.window.showQuickPick(items, {
            placeHolder: localizationManager_1.LocalizationManager.t('sdd.scopePrompt')
        });
        if (sel && sel.detail) {
            this._currentScopeId = sel.detail;
            await this.storage?.update(this.storageKey, this._currentScopeId);
            await this.persistScopeSetting(this._currentScopeId);
            const chosen = scopes.find(s => s.id === sel.detail);
            vscode.window.setStatusBarMessage(localizationManager_1.LocalizationManager.t('sdd.scopeChanged', { scope: chosen?.label || sel.detail }), 2500);
            if (onChanged) {
                onChanged();
            }
        }
    }
    /** Espelha o escopo ativo em `settings.json` para sobreviver ao reload. */
    static async persistScopeSetting(scopeId) {
        const config = vscode.workspace.getConfiguration(workspacePreferencesPolicy_1.PREFERENCE_SECTION);
        const target = vscode.workspace.workspaceFolders?.length
            ? vscode.ConfigurationTarget.Workspace
            : vscode.ConfigurationTarget.Global;
        try {
            await config.update(workspacePreferencesPolicy_1.PREFERENCE_KEYS.scopeId, scopeId, target);
        }
        catch {
            // workspaceState permanece como fallback
        }
    }
    static findRepoSdd(repoName) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return undefined;
        const candidates = (0, repositoryLocator_1.buildRepositorySddCandidates)(workspaceFolders.map(folder => folder.uri.fsPath), repoName);
        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }
        return undefined;
    }
    static findProjectSdd(projectId, projPathConfig) {
        const candidates = [];
        if (projPathConfig) {
            let clean = projPathConfig;
            clean = clean.replace(/^\/([a-zA-Z])\//, '$1:/');
            clean = clean.replace(/[/\\]gestor\/?$/, '');
            candidates.push(path.join(clean, 'sdd'));
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            for (const f of workspaceFolders) {
                candidates.push(path.join(f.uri.fsPath, '..', projectId, 'sdd'));
                candidates.push(path.join(f.uri.fsPath, 'projects', projectId, 'sdd'));
                candidates.push(path.join(f.uri.fsPath, projectId, 'sdd'));
            }
        }
        for (const c of candidates) {
            if (fs.existsSync(c)) {
                return c;
            }
        }
        return undefined;
    }
}
exports.SddScopeManager = SddScopeManager;
//# sourceMappingURL=sddScopeManager.js.map