#!/usr/bin/env node
/**
 * What the framework costs to load.
 *
 * Skills are paid for in context, every turn they are used. This prints the
 * per-skill footprint and models the heaviest turn (designing a block), so the
 * cost of adding a reference is visible before it is added rather than after.
 *
 * Tokens are estimated at 4 characters each — close enough for English
 * markdown, and the ratios are what matter here, not the absolute figures.
 *
 *   node scripts/context-budget.js          table
 *   node scripts/context-budget.js --json   machine-readable
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHARS_PER_TOKEN = 4;

const tokens = (file) =>
  Math.round(fs.readFileSync(file, 'utf8').length / CHARS_PER_TOKEN);

const listMd = (dir) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f)) : [];

function measure() {
  const skillsDir = path.join(root, 'skills');
  const skills = fs
    .readdirSync(skillsDir)
    .filter((d) => fs.existsSync(path.join(skillsDir, d, 'SKILL.md')))
    .map((id) => {
      const dir = path.join(skillsDir, id);
      const entry = tokens(path.join(dir, 'SKILL.md'));
      const refs = listMd(path.join(dir, 'references')).map((f) => ({
        name: path.basename(f),
        tokens: tokens(f),
      }));
      const description =
        /^description:\s*(.+)$/m.exec(fs.readFileSync(path.join(dir, 'SKILL.md'), 'utf8'))?.[1] ?? '';
      return {
        id,
        entry,
        refs: refs.sort((a, b) => b.tokens - a.tokens),
        refTotal: refs.reduce((n, r) => n + r.tokens, 0),
        description: Math.round(description.length / CHARS_PER_TOKEN),
      };
    })
    .sort((a, b) => b.entry + b.refTotal - (a.entry + a.refTotal));

  const byId = Object.fromEntries(skills.map((s) => [s.id, s]));
  const ref = (id, name) => byId[id]?.refs.find((r) => r.name === name)?.tokens ?? 0;

  // The heaviest turn: reading everything program-design asks for, then
  // writing a block the size of the worked example.
  const designTurn = {
    'skill descriptions (always resident)': skills.reduce((n, s) => n + s.description, 0),
    'calisthenics-coach SKILL.md': byId['calisthenics-coach']?.entry ?? 0,
    'coaching-principles.md': ref('calisthenics-coach', 'coaching-principles.md'),
    'program-design SKILL.md': byId['program-design']?.entry ?? 0,
    'example-block.md': ref('program-design', 'example-block.md'),
    'other program-design references':
      (byId['program-design']?.refTotal ?? 0) - ref('program-design', 'example-block.md'),
    'exercise-library (SKILL + references)':
      (byId['exercise-library']?.entry ?? 0) + (byId['exercise-library']?.refTotal ?? 0),
    'athlete files read from disk (estimate)': 3000,
  };

  return {
    skills,
    totals: {
      entries: skills.reduce((n, s) => n + s.entry, 0),
      refs: skills.reduce((n, s) => n + s.refTotal, 0),
      descriptions: skills.reduce((n, s) => n + s.description, 0),
    },
    designTurn,
    designTurnInput: Object.values(designTurn).reduce((a, b) => a + b, 0),
    designTurnOutput: ref('program-design', 'example-block.md'),
  };
}

const n = (v) => v.toLocaleString('en-US');

function print(m) {
  console.log(`\ncalicoach context budget  ${'~'.padEnd(2)}tokens, at ${CHARS_PER_TOKEN} chars/token\n`);
  console.log(`${'skill'.padEnd(26)}${'SKILL.md'.padStart(10)}${'refs'.padStart(9)}${'total'.padStart(9)}`);
  console.log('-'.repeat(54));
  for (const s of m.skills) {
    console.log(
      s.id.padEnd(26) + n(s.entry).padStart(10) + n(s.refTotal).padStart(9) + n(s.entry + s.refTotal).padStart(9)
    );
  }
  console.log('-'.repeat(54));
  console.log(
    'TOTAL'.padEnd(26) +
      n(m.totals.entries).padStart(10) +
      n(m.totals.refs).padStart(9) +
      n(m.totals.entries + m.totals.refs).padStart(9)
  );

  console.log(`\nAlways resident (14 skill descriptions): ${n(m.totals.descriptions)}\n`);
  console.log('Heaviest turn — designing a block:\n');
  for (const [label, value] of Object.entries(m.designTurn)) {
    console.log(`  ${n(value).padStart(8)}  ${label}`);
  }
  console.log(`  ${'-'.repeat(8)}`);
  console.log(`  ${n(m.designTurnInput).padStart(8)}  input`);
  console.log(`  ${n(m.designTurnOutput).padStart(8)}  output (a block the size of the worked example)\n`);
}

const m = measure();
if (process.argv.includes('--json')) console.log(JSON.stringify(m, null, 2));
else print(m);
