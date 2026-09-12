import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { status, formatStatus } from '../src/status.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, '..', 'bin', 'calicoach.js');

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-status-'));
}

/** Write a file inside the workspace, creating parents. */
function write(dir, rel, body) {
  const file = path.join(dir, 'calicoach', rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body);
  return file;
}

test('an empty directory reports no workspace and routes to init', () => {
  const dir = tmpdir();
  const s = status({ dir, today: '2026-09-12' });

  assert.equal(s.workspace.exists, false);
  assert.equal(s.profile.present, false);
  assert.equal(s.logs.count, 0);
  assert.equal(s.next.command, '/calicoach:init');
});

const PROFILE = `# Athlete Profile — Daniel

> Last updated: 2026-09-06 · Updated by: onboarding

## 1. Basics
| Field | Value |
|---|---|
| Age | 34 |
`;

const EMPTY_PROFILE = `# Athlete Profile — <name or handle>

> Last updated: YYYY-MM-DD · Updated by: onboarding
> Status: **EMPTY TEMPLATE — run \`athlete-onboarding\` to fill this in.**
`;

test('a seeded but unfilled profile counts as missing', () => {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', EMPTY_PROFILE);
  const s = status({ dir, today: '2026-09-12' });

  assert.equal(s.profile.present, false);
  assert.equal(s.next.command, '/calicoach:onboard');
});

test('a filled profile is present, dated and named', () => {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', PROFILE);
  const s = status({ dir, today: '2026-09-12' });

  assert.equal(s.profile.present, true);
  assert.equal(s.profile.date, '2026-09-06');
  assert.equal(s.profile.ageDays, 6);
  assert.equal(s.profile.athlete, 'Daniel');
  assert.equal(s.next.command, '/calicoach:screen');
});

test('a profile past the staleness threshold is flagged', () => {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', PROFILE);
  const s = status({ dir, today: '2027-09-06' });

  assert.equal(s.profile.stale, true);
});

const SCREENING = `# Movement Screen — Daniel

> Screened: 2026-09-06

## Red flag triage
| Flag | Present |
|---|---|
| Night pain | no |

## Active constraints

- [SH-1] Overhead pressing removed.
  Reason: painful arc at 120°.
  Forbids: overhead-press
  Instead: landmine press.
  Earns it back: pain-free arc.
  Re-test: 2026-10-04.

- [WR-1] Straight-wrist loading only.
  Reason: extension discomfort.
  Forbids: wrist-extension-loaded
  Instead: parallettes.
  Earns it back: 60s pain-free hold.
  Re-test: 2026-10-04.

## Next screen due
2026-12-06
`;

test('the screen reports its constraint count and its own due date', () => {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', PROFILE);
  write(dir, 'athlete/screening.md', SCREENING);
  const s = status({ dir, today: '2026-09-12' });

  assert.equal(s.screening.present, true);
  assert.equal(s.screening.constraints, 2);
  assert.equal(s.screening.dueDate, '2026-12-06');
  assert.equal(s.screening.stale, false);
  assert.equal(s.next.command, '/calicoach:test');
});

test('the screen goes stale when its own due date has passed', () => {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', PROFILE);
  write(dir, 'athlete/screening.md', SCREENING);
  const s = status({ dir, today: '2026-12-20' });

  assert.equal(s.screening.stale, true);
});

const BASELINE = `# Baseline — Daniel

> Tested: 2026-09-07

## Conditions
| Field | Value |
|---|---|
| Time of day | morning |
`;

const PROGRAM = `# Block 1 — foundation · Daniel

> Dates: 2026-09-06 to 2026-10-18 (6 weeks + deload)
> Days/week: 3 · Session length: 60 · Archetype: foundation
> Review due: 2026-10-04
`;

function fullWorkspace(today) {
  const dir = tmpdir();
  write(dir, 'athlete/profile.md', PROFILE);
  write(dir, 'athlete/screening.md', SCREENING);
  write(dir, 'athlete/baseline.md', BASELINE);
  write(dir, 'programs/2026-09-06_block-1_foundation.md', PROGRAM);
  write(dir, 'logs/2026-09-07_w1d1.md', '# w1d1\n');
  write(dir, 'logs/2026-09-08_w2d3.md', '# w2d3\n');
  return { dir, s: status({ dir, today }) };
}

test('the program is read from its header and the week from the newest log', () => {
  const { s } = fullWorkspace('2026-09-12');

  assert.equal(s.program.present, true);
  assert.equal(s.program.block, '1');
  assert.equal(s.program.focus, 'foundation');
  assert.equal(s.program.start, '2026-09-06');
  assert.equal(s.program.weeks, 6);
  assert.equal(s.program.reviewDue, '2026-10-04');
  assert.equal(s.program.reviewOverdue, false);
  assert.equal(s.program.week, 2);

  assert.equal(s.logs.count, 2);
  assert.equal(s.logs.last, '2026-09-08');
  assert.equal(s.logs.ageDays, 4);
  assert.equal(s.logs.week, 2);
  assert.equal(s.logs.day, 3);
});

test('templates in the workspace are not counted as programs or logs', () => {
  const { dir } = fullWorkspace('2026-09-12');
  write(dir, 'programs/_TEMPLATE-program.md', PROGRAM);
  write(dir, 'logs/_TEMPLATE-session-log.md', '# template\n');
  const s = status({ dir, today: '2026-09-12' });

  assert.equal(s.logs.count, 2);
  assert.equal(s.program.block, '1');
});

test('an overdue review wins over running the next session', () => {
  const { s } = fullWorkspace('2026-10-11');

  assert.equal(s.program.reviewOverdue, true);
  assert.equal(s.next.command, '/calicoach:review');
});

test('a complete and current workspace routes to the next session', () => {
  const { s } = fullWorkspace('2026-09-12');

  assert.equal(s.next.command, '/calicoach:log');
  assert.match(s.next.message, /week 2/);
});

test('status never throws and never writes', () => {
  const dir = tmpdir();
  const before = fs.readdirSync(dir);
  assert.doesNotThrow(() => status({ dir, today: '2026-09-12' }));
  assert.deepEqual(fs.readdirSync(dir), before);
});

function run(args, dir) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

test('formatStatus renders one line per document plus next', () => {
  const { s } = fullWorkspace('2026-09-12');
  const out = formatStatus(s);

  assert.match(out, /^athlete\s+Daniel/m);
  assert.match(out, /^screen\s+2026-09-06/m);
  assert.match(out, /2 active constraints/);
  assert.match(out, /^program\s+block-1 foundation/m);
  assert.match(out, /^logs\s+2 sessions/m);
  assert.match(out, /^next\s+run week 2 day 4/m);
});

test('formatStatus reports an empty workspace without crashing', () => {
  const dir = tmpdir();
  const out = formatStatus(status({ dir, today: '2026-09-12' }));

  assert.match(out, /no workspace/i);
  assert.match(out, /\/calicoach:init/);
});

test('the CLI prints status and exits 0 on an empty workspace', () => {
  const dir = tmpdir();
  const out = run(['status', '--no-banner'], dir);
  assert.match(out, /\/calicoach:init/);
});

test('the CLI emits stable JSON with --json', () => {
  const { dir } = fullWorkspace('2026-09-12');
  const parsed = JSON.parse(run(['status', '--json', '--no-banner'], dir));

  assert.equal(parsed.profile.athlete, 'Daniel');
  assert.equal(parsed.program.block, '1');
  assert.equal(parsed.next.command, '/calicoach:log');
  assert.ok(Object.hasOwn(parsed, 'today'));
});
