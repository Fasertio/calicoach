# Plugin and Command Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make calicoach installable as a Claude Code plugin and drivable through thirteen `/calicoach:*` commands, without changing any of the fourteen skills.

**Architecture:** `skills/` and a new `commands/` directory are the single source, consumed three ways — by the Claude Code plugin (which reads them in place from its cache), by `npx calicoach` (which copies them into `.claude/`), and by an agent export (which copies skills and generates `AGENTS.md`). Commands are thin routers: frontmatter, a deterministic preflight that injects workspace state as text, and one sentence naming the skill to invoke. The preflight is powered by a new read-only CLI command, `calicoach status`.

**Tech Stack:** Node.js ≥18, ESM, zero runtime dependencies. Tests are `node:test` + `node:assert/strict`, run by `npm test`.

**Spec:** `docs/superpowers/specs/2026-09-09-plugin-and-commands-design.md`

## Global Constraints

- Node.js ≥ 18. ESM only (`"type": "module"`). **No new dependencies** — the package has zero and keeps zero.
- **No file under `skills/` may be created, edited or deleted by this plan.** The fourteen skills are unchanged.
- Command files live in `commands/` at the repository root, one `.md` per command, **maximum 40 lines each**.
- The plugin name must be exactly `calicoach` — the command namespace `/calicoach:*` derives from it.
- `.claude-plugin/plugin.json` `version` must equal `package.json` `version`. Both become `0.2.0`.
- `calicoach status` is read-only: no writes, no network, **exit code 0 for every workspace state**, including an empty one.
- Reuse, never duplicate: `isUntouchedTemplate()` and `STALE_AFTER` from `src/check-docs.js`; `firstDate()` and `daysBetween()` from `src/constraints.js`; `section()` and `plain()` from `src/check.js`; the `c`/`log`/`ok`/`warn`/`step` helpers from `src/ui.js`.
- Terminal output uses `src/ui.js` helpers so `NO_COLOR` keeps working. Never `console.log` raw ANSI.
- Commit after every task. Conventional Commits (`feat:`, `test:`, `docs:`, `chore:`).

---

## File Structure

| File | Responsibility |
|---|---|
| `src/status.js` | **New.** Derives workspace state (`status()`) and renders it (`formatStatus()`). The only module that knows the coaching loop's decision order. |
| `src/commands.js` | **New.** Discovers `commands/*.md`, parses frontmatter, installs them into `.claude/commands/calicoach/` rewriting the plugin-root token. |
| `src/agents.js` | **New.** Generates `AGENTS.md` from the skills and copies them to `.agent/skills/`. |
| `.claude-plugin/plugin.json` | **New.** Plugin manifest. |
| `.claude-plugin/marketplace.json` | **New.** Makes the repository its own marketplace. |
| `commands/*.md` | **New.** Thirteen thin routers. |
| `bin/calicoach.js` | **Modified.** Adds `status`, `--json`, `--agent`; installs commands during `init`/`skills`. |
| `src/install.js` | **Modified.** `doctor()` additionally validates the manifests and the commands. |
| `src/paths.js` | **Modified.** Adds `commandsSource`, `pluginManifest`, and `resolveCommandsDir()`. |

`src/status.js` holds both derivation and rendering because they change together — a new state field is useless until it is shown. `src/commands.js` and `src/agents.js` are separate from `src/install.js` because that file is already 300 lines and the two concerns (command installation, non-Claude export) are independent of skill copying.

---

### Task 1: Workspace state derivation

**Files:**
- Create: `src/status.js`
- Create: `test/status.test.js`

**Interfaces:**
- Consumes: `resolveWorkspace(dir)` from `src/paths.js`; `isUntouchedTemplate(md)` and `STALE_AFTER` from `src/check-docs.js`; `firstDate(s)`, `daysBetween(from, to)` from `src/constraints.js`; `section(md, heading)` from `src/check.js`.
- Produces: `status({ dir, today }) -> StatusState`. Later tasks depend on this exact shape:

```js
{
  today: '2026-09-12',
  workspace: { root: '<abs path>', exists: true },
  profile:   { present: true, date: '2026-09-06', ageDays: 6, stale: false, athlete: 'Daniel' },
  screening: { present: true, date: '2026-09-06', ageDays: 6, stale: false, constraints: 2, dueDate: '2026-12-06' },
  baseline:  { present: false, date: null, ageDays: null, stale: false },
  program:   { present: true, file: '<abs path>', block: '1', focus: 'foundation',
               start: '2026-09-06', weeks: 6, reviewDue: '2026-10-04', reviewOverdue: false, week: 2 },
  logs:      { count: 6, last: '2026-09-08', ageDays: 4, week: 2, day: 3 },
  next:      { command: '/calicoach:log', message: 'run week 2 day 4, or /calicoach:log to record the last one' }
}
```

Every document sub-object always carries `present`. When `present` is `false` the other fields are `null`/`0`/`false` — never absent, so consumers never branch on `undefined`.

- [ ] **Step 1: Write the failing test for an absent workspace**

Create `test/status.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { status } from '../src/status.js';

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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/status.test.js`
Expected: FAIL — `Cannot find module '../src/status.js'`.

- [ ] **Step 3: Write the minimal implementation**

Create `src/status.js`:

```js
/**
 * Where the athlete stands, computed rather than read.
 *
 * Every command's preflight runs this. Establishing "who is this athlete and
 * what is due" by opening the profile, the screen, the baseline and the newest
 * program costs several thousand tokens; this costs the few dozen it takes to
 * print. Nothing here writes, and an empty workspace is a state to report, not
 * an error.
 */

import fs from 'node:fs';
import path from 'node:path';

import { resolveWorkspace } from './paths.js';
import { isUntouchedTemplate, STALE_AFTER } from './check-docs.js';
import { firstDate, daysBetween } from './constraints.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

const ABSENT = { present: false, date: null, ageDays: null, stale: false };

export function status({ dir, today = todayISO() } = {}) {
  const ws = resolveWorkspace(dir);
  const exists = fs.existsSync(ws.root);

  const state = {
    today,
    workspace: { root: ws.root, exists },
    profile: { ...ABSENT, athlete: null },
    screening: { ...ABSENT, constraints: 0, dueDate: null },
    baseline: { ...ABSENT },
    program: {
      present: false, file: null, block: null, focus: null,
      start: null, weeks: null, reviewDue: null, reviewOverdue: false, week: null,
    },
    logs: { count: 0, last: null, ageDays: null, week: null, day: null },
    next: null,
  };

  state.next = decideNext(state);
  return state;
}

/**
 * The coaching loop, in order. The first unmet gate wins — this is the same
 * order `calisthenics-coach` routes by, and the only place it is encoded.
 */
function decideNext(s) {
  if (!s.workspace.exists) {
    return { command: '/calicoach:init', message: 'no workspace yet — run /calicoach:init' };
  }
  return { command: '/calicoach:onboard', message: 'no profile yet — run /calicoach:onboard' };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `node --test test/status.test.js`
Expected: PASS, 1 test.

- [ ] **Step 5: Write the failing test for document presence and the template rule**

Append to `test/status.test.js`:

```js
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
```

- [ ] **Step 6: Run it to verify it fails**

Run: `node --test test/status.test.js`
Expected: FAIL — `s.profile.present` is `false` for the filled profile, and `athlete` is `null`.

- [ ] **Step 7: Implement document reading**

In `src/status.js`, add above `status()`:

```js
/**
 * One athlete document. A file that exists but is still the seeded template is
 * a pending task, not a document — `scaffoldWorkspace` writes those templates,
 * so existence on its own proves nothing.
 */
