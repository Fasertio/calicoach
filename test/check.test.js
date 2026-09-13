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
    path: examplePath,
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
    forbids = '  Forbids: overhead-press\n',
    extraExercise = '',
    instead = '  Instead: landmine press.\n',
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
${forbids}${instead}  Earns it back: pain-free abduction.
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
${extraExercise}
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

// --- constraints vs. what is actually prescribed ---------------------------

test('catches an exercise that violates an active constraint', () => {
  const { findings } = checkProgram(
    brokenProgram({
      budgetPull: 3,
      extraExercise:
        '| A2 | Barbell Overhead Press | `3 x 8` | RIR 2 | `2-0-1-1` | 120" | card |',
    })
  );
  const violation = findings.filter((f) => f.rule === 'constraint-violation');
  assert.equal(violation.length, 1, 'an overhead press under a no-overhead constraint must fail');
  assert.equal(violation[0].level, 'error');
  assert.match(violation[0].message, /Barbell Overhead Press/);
  assert.match(violation[0].message, /TEST-01/);
});

test('permits a variant the constraint itself names as the substitute', () => {
  const { findings } = checkProgram(
    brokenProgram({
      budgetPull: 3,
      forbids: '  Forbids: dip\n',
      instead: '  Instead: Ring Dip to humerus-parallel.\n',
      extraExercise:
        '| A2 | Ring Dip to humerus-parallel | `3 x 8` | RIR 2 | `2-0-1-1` | 120" | card |',
    })
  );
  assert.deepEqual(
    findings.filter((f) => f.rule === 'constraint-violation'),
    [],
    'the substitution named in "Instead:" is the permitted variant'
  );
});

test('requires every constraint to declare what it forbids', () => {
  const { findings } = checkProgram(brokenProgram({ budgetPull: 3, forbids: '' }));
  const c = findings.filter((f) => f.rule === 'constraints' && /forbids/i.test(f.message));
  assert.equal(c.length, 1, 'a constraint with no machine-checkable Forbids line must fail');
  assert.equal(c[0].level, 'error');
});

test('rejects an invented Forbids tag rather than silently ignoring it', () => {
  const { findings } = checkProgram(
    brokenProgram({ budgetPull: 3, forbids: '  Forbids: no-bad-vibes\n' })
  );
  const c = findings.filter((f) => f.rule === 'constraints' && /no-bad-vibes/.test(f.message));
  assert.equal(c.length, 1);
  assert.equal(c[0].level, 'error', 'an unrecognised tag is a hole in the check, not a warning');
});

test('catches a citation key that is not defined', () => {
  const md = brokenProgram({ budgetPull: 3 }).replace(
    '- Video search terms: "pull up form"',
    '- `[OG2]` — pulling progressions.'
  );
  const { findings } = checkProgram(md);
  assert.ok(findings.some((f) => f.rule === 'bibliography'));
});

test('catches a one-sided balance axis', () => {
  // A program with a vertical pull and no horizontal pull anywhere.
  const md = brokenProgram({ budgetPull: 3 })
    .replace(
      '| A1 | Pull-up | `3 x 6-8` | RIR 2 | `2-0-1-1` | 150" | card |',
      '| A1 | Pull-up | `3 x 6-8` | RIR 2 | `2-0-1-1` | 150" | card |\n| A2 | Push-up | `3 x 10` | RIR 2 | `2-0-1-1` | 90" | card |\n| A3 | Squat | `3 x 10` | RIR 2 | `2-0-1-1` | 90" | card |\n| A4 | Plank | `3 x 30"` | RPE 8 | — | 60" | card |'
    )
    .replace(
      '| Pull-up | 3 x 6 | ',
      '| Push-up | 3 x 10 | all sets at 10 | any shoulder pain |\n| Squat | 3 x 10 | all sets at 10 | any knee pain |\n| Plank | 3 x 30" | 30 s flat | the low back arches |\n| Pull-up | 3 x 6 | '
    )
    .replace(
      '### References\n- Video search terms: "pull up form"',
      `### References
- Video search terms: "pull up form"

## Push-up

| | |
|---|---|
| **Pattern** | horizontal push |

### Setup
1. Plank.
### Execution
1. Press.
### Cues
- Ribs down.
### Breathing
Exhale up.
### Range of motion standard
Chest to fist.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
Wrist.
### Regressions
1. Incline.
### Progressions
1. Decline.
### Substitutes
Floor press.
### References
- Video search terms: "push up form"

## Squat

| | |
|---|---|
| **Pattern** | knee-dominant |

### Setup
1. Stand.
### Execution
1. Sit.
### Cues
- Knees out.
### Breathing
Brace.
### Range of motion standard
Below parallel.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
Knee.
### Regressions
1. Box squat.
### Progressions
1. Load it.
### Substitutes
Leg press.
### References
- Video search terms: "squat form"

## Plank

| | |
|---|---|
| **Pattern** | anti-extension |

### Setup
1. Forearms down.
### Execution
1. Hold.
### Cues
- Ribs down.
### Breathing
Normal.
### Range of motion standard
Flat back.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
Low back.
### Regressions
1. Knees.
### Progressions
1. Longer.
### Substitutes
Dead bug.
### References
- Video search terms: "plank form"`
    );

  const { findings } = checkProgram(md);
  const balance = findings.filter((f) => f.rule === 'balance').map((f) => f.message);
  assert.ok(
    balance.some((m) => /horizontal axis is one-sided/.test(m)),
    `expected a one-sided horizontal axis finding, got: ${JSON.stringify(balance)}`
  );
  assert.ok(
    balance.some((m) => /no horizontal pulling/.test(m)),
    'expected the missing horizontal pull to be called out specifically'
  );
  assert.ok(
    balance.some((m) => /lower body axis is one-sided/.test(m)),
    'knee-dominant with no hip hinge should be flagged'
  );
  assert.ok(
    balance.some((m) => /no unilateral work/.test(m)),
    'an all-bilateral program should be flagged'
  );
});

