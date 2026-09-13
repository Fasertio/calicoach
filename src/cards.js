/**
 * The athlete's exercise cards, wherever they already exist.
 *
 * A card is the most expensive thing the framework writes: a block ships
 * sixteen of them, and a second block for the same athlete regenerates cards
 * that were already written, in the same words, for the same exercises. Output
 * prices at several times input, so that regeneration is the single largest
 * avoidable cost in the framework — larger than everything the reading side
 * can save put together.
 *
 * This module answers one question cheaply: which cards does this athlete
 * already have, and where? A block can then link to them and write only what
 * is genuinely new.
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveWorkspace } from './paths.js';
import { eol, plain } from './check.js';
import { c } from './ui.js';

/** Markdown files that may hold cards, newest last. */
function sources(ws) {
  const out = [];
  for (const dir of [ws.cards, ws.programs]) {
    if (!fs.existsSync(dir)) continue;
    out.push(
      ...fs
        .readdirSync(dir)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'))
        .sort()
        .map((f) => path.join(dir, f))
    );
  }
  return out;
}

/** Every card in one document: the `##` headings under a `# Exercise cards`. */
function cardsIn(file) {
  const lines = eol(fs.readFileSync(file, 'utf8')).split('\n');
  const found = [];
  let inCards = false;
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const h1 = /^#\s+(.+)$/.exec(lines[i]);
    if (h1) {
      inCards = /exercise cards/i.test(plain(h1[1]));
      current = null;
      continue;
    }
    if (!inCards) continue;

    const h2 = /^##\s+(.+)$/.exec(lines[i]);
    if (h2) {
      current = { name: plain(h2[1]), file, line: i + 1, pattern: null };
      found.push(current);
      continue;
    }
    if (current && !current.pattern) {
      const row = /^\|\s*\*{0,2}Pattern\*{0,2}\s*\|\s*(.+?)\s*\|/i.exec(lines[i]);
      if (row) current.pattern = plain(row[1]).toLowerCase();
    }
  }
  return found;
}

/**
 * What the athlete already has. `duplicates` matters: the same card defined in
 * two places is how a library silently drifts from the block that uses it.
 */
export function cardIndex({ dir } = {}) {
  const ws = resolveWorkspace(dir);
  const cards = [];
  for (const file of sources(ws)) cards.push(...cardsIn(file));

  const byName = new Map();
  for (const card of cards) {
    const key = card.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(card);
  }

  const duplicates = [...byName.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([, list]) => ({ name: list[0].name, files: list.map((x) => x.file) }));

  return {
    root: ws.root,
    cards: cards.sort((a, b) => a.name.localeCompare(b.name)),
    duplicates,
    has: (name) => byName.has(String(name).toLowerCase()),
    find: (name) => byName.get(String(name).toLowerCase())?.[0] ?? null,
  };
}

/** Relative to the workspace, so the table stays readable. */
const where = (root, file) => path.relative(path.dirname(root), file).replace(/\\/g, '/');

export function formatIndex(index) {
  if (index.cards.length === 0) {
    return `${c.gray('no exercise cards yet — the first block writes them')}`;
  }

  const width = Math.max(...index.cards.map((card) => card.name.length));
  const lines = index.cards.map(
    (card) =>
      `  ${card.name.padEnd(width)}  ${c.gray((card.pattern ?? '—').padEnd(18))}${c.gray(
        where(index.root, card.file)
      )}`
  );

  if (index.duplicates.length) {
    lines.push('');
    for (const d of index.duplicates) {
      lines.push(
        `  ${c.yellow('duplicate')} ${d.name} — defined in ${d.files
          .map((f) => where(index.root, f))
          .join(' and ')}`
      );
    }
  }
  return lines.join('\n');
}
