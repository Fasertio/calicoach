/**
 * The tendon guardrails, as arithmetic instead of prose.
 *
 * `injury-prevention/references/tendon-loading.md` states them: straight-arm
 * volume and skill time-under-tension climb at no more than 10% a week, even
 * when everything feels easy. `skill-progressions` adds the other half: one
 * leverage step per two to three weeks, maximum.
 *
 * Both were doctrine, and doctrine is checked by re-reading two thousand lines
 * carefully — which is to say, not checked. Connective tissue adapts in months
 * while muscle adapts in weeks, so the cost of getting this wrong is a block
 * that ends in a tendon rather than a skill. These are exactly the rules worth
 * computing.
 *
 * The numbers here are not new: they are the ones the skills already give, and
 * the worked example is held to them in the test suite. A guardrail its own
 * gold-standard example fails is a guardrail with the wrong number.
 */

import { section, parseTables, plain } from './check.js';

/** tendon-loading.md: weekly straight-arm TUT increase ≤ 10%. */
export const WEEKLY_CAP = 0.1;

/** skill-progressions: one leverage step per 2–3 weeks maximum. */
export const MIN_WEEKS_BETWEEN_LEVERAGE_STEPS = 2;

/** Rounding slack, so a plan that lands exactly on the cap is not failed. */
const TOLERANCE = 0.005;

/** Budget rows the tendon clock governs, rather than the muscle clock. */
const TENDON_ROW = /straight-arm|skill\s*tut/i;

/** `Week 1`, `Wk 3`, `W5` — the week a column stands for, or null. */
function weekOf(header) {
  return Number(/^(?:week|wk|w)\s*(\d+)$/i.exec(plain(header).trim())?.[1]) || null;
}

const num = (cell) => {
  const m = /-?\d+(?:\.\d+)?/.exec(plain(cell ?? '').replace(/,/g, ''));
  return m ? Number(m[0]) : null;
};

/**
 * Volume that climbs faster than tendon tissue tolerates.
 *
 * Growth is compounded across the weeks the columns actually span: a budget
 * that goes 6 to 8 between week 1 and week 5 is not a 33% jump, it is four
 * weeks at 7.5%.
 */
function volumeFindings(md) {
  const findings = [];
  const budget = section(String(md ?? ''), /^#+\s*Weekly volume budget/im);
  if (!budget) return findings;

  for (const t of parseTables(budget)) {
    const weeks = t.header.map(weekOf);
    const columns = weeks
      .map((w, i) => ({ week: w, i }))
      .filter((x) => x.week !== null)
      .sort((a, b) => a.week - b.week);
    if (columns.length < 2) continue;

    const first = columns[0];
    const last = columns[columns.length - 1];
    const span = last.week - first.week;
    if (span < 1) continue;

    for (const r of t.rows) {
      const name = plain(r.cells[0] ?? '');
      if (!TENDON_ROW.test(name)) continue;

      const from = num(r.cells[first.i]);
      const to = num(r.cells[last.i]);
      if (!from || to === null || to <= from) continue;

      const perWeek = (to / from) ** (1 / span) - 1;
      if (perWeek > WEEKLY_CAP + TOLERANCE) {
        findings.push({
          level: 'error',
          rule: 'guardrail',
          message:
            `"${name}" climbs from ${from} to ${to} between week ${first.week} and week ${last.week} — ` +
            `${(perWeek * 100).toFixed(1)}% a week, over the ${WEEKLY_CAP * 100}% cap that ` +
            'tendon-loading.md sets for straight-arm and skill volume',
        });
      }
    }
  }
  return findings;
}

/**
 * The leverage token in a weekly cell: the band, or the named position. Load in
 * kilograms is deliberately not one — adding weight to a pull-up moves along a
 * load ladder, not a leverage ladder, and the two have different clocks.
 */
function leverageToken(cell) {
  // Read the raw cell: `plain` strips the backticks, and the backticks are
  // exactly what marks the band.
  const raw = String(cell ?? '');
  if (!/\d\s*"/.test(raw)) return null; // hold-based rows only
  const backticked = /`([^`]+)`/.exec(raw)?.[1];
  if (!backticked || /kg|lb/i.test(backticked)) return null;
  return backticked.trim().toLowerCase();
}

function leverageFindings(md) {
  const findings = [];
  const plan = section(String(md ?? ''), /^#+\s*Progression plan/im);
  if (!plan) return findings;

  for (const t of parseTables(plan)) {
    const columns = t.header
      .map((h, i) => ({ week: weekOf(h), i }))
      .filter((x) => x.week !== null)
      .sort((a, b) => a.week - b.week);
    if (columns.length < 2) continue;

    for (const r of t.rows) {
      const name = plain(r.cells[0] ?? '');
      const steps = [];
      let previous = null;
      for (const col of columns) {
        const token = leverageToken(r.cells[col.i]);
        if (!token) continue;
        if (previous !== null && token !== previous) steps.push(col.week);
        previous = token;
      }

      for (let i = 0; i < steps.length; i++) {
        const gap = i === 0 ? steps[0] - columns[0].week : steps[i] - steps[i - 1];
        if (gap < MIN_WEEKS_BETWEEN_LEVERAGE_STEPS) {
          findings.push({
            level: 'error',
            rule: 'guardrail',
            message:
              `"${name}" advances leverage at week ${steps[i]}, ${gap} week(s) after the previous step — ` +
              `skill-progressions allows one step per ${MIN_WEEKS_BETWEEN_LEVERAGE_STEPS}–3 weeks`,
          });
          break;
        }
      }
    }
  }
  return findings;
}

/** Every guardrail a block can be held to by arithmetic. */
export function checkGuardrails(md) {
  return [...volumeFindings(md), ...leverageFindings(md)];
}
