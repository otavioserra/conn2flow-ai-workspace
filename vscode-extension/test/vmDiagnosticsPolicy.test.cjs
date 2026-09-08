const test = require('node:test');
const assert = require('node:assert/strict');

const { buildVmLogCommand, normalizeVmConnection } = require('../out/vmDiagnosticsPolicy.js');

const connection = {
  user: 'otavio',
  host: 'lab.conn2flow.local',
  port: 22,
  targetPath: '/home/admin/web/conn2flow.local/conn2flow-gestor'
};

for (const logName of ['php-error.log', 'nginx-error.log']) {
  test(`leitura remota privilegiada de ${logName}`, () => {
    assert.equal(
      buildVmLogCommand(connection, logName),
      `ssh -o BatchMode=yes -o ConnectTimeout=15 -p 22 "otavio@lab.conn2flow.local" "sudo tail -n 100 -- '/home/admin/web/conn2flow.local/conn2flow-gestor/logs/${logName}'"`
    );
  });
}

test('configuração SSH inválida continua recusada antes de montar o comando', () => {
  assert.equal(
    normalizeVmConnection({ ...connection, targetPath: '/home/admin/../root' }),
    undefined
  );
});
