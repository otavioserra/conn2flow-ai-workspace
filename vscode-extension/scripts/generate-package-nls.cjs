const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const packagePath = path.join(root, 'package.json');
const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const previousEnPath = path.join(root, 'package.nls.json');
const previousEn = fs.existsSync(previousEnPath) ? JSON.parse(fs.readFileSync(previousEnPath, 'utf8')) : {};
const previousPtPath = path.join(root, 'package.nls.pt-br.json');
const previousPt = fs.existsSync(previousPtPath) ? JSON.parse(fs.readFileSync(previousPtPath, 'utf8')) : {};

const english = {
  'conn2flow.refreshTree': 'Refresh Panel', 'conn2flow.expandAll': 'Expand All Sections', 'conn2flow.collapseAll': 'Collapse All Sections',
  'conn2flow.terminal.toggleMode': 'Toggle Terminal Mode', 'conn2flow.custom.initManifest': 'Create Custom Actions Manifest', 'conn2flow.custom.editManifest': 'Edit Project Actions',
  'conn2flow.modes.selectMode': 'Select Topology or Autonomy', 'conn2flow.modes.selectTopology': 'Select Agent Topology', 'conn2flow.modes.selectAutonomy': 'Select Autonomy Level', 'conn2flow.modes.setDoubleAgent': 'Enable Dual Agent', 'conn2flow.modes.setTriAgent': 'Enable Agent Triad',
  'conn2flow.modes.setSupervised': 'Enable Supervised Mode (Level 1)', 'conn2flow.modes.setMonitored': 'Enable Autonomous Monitored Mode (Level 2)', 'conn2flow.modes.setHeadless': 'Enable Autonomous Headless Mode (Level 3)',
  'conn2flow.sdd.selectScope': 'Select SDD Scope', 'conn2flow.sdd.toggleViewMode': 'Toggle SDD Display Mode', 'conn2flow.sdd.toggleAutoGardening': 'Toggle SDD Memory Monitoring',
  'conn2flow.sdd.runGardening': 'Run Memory Gardening', 'conn2flow.sdd.createGardeningRequest': 'Create Gardening Request', 'conn2flow.sdd.openCurrent': 'Open CURRENT.md',
  'conn2flow.sdd.openSpec': 'Open SPEC.md', 'conn2flow.sdd.openChecklist': 'Open Validation Checklist', 'conn2flow.sdd.browseRequests': 'Browse Human Requests',
  'conn2flow.sdd.browseBatches': 'Browse Implementation Batches', 'conn2flow.sdd.browseDecisions': 'Browse Architecture Decisions', 'conn2flow.sdd.browseHandoffs': 'Browse Agent Handoffs', 'conn2flow.sdd.browseBacklog': 'Browse SDD Backlog',
  'conn2flow.sdd.browseBacklog': 'Browse SDD Backlog', 'conn2flow.bridge.launchClaudeGoal': 'Start Claude Code (/goal)', 'conn2flow.bridge.copyPrompt': 'Copy Executor Prompt',
  'conn2flow.bridge.recordHandoff': 'Open Current Handoff', 'conn2flow.bridge.notifyArchitect': 'Prepare Architect Review', 'conn2flow.hub.toggleWatcher': 'Toggle Triad MCP Hub Watcher', 'conn2flow.docker.status': 'Docker Container Status',
  'conn2flow.docker.logsApache': 'Follow Apache Logs', 'conn2flow.docker.logsPhp': 'Follow PHP Logs', 'conn2flow.docker.truncatePhpLog': 'Clear PHP Logs',
  'conn2flow.manager.updateAll': 'Update Core System', 'conn2flow.manager.syncResources': 'Sync Resources', 'conn2flow.manager.cssRebuild': 'Rebuild CSS', 'conn2flow.manager.cssAudit': 'Audit CSS',
  'conn2flow.projects.setTarget': 'Set Target Project', 'conn2flow.projects.deployTarget': 'Deploy Target Project', 'conn2flow.projects.syncCoreTarget': 'Sync Core to Target Project',
  'conn2flow.projects.syncFilesTarget': 'Sync Files to Test Environment', 'conn2flow.projects.deployWithSelect': 'Select Project to Deploy', 'conn2flow.projects.updateAllTarget': 'Update Target Project',
  'conn2flow.projects.updateAllWithSelect': 'Select Project to Update', 'conn2flow.projects.addNew': 'Register Project in Environment', 'conn2flow.projects.scaffoldProject': 'Create Satellite Project',
  'conn2flow.projects.cloneRepository': 'Clone Official Repositories', 'conn2flow.projects.deployOther': 'Deploy Another Project', 'conn2flow.projects.scaffoldNew': 'New Satellite Project',
  'conn2flow.projects.registerExisting': 'Register Existing Project', 'conn2flow.projects.cloneMissing': 'Clone Missing Repositories', 'conn2flow.projects.checkRepositories': 'Check Cloned Repositories',
  'conn2flow.projects.syncTemplate': 'Sync Core Environment Template', 'conn2flow.projects.openTemplate': 'Open Environment Template', 'conn2flow.projects.openActive': 'Open Active environment.json',
  'conn2flow.ai.sync': 'Sync Skills', 'conn2flow.ai.syncAllRepos': 'Distribute Skills to Repositories', 'conn2flow.ai.syncSkills': 'Sync Skills (One Click)',
  'conn2flow.ai.validateSkills': 'Validate Skills', 'conn2flow.ai.openPlaybook': 'Open Multi-Agent Playbook', 'conn2flow.ai.openCatalog': 'Open Skills Catalog',
  'conn2flow.ai.openAgents': 'Open AGENTS.md', 'conn2flow.ai.openGemini': 'Open GEMINI.md', 'conn2flow.docs.openDevToolsGuide': 'Dev Tools Panel Manual',
  'conn2flow.docs.openDevGuide': 'Conn2Flow Developer Guide', 'conn2flow.docs.openSddGuide': 'SDD Governance Guide', 'conn2flow.docs.openTailwindGuide': 'Tailwind CSS Architecture',
  'conn2flow.docs.openPanelGuide': 'Dev Tools Panel Manual (Legacy)', 'conn2flow.docs.openMarketplaceGuide': 'Marketplace Publication Guide', 'conn2flow.docs.openArchitectureGuide': 'Dual-Agent and Triad Architecture',
  'conn2flow.docs.openDockerGuide': 'Docker Environment Guide', 'conn2flow.docs.openResourcesGuide': 'Resources and SQL Runtime', 'conn2flow.settings.selectLanguage': 'Select Extension Language',
  'conn2flow.release.verifyPermission': 'Verify Release Permission', 'conn2flow.release.manager': 'Prepare Gestor Release', 'conn2flow.release.installer': 'Prepare Gestor Installer Release',
  'conn2flow.release.executeManager': 'Execute Gestor Release', 'conn2flow.release.executeInstaller': 'Execute Gestor Installer Release', 'conn2flow.release.openActions': 'Open GitHub Actions'
};