function readDoc(file, today, staleAfter) {
  if (!fs.existsSync(file)) return { ...ABSENT };
  const md = fs.readFileSync(file, 'utf8');
  if (isUntouchedTemplate(md)) return { ...ABSENT };

  const date = firstDate(md);
  const ageDays = date ? daysBetween(date, today) : null;
  return {
    present: true,
    md,
    date,
    ageDays,
    stale: Boolean(staleAfter && ageDays !== null && ageDays > staleAfter),
  };
}

/** The athlete's name, from the profile's own heading. */
function athleteName(md) {
  const m = /^#\s*Athlete Profile\s*[—-]\s*(.+?)\s*$/m.exec(String(md));
  const name = m?.[1]?.trim();
  return !name || name.startsWith('<') ? null : name;
}
```

Then inside `status()`, replace the `profile` initialiser:

```js
  const profile = readDoc(path.join(ws.athlete, 'profile.md'), today, STALE_AFTER.profile);
  const baseline = readDoc(path.join(ws.athlete, 'baseline.md'), today, STALE_AFTER.baseline);
```

and build `state.profile` / `state.baseline` from them, dropping the `md` key:

```js
    profile: { ...omitMd(profile), athlete: profile.present ? athleteName(profile.md) : null },
    baseline: omitMd(baseline),
```

with:

```js
/** The parsed document without its body — the body is an implementation detail. */
const omitMd = ({ md, ...rest }) => rest;
```

Extend `decideNext`:

```js
  if (!s.profile.present) {
    return { command: '/calicoach:onboard', message: 'no profile yet — run /calicoach:onboard' };
  }
  if (!s.screening.present) {
    return { command: '/calicoach:screen', message: 'not screened yet — run /calicoach:screen' };
  }
  if (!s.baseline.present) {
    return { command: '/calicoach:test', message: 'no baseline yet — run /calicoach:test' };
  }
  return { command: '/calicoach:program', message: 'no program yet — run /calicoach:program' };
```

- [ ] **Step 8: Run it to verify it passes**

Run: `node --test test/status.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 9: Write the failing test for the screen**

Append to `test/status.test.js`:

```js
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
```

- [ ] **Step 10: Run it to verify it fails**

Run: `node --test test/status.test.js`
Expected: FAIL — `s.screening.present` is `false`.

- [ ] **Step 11: Implement the screen**

At the top of `src/status.js`, add the `section` import and extend the existing
`./constraints.js` import rather than adding a second one:

```js
import { section } from './check.js';
import { firstDate, daysBetween, parseConstraints } from './constraints.js';
```

Add above `status()`:

```js
/**
 * The screen carries its own expiry — `Next screen due` — rather than a fixed
 * threshold, because how fast a screen ages depends on what it found.
 */
function readScreening(file, today) {
  const doc = readDoc(file, today, null);
  if (!doc.present) return { ...ABSENT, constraints: 0, dueDate: null };

  const constraints = parseConstraints(section(doc.md, 'Active constraints') ?? '').length;
  const dueDate = firstDate(section(doc.md, 'Next screen due') ?? '');
  return {
    ...omitMd(doc),
    constraints,
    dueDate,
    stale: Boolean(dueDate && daysBetween(dueDate, today) > 0),
  };
}
```

Wire it in `status()`:

```js
  const screening = readScreening(path.join(ws.athlete, 'screening.md'), today);
```

and set `state.screening = screening`.

- [ ] **Step 12: Run it to verify it passes**

Run: `node --test test/status.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 13: Write the failing test for the program, the logs and the week**

Append to `test/status.test.js`:

```js
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
```

- [ ] **Step 14: Run it to verify it fails**

Run: `node --test test/status.test.js`
Expected: FAIL — `s.program.present` is `false`.

- [ ] **Step 15: Implement the program and the logs**

Add to `src/status.js`:

```js
/** Workspace markdown files, newest filename last, templates excluded. */
function dataFiles(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'))
    .sort()
    .map((f) => path.join(folder, f));
}

/**
 * The newest block. `Dates:` gives the start and the length, `Review due:` the
 * deadline; the block number and focus come from the filename, which the
 * workspace contract fixes as `YYYY-MM-DD_block-N_<focus>.md`.
 */
function readProgram(folder, today, logs) {
  const files = dataFiles(folder);
  const file = files[files.length - 1];
  if (!file) {
    return {
      present: false, file: null, block: null, focus: null,
      start: null, weeks: null, reviewDue: null, reviewOverdue: false, week: null,
    };
  }

  const md = fs.readFileSync(file, 'utf8');
  const name = path.basename(file);
  const dates = /Dates:\s*(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})\s*\((\d+)\s*weeks?/i.exec(md);
  const start = dates?.[1] ?? firstDate(md);
  const reviewDue = firstDate(/Review due:\s*(\d{4}-\d{2}-\d{2})/i.exec(md)?.[1] ?? '');

  return {
    present: true,
    file,
    block: /block-(\d+)/i.exec(name)?.[1] ?? null,
    focus: /block-\d+_([^.]+)\.md$/i.exec(name)?.[1] ?? null,
    start,
    weeks: dates ? Number(dates[3]) : null,
    reviewDue,
    reviewOverdue: Boolean(reviewDue && daysBetween(reviewDue, today) > 0),
    // The athlete's own log names carry the week; calendar arithmetic is the
    // fallback for a block whose first session has not been logged yet.
    week: logs.week ?? (start ? Math.floor(daysBetween(start, today) / 7) + 1 : null),
  };
}

/** Sessions completed against the current block. */
function readLogs(folder, today) {
  const files = dataFiles(folder);
  const last = files[files.length - 1];
  if (!last) return { count: 0, last: null, ageDays: null, week: null, day: null };

  const name = path.basename(last);
  const wd = /_w(\d+)d(\d+)\.md$/i.exec(name);
  const date = firstDate(name);
  return {
    count: files.length,
    last: date,
    ageDays: date ? daysBetween(date, today) : null,
    week: wd ? Number(wd[1]) : null,
    day: wd ? Number(wd[2]) : null,
  };
}
```

Wire both into `status()` — logs first, because the program's week derives from them:

```js
  const logs = readLogs(ws.logs, today);
  const program = readProgram(ws.programs, today, logs);
