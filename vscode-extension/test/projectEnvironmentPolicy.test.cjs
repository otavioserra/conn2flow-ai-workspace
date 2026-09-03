const test = require('node:test');
const assert = require('node:assert/strict');

const { isVmProject } = require('../out/projectEnvironmentPolicy.js');

test('identifica somente o projeto ativo com deploy_mode ssh como VM', () => {
  const data = {
    devProjects: {
      local: { deploy_mode: 'local' },
      vm: { deploy_mode: ' SSH ' }
    }
  };

  assert.equal(isVmProject(data, 'vm'), true);
  assert.equal(isVmProject(data, 'local'), false);
  assert.equal(isVmProject(data, 'missing'), false);
  assert.equal(isVmProject(undefined, 'vm'), false);
});

test('provider oculta nós Docker e status bar quando o alvo é VM', () => {
  const fs = require('node:fs');
  const provider = fs.readFileSync(require.resolve('../src/providers/conn2flowTreeProvider.ts'), 'utf8');
  const extension = fs.readFileSync(require.resolve('../src/extension.ts'), 'utf8');

  assert.match(provider, /if \(!ProjectsManager\.isTargetVm\(\)\)[\s\S]*?diagnostics\.dockerStatus/);
  assert.match(extension, /if \(ProjectsManager\.isTargetVm\(\)\)\s*\{\s*dockerStatusBarItem\.hide\(\)/);
});