test('the worked example covers every balance axis', () => {
  const { findings } = checkProgram(fs.readFileSync(examplePath, 'utf8'), { path: examplePath });
  assert.deepEqual(
    findings.filter((f) => f.rule === 'balance'),
    [],
    'the example must pass the balance audit'
  );
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

// --- the single-table session format --------------------------------------

/**
 * A session written as one table per day, with the phase in a column instead
 * of a sub-heading. The checker must hold it to exactly the same card rule.
 */
function singleTableProgram({ phaseHeader = 'Phase', phase = 'Primary', includeCard = true } = {}) {
  return `# Block 1 — Test · Tester

> Dates: 2026-01-05 to 2026-02-08 (4 weeks + deload)
> Days/week: 2 · Session length: 60 min · Archetype: foundation
> Review due: 2026-02-09

## Block aim
Test the single-table format.

## Active constraints
- **[TEST-01]** No overhead pressing.
  Reason: test.
  Forbids: overhead-press
  Instead: landmine press.
  Earns it back: pain-free abduction.
  Re-test: 2026-02-01.

## Weekly volume budget
| Pattern | Week 1 |
|---|---|
| Vertical pull | 3 |

## Weekly schedule
| Day | Session |
|---|---|
| Mon | A |

# Session A — Test

| # | ${phaseHeader} | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|---|
| A1 | ${phase} | Pull-up | \`3 x 6-8\` | RIR 2 | \`2-0-1-1\` | 150" | card |

**How to run it**

A1 — the only working set of the day.

# Progression plan
| Exercise | Wk 1 | Progress when | Regress when |
|---|---|---|---|
| Pull-up | 3 x 6 | all sets at 8 reps, RIR >= 2 | reps drop more than 20% for 2 sessions |

# Autoregulation
Bad day: halve the sets.

# Exercise cards
${includeCard ? `## Pull-up

| | |
|---|---|
| **Pattern** | vertical pull |

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
- Video search terms: "pull up form"` : ''}

# Deload week
Halve the sets.
`;
}

test('the phase column drives the card rule when there is no sub-heading', () => {
  const { findings } = checkProgram(singleTableProgram({ includeCard: false }), { path: 'p.md' });
  const missing = findings.filter((f) => f.rule === 'card' && /has no exercise card/.test(f.message));

  assert.equal(missing.length, 1, 'a Primary exercise with no card must be caught');
  assert.match(missing[0].message, /Primary/);
});

test('a single-table session with its card passes the card rule', () => {
  const { findings } = checkProgram(singleTableProgram(), { path: 'p.md' });
  assert.deepEqual(
    findings.filter((f) => f.rule === 'card').map((f) => f.message),
    []
  );
});

test('the phase column is found under an Italian heading', () => {
  const { findings } = checkProgram(
    singleTableProgram({ phaseHeader: 'Fase', includeCard: false }),
    { path: 'p.md' }
  );
  assert.equal(
    findings.filter((f) => f.rule === 'card' && /has no exercise card/.test(f.message)).length,
    1,
    'the column header may be localised; the phase values are the controlled vocabulary'
  );
});

test('a Prehab row needs no card', () => {
  const { findings } = checkProgram(
    singleTableProgram({ phase: 'Prehab', includeCard: false }),
    { path: 'p.md' }
  );
  assert.deepEqual(
    findings.filter((f) => /has no exercise card/.test(f.message)).map((f) => f.message),
    []
  );
});

// --- cards resolved through a companion file -------------------------------

/**
 * A block may keep its exercise cards in another file and say so. The checker
 * has to follow that, or splitting a program from its card library turns every
 * exercise into a missing card.
 */
function splitProgram({ cardsLine = '> Cards: cards.md', cardsFile = true } = {}) {
  const program = `# Block 1 — Test · Tester

> Dates: 2026-01-05 to 2026-02-08 (4 weeks + deload)
> Days/week: 2 · Session length: 60 min · Archetype: foundation
> Review due: 2026-02-09
${cardsLine}

## Block aim
Test companion cards.

## Active constraints
- **[TEST-01]** No overhead pressing.
  Reason: test.
  Forbids: overhead-press
  Instead: landmine press.
  Earns it back: pain-free abduction.
  Re-test: 2026-02-01.

## Weekly volume budget
| Pattern | Week 1 |
|---|---|
| Vertical pull | 3 |

## Weekly schedule
| Day | Session |
|---|---|
| Mon | A |

# Session A — Test

| # | Phase | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|---|
| A1 | Primary | Pull-up | \`3 x 6-8\` | RIR 2 | \`2-0-1-1\` | 150" | card |

# Progression plan
| Exercise | Wk 1 | Progress when | Regress when |
|---|---|---|---|
| Pull-up | 3 x 6 | all sets at 8 reps, RIR >= 2 | reps drop more than 20% for 2 sessions |

# Autoregulation
Bad day: halve the sets.
`;

  const cards = `# Exercise cards

## Pull-up

| | |
|---|---|
| **Pattern** | vertical pull |

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
- Video search terms: "pull up form"

## Ring Row

| | |
|---|---|
| **Pattern** | horizontal pull |

### Setup
1. Rings.
### Execution
1. Row.
### Cues
- Chest up.
### Breathing
Exhale.
### Range of motion standard
Chest to rings.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
None.
### Regressions
1. Higher.
### Progressions
1. Feet up.
### Substitutes
Inverted row.
### References
- Video search terms: "ring row"
`;

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-split-'));
  const programPath = path.join(dir, 'block.md');
  fs.writeFileSync(programPath, program);
  if (cardsFile) fs.writeFileSync(path.join(dir, 'cards.md'), cards);
  return { dir, programPath, program };
}

test('a card in the declared companion file counts as present', () => {
  const { dir, programPath, program } = splitProgram();
  const { findings, stats } = checkProgram(program, { path: programPath });

  assert.deepEqual(
    findings.filter((f) => /has no exercise card/.test(f.message)).map((f) => f.message),
    []
  );
  assert.ok(stats.cards >= 2, `companion cards must be counted, got ${stats.cards}`);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a companion card the block does not prescribe is not nagged about', () => {
  const { dir, programPath, program } = splitProgram();
  const { findings } = checkProgram(program, { path: programPath });

  assert.deepEqual(
    findings.filter((f) => /is not prescribed in any session/.test(f.message)).map((f) => f.message),
    [],
    'a shared card library legitimately holds cards this block does not use'
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a declared companion that does not exist is an error, not a silent pass', () => {
  const { dir, programPath, program } = splitProgram({ cardsFile: false });
  const { findings } = checkProgram(program, { path: programPath });

  assert.ok(
    findings.some((f) => f.level === 'error' && /cards\.md/.test(f.message)),
    'a pointer to nothing must fail loudly'
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

test('without a companion declaration the card must be in the block itself', () => {
  const { dir, programPath, program } = splitProgram({ cardsLine: '', cardsFile: true });
  const { findings } = checkProgram(program, { path: programPath });

  assert.ok(
    findings.some((f) => /has no exercise card/.test(f.message)),
    'cards are not found by accident — the block has to say where they are'
  );
  fs.rmSync(dir, { recursive: true, force: true });
});

// --- line endings ----------------------------------------------------------

/**
 * Windows workspaces hold CRLF files. JavaScript's `.` does not match a
 * carriage return -- it is a line terminator -- so `/^#+ (.*)$/` fails on a
 * heading that ends in one, and the checker silently found no sessions and no
 * progression plan in a perfectly good block.
 */
test('a CRLF document checks exactly like the same document in LF', () => {
  const lf = fs.readFileSync(examplePath, 'utf8');
  const crlf = lf.replace(/\n/g, '\r\n');

  const a = checkProgram(lf, { path: examplePath });
  const b = checkProgram(crlf, { path: examplePath });

  assert.deepEqual(
    b.findings.map((f) => `${f.level} ${f.rule}: ${f.message}`),
    a.findings.map((f) => `${f.level} ${f.rule}: ${f.message}`)
  );
  assert.deepEqual(b.stats, a.stats, 'sessions, exercises and cards must all still be found');
  assert.equal(b.stats.sessions, 3);
});

test('parseTables keeps its heading context across CRLF', () => {
  const md = ['# Session A', '', '| Exercise | Sets |', '|---|---|', '| Pull-up | 3 |'].join(
    '\r\n'
  );
  assert.equal(parseTables(md)[0].h1, 'Session A');
});
