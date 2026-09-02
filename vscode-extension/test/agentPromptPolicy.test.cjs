const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildAgentPromptIdentity,
  findOrphanPlaceholders,
  resolvePromptModeKeys
} = require('../out/agentPromptPolicy.js');
const { en, ptBR, translate } = require('../out/localizationCatalog.js');
const nlsEn = require('../package.nls.json');
const nlsPt = require('../package.nls.pt-br.json');

const REPO_ROOT = path.resolve('C:/repos/conn2flow-ai-workspace');
const SDD_ROOT = path.join(REPO_ROOT, 'sdd');
const CURRENT_PATH = path.join(SDD_ROOT, 'human-requests', 'CURRENT.md');
const REQ_PATH = path.join(SDD_ROOT, 'human-requests', 'req-044.md');

/** Interpola as chaves de modo do jeito que o AgentBridgeManager faz. */
function modesFixture(locale, modes = { topology: 'triade', autonomy: 'supervisionado' }) {
  const keys = resolvePromptModeKeys(modes);
  return {
    topology: translate(locale, keys.topologyKey),
    autonomy: translate(locale, keys.autonomyKey),
    roles: translate(locale, keys.rolesKey)
  };
}

function identityFixture() {
  return buildAgentPromptIdentity({
    sddRoot: SDD_ROOT,
    workspaceRoot: path.resolve('C:/repos/conn2flow'),
    currentPath: CURRENT_PATH,
    reqPath: REQ_PATH,
    request: 'req-044.md'
  });
}

test('identidade do prompt deriva repositório e raiz absoluta do escopo SDD ativo', () => {
  const identity = identityFixture();

  assert.equal(identity.repo, 'conn2flow-ai-workspace');
  assert.equal(identity.root, REPO_ROOT);
  assert.equal(identity.sddRoot, SDD_ROOT);
  assert.equal(identity.currentPath, CURRENT_PATH);
  assert.equal(identity.reqPath, REQ_PATH);
  assert.equal(identity.request, 'req-044.md');
});

test('identidade cai para o workspace e para CURRENT.md quando o escopo não resolve', () => {
  const identity = buildAgentPromptIdentity({ workspaceRoot: REPO_ROOT });

  assert.equal(identity.repo, 'conn2flow-ai-workspace');
  assert.equal(identity.root, REPO_ROOT);
  assert.equal(identity.sddRoot, SDD_ROOT);
  assert.equal(identity.currentPath, CURRENT_PATH);
  assert.equal(identity.reqPath, CURRENT_PATH);
  assert.equal(identity.request, 'CURRENT.md');
});

test('identidade usa rótulo de fallback quando nenhum caminho é conhecido', () => {
  const identity = buildAgentPromptIdentity({}, 'Desconhecido');

  assert.equal(identity.repo, 'Desconhecido');
  assert.equal(identity.root, 'Desconhecido');
  assert.equal(identity.sddRoot, 'Desconhecido');
  assert.equal(identity.currentPath, 'Desconhecido');
  assert.equal(identity.reqPath, 'Desconhecido');
});

test('detector de chaves órfãs reconhece marcadores não substituídos', () => {
  assert.deepEqual(findOrphanPlaceholders('Projeto: {repo} e {repo} em {root}'), ['{repo}', '{root}']);
  assert.deepEqual(findOrphanPlaceholders('Projeto: conn2flow-ai-workspace'), []);
});

for (const locale of ['pt-BR', 'en']) {
  test(`prompt do executor em ${locale} traz cabeçalho, caminho absoluto e link markdown`, () => {
    const identity = identityFixture();
    const prompt = translate(locale, 'agents.executorPrompt', {
      ...identity,
      ...modesFixture(locale),
      content: '# REQUISIÇÃO HUMANA REQ-044'
    });

    // Cabeçalho padronizado de identificação do projeto alvo.
    assert.match(prompt, /^---\r?\n🏷️ /);
    assert.ok(prompt.includes('conn2flow-ai-workspace'));
    assert.ok(prompt.includes(REPO_ROOT));
    assert.ok(prompt.includes(SDD_ROOT));

    // Link markdown do arquivo de entrada com caminho absoluto.
    assert.ok(prompt.includes(`[req-044.md](${CURRENT_PATH})`));

    // Corpo da requisição e ausência de chaves órfãs.
    assert.ok(prompt.includes('# REQUISIÇÃO HUMANA REQ-044'));
    assert.deepEqual(findOrphanPlaceholders(prompt), []);
  });

  test(`instrução /goal em ${locale} identifica projeto, raiz e arquivo de entrada`, () => {
    const identity = identityFixture();
    const instruction = translate(locale, 'agents.goalInstruction', {
      ...identity,
      ...modesFixture(locale)
    });

    assert.ok(instruction.startsWith('/goal ['));
    assert.ok(instruction.includes('conn2flow-ai-workspace'));
    assert.ok(instruction.includes(REPO_ROOT));
    assert.ok(instruction.includes(CURRENT_PATH));
    assert.ok(instruction.includes('req-044.md'));
    assert.deepEqual(findOrphanPlaceholders(instruction), []);
  });

  test(`handoff inicial em ${locale} nasce com a identificação do repositório alvo`, () => {
    const identity = identityFixture();
    const handoff = translate(locale, 'agents.handoffInitial', {
      ...identity,
      timestamp: '2026-09-01T00:00:00.000Z'
    });

    assert.ok(handoff.startsWith('# 🤝 '));
    assert.ok(handoff.includes('conn2flow-ai-workspace'));
    assert.ok(handoff.includes(REPO_ROOT));
    assert.ok(handoff.includes(SDD_ROOT));
    assert.ok(handoff.includes('2026-09-01T00:00:00.000Z'));
    assert.deepEqual(findOrphanPlaceholders(handoff), []);
  });
}

