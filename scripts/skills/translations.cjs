// Translation registration protects content; source hashes only detect changes since review.
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const identifier = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);

function load(file) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid translation registry');
  for (const [language, skills] of Object.entries(data)) {
    if (!identifier(language) || !skills || typeof skills !== 'object' || Array.isArray(skills)) {
      throw new Error(`Invalid translation registry for ${language}; migrate lists to source_sha256 entries`);
    }
    for (const [name, entry] of Object.entries(skills)) {
      if (!identifier(name) || !entry || !/^[a-f0-9]{64}$/.test(entry.source_sha256 || '') ||
          typeof entry.translated_at !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.translated_at) ||
          typeof entry.translator !== 'string' || !entry.translator.trim()) {
        throw new Error(`Invalid translation hash metadata: ${language}/${name}`);
      }
    }
  }
  return data;
}

function registered(data, language, name) {
  return Object.hasOwn(data, language) && Object.hasOwn(data[language], name);
}

function audit(data, canonical) {
  const drift = [];
  for (const [language, skills] of Object.entries(data)) for (const [skill, entry] of Object.entries(skills)) {
    const source = canonical.get(skill);
    const current = source ? digest(source) : null;
    if (current !== entry.source_sha256) drift.push({ language, skill, source_sha256: entry.source_sha256,
      current_source_sha256: current, reason: source ? 'source_changed' : 'source_missing' });
  }
  return drift;
}

function message(item) {
  return `[DRIFT-WARNING] Skill '${item.skill}' em '${item.language}' está desatualizada em relação à matriz PT-BR (${item.reason}).`;
}

function update(file, data, canonical, skill, language, translator = 'mdd-agent') {
  if (!identifier(skill) || !identifier(language) || !canonical.has(skill) || !registered(data, language, skill)) {
    throw new Error('Hash update requires an existing canonical skill and registered translation');
  }
  if (typeof translator !== 'string' || !translator.trim()) throw new Error('Translator is required');
  const updated = structuredClone(data);
  updated[language][skill] = { ...updated[language][skill], source_sha256: digest(canonical.get(skill)),
    translated_at: new Date().toISOString().slice(0, 10), translator };
  const temporary = path.join(path.dirname(file), `.translated-${process.pid}-${Date.now()}.tmp`);
  try {
    fs.writeFileSync(temporary, JSON.stringify(updated, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporary, file);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  return updated[language][skill];
}

module.exports = { load, registered, audit, message, update };
