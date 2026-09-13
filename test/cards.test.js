import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { cardIndex, formatIndex } from '../src/cards.js';
import { resolveWorkspace } from '../src/paths.js';
import { detectKind } from '../src/check-docs.js';

const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-cards-'));

function write(dir, rel, body) {
  const file = path.join(dir, 'calicoach', rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return file;
}

const CARD = (name, pattern) => `
## ${name}

| | |
|---|---|
| **Pattern** | ${pattern} |

### Setup
1. Set up.
### Execution
1. Do it.
### Cues
- Cue.
### Breathing
Exhale.
### Range of motion standard
Full.
### Common faults
| Fault | Why | Fix |
|---|---|---|
### Risk notes
None.
### Regressions
1. Easier.
### Progressions
1. Harder.
### Substitutes
Other.
### References
- Video search terms: "${name}"
`;

const LIBRARY = `# Exercise cards — Daniel
${CARD('Weighted Pull-up', 'vertical pull')}${CARD('Goblet Squat', 'knee-dominant')}`;

// --- the workspace contract ------------------------------------------------

test('the workspace has a home for the card library', () => {
  const ws = resolveWorkspace('/somewhere');
  assert.ok(ws.cards, 'resolveWorkspace must name a cards directory');
  assert.equal(path.basename(ws.cards), 'cards');
});

test('a card library is not mistaken for a training block', () => {
  assert.equal(detectKind('calicoach/cards/daniel.md'), 'cards');
  assert.equal(detectKind('calicoach/programs/2026-01-01_block-1_foundation.md'), 'program');
});

// --- the index -------------------------------------------------------------

test('the index finds every card in the library, with its pattern and home', () => {
  const dir = tmpdir();
  write(dir, 'cards/daniel.md', LIBRARY);
  const index = cardIndex({ dir });

  assert.equal(index.cards.length, 2);
  const pullUp = index.cards.find((c) => c.name === 'Weighted Pull-up');
  assert.equal(pullUp.pattern, 'vertical pull');
  assert.match(pullUp.file, /cards[\\/]daniel\.md$/);
});

test('cards written inline in a block are indexed too', () => {
  const dir = tmpdir();
  write(
    dir,
    'programs/2026-01-05_block-1_foundation.md',
    `# Block 1\n\n# Exercise cards\n${CARD('Ring Row', 'horizontal pull')}`
  );
  const index = cardIndex({ dir });

  assert.equal(index.cards.length, 1);
  assert.equal(index.cards[0].name, 'Ring Row');
  assert.match(index.cards[0].file, /programs[\\/]/);
});

test('a card defined twice is reported, not silently merged', () => {
  const dir = tmpdir();
  write(dir, 'cards/daniel.md', LIBRARY);
  write(dir, 'programs/2026-01-05_block-1_foundation.md', `# Block 1\n\n# Exercise cards\n${CARD('Goblet Squat', 'knee-dominant')}`);
  const index = cardIndex({ dir });

  assert.equal(index.duplicates.length, 1);
  assert.equal(index.duplicates[0].name, 'Goblet Squat');
  assert.equal(index.duplicates[0].files.length, 2);
});

test('an empty workspace indexes cleanly rather than throwing', () => {
  const dir = tmpdir();
  const index = cardIndex({ dir });

  assert.deepEqual(index.cards, []);
  assert.deepEqual(index.duplicates, []);
});

test('the index renders as a table an athlete can read', () => {
  const dir = tmpdir();
  write(dir, 'cards/daniel.md', LIBRARY);
  const out = formatIndex(cardIndex({ dir }));

  assert.match(out, /Weighted Pull-up/);
  assert.match(out, /vertical pull/);
});

// --- what it is for --------------------------------------------------------

test('the index says which cards a set of exercises already has', () => {
  const dir = tmpdir();
  write(dir, 'cards/daniel.md', LIBRARY);
  const index = cardIndex({ dir });

  assert.equal(index.has('weighted pull-up'), true);
  assert.equal(index.has('Weighted Pull-Up'), true, 'matching is case-insensitive');
  assert.equal(index.has('Muscle-up'), false);
});

// --- what the index is for -------------------------------------------------

test('a block whose cards all live in the library still validates', async () => {
  const { checkProgram } = await import('../src/check.js');
  const dir = tmpdir();
  write(dir, 'cards/daniel.md', LIBRARY);

  const block = `# Block 2 — Test · Daniel

> Dates: 2026-03-02 to 2026-04-05 (4 weeks + deload)
> Days/week: 2 · Session length: 60 min · Archetype: foundation
> Review due: 2026-04-06
> Cards: ../cards/daniel.md

## Block aim
Reuse what is already written.

## Active constraints
- **[TEST-01]** No overhead pressing.
  Reason: test.
  Forbids: overhead-press
  Instead: landmine press.
  Earns it back: pain-free abduction.
  Re-test: 2026-04-01.

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
| A1 | Primary | Weighted Pull-up | \`3 x 6-8\` | RIR 2 | \`2-0-1-1\` | 150" | [card](../cards/daniel.md#weighted-pull-up) |

# Progression plan
| Exercise | Wk 1 | Progress when | Regress when |
|---|---|---|---|
| Weighted Pull-up | 3 x 6 | all sets at 8 reps, RIR >= 2 | reps drop more than 20% for 2 sessions |

# Autoregulation
Bad day: halve the sets.
`;
  const programPath = path.join(dir, 'calicoach', 'programs', 'block-2.md');
  fs.mkdirSync(path.dirname(programPath), { recursive: true });
  fs.writeFileSync(programPath, block);

  const { findings } = checkProgram(block, { path: programPath });
  assert.deepEqual(
    findings.filter((f) => f.rule === 'card').map((f) => f.message),
    [],
    'a card in the library counts as written — that is the whole saving'
  );
});
