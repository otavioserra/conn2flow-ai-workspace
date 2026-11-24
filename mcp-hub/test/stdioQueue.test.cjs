const test = require('node:test');
const assert = require('node:assert/strict');
const { PassThrough } = require('node:stream');

const { McpServer } = require('../dist/server.js');

// REQ-090 / REP-011: stdin lines must be processed one at a time, in order.
test('stdio processes requests serially even when an earlier one is slower', async () => {
  const server = new McpServer();
  const events = [];
  server.handleRequest = async (request) => {
    events.push(`start:${request.id}`);
    // The first request (a "submit") is slow; the second (a "list") is instant.
    if (request.id === 1) await new Promise(resolve => setTimeout(resolve, 60));
    events.push(`end:${request.id}`);
    return { jsonrpc: '2.0', id: request.id, result: { ok: request.id } };
  };

  const input = new PassThrough();
  const output = new PassThrough();
  const chunks = [];
  output.on('data', chunk => chunks.push(chunk.toString('utf8')));

  const done = server.startStdio(input, output);
  input.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call' }) + '\n');
  input.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call' }) + '\n');
  input.write('\n');
  input.write('{not json\n');
  input.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  input.end();
  await done;

  assert.deepEqual(events.slice(0, 4), ['start:1', 'end:1', 'start:2', 'end:2']);
  const lines = chunks.join('').split('\n').filter(Boolean).map(line => JSON.parse(line));
  assert.deepEqual(lines.slice(0, 2).map(line => line.id), [1, 2]);
  assert.equal(lines[2].error.code, -32700);
  // notifications/initialized has no id and produces no output line.
  assert.equal(lines.length, 3);
});

test('a failing request does not block the queue', async () => {
  const server = new McpServer();
  server.handleRequest = async (request) => {
    if (request.id === 1) throw new Error('boom');
    return { jsonrpc: '2.0', id: request.id, result: {} };
  };
  const input = new PassThrough();
  const output = new PassThrough();
  const chunks = [];
  output.on('data', chunk => chunks.push(chunk.toString('utf8')));
  const done = server.startStdio(input, output);
  input.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'x' }) + '\n');
  input.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'x' }) + '\n');
  input.end();
  await done;
  const lines = chunks.join('').split('\n').filter(Boolean).map(line => JSON.parse(line));
  assert.equal(lines[0].error.code, -32603);
  assert.equal(lines[1].id, 2);
});
