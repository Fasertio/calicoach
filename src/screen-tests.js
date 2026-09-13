/**
 * Which screening tests a block's patterns depend on.
 *
 * The movement screen is nineteen tests, and an athlete answers all of them
 * before a first program whether or not the block will load the joints being
 * tested. Tiering it makes the screen shorter — and, on its own, would make it
 * weaker: a test that is merely optional is a test that gets skipped and then
 * quietly assumed to have passed.
 *
 * So each test in `screen-battery.md` declares the movement patterns it gates,
 * and this module reads those declarations rather than restating them. A block
 * that programs a pattern whose gating test was never run is then a detectable
 * gap, not a matter of anyone remembering. The screen gets shorter to answer
 * and stronger in what it guarantees.
 */

import fs from 'node:fs';
import path from 'node:path';

import { skillsSource } from './paths.js';
import { PATTERNS, parseTables, col, plain, section } from './check.js';

const BATTERY = path.join(skillsSource, 'movement-screening', 'references', 'screen-battery.md');

/** Cells that look like a result but are not one. */
const NOT_A_RESULT =
  /^(|-+|n\/?a|tbd|skipped|not tested|not run|pass\/limited\/symptomatic|<[^>]*>)$/i;

let cache = null;

/** The battery, as declared by the battery itself. */
export function screenTests(file = BATTERY) {
  if (cache && cache.file === file) return cache.tests;
  if (!fs.existsSync(file)) return [];

  const tests = [];
  let current = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const h = /^#{2,3}\s+([A-E]\d?)\.\s+(.+?)\s*$/.exec(line);
    if (h) {
      current = { id: h[1], title: h[2], tier: 'conditional', gates: [] };
      tests.push(current);
      continue;
    }
    if (!current) continue;

    const tier = /^-\s+\*\*Tier:\*\*\s*(\w+)/i.exec(line);
    if (tier) current.tier = tier[1].toLowerCase();

    const gates = /^-\s+\*\*Gates:\*\*\s*(.+)$/i.exec(line);
    if (gates) {
      current.gates = PATTERNS.filter((p) =>
        new RegExp(`\\b${p.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(gates[1])
      );
    }
  }

  cache = { file, tests };
  return tests;
}

/** The tests a pattern cannot be safely programmed without. */
export function testsGating(pattern, tests = screenTests()) {
  return tests.filter((t) => t.gates.includes(pattern));
}

/** A result that is anything other than a clean pass escalates. */
const CLEAN_PASS = /^(pass|ok|clear|normal)\b/i;

/**
 * Test ids the screening document records an actual result for, and which of
 * those came back as something other than a clean pass.
 */
function testsRun(screeningMd) {
  const run = new Set();
  const flagged = new Set();
  run.flagged = flagged;
  if (!screeningMd) return run;

  const results = section(String(screeningMd), /^#+\s*Screen results/im) || String(screeningMd);
  for (const t of parseTables(results)) {
    const iId = col(t.header, '#', 'id', 'item');
    const iResult = col(t.header, 'result', 'esito');
    if (iId === -1 || iResult === -1) continue;
    for (const r of t.rows) {
      const id = plain(r.cells[iId] ?? '').trim();
      const result = plain(r.cells[iResult] ?? '').trim();
      if (!/^[A-E]\d?$/.test(id) || NOT_A_RESULT.test(result)) continue;
      run.add(id);
      if (!CLEAN_PASS.test(result)) flagged.add(id);
    }
  }
  return run;
}

/** Patterns the block actually loads, from its weekly volume budget. */
function programmedPatterns(programMd) {
  const out = [];
  const budget = section(String(programMd), /^#+\s*Weekly volume budget/im);
  for (const t of parseTables(budget || String(programMd))) {
    const iPattern = col(t.header, 'pattern');
    if (iPattern === -1) continue;
    for (const r of t.rows) {
      const name = plain(r.cells[iPattern] ?? '').toLowerCase().trim();
      const match = PATTERNS.find((p) => name.includes(p));
      if (!match) continue;
      const sets = r.cells
        .slice(iPattern + 1)
        .map((c) => Number(plain(c ?? '').replace(/[^\d.]/g, '')))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (sets.length) out.push(match);
    }
  }
  return [...new Set(out)];
}

/**
 * Every pattern the block loads whose gating test has no recorded result.
 * Each gap names the pattern, the test, and why it matters — the caller
 * reports it; deciding what to do about it is the coach's job.
 */
export function gatingGaps({ programMd = '', screeningMd = '' } = {}) {
  const run = testsRun(screeningMd);
  const gaps = [];

  for (const pattern of programmedPatterns(programMd)) {
    const gating = testsGating(pattern);
    // A core test always has to have run. A conditional one only has to have
    // run once something asked for it — and the thing that asks for it is a
    // core test in the same territory coming back as anything but a clean
    // pass. That is what makes a short screen safe: the depth arrives exactly
    // where a finding says it is needed.
    const escalated = gating.some((t) => t.tier === 'core' && run.flagged.has(t.id));

    for (const t of gating) {
      if (run.has(t.id)) continue;
      if (t.tier !== 'core' && !escalated) continue;

      const why = t.tier === 'core'
        ? 'run it, or take the pattern out of the block'
        : 'a core test in the same area did not come back clean, so this one is owed';
      gaps.push({
        pattern,
        test: t.id,
        title: t.title,
        tier: t.tier,
        escalated: t.tier !== 'core',
        message: `"${pattern}" is programmed but screening test ${t.id} (${t.title}) has no result — ${why}`,
      });
    }
  }
  return gaps;
}
