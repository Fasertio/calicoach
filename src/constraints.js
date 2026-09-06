/**
 * Parsing and validation of an `Active constraints` block.
 *
 * The same block is authored in `athlete/screening.md` and copied verbatim into
 * every program header, so both documents are held to identical rules here —
 * a constraint that is well-formed in one place cannot be malformed in the
 * other.
 */

import { parseForbids } from './movement-tags.js';

const ISO_DATE = /\b(\d{4})-(\d{2})-(\d{2})\b/;

export function isRealDate(s) {
  const m = ISO_DATE.exec(String(s ?? ''));
  if (!m) return false;
  const d = new Date(`${m[0]}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === m[0];
}

/** The first real ISO date in a string, or null. */
export function firstDate(s) {
  const m = ISO_DATE.exec(String(s ?? ''));
  return m && isRealDate(m[0]) ? m[0] : null;
}

/** Whole days from `from` to `to`, both ISO dates. */
export function daysBetween(from, to) {
  return Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000);
}

/**
 * Split an `Active constraints` block into one record per `[ID]`.
 * Each record carries the raw scope text plus everything the checkers need.
 */
export function parseConstraints(blockText) {
  const text = String(blockText ?? '');
  const ids = [...text.matchAll(/\[([A-Z]+-\d+)\]/g)].map((m) => m[1]);
  const seen = new Set();

  return ids
    .filter((id) => (seen.has(id) ? false : seen.add(id)))
    .map((id) => {
      const from = text.indexOf(`[${id}]`);
      const rest = text.slice(from);
      const end = rest.indexOf('\n\n');
      const scope = end === -1 ? rest : rest.slice(0, end + 1);
      const { tags, unknown } = parseForbids(scope);
      return {
        id,
        scope,
        forbids: new Set(tags),
        unknownTags: unknown,
        declaresNoForbids: /forbids\s*:\s*none/i.test(scope),
        hasInstead: /instead:/i.test(scope),
        hasEarnsItBack: /earns it back:/i.test(scope),
        retest: /re-?test:/i.test(scope) ? firstDate(scope.slice(scope.search(/re-?test:/i))) : null,
        permitted: permittedNames(scope),
      };
    });
}

/**
 * Report every way a constraint block is malformed.
 * `emit(level, message)` receives each finding; the caller decides how to
 * record it.
 */
export function validateConstraints(constraints, emit) {
  for (const c of constraints) {
    if (!c.hasInstead)
      emit('error', `[${c.id}] removes work without naming a substitution ("Instead:")`);
    if (!c.hasEarnsItBack) emit('error', `[${c.id}] has no earn-it-back criterion`);
    if (!c.retest) emit('error', `[${c.id}] has no real re-test date`);

    for (const token of c.unknownTags) {
      emit(
        'error',
        `[${c.id}] forbids "${token}", which is not a movement tag — see src/movement-tags.js for the vocabulary`
      );
    }
    if (!c.forbids.size && !c.unknownTags.length && !c.declaresNoForbids) {
      emit(
        'error',
        `[${c.id}] has no "Forbids:" line — without it nothing checks the program against this constraint`
      );
    }
  }
}

/**
 * The variants a constraint explicitly allows — everything its `Instead:` line
 * names. A substitution is the coach's considered exception, so it is the one
 * thing that can carry a forbidden tag without failing the check.
 */
function permittedNames(scope) {
  const m = /instead:\s*([^\n]*(?:\n(?!\s*\**(?:reason|forbids|earns it back|re-?test)\**\s*:)[^\n]*)*)/i.exec(
    scope
  );
  if (!m) return [];
  return m[1]
    .replace(/\s+/g, ' ')
    .split(/[,;]|\band\b|\bor\b/i)
    .map((s) =>
      s
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\*\*|__|\*|_/g, '')
        .replace(/[.`]/g, '')
        .trim()
        .toLowerCase()
    )
    .filter((s) => s.length >= 4);
}

/** Does this exercise name match one of the constraint's named substitutes? */
export function isPermitted(name, permitted) {
  const n = String(name).toLowerCase().trim();
  return permitted.some((p) => p === n || p.includes(n) || n.includes(p));
}
