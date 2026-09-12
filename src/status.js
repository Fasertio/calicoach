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
import { section } from './check.js';
import { isUntouchedTemplate, STALE_AFTER } from './check-docs.js';
import { firstDate, daysBetween, parseConstraints } from './constraints.js';

const todayISO = () => new Date().toISOString().slice(0, 10);

const ABSENT = { present: false, date: null, ageDays: null, stale: false };

/** The parsed document without its body — the body is an implementation detail. */
const omitMd = ({ md, ...rest }) => rest;

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

/**
 * The screen carries its own expiry — `Next screen due` — rather than a fixed
 * threshold, because how fast a screen ages depends on what it found.
 */
function readScreening(file, today) {
  const doc = readDoc(file, today, null);
  if (!doc.present) return { ...ABSENT, constraints: 0, dueDate: null };

  const constraints = parseConstraints(section(doc.md, /^#+\s*Active constraints/im)).length;
  const dueDate = firstDate(section(doc.md, /^#+\s*Next screen due/im));
  return {
    ...omitMd(doc),
    constraints,
    dueDate,
    stale: Boolean(dueDate && daysBetween(dueDate, today) > 0),
  };
}

/** Workspace markdown files, newest filename last, templates excluded. */
function dataFiles(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'))
    .sort()
    .map((f) => path.join(folder, f));
}

/** Sessions completed against the current block. */
function readLogs(folder, today) {
  const files = dataFiles(folder);
  const last = files[files.length - 1];
  if (!last) return { count: 0, last: null, ageDays: null, week: null, day: null };

  const name = path.basename(last);
  const wd = /_w(\d+)d(\d+)\.md$/i.exec(name);
  // The date is the filename's prefix, not "the first date in it": an ISO date
  // butted against an underscore has no word boundary, so `firstDate` misses it.
  const date = firstDate(/^(\d{4}-\d{2}-\d{2})/.exec(name)?.[1] ?? '');
  return {
    count: files.length,
    last: date,
    ageDays: date ? daysBetween(date, today) : null,
    week: wd ? Number(wd[1]) : null,
    day: wd ? Number(wd[2]) : null,
  };
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
      present: false,
      file: null,
      block: null,
      focus: null,
      start: null,
      weeks: null,
      reviewDue: null,
      reviewOverdue: false,
      week: null,
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

export function status({ dir, today = todayISO() } = {}) {
  const ws = resolveWorkspace(dir);
  const exists = fs.existsSync(ws.root);

  const profile = readDoc(path.join(ws.athlete, 'profile.md'), today, STALE_AFTER.profile);
  const baseline = readDoc(path.join(ws.athlete, 'baseline.md'), today, STALE_AFTER.baseline);
  const screening = readScreening(path.join(ws.athlete, 'screening.md'), today);
  const logs = readLogs(ws.logs, today);
  const program = readProgram(ws.programs, today, logs);

  const state = {
    today,
    workspace: { root: ws.root, exists },
    profile: {
      ...omitMd(profile),
      athlete: profile.present ? athleteName(profile.md) : null,
    },
    screening,
    baseline: omitMd(baseline),
    program,
    logs,
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
  if (!s.profile.present) {
    return { command: '/calicoach:onboard', message: 'no profile yet — run /calicoach:onboard' };
  }
  if (!s.screening.present) {
    return { command: '/calicoach:screen', message: 'not screened yet — run /calicoach:screen' };
  }
  if (!s.baseline.present) {
    return { command: '/calicoach:test', message: 'no baseline yet — run /calicoach:test' };
  }
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
}
