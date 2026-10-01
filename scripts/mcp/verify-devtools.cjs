// Local integration probe. Requires a launched sandbox and Node 22 via npm exec.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { Client } = require('../../mcp-hub/node_modules/@modelcontextprotocol/sdk/dist/cjs/client/index.js');
const { StdioClientTransport } = require('../../mcp-hub/node_modules/@modelcontextprotocol/sdk/dist/cjs/client/stdio.js');

const root = path.resolve(__dirname, '../..');
const packageRoot = path.resolve(path.dirname(process.execPath), '../../chrome-devtools-mcp');
const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const client = new Client({ name: 'conn2flow-batch-065-probe', version: '1.0.0' }, { capabilities: {} });
const transport = new StdioClientTransport({ command: process.execPath,
  args: [path.join(packageRoot, metadata.bin['chrome-devtools-mcp']),
    '--allow-unrestricted-paths', '--browser-url=http://127.0.0.1:9222', '--no-usage-statistics', '--no-performance-crux'],
  env: { ...process.env, CI: '1' }, stderr: 'pipe', cwd: root });
const fixture = http.createServer((request, response) => {
  if (request.url === '/_ajax/probe') {
    response.writeHead(request.headers['x-csrf-token'] === 'fixture-token' ? 200 : 403,
      { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'Ok', fixture: true }));
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(`<!doctype html><html><head><title>BATCH-065 local probe</title></head>
    <body><button id="open">Open modal</button><dialog id="modal"><p>Sandbox modal</p></dialog>
    <script>document.getElementById('open').onclick = async () => {
      document.getElementById('modal').showModal();
      await fetch('/_ajax/probe', {method: 'POST', headers: {'X-CSRF-Token': 'fixture-token'}, body: 'ajax=sim'});
      console.error('BATCH-065 fixture console trace');
    };</script></body></html>`);
});
const observations = [];
let pageId;
let schemas;
async function call(name, args = {}) {
  const schema = schemas.get(name);
  assert.ok(schema, `Missing required tool: ${name}`);
  if (schema.properties?.pageId && pageId !== undefined) args.pageId = pageId;
  const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 20000 });
  assert.ok(!result.isError, `${name}: ${JSON.stringify(result.content)}`);
  const text = (result.content || []).filter(item => item.type === 'text').map(item => item.text).join('\n');
  observations.push({ tool: name, passed: true });
  return { result, text };
}

(async () => {
  await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
  try {
    await client.connect(transport);
    const tools = await client.listTools();
    schemas = new Map(tools.tools.map(tool => [tool.name, tool.inputSchema]));
    for (const name of ['navigate_page', 'take_snapshot', 'take_screenshot', 'evaluate_script',
      'list_console_messages', 'get_console_message', 'list_network_requests', 'get_network_request']) {
      assert.ok(schemas.has(name), `Tool not exposed: ${name}`);
    }
    const pages = await call('list_pages');
    // The server uses numeric IDs in its human-readable page list.
    const pageMatch = pages.text.match(/(?:^|\n)(\d+):/);
    assert.ok(pageMatch, `Cannot identify sandbox page: ${pages.text}`);
    pageId = Number(pageMatch[1]);
    if (schemas.has('select_page')) await call('select_page', { pageId });
    const url = `http://127.0.0.1:${fixture.address().port}/`;
    await call('navigate_page', { type: 'url', url });
    const snapshot = await call('take_snapshot');
    assert.match(snapshot.text, /Open modal/);
    const uidMatch = snapshot.text.match(/uid=([^\s]+).*button "Open modal"/);
    assert.ok(uidMatch, 'Button UID not found');
    await call('click', { uid: uidMatch[1] });
    const modalSnapshot = await call('take_snapshot');
    assert.match(modalSnapshot.text, /Sandbox modal/);
    const measurement = await call('evaluate_script', { function: `() => {
      const modal = document.querySelector('#modal'); const rect = modal.getBoundingClientRect();
      return { open: modal.open, width: rect.width, height: rect.height, display: getComputedStyle(modal).display };
    }` });
    assert.match(measurement.text, /"open"\s*:\s*true/);
    const screenshotPath = path.join(root, 'completions/BATCH-065-sandbox-smoke.png');
    await call('take_screenshot', { filePath: screenshotPath });
    assert.ok(fs.statSync(screenshotPath).size > 0);
    const consoleList = await call('list_console_messages', { types: ['error'] });
    assert.match(consoleList.text, /BATCH-065 fixture console trace/);
    const msgid = consoleList.text.match(/msgid=(\d+)/);
    assert.ok(msgid, 'Console ID not found');
    const consoleDetail = await call('get_console_message', { msgid: Number(msgid[1]) });
    const network = await call('list_network_requests', { resourceTypes: ['fetch', 'xhr'] });
    const reqMatch = network.text.match(/reqid=(\d+)[^\n]*\/_ajax\/probe/);
    assert.ok(reqMatch, `Probe request not found: ${network.text}`);
    const requestDetail = await call('get_network_request', { reqid: Number(reqMatch[1]) });
    assert.match(requestDetail.text, /200/);
    assert.match(requestDetail.text, /csrf-token/i);
    assert.match(requestDetail.text, /"status"\s*:\s*"Ok"/);
    const report = { batch: 'BATCH-065', status: 'PASS', timestamp: new Date().toISOString(),
      node: process.version, mcpVersion: metadata.version, toolCount: tools.tools.length, fixtureUrl: url,
      observations, consoleStackTraceObserved: /stack|:\d+:\d+/i.test(consoleDetail.text),
      ajaxStatus: 200, csrfHeaderObserved: true, modalOpened: true, domMeasured: true,
      screenshot: 'completions/BATCH-065-sandbox-smoke.png', scope: 'Local synthetic fixture; no Gestor module homologation' };
    fs.writeFileSync(path.join(root, 'completions/BATCH-065-mcp-smoke.json'), `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report));
  } finally {
    await client.close();
    fixture.closeAllConnections();
    await new Promise(resolve => fixture.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
