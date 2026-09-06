import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  checkProgram,
  parseSets,
  parseWorkSeconds,
  holdSeconds,
  classifyPattern,
  isCheckableTrigger,
  parseTables,
} from '../src/check.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const cli = path.join(repoRoot, 'bin', 'calicoach.js');
const examplePath = path.join(
  repoRoot,
  'skills',
  'program-design',
  'references',
  'example-block.md'
);

const rules = (findings, level) =>
  findings.filter((f) => !level || f.level === level).map((f) => f.rule);

// --- parsing ---------------------------------------------------------------

test('parseSets reads every notation form', () => {
  assert.equal(parseSets('4'), 4);
  assert.equal(parseSets('`4 x 8`'), 4);
  assert.equal(parseSets('`3 e 4 x 5`', 1), 3, '"3 e 4" is 3 in week 1');
  assert.equal(parseSets('`3 e 4 x 5`', 4), 4, '"3 e 4" is 4 in week 4');
  assert.equal(parseSets('`2-`', 1), 2, '"2-" starts at 2');
  assert.equal(parseSets('`2-`', 3), 4, '"2-" climbs one set per week');
  assert.equal(parseSets('3\\4'), 3, 'an either/or set count takes the lower bound');
  assert.equal(parseSets('`5 x 8-12"`'), 5);
  assert.equal(parseSets('rt'), null, 'total-rep prescriptions have no set count');
  assert.equal(parseSets('ladder'), null);
  assert.equal(parseSets(''), null);
});

test('holdSeconds takes the top of a hold window', () => {
  assert.equal(holdSeconds('`5 x 8-12"`'), 12);
  assert.equal(holdSeconds('`2 x 30"`'), 30);
  assert.equal(holdSeconds('`4 x 8`'), 0, 'a rep prescription is not a hold');
});

test('parseWorkSeconds uses tempo for reps and the window for holds', () => {
  assert.equal(parseWorkSeconds('`5 x 8-12"`', ''), 12);
  // 5 reps at tempo 2-0-1-1 = 4 s per rep
  assert.equal(parseWorkSeconds('`3 e 4 x 5`', '`2-0-1-1`'), 20);
  // top of the rep range is used
  assert.equal(parseWorkSeconds('`4 x 8-10`', '`3-0-1-1`'), 50);
});

test('classifyPattern puts straight-arm work on its own clock', () => {
  assert.equal(classifyPattern('vertical pull'), 'vertical pull');
  assert.equal(
    classifyPattern('vertical pull — straight-arm'),
    'straight-arm pull',
    'straight-arm work must not land in the bent-arm budget'
  );
  assert.equal(classifyPattern('horizontal push'), 'horizontal push');
  assert.equal(classifyPattern('constraint work — isometric shoulder tolerance'), 'excluded');
  assert.equal(classifyPattern('something else entirely'), null);
});

test('isCheckableTrigger accepts numbers and named symptoms, rejects vibes', () => {
  assert.ok(isCheckableTrigger('all sets at 10 reps, RIR >= 2'));
  assert.ok(isCheckableTrigger('any front-shoulder pinch'));
  assert.ok(isCheckableTrigger('the low back arches'));
  assert.ok(!isCheckableTrigger('when it feels right'));
});

test('parseTables tags each table with its heading context', () => {
  const tables = parseTables(
    ['# Session A', '## Primary strength', '| Exercise | Sets |', '|---|---|', '| Pull-up | 3 |'].join('\n')
  );
  assert.equal(tables.length, 1);
  assert.equal(tables[0].h1, 'Session A');
  assert.equal(tables[0].h2, 'Primary strength');
  assert.deepEqual(tables[0].rows[0].cells, ['Pull-up', '3']);
});

test('parseTables ignores tables inside fenced code blocks', () => {
  const md = ['# Doc', '```markdown', '| Exercise | Sets |', '|---|---|', '| Fake | 3 |', '```'].join('\n');
  assert.deepEqual(parseTables(md), []);
});

// --- the worked example ----------------------------------------------------

test('the worked example passes the checker with no findings', () => {
  const { findings, stats } = checkProgram(fs.readFileSync(examplePath, 'utf8'), {
    path: 'example-block.md',
  });
  assert.deepEqual(
    findings.map((f) => `${f.level} ${f.rule}: ${f.message}`),
    [],
    'the gold-standard example must pass its own validator'
  );
  assert.equal(stats.sessions, 3);
  assert.ok(stats.cards >= 13, `expected 13+ cards, found ${stats.cards}`);
  assert.equal(stats.constraints, 2);
});

// --- failure detection -----------------------------------------------------

