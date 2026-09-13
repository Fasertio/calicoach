import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

import { skillGraph, TURNS, turnCost, budget } from '../src/budget.js';

test('the graph separates what a skill reads from where it can route', () => {
  const g = skillGraph();
  const pd = g.get('program-design');

  assert.ok(pd.entry > 1000, 'SKILL.md has a token cost');
  // Own references.
  assert.ok(pd.reads.some((r) => r.id.endsWith('program-design/references/example-block.md')));
  // A reference owned by another skill, linked directly — a real read.
  assert.ok(
    pd.reads.some((r) => r.id.endsWith('calisthenics-coach/references/coaching-principles.md')),
    'a cross-skill reference link is a read, not a route'
  );
  // A cross-skill SKILL.md link is a route: one of them is taken, not all.
  assert.ok(pd.routes.includes('exercise-library'));
  assert.ok(!pd.reads.some((r) => r.id.endsWith('exercise-library/SKILL.md')));
});

test('every link in the graph resolves to a file that exists', () => {
  for (const [id, s] of skillGraph()) {
    for (const r of s.reads) {
      assert.ok(r.tokens > 0, `${id}: ${r.id} resolved to nothing`);
    }
  }
});

test('a turn costs its routes cheaply and its reads in full', () => {
  const cost = turnCost({ route: ['calisthenics-coach'], read: ['program-design'] });

  const labels = cost.items.map((i) => i.label);
  assert.ok(labels.includes('skill descriptions (always resident)'));
  assert.ok(labels.some((l) => l.includes('calisthenics-coach SKILL.md')));
  assert.ok(labels.some((l) => l.includes('example-block.md')));
  // Routed-to skills contribute nothing beyond the routing skill's own entry.
  assert.ok(!labels.some((l) => l.includes('exercise-library')));
  assert.equal(
    cost.total,
    cost.items.reduce((n, i) => n + i.tokens, 0),
    'the total is the sum of what is listed — no unexplained tokens'
  );
});

test('nothing is counted twice when two skills read the same reference', () => {
  const cost = turnCost({ route: [], read: ['program-design', 'calisthenics-coach'] });
  const seen = cost.items.map((i) => i.label);
  assert.equal(new Set(seen).size, seen.length, 'a reference read by both is charged once');
});

test('the four named turns are reported', () => {
  const b = budget();
  assert.deepEqual(Object.keys(b.turns).sort(), ['design', 'log', 'review', 'revise', 'screen']);
  for (const t of Object.values(b.turns)) {
    assert.ok(t.total > 0);
    assert.ok(t.items.length > 0);
  }
});

test('writing and revising a block are the two heavy turns', () => {
  const { turns } = budget();
  const order = Object.entries(turns)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([n]) => n);

  assert.deepEqual(order.slice(0, 2).sort(), ['design', 'revise']);
});

test('revising costs more to read than designing, because the block is read back', () => {
  const { turns } = budget();

  assert.ok(
    turns.revise.total > turns.design.total,
    'a revision re-reads the whole block; designing writes one instead'
  );
  assert.ok(
    turns.design.output > turns.revise.output,
    'designing writes a whole block; revising writes part of one'
  );
});

test('every turn reports what it writes, not only what it reads', () => {
  for (const t of Object.values(budget().turns)) {
    assert.equal(typeof t.output, 'number');
  }
});

test('no turn has grown since the committed baseline', () => {
  // The calibration against the old hand-built model did its job once, when
  // this module replaced it. What matters from here is direction: a phase may
  // make a turn cheaper, and then refreshes the baseline. Nothing may make one
  // quietly more expensive.
  const baselinePath = path.join(here, '..', 'docs', 'budget-baseline.json');
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const { turns } = budget();

  for (const [name, t] of Object.entries(turns)) {
    const was = baseline.turns[name];
    if (!was) continue;
    assert.ok(
      t.total <= was.total,
      `the ${name} turn reads ${t.total}, up from ${was.total} in docs/budget-baseline.json — ` +
        'if the growth is intended, run npm run budget:baseline'
    );
  }
});

test('the workspace estimate is labelled as an estimate, and is small', () => {
  const { turns } = budget();
  const ws = turns.design.items.filter((i) => i.estimated);

  assert.ok(ws.length > 0, 'what is read from the athlete workspace must be shown');
  assert.ok(
    ws.every((i) => /estimate|preflight/i.test(i.label)),
    'an estimate must say so in its own label'
  );
});

test('TURNS declares routes and reads, never file lists', () => {
  for (const [name, t] of Object.entries(TURNS)) {
    for (const key of Object.keys(t)) {
      assert.ok(
        ['route', 'read', 'workspace', 'writes', 'patterns'].includes(key),
        `turn "${name}" declares "${key}" — a turn names skills, not files`
      );
    }
  }
});

// --- conditional, pattern-scoped reads -------------------------------------

test('a catalogue file is a conditional read, keyed by the patterns in its row', () => {
  const lib = skillGraph().get('exercise-library');

  const legs = lib.conditional.find((r) => r.id.endsWith('legs-exercises.md'));
  assert.ok(legs, 'legs-exercises.md must be conditional, not an unconditional read');
  assert.deepEqual(legs.patterns.sort(), ['hip hinge', 'knee-dominant']);

  assert.ok(
    !lib.reads.some((r) => r.id.endsWith('legs-exercises.md')),
    'a conditional read must not also be charged unconditionally'
  );
});

test('files that are not pattern-scoped stay unconditional', () => {
  const lib = skillGraph().get('exercise-library');
  assert.ok(lib.reads.some((r) => r.id.endsWith('bibliography.md')), 'every card cites');
  assert.ok(lib.reads.some((r) => r.id.endsWith('reference-sources.md')));
});

test('a block with no leg work does not read the leg catalogue', () => {
  const cost = turnCost({
    read: ['exercise-library'],
    patterns: ['vertical pull', 'horizontal pull', 'vertical push'],
  });
  const labels = cost.items.map((i) => i.label);

  assert.ok(!labels.some((l) => l.includes('legs-exercises')), 'no knee or hinge volume, no leg catalogue');
  assert.ok(labels.some((l) => l.includes('pull-exercises')));
  assert.ok(labels.some((l) => l.includes('push-exercises')));
});

test('a block that squats does read it', () => {
  const cost = turnCost({ read: ['exercise-library'], patterns: ['knee-dominant'] });
  assert.ok(cost.items.some((i) => i.label.includes('legs-exercises')));
});

test('naming no patterns loads every catalogue — the honest worst case', () => {
  const none = turnCost({ read: ['exercise-library'] });
  const some = turnCost({ read: ['exercise-library'], patterns: ['knee-dominant'] });
  assert.ok(none.total > some.total, 'an unknown block has to be charged for all of it');
});

test('the design turn resolves its patterns from the worked example', () => {
  const { turns } = budget();
  assert.ok(Array.isArray(turns.design.patterns) && turns.design.patterns.length > 0);
  assert.ok(turns.design.patterns.includes('vertical pull'));
});