```

Extend `decideNext`, after the baseline gate:

```js
  if (!s.program.present) {
    return { command: '/calicoach:program', message: 'no program yet — run /calicoach:program' };
  }
  if (s.program.reviewOverdue) {
    return {
      command: '/calicoach:review',
      message: `review was due ${s.program.reviewDue} — run /calicoach:review before the next block`,
    };
  }
  const day = s.logs.day ? s.logs.day + 1 : 1;
  return {
    command: '/calicoach:log',
    message: `run week ${s.program.week ?? 1} day ${day}, or /calicoach:log to record the last one`,
  };
```

- [ ] **Step 16: Run the whole suite**

Run: `npm test`
Expected: PASS — the existing suites plus 11 new `status` tests.

- [ ] **Step 17: Commit**

```bash
git add src/status.js test/status.test.js
git commit -m "feat(status): derive where the athlete stands from the workspace"
```

---

### Task 2: Rendering and CLI wiring

**Files:**
- Modify: `src/status.js` (add `formatStatus`)
- Modify: `bin/calicoach.js` (add the `status` case, `--json`, help text)
- Modify: `test/status.test.js` (append CLI tests)

**Interfaces:**
- Consumes: `status({ dir, today })` from Task 1.
- Produces: `formatStatus(state) -> string` (no trailing newline, no ANSI when `NO_COLOR` is set); the CLI command `calicoach status [--json] [--dir <path>]`, exit code 0 always.

- [ ] **Step 1: Write the failing test**

Append to `test/status.test.js`:

```js
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { formatStatus } from '../src/status.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(here, '..', 'bin', 'calicoach.js');

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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/status.test.js`
Expected: FAIL — `formatStatus is not a function`.

- [ ] **Step 3: Implement `formatStatus`**

Append to `src/status.js`:

```js
import { c } from './ui.js';

/** `2026-09-06 (6d)`, or nothing when the document has no date. */
function dated(doc) {
  if (!doc.date) return 'undated';
  const age = doc.ageDays === null ? '' : ` ${c.gray(`(${doc.ageDays}d)`)}`;
  return `${doc.date}${age}${doc.stale ? ` ${c.yellow('stale')}` : ''}`;
}

const row = (label, value) => `${label.padEnd(10)} ${value}`;

/**
 * One screen. Every line is a fact from the workspace; the last is the only
 * judgement, and it names the command that acts on it.
 */
export function formatStatus(s) {
  if (!s.workspace.exists) {
    return [
      row('workspace', `${c.yellow('no workspace')} at ${c.gray(s.workspace.root)}`),
      row('next', s.next.message),
    ].join('\n');
  }

  const lines = [];
  lines.push(
    row(
      'athlete',
      s.profile.present
        ? `${s.profile.athlete ?? 'unnamed'} · profile ${dated(s.profile)}`
        : c.yellow('no profile')
    )
  );
  lines.push(
    row(
      'screen',
      s.screening.present
        ? `${dated(s.screening)} · ${s.screening.constraints} active constraint${s.screening.constraints === 1 ? '' : 's'}`
        : c.yellow('not screened')
    )
  );
  lines.push(row('baseline', s.baseline.present ? dated(s.baseline) : c.yellow('not tested')));

  if (s.program.present) {
    const weeks = s.program.weeks ? ` of ${s.program.weeks}` : '';
    const due = s.program.reviewDue
      ? ` · review due ${s.program.reviewDue}${s.program.reviewOverdue ? ` ${c.yellow('OVERDUE')}` : ''}`
      : '';
    lines.push(
      row('program', `block-${s.program.block} ${s.program.focus} · week ${s.program.week}${weeks}${due}`)
    );
  } else {
    lines.push(row('program', c.yellow('no program')));
  }

  lines.push(
    row(
      'logs',
      s.logs.count
        ? `${s.logs.count} session${s.logs.count === 1 ? '' : 's'} · last ${s.logs.last} ${c.gray(`(${s.logs.ageDays}d)`)}`
        : c.gray('none yet')
    )
  );
  lines.push(row('next', c.bold(s.next.message)));
  return lines.join('\n');
}
```

- [ ] **Step 4: Wire the CLI**

In `bin/calicoach.js`, add to the imports:

```js
import { status, formatStatus } from '../src/status.js';
```

Add a case to the `switch (cmd)` block, before `default`:

```js
    case 'status': {
      const state = status({ dir });
      log(args.flags.json ? JSON.stringify(state, null, 2) : formatStatus(state));
      break;
    }
```

Suppress the banner for `status` the same way `list` does — change the banner guard to:

```js
  if (!args.flags['no-banner'] && !['list', 'status'].includes(cmd)) banner(pkg.version);
```

Add to the `COMMANDS` block in `help()`, after `check`:

```js
  ${c.cyan('status')}        Where the athlete stands: profile, screen, baseline, block, and
                what is due next. Read-only. ${c.gray('--json for machine use')}
```

and to `OPTIONS`:

```js
      --json        status: emit JSON instead of the table
```

- [ ] **Step 5: Run the tests**

Run: `npm test`
Expected: PASS — 15 `status` tests, existing suites unchanged.

- [ ] **Step 6: See it for real**

Run: `node bin/calicoach.js status --no-banner`
Expected: the no-workspace form, naming `/calicoach:init`. Exit code 0 — confirm with `echo $?`.

- [ ] **Step 7: Commit**

```bash
git add src/status.js bin/calicoach.js test/status.test.js
git commit -m "feat(status): render the workspace state and expose it on the CLI"
```

---

### Task 3: Plugin manifests

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `test/plugin.test.js`
- Modify: `src/paths.js` (add `pluginManifest`, `marketplaceManifest`)
- Modify: `src/install.js` (`doctor()` validates the manifests)
- Modify: `package.json` (version `0.2.0`, `files[]`)

**Interfaces:**
- Consumes: `readPackageJson()` from `src/paths.js`.
- Produces: `pluginManifest` and `marketplaceManifest` (absolute paths) from `src/paths.js`; `doctor()` gains manifest problems in its existing `{ skills, problems }` return.

- [ ] **Step 1: Write the failing test**

Create `test/plugin.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { pluginManifest, marketplaceManifest, readPackageJson } from '../src/paths.js';

const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

test('the plugin manifest is valid and complete', () => {
  const plugin = read(pluginManifest);

  assert.equal(plugin.name, 'calicoach', 'the command namespace /calicoach:* derives from this');
  assert.ok(plugin.description?.length > 20);
  assert.ok(plugin.author?.name);
  assert.equal(plugin.license, 'GPL-3.0-or-later');
  assert.ok(Array.isArray(plugin.keywords) && plugin.keywords.length > 0);
});

test('the plugin version matches the package version', () => {
  assert.equal(read(pluginManifest).version, readPackageJson().version);
});

