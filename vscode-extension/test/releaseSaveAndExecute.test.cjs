const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

test('formulário de release integra botão Salvar e Executar com releaseManager', () => {
  const formSource = fs.readFileSync(require.resolve('../src/providers/actionFormPanel.ts'), 'utf8');
  const managerSource = fs.readFileSync(require.resolve('../src/providers/releaseManager.ts'), 'utf8');

  assert.match(formSource, /saveAndExecuteLabel/);
  assert.match(formSource, /save-and-execute-btn/);
  assert.match(formSource, /submitForm\('save_and_execute'\)/);
  assert.match(formSource, /keepOpenOnSaveAndExecute/);
  assert.match(formSource, /loadingLabel/);

  assert.match(managerSource, /saveAndExecuteLabel:\s*LocalizationManager\.t\('release\.saveAndExecute'\)/);
  assert.match(managerSource, /submission\.action === 'save_and_execute'/);
  assert.match(managerSource, /await this\.execute\(product, new CommandRunner\(\), onChanged\)/);
  assert.match(managerSource, /submission\.close\?\.\(\)/);
});
