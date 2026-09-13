import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkGuardrails, WEEKLY_CAP } from '../src/guardrails.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const examplePath = path.join(
  here,
  '..',
  'skills',
  'program-design',
  'references',
  'example-block.md'
);

const budget = (rows) => `
# Block 1 — Test

> Track: skill · Archetype: skill

## Weekly volume budget
| Pattern | Week 1 | Week 5 | Landmark |
|---|---|---|---|
${rows}
`;

test('the cap is the number the doctrine already states', () => {
  assert.equal(WEEKLY_CAP, 0.1, 'tendon-loading.md: weekly straight-arm TUT increase <= 10%');
});

test('straight-arm volume climbing faster than the cap is an error', () => {
  // 6 -> 12 over four weeks is ~18.9% a week.
  const findings = checkGuardrails(budget('| Straight-arm pull | 6 | 12 | own clock |'));
  assert.ok(
    findings.some((f) => f.level === 'error' && /straight-arm pull/i.test(f.message)),
    'connective tissue does not care that the athlete felt fine'
  );
  assert.match(findings[0].message, /18\.\d%|19%/, 'the finding must name the actual rate');
});

test('skill TUT climbing faster than the cap is an error', () => {
  const findings = checkGuardrails(budget('| Front lever skill TUT (s) | 120 | 240 | 120-240 |'));
  assert.ok(findings.some((f) => f.level === 'error' && /skill tut/i.test(f.message)));
});

test('a climb inside the cap passes', () => {
  const findings = checkGuardrails(budget('| Straight-arm pull | 6 | 8 | own clock |'));
  assert.deepEqual(findings, []);
});

test('patterns that are not straight-arm or skill are not held to this cap', () => {
  // Bent-arm work adapts on the muscle clock; 6 -> 12 is aggressive but legal.
  const findings = checkGuardrails(budget('| Vertical pull (bent-arm) | 6 | 12 | 8-14 |'));
  assert.deepEqual(findings, []);
});

test('a budget with a single week column cannot be judged, and says nothing', () => {
  const findings = checkGuardrails(`
## Weekly volume budget
| Pattern | Hard sets/week |
|---|---|
| Straight-arm pull | 6 |
`);
  assert.deepEqual(findings, [], 'no second week means no growth rate — silence, not a guess');
});

// --- leverage ---------------------------------------------------------------

const plan = (row) => `
> Track: skill

# Progression plan
| Exercise | Wk 1 | Wk 2 | Wk 3 | Wk 4 | Wk 5 | Deload | Progress when | Regress when |
|---|---|---|---|---|---|---|---|---|
${row}
`;

test('a leverage step every week is an error', () => {
  const findings = checkGuardrails(
    plan(
      '| Front lever iso | 5 x 10" `loop XL` | 5 x 10" `loop L` | 5 x 10" `loop M` | 5 x 10" `loop S` | 5 x 10" `loop XS` | 3 x 8" `loop S` | x | y |'
    )
  );
  assert.ok(
    findings.some((f) => /leverage/i.test(f.message)),
    'one step per 2-3 weeks maximum — skill-progressions says so, and now it is checked'
  );
});

test('a leverage step every three weeks passes', () => {
  const findings = checkGuardrails(
    plan(
      '| Front lever iso | 5 x 10" `loop M` | 5 x 10" `loop M` | 5 x 10" `loop M` | 5 x 12" `loop L` | 5 x 12" `loop L` | 3 x 8" `loop L` | x | y |'
    )
  );
  assert.deepEqual(findings.filter((f) => /leverage/i.test(f.message)), []);
});

test('load changes on a rep-based lift are not leverage changes', () => {
  const findings = checkGuardrails(
    plan('| Weighted pull-up | 3 x 5 @ +10 kg | 3 x 5 @ +12.5 kg | 3 x 5 @ +15 kg | 4 x 5 @ +15 kg | 4 x 5 @ +17.5 kg | 2 x 5 | x | y |')
  );
  assert.deepEqual(
    findings.filter((f) => /leverage/i.test(f.message)),
    [],
    'adding weight to a pull-up is not moving along a leverage ladder'
  );
});

// --- the example has to survive its own rule --------------------------------

test('the worked example passes both guardrails', () => {
  const findings = checkGuardrails(fs.readFileSync(examplePath, 'utf8'));
  assert.deepEqual(
    findings.map((f) => f.message),
    [],
    'a guardrail the gold-standard example fails is a guardrail with the wrong number'
  );
});

test('the cap binds wherever straight-arm volume exists, not only on a skill block', () => {
  const strength = budget('| Straight-arm pull | 6 | 12 | own clock |').replace(
    'Track: skill',
    'Track: strength'
  );
  assert.ok(
    checkGuardrails(strength).some((f) => f.level === 'error'),
    'tendon-loading states this cap unconditionally — a tendon does not read the track'
  );
});