test('chaves de modo resolvem topologia e autonomia ativas, com padrão seguro', () => {
  assert.deepEqual(resolvePromptModeKeys({ topology: 'duplo', autonomy: 'autonomo_monitorado' }), {
    topologyKey: 'mode.dual',
    rolesKey: 'agents.roles.dual',
    autonomyKey: 'mode.monitored'
  });

  assert.deepEqual(resolvePromptModeKeys({ topology: 'triade', autonomy: 'autonomo_headless' }), {
    topologyKey: 'mode.triad',
    rolesKey: 'agents.roles.triad',
    autonomyKey: 'mode.headless'
  });

  // Entrada desconhecida nunca vaza chave inválida para o catálogo.
  assert.deepEqual(resolvePromptModeKeys({ topology: 'quarteto', autonomy: 'turbo' }), {
    topologyKey: 'mode.triad',
    rolesKey: 'agents.roles.triad',
    autonomyKey: 'mode.supervised'
  });
  assert.deepEqual(resolvePromptModeKeys(), {
    topologyKey: 'mode.triad',
    rolesKey: 'agents.roles.triad',
    autonomyKey: 'mode.supervised'
  });
});

for (const locale of ['pt-BR', 'en']) {
  test(`prompt do executor em ${locale} descreve os papéis da topologia selecionada`, () => {
    const identity = identityFixture();

    const dual = translate(locale, 'agents.executorPrompt', {
      ...identity,
      ...modesFixture(locale, { topology: 'duplo', autonomy: 'autonomo_monitorado' }),
      content: '# REQ'
    });
    const triad = translate(locale, 'agents.executorPrompt', {
      ...identity,
      ...modesFixture(locale, { topology: 'triade', autonomy: 'supervisionado' }),
      content: '# REQ'
    });

    // O corpo do prompt muda com a topologia: sem isso a seleção do painel seria decorativa.
    assert.notEqual(dual, triad);
    assert.ok(dual.includes(translate(locale, 'agents.roles.dual')));
    assert.ok(triad.includes(translate(locale, 'agents.roles.triad')));
    assert.ok(dual.includes(translate(locale, 'mode.monitored')));
    assert.ok(triad.includes(translate(locale, 'mode.supervised')));

    assert.deepEqual(findOrphanPlaceholders(dual), []);
    assert.deepEqual(findOrphanPlaceholders(triad), []);
  });
}

test('templates espelhados no NLS acompanham o catálogo de runtime', () => {
  for (const key of ['agents.executorPrompt', 'agents.goalInstruction']) {
    assert.equal(nlsEn[key], en[key], `package.nls.json divergiu em ${key}`);
    assert.equal(nlsPt[key], ptBR[key], `package.nls.pt-br.json divergiu em ${key}`);
  }
});

test('AgentBridgeManager injeta a identidade do repositório em todas as pontes', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/agentBridgeManager.ts'), 'utf8');

  assert.match(source, /buildAgentPromptIdentity/);
  assert.match(source, /sddRoot: SddScopeManager\.getActiveSddRoot\(\)/);
  assert.match(source, /currentPath: active\?\.currentPath/);
  assert.match(source, /reqPath: active\?\.fullPath/);

  for (const key of ['agents.executorPrompt', 'agents.goalInstruction', 'agents.handoffInitial']) {
    const call = new RegExp(`t\\('${key.replace('.', '\\.')}',\\s*\\{[\\s\\S]{0,400}?currentPath: identity\\.currentPath`);
    assert.match(source, call, `${key} deve receber currentPath na interpolação`);
  }
});

test('AgentBridgeManager injeta topologia, autonomia e papéis ativos nos prompts', () => {
  const source = fs.readFileSync(require.resolve('../src/providers/agentBridgeManager.ts'), 'utf8');

  assert.match(source, /resolvePromptModeKeys/);
  assert.match(source, /ModesManager\.getCurrentModes\(\)/);

  for (const key of ['agents.executorPrompt', 'agents.goalInstruction']) {
    const call = new RegExp(`t\\('${key.replace('.', '\\.')}',\\s*\\{[\\s\\S]{0,600}?topology: modes\\.topology`);
    assert.match(source, call, `${key} deve receber a topologia ativa na interpolação`);
  }
});
