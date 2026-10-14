const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { buildBacklogSourcePath } = require('../out/backlogPolicy.js');
const { translate } = require('../out/localizationCatalog.js');

for (const folder of ['memory', 'sdd']) {
  test(`backlog promotion points at the ${folder} scope`, () => {
    const source = buildBacklogSourcePath(path.resolve('project', folder), 'BL-001.md');
    assert.equal(source, `${folder}/backlog/BL-001.md`);
    for (const locale of ['en', 'pt-BR']) {
      const prompt = translate(locale, 'backlog.promotionPrompt', {
        id: 'BL-001', type: 'feature', status: 'approved', title: 'Test', action: 'intake', source
      });
      assert.ok(prompt.includes(source));
      assert.ok(prompt.includes('start-mdd-slice'));
      assert.doesNotMatch(prompt, /\{source\}|\{file\}/);
    }
  });
}
