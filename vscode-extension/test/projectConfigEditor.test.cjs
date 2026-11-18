const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    extractProjectConfig,
    mergeProjectConfig,
    removeProjectConfig,
    scopedConfigFileName,
    serializeProjectConfig
} = require('../out/projectConfigEditorPolicy.js');

const environment = {
    name: 'dev',
    devEnvironment: { projectTarget: 'lumix' },
    gemini: { apiKey: 'SECRET-GEMINI' },
    devProjects: {
        lumix: { name: 'Lumix', path: '../lumix', api: { access_token: 'TOKEN-LUMIX' } },
        site: { name: 'Site', path: '../site', api: { access_token: 'TOKEN-SITE' } }
    }
};
const environmentText = `${JSON.stringify(environment, null, 2)}\n`;

test('extrai somente devProjects[projectId], sem chaves globais nem outros projetos', () => {
    const scoped = extractProjectConfig(environment, 'lumix');
    assert.deepEqual(scoped, environment.devProjects.lumix);
    const text = serializeProjectConfig(scoped);
    assert.doesNotMatch(text, /SECRET-GEMINI|TOKEN-SITE|devProjects|projectTarget/);
    assert.match(text, /TOKEN-LUMIX/);
    assert.equal(extractProjectConfig(environment, 'missing'), undefined);
    assert.equal(extractProjectConfig({}, 'lumix'), undefined);
});

test('extração devolve cópia e não muta o environment original', () => {
    const scoped = extractProjectConfig(environment, 'lumix');
    scoped.name = 'Alterado';
    assert.equal(environment.devProjects.lumix.name, 'Lumix');
});

