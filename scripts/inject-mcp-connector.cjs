const fs = require('fs');
const path = require('path');

const targetName = process.argv[2];
const filePath = process.argv[3];
const entryPoint = process.argv[4];

if (!filePath || !entryPoint) {
  console.error('Usage: node inject-mcp-connector.cjs <targetName> <filePath> <entryPoint>');
  process.exit(1);
}

try {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let data = {};
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (raw) data = JSON.parse(raw);
    } catch (e) {
      data = {};
    }
  }

  if (!data.mcpServers || typeof data.mcpServers !== 'object') {
    data.mcpServers = {};
  }

  data.mcpServers['conn2flow-hub'] = {
    command: 'node',
    args: [entryPoint]
  };

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`  ✔ [${targetName}] Injected into: ${filePath}`);
} catch (err) {
  console.error(`  ✖ [${targetName}] Failed: ${err.message}`);
  process.exit(1);
}
