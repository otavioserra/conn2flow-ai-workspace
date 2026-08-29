const fs = require('fs');

const svgFile = 'C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow/gestor/assets/images/Logomarca.svg';
const content = fs.readFileSync(svgFile, 'utf8');

// Extract layer1
const layerMatch = content.match(/<g[^>]*id="layer1"[^>]*>([\s\S]*?)<\/g>/);
if (!layerMatch) {
  console.error('layer1 not found');
  process.exit(1);
}

let layerContent = layerMatch[1];

// Clean out filters and inline styles
layerContent = layerContent
  .replace(/style="[^"]*"/g, 'fill="currentColor"')
  .replace(/\s+/g, ' ');

// Match paths
const pathMatches = layerContent.match(/<path[^>]+>/g) || [];

// Clean each path
const cleanPaths = pathMatches.map(p => {
  const d = p.match(/d="([^"]+)"/)?.[1] || '';
  const id = p.match(/id="([^"]+)"/)?.[1] || '';
  return `    <path id="${id}" fill="currentColor" d="${d}" />`;
}).join('\n');

// We want a square viewBox centered on the logo
// Min X is around 40, Max X is around 325 -> width ~ 285, center ~ 182
// Min Y is around 25, Max Y is around 310 -> height ~ 285, center ~ 167
// Let's use a 300x300 viewBox: minX = 35, minY = 20, width = 295, height = 295
const finalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="35 20 295 295" width="24" height="24">
  <g fill="currentColor">
${cleanPaths}
  </g>
</svg>
`;

fs.writeFileSync('C:/Users/otavi/OneDrive/Documentos/GIT/conn2flow-ai-workspace/vscode-extension/resources/icon.svg', finalSvg);
console.log('Successfully generated clean vector icon in vscode-extension/resources/icon.svg');
