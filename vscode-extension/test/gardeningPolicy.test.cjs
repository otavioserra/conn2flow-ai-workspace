const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  MEMORY_GARDENING_LIMITS,
  classifyMemoryHealth
} = require('../out/gardeningPolicy.js');

test('limites normativos de gardening usam 50 KB / 200 linhas e 75 KB / 300 linhas', () => {
  assert.deepEqual(MEMORY_GARDENING_LIMITS, {
    warningBytes: 50 * 1024,
    warningLines: 200,
    criticalBytes: 75 * 1024,
    criticalLines: 300,
    targetBytes: 25 * 1024,
    recentTasksMin: 20,
    recentTasksMax: 25
  });
});

test('memória abaixo do alerta permanece saudável e não dispara poda', () => {
  assert.equal(classifyMemoryHealth((50 * 1024) - 1, 199), 'healthy');
});

test('alerta inicia ao atingir qualquer limite preventivo', () => {
  assert.equal(classifyMemoryHealth(50 * 1024, 1), 'warning');
  assert.equal(classifyMemoryHealth(1, 200), 'warning');
});

test('poda torna-se obrigatória ao atingir qualquer teto crítico', () => {
  assert.equal(classifyMemoryHealth(75 * 1024, 1), 'critical');
  assert.equal(classifyMemoryHealth(1, 300), 'critical');
});

test('requisição gerada usa alvo de 25 KB e preserva 20 a 25 tarefas', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../src/providers/gardeningManager.ts'),
    'utf8'
  );

  assert.match(source, /abaixo de 50 KB \/ 200 linhas/);
  assert.match(source, /75 KB \/ 300 linhas/);
  assert.match(source, /~25 KB preservando as 20 a 25 tarefas/);
  assert.doesNotMatch(source, /35 KB|100 linhas|150 linhas|~15 KB|12 a 15 tarefas/);
});
