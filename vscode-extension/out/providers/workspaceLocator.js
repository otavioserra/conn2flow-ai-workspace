"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceLocator = void 0;
const vscode = require("vscode");
const fs = require("fs");
const repositoryLocator_1 = require("../repositoryLocator");
class WorkspaceLocator {
    static getWorkspacePaths() {
        return vscode.workspace.workspaceFolders?.map(folder => folder.uri.fsPath) || [];
    }
    static findRepositoryRoot(repoName) {
        return (0, repositoryLocator_1.buildRepositoryRootCandidates)(this.getWorkspacePaths(), repoName).find(candidate => fs.existsSync(candidate));
    }
    static getCoreRoot() {
        return this.findRepositoryRoot('conn2flow');
    }
    static getAiWorkspaceRoot() {
        return this.findRepositoryRoot('conn2flow-ai-workspace');
    }
}
exports.WorkspaceLocator = WorkspaceLocator;
//# sourceMappingURL=workspaceLocator.js.map