function brokenProgram(overrides = {}) {
  const {
    budgetPull = 9,
    cardPattern = 'vertical pull',
    includeCard = true,
    progressWhen = 'all sets at 8 reps, RIR >= 2',
    regressWhen = 'reps drop more than 20% for 2 sessions',
  } = overrides;

  return `# Block 1 — Test · Tester

> Dates: 2026-01-05 to 2026-02-08 (4 weeks + deload)
> Days/week: 2 · Session length: 60 min · Archetype: foundation
> Review due: 2026-02-09

## Block aim
Test the checker.

## Active constraints
- **[TEST-01]** No overhead pressing.
  Reason: test.
  Instead: landmine press.
  Earns it back: pain-free abduction.
  Re-test: 2026-02-01.

## Weekly volume budget
| Pattern | Week 1 |
|---|---|
| Vertical pull | ${budgetPull} |

## Weekly schedule
| Day | Session |
|---|---|
| Mon | A |

# Session A — Test

## Primary strength
| # | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|
| A1 | Pull-up | \`3 x 6-8\` | RIR 2 | \`2-0-1-1\` | 150" | card |

# Progression plan
| Exercise | Wk 1 | Progress when | Regress when |
|---|---|---|---|
| Pull-up | 3 x 6 | ${progressWhen} | ${regressWhen} |

# Autoregulation
**Bad day** cut a set. **Short day** first exercise only. **Amber** regress.
**Red** stop. **Missed sessions** repeat the week.

# Exercise cards
${
  includeCard
    ? `## Pull-up

| | |
|---|---|
| **Pattern** | ${cardPattern} |

### Setup
1. Hang.
### Execution
1. Pull.
### Cues
- Chest to bar.
### Breathing
Exhale up.
### Range of motion standard
Chin over bar.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
Elbow.
### Regressions
1. Ring row.
### Progressions
1. Weighted.
### Substitutes
Lat pulldown.
### References
- Video search terms: "pull up form"`
    : ''
}

# Deload week
Halve the sets.

# Review — 2026-02-09
Retest pull-ups.

# Changelog
| Date | Change | Reason |
|---|---|---|
| 2026-01-04 | Created | — |
`;
}

test('a correct minimal program produces no errors', () => {
  const { findings } = checkProgram(brokenProgram({ budgetPull: 3 }));
  assert.deepEqual(
    findings.filter((f) => f.level === 'error'),
    []
  );
});

test('catches a volume budget that does not match the sessions', () => {
  const { findings } = checkProgram(brokenProgram({ budgetPull: 9 }));
  const budget = findings.filter((f) => f.rule === 'budget' && f.level === 'error');
  assert.equal(budget.length, 1);
  assert.match(budget[0].message, /declares 9 week-1 sets of vertical pull, the sessions contain 3/);
});

test('catches a prescribed exercise with no card', () => {
  const { findings } = checkProgram(brokenProgram({ includeCard: false }));
  assert.ok(rules(findings, 'error').includes('card'));
});

test('catches a progression row with no regress trigger', () => {
  const { findings } = checkProgram(brokenProgram({ budgetPull: 3, regressWhen: '' }));
  const prog = findings.filter((f) => f.rule === 'progression' && f.level === 'error');
  assert.equal(prog.length, 1);
  assert.match(prog[0].message, /no regress trigger/);
});

test('catches an unfalsifiable progression trigger', () => {
  const { findings } = checkProgram(
    brokenProgram({ budgetPull: 3, progressWhen: 'when it feels right' })
  );
  assert.ok(
    findings.some((f) => f.level === 'warn' && /not checkable/.test(f.message)),
    'a trigger with no number and no named symptom should warn'
  );
});

test('catches push volume exceeding pull volume', () => {
  const md = brokenProgram({ budgetPull: 3, cardPattern: 'vertical push' })
    .replace('| Vertical pull | 3 |', '| Vertical push | 3 |');
  const { findings } = checkProgram(md);
  assert.ok(
    findings.some((f) => f.rule === 'budget' && /exceeds pull volume/.test(f.message)),
    'a push-dominant program must fail'
  );
});

test('catches a review date that falls before the block ends', () => {
  const md = brokenProgram({ budgetPull: 3 }).replace('Review due: 2026-02-09', 'Review due: 2026-01-20');
  const { findings } = checkProgram(md);
  assert.ok(findings.some((f) => f.rule === 'dates' && /before the block ends/.test(f.message)));
});

test('catches a constraint with no substitution or re-test date', () => {
  const md = brokenProgram({ budgetPull: 3 })
    .replace('  Instead: landmine press.\n', '')
    .replace('  Re-test: 2026-02-01.\n', '');
  const { findings } = checkProgram(md);
  const c = findings.filter((f) => f.rule === 'constraints').map((f) => f.message).join(' ');
  assert.match(c, /naming a substitution/);
  assert.match(c, /re-test date/);
});

test('catches a citation key that is not defined', () => {
  const md = brokenProgram({ budgetPull: 3 }).replace(
    '- Video search terms: "pull up form"',
    '- `[OG2]` — pulling progressions.'
  );
  const { findings } = checkProgram(md);
  assert.ok(findings.some((f) => f.rule === 'bibliography'));
});

test('catches a session that does not fit the stated session length', () => {
  const md = brokenProgram({ budgetPull: 3 }).replace(
    '| A1 | Pull-up | `3 x 6-8` | RIR 2 | `2-0-1-1` | 150" | card |',
    '| A1 | Pull-up | `20 x 6-8` | RIR 2 | `2-0-1-1` | 300" | card |'
  );
  const { findings } = checkProgram(md);
  assert.ok(findings.some((f) => f.rule === 'time' && f.level === 'error'));
});

// --- CLI -------------------------------------------------------------------

test('CLI check exits 0 on the worked example', () => {
  const out = execFileSync(process.execPath, [cli, 'check', examplePath, '--no-banner'], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  assert.match(out, /no findings/);
});

test('CLI check exits 1 on a broken program', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-check-'));
  const file = path.join(dir, 'bad.md');
  fs.writeFileSync(file, brokenProgram({ budgetPull: 9 }));
  assert.throws(
    () =>
      execFileSync(process.execPath, [cli, 'check', file, '--no-banner'], {
        encoding: 'utf8',
        env: { ...process.env, NO_COLOR: '1' },
      }),
    /Command failed/
  );
  fs.rmSync(dir, { recursive: true, force: true });
});