test('merge substitui apenas o nó do projeto e preserva o resto intacto', () => {
    const edited = JSON.stringify({ name: 'Lumix 2', path: '../lumix', url: 'http://lumix.local' });
    const result = mergeProjectConfig(environmentText, 'lumix', edited);
    assert.equal(result.ok, true);
    const saved = JSON.parse(result.text);
    assert.deepEqual(saved.devProjects.lumix, JSON.parse(edited));
    assert.deepEqual(saved.devProjects.site, environment.devProjects.site);
    assert.deepEqual(saved.gemini, environment.gemini);
    assert.deepEqual(saved.devEnvironment, environment.devEnvironment);
    assert.equal(saved.name, 'dev');
    assert.deepEqual(Object.keys(saved.devProjects), ['lumix', 'site']);
    assert.ok(result.text.endsWith('}\n'));
    assert.match(result.text, /\n  "devProjects": \{/);
});

test('merge rejeita JSON inválido, não-objeto, projeto ausente e environment corrompido', () => {
    assert.equal(mergeProjectConfig(environmentText, 'lumix', '{ "name": ').reason, 'invalidJson');
    assert.equal(mergeProjectConfig(environmentText, 'lumix', '[1,2]').reason, 'notObject');
    assert.equal(mergeProjectConfig(environmentText, 'lumix', 'null').reason, 'notObject');
    assert.equal(mergeProjectConfig(environmentText, 'ghost', '{}').reason, 'projectMissing');
    assert.equal(mergeProjectConfig('{broken', 'lumix', '{}').reason, 'environmentInvalid');
    assert.equal('text' in mergeProjectConfig(environmentText, 'lumix', 'oops'), false);
});

test('nome do buffer temporário é seguro contra separadores de caminho', () => {
    assert.equal(scopedConfigFileName('lumix'), 'lumix.project.json');
    assert.doesNotMatch(scopedConfigFileName('../../etc/passwd'), /[\\/]/);
    assert.doesNotMatch(scopedConfigFileName('..'), /^\.\./);
});

test('ProjectsManager usa temp isolado, sincroniza no save e limpa ao fechar', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/providers/projectsManager.ts'), 'utf8');
    assert.match(source, /fs\.mkdtempSync\(path\.join\(os\.tmpdir\(\)/);
    assert.match(source, /onDidSaveTextDocument/);
    assert.match(source, /onDidCloseTextDocument/);
    assert.match(source, /mergeProjectConfig\(/);
    assert.match(source, /fs\.rmSync\(session\.dir/);
    const extension = fs.readFileSync(path.resolve(__dirname, '../src/extension.ts'), 'utf8');
    assert.match(extension, /registerScopedProjectConfigEditor\(/);
    assert.match(extension, /'conn2flow\.projects\.editTargetConfig'/);
    assert.match(extension, /'conn2flow\.projects\.editProjectConfigSelect'/);
});

test('aba Projetos exibe choques só do alvo + seletor, sem lista de warnings', () => {
    const tree = fs.readFileSync(path.resolve(__dirname, '../src/providers/conn2flowTreeProvider.ts'), 'utf8');
    const projectsBlock = tree.slice(tree.indexOf('const projects = ['), tree.indexOf('const diagnostics'));
    const targetBlock = projectsBlock.slice(projectsBlock.indexOf('if (target) {'), projectsBlock.indexOf('\n    }'));

    assert.doesNotMatch(projectsBlock, /getProjectsList\(\)/);
    assert.doesNotMatch(projectsBlock, /'warning'/);
    assert.match(targetBlock, /'projects\.conflictsFor',\s*'conn2flow\.projects\.listConflicts',\s*'git-compare',\s*\{ project: target \},\s*\[target\]/);
    assert.match(targetBlock, /'projects\.editTargetConfig',\s*'conn2flow\.projects\.editTargetConfig'/);
    assert.match(projectsBlock, /this\.leaf\('projects\.conflictsSelectProject',\s*'conn2flow\.projects\.listConflicts',\s*'diff'\)/);
    assert.match(projectsBlock, /this\.leaf\('projects\.editConfigSelect',\s*'conn2flow\.projects\.editProjectConfigSelect',\s*'edit'\)/);
    assert.equal((projectsBlock.match(/projects\.conflictsFor/g) || []).length, 1);
});

test('rótulos novos existem nos dois idiomas sem ícone de alerta', () => {
    const { en, ptBR } = require('../out/localizationCatalog.js');
    for (const key of ['projects.conflictsFor', 'projects.conflictsSelectProject', 'projects.editTargetConfig', 'projects.editConfigSelect',
        'projects.configSaved', 'projects.configInvalidJson', 'projects.configNotObject', 'projects.configEnvironmentInvalid', 'projects.configSelectPrompt', 'projects.configOpened']) {
        assert.ok(en[key], `${key} missing in en`);
        assert.ok(ptBR[key], `${key} missing in pt-BR`);
    }
    assert.doesNotMatch(en['projects.conflictsFor'], /⚠️/);
    assert.doesNotMatch(ptBR['projects.conflictsFor'], /⚠️/);
    assert.match(ptBR['projects.editTargetConfig'], /Editar Dados do Projeto: \{target\}/);
    assert.match(ptBR['projects.conflictsSelectProject'], /Selecionar Projeto/);
});

test('exclusão remove só devProjects[projectId] e limpa o alvo quando necessário', () => {
    const result = removeProjectConfig(environmentText, 'lumix');
    assert.equal(result.ok, true);
    assert.equal(result.wasTarget, true);
    const saved = JSON.parse(result.text);
    assert.deepEqual(Object.keys(saved.devProjects), ['site']);
    assert.deepEqual(saved.devProjects.site, environment.devProjects.site);
    assert.deepEqual(saved.gemini, environment.gemini);
    assert.equal('projectTarget' in saved.devEnvironment, false);
    assert.equal(saved.name, 'dev');
    assert.ok(result.text.endsWith('}\n'));

    const other = removeProjectConfig(environmentText, 'site');
    assert.equal(other.wasTarget, false);
    assert.equal(JSON.parse(other.text).devEnvironment.projectTarget, 'lumix');
});

test('exclusão rejeita projeto ausente e environment corrompido sem produzir texto', () => {
    assert.equal(removeProjectConfig(environmentText, 'ghost').reason, 'projectMissing');
    assert.equal(removeProjectConfig('{broken', 'lumix').reason, 'environmentInvalid');
    assert.equal('text' in removeProjectConfig(environmentText, 'ghost'), false);
});

test('excluir projeto exige confirmação modal e aparece como seletor na árvore', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/providers/projectsManager.ts'), 'utf8');
    const del = source.match(/public static async deleteProject[\s\S]*?\n  }/)?.[0] || '';
    assert.match(del, /showWarningMessage\([\s\S]*modal: true/);
    assert.match(del, /answer !== confirmLabel/);
    assert.match(del, /removeProjectConfig\(/);
    const tree = fs.readFileSync(path.resolve(__dirname, '../src/providers/conn2flowTreeProvider.ts'), 'utf8');
    assert.match(tree, /this\.leaf\('projects\.deleteSelect',\s*'conn2flow\.projects\.deleteProjectSelect',\s*'trash'\)/);
    const { en, ptBR } = require('../out/localizationCatalog.js');
    assert.match(ptBR['projects.deleteSelect'], /Excluir Projeto/);
    assert.match(en['projects.deleteSelect'], /Delete Project/);
});

test('cadastro de projeto pré-preenche URL e caminhos editáveis e mantém foco no Alt+Tab', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '../src/providers/projectsManager.ts'), 'utf8');
    const add = source.match(/public static async addNewProject[\s\S]*?\r?\n  }\r?\n/)?.[0] || '';
    const boxes = add.match(/show(InputBox|QuickPick)\(/g) || [];
    assert.ok(boxes.length >= 6);
    assert.equal((add.match(/ignoreFocusOut: true/g) || []).length, boxes.length, 'todas as caixas devem manter o foco');
    assert.match(add, /value: defaultUrl/);
    assert.match(add, /prompt: LocalizationManager\.t\('projects\.pathPrompt'\),\s*value: this\.toGitPath\(path\.join\(parent, id, 'gestor'\)\)/);
    assert.match(add, /prompt: LocalizationManager\.t\('projects\.pathTestsPrompt'\),\s*value:/);
    assert.match(add, /path: projectPath/);
    assert.match(add, /existingIds\.has\(trimmed\)/);
    const { en, ptBR } = require('../out/localizationCatalog.js');
    for (const key of ['projects.pathPrompt', 'projects.pathTestsPrompt', 'projects.fieldRequired', 'projects.idInvalid', 'projects.idExists']) {
        assert.ok(en[key] && ptBR[key], key);
    }
});
