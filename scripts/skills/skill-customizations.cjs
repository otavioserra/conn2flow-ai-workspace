// Preserve exact local/seed SHA-256 acknowledgements across governance renames.
const fs = require('node:fs');
const path = require('node:path');

function loadManifests(targets, validate) {
  const states = new Map();
  for (const target of targets) {
    const root = path.dirname(path.dirname(target.skills));
    if (states.has(root)) continue;
    const file = path.join(root, 'memory/sync-customizations.json');
    validate(target.skills, file);
    const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Manifesto inválido: ${file}`);
    states.set(root, { file, data, original: JSON.stringify(data), migrations: [] });
  }
  return states;
}

function planRenames(states, aliases, selected) {
  for (const [root, state] of states) {
    const renamed = { ...state.data };
    for (const [key, entry] of Object.entries(state.data)) {
      const parts = key.split('/');
      if (parts.length !== 4 || !['.gemini', '.claude', '.cursor', '.codex', '.github'].includes(parts[0]) ||
          parts[1] !== 'skills' || parts[3] !== 'SKILL.md' || !selected.includes(aliases[parts[2]])) continue;
      const destination = [parts[0], 'skills', aliases[parts[2]], 'SKILL.md'].join('/');
      if (Object.hasOwn(renamed, destination) && JSON.stringify(renamed[destination]) !== JSON.stringify(entry)) {
        throw new Error(`Customizações antiga e nova coexistem: ${root}/${key}`);
      }
      renamed[destination] = entry;  // Keep hashes unchanged; a changed seed reopens the conflict.
      delete renamed[key];
      state.migrations.push({ root, from: key, to: destination });
    }
    state.data = renamed;
  }
}

function saveManifests(states) {
  for (const state of states.values()) {
    if (JSON.stringify(state.data) === state.original) continue;
    const temporary = `${state.file}.mdd-${process.pid}-${Date.now()}`;
    try {
      fs.writeFileSync(temporary, JSON.stringify(state.data, null, 2) + '\n', { flag: 'wx' });
      fs.renameSync(temporary, state.file);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }
}

function intentional(states, destination, local, seed, hash) {
  if (!local) return false;
  const root = path.dirname(path.dirname(path.dirname(path.dirname(destination))));
  const entry = states.get(root)?.data[path.relative(root, destination).replace(/\\/g, '/')];
  return entry && entry.local_sha256 === hash(local) && entry.seed_sha256 === hash(seed);
}

module.exports = { loadManifests, planRenames, saveManifests, intentional };