const en = {
  'extension.displayName': 'Conn2Flow Dev Tools',
  'extension.description': 'Official developer panel for SDD, Core, projects, diagnostics, agents, backlog and releases.',
  'view.title': 'Conn2Flow Dev Tools',
  'config.language.description': 'Runtime interface language. Automatic follows the VS Code display language.',
  'config.githubOwner.description': 'Optional GitHub owner or organization, used only when it cannot be derived from the Core origin remote.'
};
const pt = {
  'extension.displayName': 'Conn2Flow Dev Tools',
  'extension.description': 'Painel oficial para SDD, Core, projetos, diagnóstico, agentes, backlog e releases.',
  'view.title': 'Conn2Flow Dev Tools',
  'config.language.description': 'Idioma da interface em runtime. Automático acompanha o idioma de exibição do VS Code.',
  'config.githubOwner.description': 'Owner ou organização GitHub opcional, usado somente quando não puder ser derivado do remoto origin do Core.'
};

for (const key of Object.keys(previousEn)) {
  if (key.startsWith('tooltip.') || key.startsWith('agents.')) en[key] = previousEn[key];
}
for (const key of Object.keys(previousPt)) {
  if (key.startsWith('tooltip.') || key.startsWith('agents.')) pt[key] = previousPt[key];
}

for (const command of manifest.contributes.commands) {
  const key = `command.${command.command}`;
  const current = command.title;
  const localizedPt = typeof current === 'string' && !current.startsWith('%') ? current : previousPt[key];
  if (!localizedPt) throw new Error(`Missing pt-BR title for ${command.command}`);
  if (!english[command.command]) throw new Error(`Missing English title for ${command.command}`);
  pt[key] = localizedPt;
  en[key] = english[command.command];
  command.title = `%${key}%`;
}

manifest.displayName = '%extension.displayName%';
manifest.description = '%extension.description%';
manifest.contributes.viewsContainers.activitybar[0].title = '%view.title%';
manifest.contributes.views['conn2flow-view-container'][0].name = '%view.title%';

fs.writeFileSync(packagePath, JSON.stringify(manifest, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'package.nls.json'), JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(previousPtPath, JSON.stringify(pt, null, 2) + '\n');
