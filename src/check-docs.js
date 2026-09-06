/**
 * Deterministic validation of the athlete's living documents.
 *
 * `check.js` validates the program. This module validates everything the
 * program is derived from — the profile, the screen, the baseline and the
 * review — plus the thing none of them can see on their own: whether they have
 * gone stale. A program built on a six-month-old profile and an overdue screen
 * is coherent and wrong, and only a date comparison catches that.
 */

import { col, parseTables, plain, section } from './check.js';
import {
  daysBetween,
  firstDate,
  isRealDate,
  parseConstraints,
  validateConstraints,
} from './constraints.js';

/** Staleness thresholds, in days, each traceable to a rule in the skills. */
export const STALE_AFTER = {
  /** question-bank.md: re-profile when more than 6 months have passed. */
  profile: 183,
  /** assessment-testing: full battery every 12–16 weeks. */
  baseline: 112,
};

const REQUIRED = {
  profile: [
    [/^#+\s*\d*\.?\s*Basics/im, 'Basics'],
    [/^#+\s*\d*\.?\s*Goals/im, 'Goals'],
    [/^#+\s*\d*\.?\s*Current capacity/im, 'Current capacity'],
    [/^#+\s*\d*\.?\s*Health and injury/im, 'Health and injury'],
    [/^#+\s*\d*\.?\s*Logistics/im, 'Logistics'],
    [/^#+\s*\d*\.?\s*Lifestyle/im, 'Lifestyle'],
    [/^#+\s*\d*\.?\s*Preferences/im, 'Preferences'],
    [/^#+\s*\d*\.?\s*Open questions/im, 'Open questions'],
    [/^#+\s*\d*\.?\s*Coach.?s read/im, "Coach's read"],
    [/^#+\s*\d*\.?\s*Changelog/im, 'Changelog'],
  ],
  screening: [
    [/^#+\s*Red flag triage/im, 'Red flag triage'],
    [/^#+\s*Screen results/im, 'Screen results'],
    [/^#+\s*Active constraints/im, 'Active constraints'],
    [/^#+\s*Next screen due/im, 'Next screen due'],
  ],
  baseline: [
    [/^#+\s*Conditions/im, 'Conditions'],
    [/^#+\s*Not tested/im, 'Not tested'],
    [/^#+\s*Level read/im, 'Level read'],
  ],
  review: [
    [/^#+\s*\d*\.?\s*Adherence/im, 'Adherence'],
    [/^#+\s*\d*\.?\s*Markers retested/im, 'Markers retested'],
    [/^#+\s*\d*\.?\s*Cause analysis/im, 'Cause analysis'],
    [/^#+\s*\d*\.?\s*What the body said/im, 'What the body said'],
    [/^#+\s*\d*\.?\s*MRV signal/im, 'MRV signal'],
    [/^#+\s*\d*\.?\s*Next block brief/im, 'Next block brief'],
    [/^#+\s*\d*\.?\s*What to say to the athlete/im, 'What to say to the athlete'],
  ],
};

/**
 * Which validator a file belongs to, from its place in the workspace.
 * Returns null for anything outside it — the checker never guesses.
 */
export function detectKind(filePath) {
  const p = String(filePath).replace(/\\/g, '/').toLowerCase();
  if (/\/athlete\/profile\.md$|^profile\.md$/.test(p)) return 'profile';
  if (/\/athlete\/screening\.md$|^screening\.md$/.test(p)) return 'screening';
  if (/\/athlete\/baseline\.md$|^baseline\.md$/.test(p)) return 'baseline';
  if (/\/reviews\/[^/]+\.md$/.test(p)) return 'review';
  if (/\/programs\/[^/]+\.md$/.test(p)) return 'program';
  if (/\/logs\/[^/]+\.md$/.test(p)) return 'log';
  return null;
}

/** Which skill fills each document in, for the "not started yet" message. */
const STARTED_BY = {
  profile: 'athlete-onboarding',
  screening: 'movement-screening',
  baseline: 'assessment-testing',
  review: 'progress-review',
};

/**
 * Has this document been started at all?
 *
 * The scaffolded templates say so themselves in a `Status:` line; the fallback
 * is structural — a form whose tables carry no values anywhere is a form nobody
 * has filled in. Either way it is a pending task, not a broken document.
 */
export function isUntouchedTemplate(md) {
  const text = String(md);
  if (/EMPTY TEMPLATE/i.test(text)) return true;

  let rows = 0;
  let filled = 0;
  for (const line of text.split('\n')) {
    if (!/^\s*\|/.test(line) || /^\s*\|[\s:|-]+\|?\s*$/.test(line)) continue;
    const cells = line.trim().replace(/^\||\|$/g, '').split('|').slice(1);
    if (!cells.length) continue;
    rows += 1;
    if (cells.some((cell) => plain(cell))) filled += 1;
  }
  return rows >= 5 && filled === 0;
}

/** The skill a document's own status line names, when it names one. */
const namedSkill = (md) => /run\s+`?([a-z-]+)`?\s+to fill/i.exec(String(md))?.[1] ?? null;

const todayISO = () => new Date().toISOString().slice(0, 10);

/**
 * Validate one athlete document.
 * `today` is injected so staleness is testable and reproducible.
 */
export function checkDoc(md, { path: filePath = 'document.md', kind, today = todayISO() } = {}) {
  const resolved = kind ?? detectKind(filePath);
  const findings = [];
  const add = (level, rule, message, line) =>
    findings.push({ level, rule, message, line, file: filePath });
  const error = (rule, message, line) => add('error', rule, message, line);
  const warn = (rule, message, line) => add('warn', rule, message, line);

  if (!resolved || resolved === 'program' || resolved === 'log') {
    return { findings, stats: { kind: resolved } };
  }

  // A scaffolded file the athlete has not filled in is not a broken document.
  // Say what it is waiting for, and stop — the rest would be noise.
  if (isUntouchedTemplate(md)) {
    warn(
      'pending',
      `still the blank template — run ${namedSkill(md) ?? STARTED_BY[resolved]} to fill it in`
    );
    return { findings, stats: { kind: resolved, pending: true } };
  }

  for (const [re, name] of REQUIRED[resolved] ?? []) {
    if (!re.test(md)) error('structure', `missing required section: ${name}`);
  }
  checkPlaceholders(md, error);

  const tables = parseTables(md);
  const ctx = { md, tables, today, error, warn };

  if (resolved === 'profile') checkProfile(ctx);
  if (resolved === 'screening') checkScreening(ctx);
  if (resolved === 'baseline') checkBaseline(ctx);
  if (resolved === 'review') checkReview(ctx);

  return { findings, stats: { kind: resolved } };
}

// ---------------------------------------------------------------------------

function checkPlaceholders(md, error) {
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(<!--|>)/.test(lines[i])) continue;
    if (/YYYY-MM-DD/.test(lines[i])) {
      error('placeholder', 'unfilled date placeholder (YYYY-MM-DD)', i + 1);
      break;
    }
  }
}

/** Rows of the first table under a heading, with its header row. */
function tableUnder(tables, headingRe) {
  return tables.find((t) => headingRe.test(t.h1) || headingRe.test(t.h2) || headingRe.test(t.h3));
}

// ---------------------------------------------------------------------------
// profile
// ---------------------------------------------------------------------------

function checkProfile({ md, tables, today, error, warn }) {
  const updated = firstDate(/last updated:\s*([^\n·]*)/i.exec(md)?.[1] ?? '');
  if (!updated) {
    warn('dates', 'no "Last updated: YYYY-MM-DD" line — the profile has no age');
  } else {
    const age = daysBetween(updated, today);
    if (age > STALE_AFTER.profile) {
      warn(
        'stale',
        `profile is ${age} days old — re-interview before the next block (question-bank: re-profile past 6 months)`
      );
    }
  }

  // A mandatory field is answered or explicitly "unknown"; never blank.
  for (const heading of [/Basics/i, /Logistics/i, /Lifestyle/i]) {
    const t = tableUnder(tables, heading);
    if (!t) continue;
    const iField = col(t.header, 'field');
    const iValue = col(t.header, 'value');
    if (iField === -1 || iValue === -1) continue;
    for (const r of t.rows) {
      const field = plain(r.cells[iField] ?? '');
      if (!field) continue;
      if (!plain(r.cells[iValue] ?? ''))
        error('completeness', `"${field}" is blank — write the value or "unknown"`, r.line);
    }
  }

  // Every capacity number says whether it was measured or claimed.
  const cap = tableUnder(tables, /Current capacity/i);
  if (cap) {
    const iName = col(cap.header, 'movement');
    const iValue = col(cap.header, 'value');
    const iSource = col(cap.header, 'source');
    for (const r of cap.rows) {
      const name = plain(r.cells[iName] ?? '');
      if (!name || !plain(r.cells[iValue] ?? '')) continue;
      if (iSource === -1 || !plain(r.cells[iSource] ?? '')) {
        error(
          'provenance',
          `"${name}" has a value with no source — tag it "self-reported" or "tested YYYY-MM-DD"`,
          r.line
        );
      }
    }
  }

  const goals = tableUnder(tables, /Goals/i);
  if (goals) {
    const iGoal = col(goals.header, 'goal');
    const iDate = col(goals.header, 'target date');
    for (const r of goals.rows) {
      const goal = plain(r.cells[iGoal] ?? '');
      if (!goal) continue;
      if (iDate !== -1 && !isRealDate(plain(r.cells[iDate] ?? '')))
        warn('dates', `goal "${goal}" has no real target date`, r.line);
    }
  }
}

// ---------------------------------------------------------------------------
// screening
// ---------------------------------------------------------------------------

function checkScreening({ md, tables, today, error, warn }) {
  const block = section(md, /^#+\s*Active constraints/im);
  const constraints = parseConstraints(block);
  validateConstraints(constraints, (level, message) => (level === 'error' ? error : warn)('constraints', message));

  for (const c of constraints) {
    if (c.retest && daysBetween(c.retest, today) > 0) {
      warn(
        'stale',
        `[${c.id}] re-test was due ${c.retest} — it is overdue by ${daysBetween(c.retest, today)} days`
      );
    }
  }

  const due = firstDate(section(md, /^#+\s*Next screen due/im));
  if (!due) warn('dates', '"Next screen due" has no real date');
  else if (daysBetween(due, today) > 0)
    warn('stale', `the next screen was due ${due} — re-screen is overdue by ${daysBetween(due, today)} days`);

  // Nothing gets screened and then ignored.
  const acted = `${block}\n${section(md, /^#+\s*Priorities from this screen/im)}`.toLowerCase();
  const results = tableUnder(tables, /Screen results/i);
  if (results) {
    const iId = col(results.header, '#');
    const iItem = col(results.header, 'item');
    const iResult = col(results.header, 'result');
    if (iResult !== -1) {
      for (const r of results.rows) {
        const verdict = plain(r.cells[iResult] ?? '').toLowerCase();
        if (!/limited|symptomatic/.test(verdict)) continue;
        const id = iId === -1 ? '' : plain(r.cells[iId] ?? '');
        const item = iItem === -1 ? '' : plain(r.cells[iItem] ?? '');
        const named =
          (id && acted.includes(id.toLowerCase())) || (item && acted.includes(item.toLowerCase()));
        if (!named) {
          error(
            'completeness',
            `screen item ${id || item} came back ${verdict} but appears in neither Active constraints nor Priorities`,
            r.line
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// baseline
// ---------------------------------------------------------------------------

function checkBaseline({ md, tables, today, error, warn }) {
  // The newest dated column is the age of the measurements.
  const dates = [...md.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)].map((m) => m[0]).filter(isRealDate);
  const newest = dates.sort().pop();
  if (!newest) {
    warn('dates', 'no dated column — a baseline without a date cannot be compared to anything');
  } else {
    const age = daysBetween(newest, today);
    if (age > STALE_AFTER.baseline) {
      warn(
        'stale',
        `baseline is ${Math.round(age / 7)} weeks old (newest column ${newest}) — retest the full battery every 12–16 weeks`
      );
    }
  }

  // A test is either done, or blocked by a constraint that is named.
  const skipped = tableUnder(tables, /Not tested/i);
  if (skipped) {
    const iTest = col(skipped.header, 'test');
    const iReason = col(skipped.header, 'reason');
    for (const r of skipped.rows) {
      const name = plain(r.cells[iTest] ?? '');
      if (!name) continue;
      const reason = iReason === -1 ? '' : plain(r.cells[iReason] ?? '');
      if (!/\[[A-Z]+-\d+\]/.test(r.cells[iReason] ?? '') && !/clinician|refer/i.test(reason)) {
        error(
          'provenance',
          `"${name}" is untested with no constraint id to justify it — cite the [CONSTRAINT-ID], or test it`,
          r.line
        );
      }
    }
  }

  if (!/programming band/i.test(md))
    warn('completeness', 'no programming band stated — program-design needs one per pattern');
}

// ---------------------------------------------------------------------------
// review
// ---------------------------------------------------------------------------

function checkReview({ md, today, error, warn }) {
  const dates = /Block dates:\s*(\d{4}-\d{2}-\d{2})\s*(?:to|–|-)\s*(\d{4}-\d{2}-\d{2})/i.exec(md);
  if (!dates) warn('dates', 'no "Block dates: YYYY-MM-DD to YYYY-MM-DD" line');
  else if (!isRealDate(dates[1]) || !isRealDate(dates[2]))
    error('dates', 'block dates are not valid calendar dates');

  // The MRV signal is the block's most valuable output; an unfilled one is
  // worse than none, because the next block will be built on it.
  const mrv = section(md, /^#+\s*\d*\.?\s*MRV signal/im).replace(/^#+.*$/m, '').trim();
  if (!mrv || /<[^>]+>/.test(mrv)) {
    error(
      'completeness',
      'the MRV signal is empty or still a placeholder — it sets the next block\'s volume ceiling'
    );
  }

  const brief = section(md, /^#+\s*\d*\.?\s*Next block brief/im);
  const changes = /changes from this block:?\**\s*\n((?:\s*\d+\.\s*.+\n?)+)/i.exec(brief);
  if (changes) {
    const n = changes[1].split('\n').filter((l) => /^\s*\d+\.\s*\S/.test(l)).length;
    if (n > 3)
      warn(
        'review',
        `${n} changes in the next block brief — more than three and you cannot attribute the result to any of them`
      );
  }
}
