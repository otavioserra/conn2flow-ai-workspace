const test = require('node:test');
const assert = require('node:assert/strict');

const { en, ptBR, resolveLocale, translate } = require('../out/localizationCatalog.js');

test('catálogos português e inglês possuem paridade estrita', () => {
  assert.deepEqual(Object.keys(ptBR).sort(), Object.keys(en).sort());
});

test('modo automático acompanha português e inglês do VS Code', () => {
  assert.equal(resolveLocale('auto', 'pt-br'), 'pt-BR');
  assert.equal(resolveLocale('auto', 'en-US'), 'en');
});

test('preferência manual vence o idioma do VS Code', () => {
  assert.equal(resolveLocale('en', 'pt-BR'), 'en');
  assert.equal(resolveLocale('pt-BR', 'en-US'), 'pt-BR');
});

test('environment só atua quando o idioma automático não é suportado', () => {
  assert.equal(resolveLocale('auto', 'fr', 'pt-BR'), 'pt-BR');
  assert.equal(resolveLocale('auto', 'fr', 'en'), 'en');
});

test('interpolação preserva chaves ausentes e substitui valores conhecidos', () => {
  assert.equal(translate('en', 'overview.target', { target: 'lumix' }), '📌 Target Project: lumix');
});

const fs = require('node:fs');
const path = require('node:path');
const manifestEn = require('../package.nls.json');
const manifestPt = require('../package.nls.pt-br.json');
const { FEEDBACK_GROUP_ORDER, feedbackLabel, describeFeedback, describeFeedbackMetadata, describeServerStatus } = require('../out/mddHubPolicy.js');

test('MDD Hub and bootstrap catalogs agree on keys and placeholders in both languages', () => {
  const pairs = [
    [en, ptBR, /^(?:mddHub\.|tooltip\.mddHub\.|bootstrap\.|view\.mddHub$)/],
    [manifestEn, manifestPt, /^(?:command\.conn2flow\.(?:mddHub\.|mdd\.initProject$)|view\.mddHub$|config\.(?:mddHubPort|autoSyncSkills|autoSyncIntervalHours|remoteMatrixUrl)\.description$)/]
  ];
  const portugueseWords = /\b(?:atualizar|servidores|habilidades|pendentes|aceitos|quarentena|iniciar|triagem|domínio|veredito)\b/iu;
  const englishWords = /\b(?:refresh|servers|skills|pending|accepted|quarantine|stop|restart|handshake|feedbacks?|issues|verdict|kind|running|stopped)\b/iu;
  const placeholders = value => (value.match(/\{\w+\}/g) || []).sort();
  for (const [english, portuguese, scope] of pairs) {
    const keys = Object.keys(english).filter(key => scope.test(key)).sort();
    assert.ok(keys.length > 0);
    assert.deepEqual(Object.keys(portuguese).filter(key => scope.test(key)).sort(), keys);
    for (const key of keys) {
      assert.ok(english[key].trim() && portuguese[key].trim(), key);
      assert.deepEqual(placeholders(english[key]), placeholders(portuguese[key]), key);
      assert.doesNotMatch(english[key], portugueseWords, key);
      // The executable, its subcommand and machine placeholders keep their spelling.
      const text = /remoteSync|syncRemoteSkills|autoSync|remoteMatrixUrl/i.test(key)
        ? portuguese[key].replace(/\bskills\b/gi, '') : portuguese[key];
      assert.doesNotMatch(text.replace(/memory\/inbox\/feedback\/|mdd feedback(?: list| triage)?|\{\w+\}/g, ''), englishWords, key);
    }
  }
  assert.equal(manifestEn['view.mddHub'], en['view.mddHub']);
  assert.equal(manifestPt['view.mddHub'], ptBR['view.mddHub']);
});

test('MDD Hub localizes all verdict groups and dynamic metadata without translating source text', () => {
  const records = FEEDBACK_GROUP_ORDER.map(verdict => ({ verdict }));
  assert.deepEqual(records.map(({ verdict }) => feedbackLabel('en', 'group', verdict)),
    ['Pending', 'Accepted', 'Needs evidence', 'Quarantine', 'Rejected', 'Local only']);
  assert.deepEqual(records.map(({ verdict }) => feedbackLabel('pt-BR', 'group', verdict)),
    ['Pendentes', 'Aceitos', 'Aguardando evidências', 'Quarentena', 'Rejeitados', 'Somente locais']);

  const record = { status: 'TRIAGED', verdict: 'ACCEPT', kind: 'learning', severity: 'high', skill: 'mdd-workflow', repo: 'site' };
  assert.equal(describeFeedback(record, 'en'), 'high · mdd-workflow · site');
  assert.equal(describeFeedback(record, 'pt-BR'), 'alta · mdd-workflow · site');
  assert.equal(describeFeedbackMetadata(record, 'en'), 'Status: Triaged · Verdict: Accepted · Kind: learning');
  assert.equal(describeFeedbackMetadata(record, 'pt-BR'), 'Situação: Triado · Veredito: Aceitos · Tipo: aprendizado');
  assert.equal(feedbackLabel('pt-BR', 'status', 'OPEN'), 'Aberto');
  assert.equal(feedbackLabel('en', 'group', 'FUTURE_VERDICT'), 'FUTURE_VERDICT');
  assert.equal(describeServerStatus({ id: 'mdd-client', state: 'STOPPED' }, 'pt-BR'), 'PARADO');
});

test('changing the extension language updates the MDD Hub title and repaints before the reload', () => {
  const extension = fs.readFileSync(path.join(__dirname, '../src/extension.ts'), 'utf8');
  const manager = fs.readFileSync(path.join(__dirname, '../src/providers/localizationManager.ts'), 'utf8');
  assert.match(manager, /affectsConfiguration\('conn2flow\.language'\)[\s\S]*?this\.refreshLocale\(\);\s+onChanged\(\);/);
  assert.match(extension, /LocalizationManager\.initialize\(context, \(\) => \{\s+refreshAll\(\);\s+mddHubView\.title = LocalizationManager\.t\('view\.mddHub'\);\s+mddHubTreeProvider\.repaint\(\);\s+void mddHubTreeProvider\.refresh\(\);\s+\}\);/);
});
