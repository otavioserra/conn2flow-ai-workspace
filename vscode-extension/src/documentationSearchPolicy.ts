import * as fs from 'fs';
import * as path from 'path';

export interface DocumentationRoot {
  rootPath: string;
  label: string;
}

export interface DocumentationEntry {
  label: string;
  description: string;
  detail: string;
  path: string;
}

export function collectMarkdownDocuments(roots: DocumentationRoot[]): DocumentationEntry[] {
  const entries: DocumentationEntry[] = [];
  const seen = new Set<string>();

  for (const root of roots) {
    if (!fs.existsSync(root.rootPath) || !fs.statSync(root.rootPath).isDirectory()) continue;
    walkMarkdown(root.rootPath, filePath => {
      const normalized = path.resolve(filePath).toLocaleLowerCase('en-US');
      if (seen.has(normalized)) return;
      seen.add(normalized);

      const relative = path.relative(root.rootPath, filePath).replace(/\\/g, '/');
      entries.push({
        label: titleFromMarkdown(filePath),
        description: `${root.label} · ${relative}`,
        detail: filePath,
        path: filePath
      });
    });
  }

  return entries.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}

function walkMarkdown(directory: string, accept: (filePath: string) => void): void {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    if (item.name === '.git' || item.name === 'node_modules') continue;
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      walkMarkdown(fullPath, accept);
    } else if (item.isFile() && item.name.toLocaleLowerCase('en-US').endsWith('.md')) {
      accept(fullPath);
    }
  }
}

function titleFromMarkdown(filePath: string): string {
  try {
    const firstHeading = fs.readFileSync(filePath, 'utf8').match(/^#\s+(.+)$/m)?.[1]?.trim();
    if (firstHeading) return firstHeading;
  } catch {
    // O nome do arquivo continua disponível como fallback determinístico.
  }
  return path.basename(filePath, path.extname(filePath)).replace(/[-_]+/g, ' ');
}
