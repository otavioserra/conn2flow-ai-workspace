const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('CommandRunner mantém progresso nativo até a tarefa terminar', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/commandRunner.ts'), 'utf8');

  assert.match(source, /vscode\.window\.withProgress/);
  assert.match(source, /location:\s*vscode\.ProgressLocation\.Notification/);
  assert.match(source, /cancellable:\s*false/);
  assert.match(source, /return this\.executeTask\(request\)/);
});

test('pipelines longos de Core e projetos ativam progresso', () => {
  const source = fs.readFileSync(require.resolve('../src/extension.ts'), 'utf8');

  for (const command of [
    'manager:update-all',
    'resources:sync',
    'css:rebuild --project=',
    'project:update-all ',
    'project:deploy ',
    'project:sync-core '
  ]) {
    const position = source.indexOf(command);
    assert.notEqual(position, -1, `${command} deve existir`);
    assert.match(source.slice(position, position + 420), /true, false, true\)/, `${command} deve ativar progresso`);
  }
});

test('Salvar e Executar desabilita o formulário e exibe spinner até o release terminar', () => {
  const form = fs.readFileSync(require.resolve('../src/providers/actionFormPanel.ts'), 'utf8');
  const release = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');

  assert.match(form, /form\.setAttribute\('aria-busy', 'true'\)/);
  assert.match(form, /classList\.add\('busy'\)/);
  assert.match(release, /keepOpenOnSaveAndExecute:\s*true/);
  assert.match(release, /progressTitle:\s*LocalizationManager\.t\('release\.progress'/);
  assert.match(release, /finally\s*\{\s*submission\.close\?\.\(\)/);
});
