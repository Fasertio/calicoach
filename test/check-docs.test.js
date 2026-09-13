import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { checkDoc, detectKind } from '../src/check-docs.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(repoRoot, 'bin', 'calicoach.js');

const TODAY = '2026-09-07';
const at = (md, kind, today = TODAY) => checkDoc(md, { kind, today, path: `${kind}.md` });
const messages = (findings, level) =>
  findings.filter((f) => !level || f.level === level).map((f) => f.message).join(' | ');

// --- dispatch --------------------------------------------------------------

test('detectKind reads the document type from its place in the workspace', () => {
  assert.equal(detectKind('calicoach/athlete/profile.md'), 'profile');
  assert.equal(detectKind('calicoach/athlete/screening.md'), 'screening');
  assert.equal(detectKind('calicoach/athlete/baseline.md'), 'baseline');
  assert.equal(detectKind('calicoach/reviews/2026-10-19_block-2-review.md'), 'review');
  assert.equal(detectKind('calicoach/programs/2026-09-07_block-2_skill.md'), 'program');
  assert.equal(detectKind('calicoach/logs/2026-09-08_w1d1.md'), 'log');
  assert.equal(detectKind('notes/random.md'), null);
});

// --- profile ---------------------------------------------------------------

const PROFILE = `# Athlete Profile — Marco

> Last updated: 2026-09-01 · Updated by: onboarding
> Scope acknowledged: yes (2026-09-01) — coaching guidance, not medical advice.

## 1. Basics
| Field | Value |
|---|---|
| Age | 31 |

## 2. Goals
| # | Goal | Test | Target date | Priority |
|---|---|---|---|---|
| 1 | Straddle front lever | 10 s hold | 2027-09-01 | primary |

## 3. Current capacity (self-reported)
| Movement | Value | Source |
|---|---|---|
| Strict pull-ups | 9 | tested 2026-09-01 |

## 4. Health and injury
Nothing current.

## 5. Logistics
| Field | Value |
|---|---|
| Days per week (realistic) | 3 |

## 6. Lifestyle
| Field | Value |
|---|---|
| Sleep (h / quality) | 7.5, good |

## 7. Preferences
- Loves: pulling.

## 8. Open questions
- [ ] none

## 9. Coach's read
- **Limiting factor #1:** shoulder tolerance.

## 10. Changelog
| Date | Change | Trigger |
|---|---|---|
| 2026-09-01 | Created | onboarding |
`;

test('a complete profile produces no errors', () => {
  assert.deepEqual(at(PROFILE, 'profile').findings.filter((f) => f.level === 'error'), []);
});