test('the marketplace offers calicoach from the repository root', () => {
  const market = read(marketplaceManifest);

  assert.ok(market.name);
  assert.ok(market.owner?.name);
  assert.equal(market.plugins.length, 1);
  assert.equal(market.plugins[0].name, 'calicoach');
  assert.equal(market.plugins[0].source, './');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/plugin.test.js`
Expected: FAIL — `pluginManifest` is not exported.

- [ ] **Step 3: Add the path exports**

In `src/paths.js`, after `templatesSource`:

```js
export const pluginManifest = path.join(packageRoot, '.claude-plugin', 'plugin.json');
export const marketplaceManifest = path.join(packageRoot, '.claude-plugin', 'marketplace.json');
```

- [ ] **Step 4: Write the manifests**

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "calicoach",
  "version": "0.2.0",
  "description": "An expert calisthenics and strength coach: athlete onboarding, movement screening, injury-first program design, exercise cards, session logs and block reviews — all written to Markdown you own.",
  "author": {
    "name": "Daniel Simonini",
    "url": "https://github.com/Fasertio"
  },
  "homepage": "https://github.com/Fasertio/calicoach",
  "repository": "https://github.com/Fasertio/calicoach",
  "license": "GPL-3.0-or-later",
  "keywords": [
    "calisthenics",
    "strength-training",
    "coaching",
    "workout",
    "bodyweight",
    "programming",
    "skills"
  ]
}
```

Create `.claude-plugin/marketplace.json`:

```json
{
  "name": "calicoach",
  "owner": {
    "name": "Daniel Simonini",
    "url": "https://github.com/Fasertio"
  },
  "description": "calicoach — an expert calisthenics and strength coach, as an installable Claude Code plugin.",
  "plugins": [
    {
      "name": "calicoach",
      "source": "./",
      "description": "Athlete onboarding, movement screening, injury-first program design and progression tracking, with thirteen /calicoach:* commands.",
      "category": "productivity",
      "keywords": ["calisthenics", "strength-training", "coaching", "workout"]
    }
  ]
}
```

- [ ] **Step 5: Bump the version and ship the new directories**

In `package.json`, set `"version": "0.2.0"` and extend `files`:

```json
  "files": [
    "bin",
    "src",
    "skills",
    "commands",
    "templates",
    ".claude-plugin",
    "README.md",
    "LICENSE"
  ],
```

- [ ] **Step 6: Run it to verify it passes**

Run: `node --test test/plugin.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 7: Teach `doctor` about the manifests**

In `src/install.js`, add to the imports from `./paths.js`: `pluginManifest`, `marketplaceManifest`, `readPackageJson`.

Add above `doctor()`:

```js
/**
 * The plugin is a second way to install the same skills, and it fails
 * differently: a malformed manifest is invisible until someone tries to
 * install it. `doctor` is where that gets caught, before publication.
 */
function checkManifests() {
  const problems = [];
  for (const [label, file] of [['plugin.json', pluginManifest], ['marketplace.json', marketplaceManifest]]) {
    if (!fs.existsSync(file)) {
      problems.push(`${label}: missing`);
      continue;
    }
    try {
      JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (err) {
      problems.push(`${label}: invalid JSON — ${err.message}`);
    }
  }
  if (problems.length) return problems;

  const plugin = JSON.parse(fs.readFileSync(pluginManifest, 'utf8'));
  const pkg = readPackageJson();
  if (plugin.name !== 'calicoach') {
    problems.push(`plugin.json: name is "${plugin.name}", must be "calicoach" for /calicoach:* commands`);
  }
  if (plugin.version !== pkg.version) {
    problems.push(`plugin.json: version ${plugin.version} does not match package.json ${pkg.version}`);
  }
  return problems;
}
```

In `doctor()`, before `return { skills, problems }`:

```js
  problems.push(...checkManifests());
```

- [ ] **Step 8: Run the whole suite**

Run: `npm test && npm run doctor`
Expected: tests PASS; `doctor` reports all skills valid and exits 0.

- [ ] **Step 9: Commit**

```bash
git add .claude-plugin package.json src/paths.js src/install.js test/plugin.test.js
git commit -m "feat(plugin): ship a plugin manifest and make the repo its own marketplace"
```

---

### Task 4: The thirteen command files

**Files:**
- Create: `commands/init.md`, `status.md`, `onboard.md`, `screen.md`, `test.md`, `program.md`, `log.md`, `review.md`, `pain.md`, `skill.md`, `exercise.md`, `learn.md`, `check.md`
- Create: `test/commands.test.js`
- Modify: `src/paths.js` (add `commandsSource`)

**Interfaces:**
- Consumes: `calicoach status` from Task 2 (each preflight invokes it).
- Produces: `commandsSource` (absolute path to `commands/`) from `src/paths.js`; thirteen command files whose frontmatter carries `description`, `argument-hint` (except `status` and `init`) and `allowed-tools`.

**The preflight line.** Every command except `init` and `status` opens with exactly this, verbatim:

```
!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`
```

- [ ] **Step 1: Write the failing test**

Create `test/commands.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { commandsSource, skillsSource } from '../src/paths.js';
import { parseFrontmatter } from '../src/install.js';

const EXPECTED = [
  'check', 'exercise', 'init', 'learn', 'log', 'onboard', 'pain',
  'program', 'review', 'screen', 'skill', 'status', 'test',
];

const files = () => fs.readdirSync(commandsSource).filter((f) => f.endsWith('.md')).sort();
const body = (name) => fs.readFileSync(path.join(commandsSource, `${name}.md`), 'utf8');

test('every expected command ships, and no others', () => {
  assert.deepEqual(files().map((f) => f.replace(/\.md$/, '')), EXPECTED);
});

test('every command has a description and declares its tools', () => {
  for (const f of files()) {
    const fm = parseFrontmatter(fs.readFileSync(path.join(commandsSource, f), 'utf8'));
    assert.ok(fm, `${f}: no frontmatter`);
    assert.ok(fm.description?.length > 15, `${f}: description too short`);
    assert.ok(fm['allowed-tools']?.includes('Bash'), `${f}: preflight needs Bash`);
  }
});

test('every skill a command names actually exists', () => {
  const known = new Set(fs.readdirSync(skillsSource, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name));

  for (const f of files()) {
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    for (const m of md.matchAll(/`(?:calicoach:)?([a-z]+(?:-[a-z]+)+)`\s+skill/g)) {
      assert.ok(known.has(m[1]), `${f}: names unknown skill "${m[1]}"`);
    }
  }
});

test('every /calicoach: command a command references exists', () => {
  for (const f of files()) {
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    for (const m of md.matchAll(/\/calicoach:([a-z]+)/g)) {
      assert.ok(EXPECTED.includes(m[1]), `${f}: references unknown command /calicoach:${m[1]}`);
    }
  }
});

test('no command exceeds 40 lines', () => {
  for (const f of files()) {
    const lines = fs.readFileSync(path.join(commandsSource, f), 'utf8').trimEnd().split('\n').length;
    assert.ok(lines <= 40, `${f}: ${lines} lines — a command carries intent, not doctrine`);
  }
});

test('every athlete-facing command injects state instead of reading files', () => {
  for (const f of files()) {
    if (['init.md', 'status.md'].includes(f)) continue;
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    assert.match(md, /calicoach\.js" status --no-banner/, `${f}: no preflight`);
    assert.match(md, /\$ARGUMENTS/, `${f}: does not pass the athlete's own words through`);
  }
});

