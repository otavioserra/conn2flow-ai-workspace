const test = require('node:test');
const assert = require('node:assert/strict');

const { isLocalVmProject, isVmProject } = require('../out/projectEnvironmentPolicy.js');

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
  assert.match(extension, /if \(ProjectsManager\.isTargetVm\(\)\)\s*\{[\s\S]*?Conn2Flow VM/);
  assert.match(extension, /dockerStatusBarItem\.command = 'conn2flow\.vm\.diagnostics'/);
});

test('confirmacao automatica e restrita a VM declarada como local', () => {
  const data = {
    devProjects: {
      localVm: { deploy_mode: 'ssh', local: true },
      remoteVm: { deploy_mode: 'ssh', local: false },
      docker: { deploy_mode: 'local', local: true }
    }
  };

  assert.equal(isLocalVmProject(data, 'localVm'), true);
  assert.equal(isLocalVmProject(data, 'remoteVm'), false);
  assert.equal(isLocalVmProject(data, 'docker'), false);
});
