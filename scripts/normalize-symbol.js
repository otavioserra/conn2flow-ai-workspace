const fs = require('fs');

const content = fs.readFileSync('C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow/gestor/assets/images/Logomarca.svg', 'utf8');

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

// Exact bounds of Conn2Flow symbol:
// X: ~40 to ~292 (width = 252)
// Y: ~38 to ~310 (height = 272)
// Center: (166, 174)
// We can use SVG transform or translate to 24x24:
// scale = 20 / 272 = 0.0735
// translateX = 12 - 166 * scale = 12 - 12.2 = -0.2 -> center around 12
// translateY = 12 - 174 * scale = 12 - 12.79 = -0.79 -> center around 12

// Even cleaner:
// In SVG:
// <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
//   <g transform="translate(12, 12) scale(0.075) translate(-165, -174)">
//     <path d="..." />
//     ...
//   </g>
// </svg>

const scale = 0.072;
const cx = 165;
const cy = 174;

const svg24 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#FFFFFF">
  <g transform="translate(12, 12) scale(${scale}) translate(-${cx}, -${cy})">
    <path d="${pathDefs['path13']}" />
    <path d="${pathDefs['path3']}" />
    <path d="${pathDefs['path2']}" />
    <path d="${pathDefs['path1']}" />
  </g>
</svg>`;

fs.writeFileSync('vscode-extension/resources/icon.svg', svg24.trim());
console.log('Successfully written official Conn2Flow symbol to vscode-extension/resources/icon.svg');