test('the program command states the doctrine gate it could violate', () => {
  const md = body('program');
  assert.match(md, /\/calicoach:onboard/);
  assert.match(md, /\/calicoach:screen/);
});

test('the pain command re-triages red flags before loading advice', () => {
  assert.match(body('pain'), /movement-screening/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/commands.test.js`
Expected: FAIL — `commandsSource` is not exported.

- [ ] **Step 3: Add the path export**

In `src/paths.js`, beside `skillsSource`:

```js
export const commandsSource = path.join(packageRoot, 'commands');
```

- [ ] **Step 4: Write the ten routing commands**

Each of the ten skill-routing commands is exactly this file, with the five bracketed slots filled from the table below. Write all ten.

````markdown
---
description: {{DESCRIPTION}}
argument-hint: {{HINT}}
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `{{SKILL}}` skill (`calicoach:{{SKILL}}` when installed as a
plugin) and {{INTENT}}.

What the athlete said with the command: $ARGUMENTS

{{GATE}}
````

| File | `{{DESCRIPTION}}` | `{{HINT}}` | `{{SKILL}}` | `{{INTENT}}` |
|---|---|---|---|---|
| `onboard.md` | Interview the athlete and write their profile | `[anything you want to tell me]` | `athlete-onboarding` | run the intake interview, then write `calicoach/athlete/profile.md` |
| `screen.md` | Run the movement screen and record the hard constraints | `[area or symptom]` | `movement-screening` | run the screen, triage red flags, then write `calicoach/athlete/screening.md` |
| `test.md` | Measure a baseline the programming can start from | `[specific test]` | `assessment-testing` | run the test battery, then write `calicoach/athlete/baseline.md` |
| `program.md` | Write or revise the training block | `[goal, constraint, or "revise"]` | `program-design` | design the block and write it to `calicoach/programs/` |
| `log.md` | Record a session, or adjust today's before you train | `[how it went]` | `session-logging` | record the session to `calicoach/logs/`, applying the autoregulation rules |
| `review.md` | Review the block and brief the next one | `[block number]` | `progress-review` | analyse the logs against the plan, then write the review to `calicoach/reviews/` |
| `pain.md` | Something hurts — triage it and adjust the load | `<where> [since when]` | `injury-prevention` | work out what to stop, what to keep, and how to load it |
| `skill.md` | Program a calisthenics skill progression | `<planche, front-lever, muscle-up, handstand, flag, pistol>` | `skill-progressions` | pick the right rung, set the volume, and define the advance and regress criteria |
| `exercise.md` | Get the full card for one exercise | `<exercise name>` | `exercise-library` | produce the full exercise card — setup, execution, cues, faults, tempo, risk notes, regressions, progressions, references |
| `learn.md` | Add a book, PDF or method as a source | `<file or method>` | `knowledge-ingestion` | index the source into `calicoach/references/` and state what it changes in the programming |

`{{GATE}}` is empty for every file except these three:

- `program.md`:

```markdown
Doctrine gate: no program without a profile, no loading without a screen.
If the state shows either missing, say so in one sentence and route to
`/calicoach:onboard` or `/calicoach:screen` instead of writing a block.
```

- `pain.md`:

```markdown
Before any loading advice, re-run the red-flag triage from the
`movement-screening` skill. If a red flag is present, stop, refer, and
coach only what is unambiguously safe. If the picture has changed since
the last screen, route to `/calicoach:screen`.
```

- `review.md`:

```markdown
If the state shows no program, there is nothing to review — say so and
route to `/calicoach:program`.
```

- [ ] **Step 5: Write `init.md`**

```markdown
---
description: Create the calicoach workspace in this project and show what is installed
argument-hint: [--global]
allowed-tools: [Bash, Read]
---

Set up calicoach in the current project.

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" workspace --no-banner 2>&1 || echo "bundled CLI unavailable — run: npx calicoach"`

Then report, in three lines:

1. Where the workspace was created, and whether it already existed.
2. That the athlete's data is theirs — Markdown under `calicoach/`, never
   overwritten without being told.
3. The next step: `/calicoach:onboard` to be interviewed.

Arguments: $ARGUMENTS
```

- [ ] **Step 6: Write `status.md`**

```markdown
---
description: Where you are in the coaching loop and what is due next
allowed-tools: [Bash]
---

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

Relay the state above as-is. Do not open any file to expand on it — every
line was computed from the workspace. Add at most one sentence of your own,
naming the command in `next`.

If it reads `NO_WORKSPACE`, say calicoach is installed but this project has
no workspace yet, and route to `/calicoach:init`.
```

- [ ] **Step 7: Write `check.md`**

```markdown
---
description: Validate the program and the documents it was built from
argument-hint: [paths] [--strict]
allowed-tools: [Bash, Read, Edit]
---

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" check --no-banner $ARGUMENTS 2>&1 || true`

The checker output above is deterministic and complete for what it covers:
volume-budget arithmetic, push:pull ratio, structural balance, missing cards,
missing progression triggers, session time, dates, citation keys, and every
exercise against the active constraints.

Report what it found. For each error, name the fix in one line. Do not edit
any file unless the athlete asks — and never "fix" a constraint violation by
weakening the constraint.

If it reports nothing to check, route to `/calicoach:init`.
```

- [ ] **Step 8: Run it to verify it passes**

Run: `node --test test/commands.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 9: Commit**

```bash
git add commands src/paths.js test/commands.test.js
git commit -m "feat(commands): thirteen thin routers over the coaching loop"
```

---

### Task 5: Installing commands through the CLI

**Files:**
- Create: `src/commands.js`
- Modify: `src/paths.js` (add `resolveCommandsDir`)
- Modify: `bin/calicoach.js` (install commands in `init`/`skills`; `uninstall` removes them)
- Modify: `src/install.js` (`doctor()` reports the command count)
- Modify: `test/commands.test.js` (append install tests)

**Interfaces:**
- Consumes: `commandsSource` from Task 4; `resolveTarget({ scope, dir })` from `src/paths.js`.
- Produces:
  - `resolveCommandsDir({ scope, dir }) -> string` — `<base>/.claude/commands/calicoach`
  - `installCommands({ scope, dir, force }) -> { written: string[], skipped: string[], dir: string }`
  - `uninstallCommands({ scope, dir }) -> { removed: string[] }`
  - `discoverCommands() -> [{ id, file, description }]`

- [ ] **Step 1: Write the failing test**

Append to `test/commands.test.js`:

```js
import os from 'node:os';
import { installCommands, uninstallCommands, discoverCommands } from '../src/commands.js';
import { resolveCommandsDir } from '../src/paths.js';

const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-cmd-'));

test('discoverCommands reads the id and description of each command', () => {
  const found = discoverCommands();
  assert.equal(found.length, EXPECTED.length);
  assert.ok(found.every((cmd) => cmd.description.length > 15));
  assert.ok(found.some((cmd) => cmd.id === 'program'));
});

test('installing writes every command into .claude/commands/calicoach', () => {
  const dir = tmpdir();
  const report = installCommands({ dir });
  const dest = resolveCommandsDir({ dir });

  assert.equal(report.written.length, EXPECTED.length);
  assert.deepEqual(
    fs.readdirSync(dest).sort(),
    EXPECTED.map((id) => `${id}.md`)
  );
});

test('installed commands point at a CLI that exists', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const md = fs.readFileSync(path.join(resolveCommandsDir({ dir }), 'program.md'), 'utf8');

  assert.doesNotMatch(md, /CLAUDE_PLUGIN_ROOT/, 'the token must be resolved at copy time');
  const cliPath = /node "([^"]+calicoach\.js)"/.exec(md)?.[1];
  assert.ok(cliPath, 'the preflight must still invoke the CLI');
  assert.ok(fs.existsSync(cliPath), `rewritten CLI path does not exist: ${cliPath}`);
});

test('installing twice does not clobber without --force', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const second = installCommands({ dir });

  assert.equal(second.written.length, 0);
  assert.equal(second.skipped.length, EXPECTED.length);
});

test('uninstall removes the commands it installed', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const { removed } = uninstallCommands({ dir });

  assert.equal(removed.length, EXPECTED.length);
  assert.equal(fs.existsSync(resolveCommandsDir({ dir })), false);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/commands.test.js`
Expected: FAIL — `Cannot find module '../src/commands.js'`.

- [ ] **Step 3: Add the path resolver**

In `src/paths.js`, after `resolveTarget`:

```js
/**
 * Where slash commands are written. Namespaced by a `calicoach/` subdirectory
 * so `/calicoach:<name>` resolves the same way it does under a plugin install.
 */
export function resolveCommandsDir({ scope = 'project', dir } = {}) {
  return path.join(resolveTarget({ scope, dir }).claudeDir, 'commands', 'calicoach');
}
```

- [ ] **Step 4: Implement `src/commands.js`**

```js
/**
 * Installing the slash commands for a non-plugin install.
 *
 * The command files are written once, for the plugin, where Claude Code
 * defines `${CLAUDE_PLUGIN_ROOT}`. A CLI install has no such variable, so the
 * token is resolved to this package's own `bin/calicoach.js` as the file is
 * copied. One source, two destinations, no second copy to keep in step.
 */

import fs from 'node:fs';
import path from 'node:path';

import { commandsSource, packageRoot, resolveCommandsDir } from './paths.js';
import { parseFrontmatter } from './install.js';
import { c, add, skip } from './ui.js';

const PLUGIN_ROOT_TOKEN = /\$\{CLAUDE_PLUGIN_ROOT\}/g;

/** Every command shipped with the package. */
export function discoverCommands() {
  if (!fs.existsSync(commandsSource)) return [];
  return fs
    .readdirSync(commandsSource)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const file = path.join(commandsSource, f);
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf8')) || {};
      return { id: f.replace(/\.md$/, ''), file, description: fm.description || '' };
    });
}

export function installCommands({ scope = 'project', dir, force = false } = {}) {
  const dest = resolveCommandsDir({ scope, dir });
  const report = { written: [], skipped: [], dir: dest };

  fs.mkdirSync(dest, { recursive: true });
  for (const cmd of discoverCommands()) {
    const target = path.join(dest, `${cmd.id}.md`);
    if (fs.existsSync(target) && !force) {
      report.skipped.push(target);
      skip(`/calicoach:${cmd.id} (exists, use --force to overwrite)`);
      continue;
    }
    const body = fs
      .readFileSync(cmd.file, 'utf8')
      .replace(PLUGIN_ROOT_TOKEN, packageRoot.replace(/\\/g, '/'));
    fs.writeFileSync(target, body);
    report.written.push(target);
    add(`${c.bold(`/calicoach:${cmd.id}`)}`);
  }
  return report;
}

export function uninstallCommands({ scope = 'project', dir } = {}) {
  const dest = resolveCommandsDir({ scope, dir });
  const removed = [];
  if (!fs.existsSync(dest)) return { removed };

  for (const cmd of discoverCommands()) {
    const target = path.join(dest, `${cmd.id}.md`);
    if (fs.existsSync(target)) {
      fs.rmSync(target);
      removed.push(cmd.id);
    }
  }
  if (fs.readdirSync(dest).length === 0) fs.rmSync(dest, { recursive: true });
  return { removed };
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `node --test test/commands.test.js`
Expected: PASS, 13 tests.

- [ ] **Step 6: Wire the CLI**

In `bin/calicoach.js`, add:

```js
import { installCommands, uninstallCommands, discoverCommands } from '../src/commands.js';
```

Add a helper beside `installTo`:

```js
function installCommandsTo(opts) {
  step(`Installing commands into ${c.gray(resolveCommandsDir(opts))}`);
  return installCommands(opts);
}
```

(and add `resolveCommandsDir` to the `../src/paths.js` import).

In the `init` and `skills` cases, after `installTo(...)`:

```js
      const commands = installCommandsTo({ scope, dir, force });
```

Widen `finish` to take a third report — `function finish(skillReport, wsReport, cmdReport)` — update both existing call sites to pass `null` for it where there is none, and report it there:

```js
  if (cmdReport) {
    ok(`${cmdReport.written.length + cmdReport.skipped.length} commands ready ${c.gray('(type /calicoach: to see them)')}`);
  }
```

In the `uninstall` case, after `uninstallSkills`:

```js
      const { removed: cmds } = uninstallCommands({ scope, dir });
      if (cmds.length) ok(`removed ${cmds.length} command(s)`);
```

In the `list` case, after the skill table:

```js
      log(`\n${c.bold('COMMANDS')}`);
      for (const cmd of discoverCommands()) {
        log(`  ${c.cyan(`/calicoach:${cmd.id}`.padEnd(22))}  ${c.gray(cmd.description)}`);
      }
```

Update the `GETTING STARTED` block in `help()`:

```js
${c.bold('GETTING STARTED')}
  ${c.gray('#')} as a Claude Code plugin
  ${c.gray('>')} /plugin marketplace add Fasertio/calicoach
  ${c.gray('>')} /plugin install calicoach@calicoach
  ${c.gray('>')} /calicoach:init

  ${c.gray('#')} or from the terminal
  ${c.gray('$')} npx calicoach
  ${c.gray('>')} ${c.bold('/calicoach:onboard')}
```

- [ ] **Step 7: Report commands in `doctor`**

In `src/install.js`, import `discoverCommands` from `./commands.js` and, inside `doctor()`, before the manifest check:

```js
  for (const cmd of discoverCommands()) {
    if (!cmd.description) problems.push(`commands/${cmd.id}.md: frontmatter has no "description"`);
  }
```

Return the commands too, so the CLI can print the count: change the return to `{ skills, commands: discoverCommands(), problems }`, and in `bin/calicoach.js`'s `doctor` case add after the skills line:

```js
      ok(`${commands.length} commands bundled`);
```

destructuring `commands` alongside `skills`.

> Note: `src/commands.js` imports `parseFrontmatter` from `src/install.js` and `src/install.js` imports `discoverCommands` from `src/commands.js`. ESM handles this cycle because both are used at call time, not at module evaluation. If Node reports a cycle warning, move `parseFrontmatter` into `src/paths.js` and import it from there in both.

- [ ] **Step 8: Run the whole suite and the CLI**

Run: `npm test && npm run doctor && node bin/calicoach.js list`
Expected: tests PASS; `doctor` reports 14 skills, 13 commands, no problems; `list` prints both tables.

- [ ] **Step 9: Verify a real install end to end**

```bash
rm -rf /tmp/cc-smoke && mkdir -p /tmp/cc-smoke
node bin/calicoach.js init --dir /tmp/cc-smoke
ls /tmp/cc-smoke/.claude/commands/calicoach
node bin/calicoach.js status --dir /tmp/cc-smoke --no-banner
```

Expected: thirteen `.md` files; `status` reports a workspace with no profile and routes to `/calicoach:onboard`.

- [ ] **Step 10: Commit**

```bash
git add src/commands.js src/paths.js src/install.js bin/calicoach.js test/commands.test.js
git commit -m "feat(commands): install the command surface alongside the skills"
```

---

### Task 6: Agent export

**Files:**
- Create: `src/agents.js`
- Create: `test/agents.test.js`
- Modify: `bin/calicoach.js` (`--agent <id>`)

**Interfaces:**
- Consumes: `discoverSkills()` from `src/install.js`; `skillsSource` from `src/paths.js`.
- Produces:
  - `AGENT_IDS = ['claude', 'codex', 'cursor', 'generic']`
  - `renderAgentsMd(skills) -> string` — the block between the two markers, markers included
  - `exportForAgent({ dir, agent, force }) -> { skillsDir, agentsFile, written: string[] }`

- [ ] **Step 1: Write the failing test**

Create `test/agents.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { AGENT_IDS, renderAgentsMd, exportForAgent } from '../src/agents.js';
import { discoverSkills } from '../src/install.js';

const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-agent-'));

test('the rendered block names every skill and is delimited', () => {
  const md = renderAgentsMd(discoverSkills());

  assert.match(md, /<!-- calicoach:start -->/);
  assert.match(md, /<!-- calicoach:end -->/);
  for (const s of discoverSkills()) assert.match(md, new RegExp(s.id));
  assert.match(md, /calisthenics-coach/);
});

test('exporting copies the skills and writes AGENTS.md', () => {
  const dir = tmpdir();
  const report = exportForAgent({ dir, agent: 'generic' });

  assert.ok(fs.existsSync(path.join(dir, '.agent', 'skills', 'program-design', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(dir, 'AGENTS.md')));
  assert.ok(report.written.length > 0);
});

test('an existing AGENTS.md keeps its own content outside the markers', () => {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# House rules\n\nAlways run the linter.\n');
  exportForAgent({ dir, agent: 'generic' });
  const md = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');

  assert.match(md, /Always run the linter/);
  assert.match(md, /calicoach:start/);
});

test('re-exporting replaces only the calicoach block', () => {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# House rules\n');
  exportForAgent({ dir, agent: 'generic' });
  exportForAgent({ dir, agent: 'generic' });
  const md = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');

  assert.equal(md.match(/calicoach:start/g).length, 1);
  assert.match(md, /House rules/);
});

test('every advertised agent id is accepted', () => {
  for (const agent of AGENT_IDS) {
    const dir = tmpdir();
    assert.doesNotThrow(() => exportForAgent({ dir, agent }));
  }
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node --test test/agents.test.js`
Expected: FAIL — `Cannot find module '../src/agents.js'`.

- [ ] **Step 3: Implement `src/agents.js`**

```js
/**
 * Exporting the skills to an agent that is not Claude Code.
 *
 * Other agents have no plugin format and no slash commands, but they do read a
 * project's `AGENTS.md`. So the export is the skills on disk plus an index
 * generated from those same skills — never hand-written, so it cannot drift
 * from what it describes.
 */

import fs from 'node:fs';
import path from 'node:path';

import { skillsSource } from './paths.js';
import { discoverSkills } from './install.js';
import { add } from './ui.js';

export const AGENT_IDS = ['claude', 'codex', 'cursor', 'generic'];

const START = '<!-- calicoach:start -->';
const END = '<!-- calicoach:end -->';

/** The generated block, markers included. */
export function renderAgentsMd(skills) {
  const rows = skills
    .map((s) => `| \`${s.id}\` | ${s.description.replace(/\|/g, '\\|')} |`)
    .join('\n');

  return `${START}
## calicoach — calisthenics and strength coaching

This project carries a coaching framework as agent skills, in
\`.agent/skills/\`. Read \`.agent/skills/calisthenics-coach/SKILL.md\` first:
it holds the doctrine, the workspace contract and the routing table.

**Non-negotiable, in this order:** no program without a profile; no loading
without a screen; injury avoidance beats stimulus; never diagnose; every
prescribed exercise ships as a full card; everything is written to disk under
\`calicoach/\`, not left in the conversation.

Read \`calicoach/athlete/profile.md\`, \`calicoach/athlete/screening.md\` and the
newest file in \`calicoach/programs/\` at the start of every coaching turn.
They are the source of truth; the conversation is not.

Validate any program you write with \`npx calicoach check\`. A program is not
finished until it passes.

| Skill | Use it for |
|---|---|
${rows}
${END}`;
}

/** Replace the generated block in an existing file, or append it. */
function spliceBlock(existing, block) {
  if (!existing) return `${block}\n`;
  const start = existing.indexOf(START);
  const end = existing.indexOf(END);
  if (start !== -1 && end !== -1) {
    return `${existing.slice(0, start)}${block}${existing.slice(end + END.length)}`;
  }
  return `${existing.trimEnd()}\n\n${block}\n`;
}

function copyDir(src, dest, written) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, written);
    else {
      fs.copyFileSync(s, d);
      written.push(d);
    }
  }
}

export function exportForAgent({ dir, agent = 'generic' } = {}) {
  if (!AGENT_IDS.includes(agent)) {
    throw new Error(`unknown agent "${agent}" — expected one of ${AGENT_IDS.join(', ')}`);
  }
  const base = path.resolve(dir || process.cwd());
  const skillsDir = path.join(base, '.agent', 'skills');
  const agentsFile = path.join(base, 'AGENTS.md');
  const written = [];

  copyDir(skillsSource, skillsDir, written);
  add(`.agent/skills (${written.length} files)`);

  const existing = fs.existsSync(agentsFile) ? fs.readFileSync(agentsFile, 'utf8') : '';
  fs.writeFileSync(agentsFile, spliceBlock(existing, renderAgentsMd(discoverSkills())));
  written.push(agentsFile);
  add('AGENTS.md');

  return { skillsDir, agentsFile, written };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `node --test test/agents.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Wire `--agent` into the CLI**

In `bin/calicoach.js`, import `{ exportForAgent, AGENT_IDS }` from `../src/agents.js`, and accept the flag's value by adding `'agent'` to the list in `parseArgs`:

```js
      else if (argv[i + 1] && !argv[i + 1].startsWith('-') && ['dir', 'only', 'agent'].includes(k))
```

In `main()`, after `const only = ...`:

```js
  const agent = typeof args.flags.agent === 'string' ? args.flags.agent : 'claude';
  if (!AGENT_IDS.includes(agent)) {
    fail(`unknown agent "${agent}" — expected one of ${AGENT_IDS.join(', ')}`);
    process.exitCode = 1;
    return;
  }
```

In the `init` case, branch at the top:

```js
    case 'init': {
      if (agent !== 'claude') {
        step(`Exporting skills for ${agent}`);
        exportForAgent({ dir, agent });
        step('Athlete workspace');
        const wsReport = scaffoldWorkspace({ dir, force });
        finish(null, wsReport, null);
        break;
      }
      // ... existing Claude path
```

Add to `OPTIONS` in `help()`:

```js
      --agent <id>  init: target agent — claude (default), codex, cursor, generic.
                    Anything but claude exports to .agent/skills and AGENTS.md
```

- [ ] **Step 6: Verify by hand**

```bash
rm -rf /tmp/cc-agent && mkdir -p /tmp/cc-agent
node bin/calicoach.js init --dir /tmp/cc-agent --agent generic
head -30 /tmp/cc-agent/AGENTS.md
```

Expected: the generated block with all fourteen skills in the table.

- [ ] **Step 7: Run the whole suite**

Run: `npm test`
Expected: PASS across all suites.

- [ ] **Step 8: Commit**

```bash
git add src/agents.js bin/calicoach.js test/agents.test.js
git commit -m "feat(agents): export the skills and a generated AGENTS.md for non-Claude agents"
```

---

### Task 7: Documentation and the context budget

**Files:**
- Modify: `README.md`
- Modify: `docs/context-budget.md`
- Modify: `scripts/context-budget.js` (count the commands)

**Interfaces:**
- Consumes: `discoverCommands()` from Task 5.
- Produces: no code interface; this task makes the two new surfaces discoverable and keeps the budget doc honest.

- [ ] **Step 1: Lead the README with the plugin install**

Replace the opening code block and the first paragraph after the title with:

````markdown
```
/plugin marketplace add Fasertio/calicoach
/plugin install calicoach@calicoach
/calicoach:init
```

Then `/calicoach:onboard` and the coach interviews you.

Prefer the terminal, or using another agent? `npx calicoach` still installs
everything into the current project.
````

- [ ] **Step 2: Add a commands section to the README**

Insert after "The skills":

````markdown
## The commands

Type `/calicoach:` in Claude Code to see them all.

| Command | What it does |
|---|---|
| `/calicoach:init` | create the workspace in this project |
| `/calicoach:status` | where you are in the loop and what is due |
| `/calicoach:onboard` | the intake interview and your profile |
| `/calicoach:screen` | the movement screen and your hard constraints |
| `/calicoach:test` | measure a baseline |
| `/calicoach:program` | write or revise the block |
| `/calicoach:log` | record a session, or adjust today's |
| `/calicoach:review` | end-of-block review and the next brief |
| `/calicoach:pain` | something hurts — triage and adjust |
| `/calicoach:skill` | planche, levers, muscle-up, handstand, flag |
| `/calicoach:exercise` | the full card for one exercise |
| `/calicoach:learn` | add a book, PDF or method as a source |
| `/calicoach:check` | validate the program and what it was built from |

Each command is a router: it establishes where you stand with one call to
`calicoach status`, then hands off to the skill that does the work. The
doctrine lives in the skills, once.
````

- [ ] **Step 3: Document the other-agent path**

In the README's Install section, add:

````markdown
Using Codex, Cursor, or another agent that reads `AGENTS.md`?

```bash
npx calicoach init --agent generic
```

This writes the skills to `.agent/skills/` and generates an `AGENTS.md`
indexing them. Slash commands are Claude Code only; `AGENTS.md` describes
the equivalents in prose.
````

- [ ] **Step 4: Count commands in the budget script**

In `scripts/context-budget.js`, import `discoverCommands` from `../src/commands.js` and print a line with the number of commands and the total size of their frontmatter descriptions.

Run: `npm run budget`
Expected: the table, plus the command line. Note the description total — you need it for the next step.

- [ ] **Step 5: Update the budget document**

In `docs/context-budget.md`, add a row to "The footprint" table and a short section after it:

````markdown
## The command layer

Thirteen `/calicoach:*` commands cost nothing when they are not used: Claude
Code lists their names and descriptions when the athlete types `/`, and loads
a body only on invocation. They are not part of the always-resident figure
above, which is unchanged.

They are a net saving. Every command opens by running `calicoach status`,
whose output — a few dozen tokens — replaces the three to four thousand that
opening the profile, the screen, the baseline and the newest program used to
cost before the turn could even begin.

| Establishing where the athlete stands | Tokens |
|---|---|
| reading profile, screen, baseline and program | ~3,500 |
| one `calicoach status` preflight | ~40 |
````

- [ ] **Step 6: Verify every documented command exists**

Run: `node bin/calicoach.js list`
Expected: the thirteen commands in the README table appear, spelled identically.

- [ ] **Step 7: Full verification**

Run: `npm test && npm run doctor && npm run budget`
Expected: all tests pass, `doctor` reports 14 skills and 13 commands with no problems, the budget table regenerates.

- [ ] **Step 8: Commit**

```bash
git add README.md docs/context-budget.md scripts/context-budget.js
git commit -m "docs: lead with the plugin install and document the command surface"
```

---

## Done when

- `npm test` passes, including the four new suites.
- `npm run doctor` reports 14 skills, 13 commands, and no problems.
- `node bin/calicoach.js init --dir <tmp>` produces `.claude/skills/` (14), `.claude/commands/calicoach/` (13), and `calicoach/`.
- `node bin/calicoach.js init --dir <tmp> --agent generic` produces `.agent/skills/` and an `AGENTS.md` whose table lists all fourteen skills.
- `node bin/calicoach.js status` exits 0 in an empty directory and names `/calicoach:init`.
- No file under `skills/` differs from `main`: `git diff --stat main -- skills/` is empty.
