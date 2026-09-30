const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
    buildConflictDetailsArgs,
    buildConflictListArgs,
    buildResolveConflictArgs,
    parseConflictDetails,
    parseConflictList,
    requiredConflictFilePaths
} = require('../out/projectConflictsPolicy.js');

const conflict = {
    id: 'conflict-1',
    caminho: 'gestor/resources/page.html',
    motivo: 'editado',
    acoes: ['sobrescrever', 'manter', 'mesclar']
};

test('monta argumentos separados para listar e abrir choques', () => {
    assert.deepEqual(buildConflictListArgs('project-test'), [
        'update:conflicts', 'project-test', '--json'
    ]);
    assert.deepEqual(buildConflictDetailsArgs('project-test', conflict.id), [
        'update:conflicts', 'project-test', conflict.id, '--json'
    ]);
});

test('analisa lista JSON e conserva apenas as acoes suportadas pelo CLI', () => {
    const output = JSON.stringify({
        ok: true,
        projeto: 'project-test',
        choques: [{ ...conflict, acoes: [...conflict.acoes, 'unexpected'] }]
    });

    assert.deepEqual(parseConflictList(output), {
        projeto: 'project-test',
        choques: [conflict]
    });
});

test('normaliza IDs numericos do contrato real do CLI', () => {
    const output = JSON.stringify({
        ok: true,
        projeto: 'project-test',
        choques: [{ ...conflict, id: 9 }]
    });

    assert.equal(parseConflictList(output).choques[0].id, '9');
});

test('analisa caminhos das tres versoes de um choque', () => {
    const output = JSON.stringify({
        ok: true,
        projeto: 'project-test',
        choque: conflict,
        arquivos: {
            'no-ar': 'temp/conflicts/project-test/conflict-1/no-ar',
            nova: 'temp/conflicts/project-test/conflict-1/nova',
            mesclado: 'temp/conflicts/project-test/conflict-1/mesclado'
        }
    });

    assert.deepEqual(parseConflictDetails(output), {
        projeto: 'project-test',
        choque: conflict,
        arquivos: {
            'no-ar': 'temp/conflicts/project-test/conflict-1/no-ar',
            nova: 'temp/conflicts/project-test/conflict-1/nova',
            mesclado: 'temp/conflicts/project-test/conflict-1/mesclado'
        }
    });
});

test('aceita choque de retirada (sem versao nova) e de registro (sem arquivo)', () => {
    const retirada = parseConflictDetails(JSON.stringify({
        ok: true, projeto: 'project-test',
        choque: { id: 11, caminho: 'bibliotecas/b.php', motivo: 'retirado-editado', acoes: ['sobrescrever', 'manter'] },
        arquivos: { 'no-ar': 'temp/no-ar.php', mesclado: 'temp/mesclado.php' }
    }));
    assert.deepEqual(retirada.arquivos, { 'no-ar': 'temp/no-ar.php', mesclado: 'temp/mesclado.php' });
    assert.deepEqual(requiredConflictFilePaths(retirada.choque, retirada.arquivos), ['temp/no-ar.php']);

    const registro = parseConflictDetails(JSON.stringify({
        ok: true, projeto: 'project-test',
        choque: { id: 10, caminho: 'db:variaveis?id=x&language=pt-br', motivo: 'retirado-editado', acoes: ['sobrescrever', 'manter'] },
        arquivos: []
    }));
    assert.deepEqual(registro.arquivos, {});
    assert.deepEqual(requiredConflictFilePaths(registro.choque, registro.arquivos), []);
});

test('sem o arquivo mesclado, a acao mesclar sai das opcoes', () => {
    const d = parseConflictDetails(JSON.stringify({
        ok: true, projeto: 'project-test', choque: conflict, arquivos: { 'no-ar': 'a', nova: 'b' }
    }));
    assert.deepEqual(d.choque.acoes, ['sobrescrever', 'manter']);
});

test('exige o arquivo mesclado somente quando a acao esta disponivel', () => {
    const files = {
        'no-ar': 'live',
        nova: 'incoming',
        mesclado: 'merged'
    };

    assert.deepEqual(requiredConflictFilePaths({ ...conflict, acoes: ['manter'] }, files), ['live', 'incoming']);
    assert.deepEqual(requiredConflictFilePaths(conflict, files), ['live', 'incoming', 'merged']);
});

test('preserva erro do CLI e rejeita JSON incompleto', () => {
    assert.throws(
        () => parseConflictList(JSON.stringify({ ok: false, erro: 'Projeto inexistente.' })),
        /Projeto inexistente\./
    );
    assert.throws(() => parseConflictList('{'), error => error.code === 'invalid-json');
    assert.throws(
        () => parseConflictList(JSON.stringify({ ok: true, projeto: 'project-test' })),
        error => error.code === 'invalid-response'
    );
});

test('monta resolucao com acao selecionada e flag local opcional', () => {
    assert.deepEqual(buildResolveConflictArgs('project-test', conflict.id, 'manter', false), [
        'update:resolve', 'project-test', conflict.id, '--acao=manter', '--json'
    ]);
    assert.deepEqual(buildResolveConflictArgs('project-test', conflict.id, 'mesclar', true), [
        'update:resolve', 'project-test', conflict.id, '--acao=mesclar', '--local', '--json'
    ]);
});

test('gerenciador captura o CLI, exige Workspace Trust e apresenta erros sem propaga-los a arvore', () => {
    const source = fs.readFileSync(
        path.resolve(__dirname, '../src/providers/projectConflictsManager.ts'),
        'utf8'
    );

    assert.match(source, /execFile\(command, commandArgs/);
    assert.match(source, /if \(!vscode\.workspace\.isTrusted\)/);
    assert.match(source, /vscode\.commands\.executeCommand\(\s*'vscode\.diff'/);
    assert.match(source, /showErrorMessage\(\s*LocalizationManager\.t\('projects\.conflictError'/);
});
