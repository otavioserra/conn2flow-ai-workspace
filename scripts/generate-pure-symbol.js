const fs = require('fs');

const content = fs.readFileSync('C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow/gestor/assets/images/Logomarca.svg', 'utf8');

// Extract d for path13, path3, path2, path1
const ids = ['path13', 'path3', 'path2', 'path1'];
const pathDefs = {};

for (const id of ids) {
  const reg = new RegExp('<path[^>]*d="([^"]+)"[^>]*id="' + id + '"', 'i');
  const m = content.match(reg);
  if (m) {
    pathDefs[id] = m[1];
  } else {
    const reg2 = new RegExp('<path[^>]*id="' + id + '"[^>]*d="([^"]+)"', 'i');
    const m2 = content.match(reg2);
    if (m2) pathDefs[id] = m2[1];
  }
}

console.log('Path count:', Object.keys(pathDefs).length);

// Let's create an SVG file containing just these 4 paths
const svgSnippet = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="35 30 260 285" width="24" height="24">
  <g fill="currentColor">
    <path d="${pathDefs['path13']}" />
    <path d="${pathDefs['path3']}" />
    <path d="${pathDefs['path2']}" />
    <path d="${pathDefs['path1']}" />
  </g>
</svg>
`;

fs.writeFileSync('scripts/pure-symbol.svg', svgSnippet.trim());
console.log('Saved scripts/pure-symbol.svg');