test('catches a profile section that is missing entirely', () => {
  const md = PROFILE.replace(/## 9\. Coach's read[\s\S]*?(?=## 10)/, '');
  assert.match(messages(at(md, 'profile').findings, 'error'), /Coach's read/);
});

test('catches a capacity value that never says where it came from', () => {
  const md = PROFILE.replace('| Strict pull-ups | 9 | tested 2026-09-01 |', '| Strict pull-ups | 9 | |');
  assert.match(
    messages(at(md, 'profile').findings, 'error'),
    /Strict pull-ups.*source/i,
    'an untagged number is an estimate masquerading as a measurement'
  );
});

test('catches a mandatory field left blank instead of "unknown"', () => {
  const md = PROFILE.replace('| Age | 31 |', '| Age | |');
  assert.match(messages(at(md, 'profile').findings, 'error'), /Age/);
});

test('warns when the profile is older than six months', () => {
  const md = PROFILE.replace('Last updated: 2026-09-01', 'Last updated: 2026-01-01');
  assert.match(messages(at(md, 'profile').findings, 'warn'), /249 days|out of date|re-interview/i);
});

// --- screening -------------------------------------------------------------

const SCREENING = `# Movement Screening — Marco

> Date: 2026-09-01 · Screened by: self-administered

## Red flag triage
| Flag | Present? | Detail | Action |
|---|---|---|---|
| Night pain | no | | |

**Outcome:** none.

## Screen results
| # | Item | L | R | Result | Notes | Re-test |
|---|---|---|---|---|---|---|
| A1 | Wall overhead reach | | | Pass | | |
| A3 | Painful arc | | 70-110 | Symptomatic | right | 2026-10-13 |

## Active constraints

- **[SHOULDER-01]** No overhead pressing.
  Reason: painful arc 70–110°, right, 3/10 (item A3).
  Forbids: overhead-press, overhead-load
  Instead: landmine press, incline dumbbell press.
  Earns it back: pain-free full abduction.
  Re-test: 2026-10-13.

## Lifted constraints
| ID | Lifted | By | Note |
|---|---|---|---|

## Priorities from this screen
1. Rebuild pain-free pressing range.

## Next screen due
2026-11-24
`;

test('a complete screening produces no errors', () => {
  assert.deepEqual(at(SCREENING, 'screening').findings.filter((f) => f.level === 'error'), []);
});

test('screening constraints are held to the same rules as a program header', () => {
  const md = SCREENING.replace('  Forbids: overhead-press, overhead-load\n', '');
  assert.match(messages(at(md, 'screening').findings, 'error'), /SHOULDER-01.*Forbids/);
});

test('catches a symptomatic screen row that is never acted on', () => {
  const md = SCREENING.replace(/## Active constraints[\s\S]*?(?=## Lifted)/, '## Active constraints\n\nnone\n\n')
    .replace('1. Rebuild pain-free pressing range.', '1. Nothing.');
  assert.match(
    messages(at(md, 'screening').findings, 'error'),
    /A3/,
    'a Symptomatic row must reach either a constraint or a priority'
  );
});

test('warns when a constraint re-test date has passed', () => {
  const findings = at(SCREENING, 'screening', '2026-10-20').findings;
  assert.match(messages(findings, 'warn'), /SHOULDER-01.*re-test.*overdue|overdue.*SHOULDER-01/i);
});

test('warns when the next screen is overdue', () => {
  const findings = at(SCREENING, 'screening', '2026-12-25').findings;
  assert.match(messages(findings, 'warn'), /screen.*overdue/i);
});

// --- baseline --------------------------------------------------------------

const BASELINE = `# Baseline — Marco

| Test | 2026-09-01 | Standard used |
|---|---|---|
| Strict pull-ups | 9 | dead hang, chin over bar |

## Conditions
| Date | Bodyweight | Time | Sleep prev. night | Notes |
|---|---|---|---|---|
| 2026-09-01 | 78 kg | 10:00 | 7.5 h | end of deload |

## Not tested
| Test | Reason |
|---|---|
| Overhead press 5RM | [SHOULDER-01] painful arc |

## Level read
- **Programming band:** intermediate
`;

test('a complete baseline produces no errors', () => {
  assert.deepEqual(at(BASELINE, 'baseline').findings.filter((f) => f.level === 'error'), []);
});

test('catches an untested item with no constraint id to justify it', () => {
  const md = BASELINE.replace('| Overhead press 5RM | [SHOULDER-01] painful arc |', '| Overhead press 5RM | skipped |');
  assert.match(
    messages(at(md, 'baseline').findings, 'error'),
    /Overhead press 5RM/,
    'a test is either done or blocked by a named constraint'
  );
});

test('warns when the newest baseline column is older than sixteen weeks', () => {
  const findings = at(BASELINE, 'baseline', '2027-02-01').findings;
  assert.match(messages(findings, 'warn'), /baseline.*\d+ weeks old|retest/i);
});

// --- review ----------------------------------------------------------------

const REVIEW = `# Block 2 Review — front lever

> Block dates: 2026-09-07 to 2026-10-18 · Reviewed: 2026-10-19
> Archetype: skill

## Block aim (as written at the start)
Take the front lever to a 10 s advanced tuck.

## 1. Adherence
| | Planned | Actual | % |
|---|---|---|---|
| Sessions | 18 | 17 | 94 |

## 2. Markers retested
| Marker | Start | End | Change | Standard identical? |
|---|---|---|---|---|
| Adv. tuck front lever | 5 s | 11 s | +6 s | yes |

## 3. Cause analysis
**Overall read:** program worked.

## 4. What the body said
| Site | First reported | Peak | Trend | Status |
|---|---|---|---|---|
| R elbow | week 2 | 2/10 | resolved | monitor |

## 5. MRV signal
week 5, 14 hard sets/pattern, 240 s skill TUT

## 6. Programme changes made mid-block
| Date | Change | Reason | Outcome |
|---|---|---|---|

## 7. Next block brief
- **Aim (one sentence):** consolidate the advanced tuck.
- **Archetype:** skill
- **Changes from this block:**
  1. Add one horizontal pull set.
  2. Drop the landmine press to twice weekly.

## 8. What to say to the athlete
Advanced tuck went from 5 to 11 seconds.
`;

test('a complete review produces no errors', () => {
  assert.deepEqual(at(REVIEW, 'review').findings.filter((f) => f.level === 'error'), []);
});

test('catches an MRV signal left as the template placeholder', () => {
  const md = REVIEW.replace(
    'week 5, 14 hard sets/pattern, 240 s skill TUT',
    '`week <N>, <X> hard sets/pattern, <Y> s skill TUT`'
  );
  assert.match(
    messages(at(md, 'review').findings, 'error'),
    /MRV/i,
    'the MRV signal sets the next block ceiling — an unfilled one is worse than none'
  );
});

test('warns when the next block brief carries more than three changes', () => {
  const md = REVIEW.replace(
    '  2. Drop the landmine press to twice weekly.',
    '  2. Drop the landmine press to twice weekly.\n  3. Add a hinge day.\n  4. Switch to rings.'
  );
  assert.match(messages(at(md, 'review').findings, 'warn'), /three changes|attribute/i);
});

// --- the CLI over a whole workspace ---------------------------------------

function workspace(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-ws-'));
  for (const [rel, body] of Object.entries(files)) {
    const file = path.join(dir, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
  }
  return dir;
}

const run = (dir, args = []) =>
  execFileSync(process.execPath, [cli, 'check', '--dir', dir, '--no-banner', ...args], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });

test('CLI check validates the athlete documents, not only the programs', () => {
  const dir = workspace({
    'calicoach/athlete/profile.md': PROFILE.replace('| Age | 31 |', '| Age | |'),
    'calicoach/athlete/screening.md': SCREENING,
    'calicoach/athlete/baseline.md': BASELINE,
  });
  assert.throws(() => run(dir), /Command failed/, 'a blank mandatory field must fail the run');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI check reports a clean workspace as valid', () => {
  const dir = workspace({
    'calicoach/athlete/profile.md': PROFILE,
    'calicoach/athlete/screening.md': SCREENING,
    'calicoach/athlete/baseline.md': BASELINE,
    'calicoach/reviews/2026-10-19_block-2-review.md': REVIEW,
  });
  const out = run(dir);
  assert.match(out, /4 document\(s\) valid|valid/);
  fs.rmSync(dir, { recursive: true, force: true });
});

/** The worked example plus the card file it declares, as a real block would ship. */
const exampleCards = () =>
  fs.readFileSync(
    path.join(repoRoot, 'skills', 'program-design', 'references', 'example-block-cards.md'),
    'utf8'
  );

test('CLI check flags a block whose review came due and was never written', () => {
  const example = fs.readFileSync(
    path.join(repoRoot, 'skills', 'program-design', 'references', 'example-block.md'),
    'utf8'
  )
    .replace('Dates: 2026-09-07 to 2026-10-18', 'Dates: 2020-01-06 to 2020-02-14')
    .replace('Review due: 2026-10-19', 'Review due: 2020-02-15')
    // The library lives outside programs/, or the checker would validate a
    // file of exercise cards as though it were a training block.
    .replace('> Cards: example-block-cards.md', '> Cards: ../example-block-cards.md');

  const dir = workspace({
    'calicoach/programs/2020-01-06_block-2_skill.md': example,
    'calicoach/example-block-cards.md': exampleCards(),
  });
  const out = run(dir);
  assert.match(out, /review was due 2020-02-15 and none is written/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI check stays quiet once that review exists', () => {
  const example = fs.readFileSync(
    path.join(repoRoot, 'skills', 'program-design', 'references', 'example-block.md'),
    'utf8'
  )
    .replace('Dates: 2026-09-07 to 2026-10-18', 'Dates: 2020-01-06 to 2020-02-14')
    .replace('Review due: 2026-10-19', 'Review due: 2020-02-15')
    // The library lives outside programs/, or the checker would validate a
    // file of exercise cards as though it were a training block.
    .replace('> Cards: example-block-cards.md', '> Cards: ../example-block-cards.md');

  const dir = workspace({
    'calicoach/programs/2020-01-06_block-2_skill.md': example,
    'calicoach/example-block-cards.md': exampleCards(),
    'calicoach/reviews/2020-02-15_block-2-review.md': REVIEW,
  });
  assert.doesNotMatch(run(dir), /review was due/);
  fs.rmSync(dir, { recursive: true, force: true });
});

// --- a workspace that has not been filled in yet ---------------------------

test('an untouched template reports as pending, not as a wall of errors', () => {
  const blank = fs.readFileSync(
    path.join(repoRoot, 'templates', 'athlete-profile.md'),
    'utf8'
  );
  const { findings } = checkDoc(blank, { kind: 'profile', today: TODAY, path: 'profile.md' });
  assert.deepEqual(
    findings.filter((f) => f.level === 'error'),
    [],
    'a blank template is not a broken document — the athlete simply has not been onboarded'
  );
  assert.match(messages(findings, 'warn'), /template|onboard/i);
});

test('CLI check on a freshly scaffolded workspace exits 0', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-fresh-'));
  execFileSync(process.execPath, [cli, 'workspace', '--dir', dir, '--no-banner'], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  const out = run(dir);
  assert.match(out, /valid/, 'a new user must not be greeted by a wall of errors');
  fs.rmSync(dir, { recursive: true, force: true });
});
