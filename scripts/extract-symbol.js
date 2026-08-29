const fs = require('fs');

const content = fs.readFileSync('C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow/gestor/assets/images/Logomarca.svg', 'utf8');

const pathRegex = /<path\s+[^>]*d="([^"]+)"[^>]*id="(path\d+)"/g;
let m;
const paths = [];
while ((m = pathRegex.exec(content)) !== null) {
  paths.push({ id: m[2], d: m[1] });
}

console.log('Found paths:', paths.map(p => p.id));
for (const p of paths) {
  console.log('--- ' + p.id + ' ---');
  console.log(p.d.slice(0, 100) + '...');
}
