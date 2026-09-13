import { test } from 'node:test';
import assert from 'node:assert/strict';

import { screenTests, testsGating, gatingGaps } from '../src/screen-tests.js';
import { PATTERNS } from '../src/check.js';

test('every test in the battery declares a tier and what it gates', () => {
  const tests = screenTests();
  assert.ok(tests.length >= 18, `expected the whole battery, found ${tests.length}`);
  for (const t of tests) {
    assert.ok(['core', 'conditional'].includes(t.tier), `${t.id}: tier is "${t.tier}"`);
    assert.ok(t.title, `${t.id}: no title`);
  }
});

test('every gated pattern is one the checker already knows', () => {
  for (const t of screenTests()) {
    for (const p of t.gates) {
      assert.ok(PATTERNS.includes(p), `${t.id} gates "${p}", which is not a movement pattern`);
    }
  }
});

test('the core is small, and every pattern is gated by at least one test', () => {
  const tests = screenTests();
  const core = tests.filter((t) => t.tier === 'core');

  assert.ok(core.length <= 8, `the core is ${core.length} tests — that is not a short screen`);
  const gated = new Set(tests.flatMap((t) => t.gates));
  for (const p of PATTERNS) {
    assert.ok(gated.has(p), `no screening test gates "${p}"`);
  }
});

test('testsGating finds the tests a pattern depends on', () => {
  const g = testsGating('straight-arm pull').map((t) => t.id);
  assert.ok(g.includes('B2'), 'straight-arm load tolerance gates straight-arm pull');
  assert.ok(g.includes('A4'));
  assert.ok(!g.includes('C1'), 'a squat test has nothing to do with straight-arm pulling');
});

// --- the gap rule ----------------------------------------------------------

const BUDGET = (pattern, sets) => `
## Weekly volume budget
| Pattern | Hard sets/week |
|---|---|
| ${pattern} | ${sets} |
`;

const RESULTS = (rows) => `
## Screen results
| # | Item | L | R | Result | Notes |
|---|---|---|---|---|---|
${rows}
`;

test('a programmed pattern whose gating test never ran is a gap', () => {
  const gaps = gatingGaps({
    programMd: BUDGET('straight-arm pull', 6),
    screeningMd: RESULTS('| A4 | Scapular pull-up | | | Pass | |'),
  });

  assert.ok(gaps.some((g) => g.test === 'B2'), 'B2 was never run but the block loads straight arms');
  assert.ok(gaps.every((g) => g.pattern === 'straight-arm pull'));
});

test('a clean core pass closes the pattern — the conditional tests stay unrun', () => {
  const gaps = gatingGaps({
    programMd: BUDGET('knee-dominant', 9),
    screeningMd: RESULTS('| C1 | Deep squat | | | Pass | |'),
  });

  assert.deepEqual(gaps, [], 'a clean squat screen does not owe an ankle and a step-down test');
});

test('a core test that is not a clean pass pulls in the conditional tests', () => {
  const gaps = gatingGaps({
    programMd: BUDGET('knee-dominant', 9),
    screeningMd: RESULTS('| C1 | Deep squat | | | Limited | heels lift |'),
  });

  assert.deepEqual(gaps.map((g) => g.test).sort(), ['C2', 'C3']);
  assert.ok(gaps.every((g) => g.escalated), 'these are owed because of a finding, not by default');
});

test('a conditional test is never owed on its own', () => {
  const gaps = gatingGaps({
    programMd: BUDGET('vertical pull', 9),
    screeningMd: RESULTS('| A4 | Scapular pull-up | | | Pass | |'),
  });

  assert.deepEqual(gaps, [], 'B4 grip is conditional and nothing asked for it');
});

test('a blank or skipped result does not count as run', () => {
  for (const cell of ['', ' ', 'skipped', 'not tested', 'Pass/Limited/Symptomatic']) {
    const gaps = gatingGaps({
      programMd: BUDGET('knee-dominant', 9),
      screeningMd: RESULTS(`| C1 | Deep squat | | |${cell}| |`),
    });
    assert.ok(gaps.length > 0, `"${cell}" must not count as a result`);
  }
});

test('a pattern with no volume needs no screening test', () => {
  const gaps = gatingGaps({
    programMd: BUDGET('knee-dominant', 0),
    screeningMd: RESULTS('| A4 | Scapular pull-up | | | Pass | |'),
  });

  assert.deepEqual(gaps, [], 'a block with no leg work owes nothing to the squat screen');
});

test('no screening document at all is a gap for every programmed pattern', () => {
  const gaps = gatingGaps({ programMd: BUDGET('hip hinge', 6), screeningMd: '' });
  assert.ok(gaps.length > 0);
  assert.ok(gaps.every((g) => g.pattern === 'hip hinge'));
});
