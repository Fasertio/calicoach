/** Rendering for `calicoach budget`. The data lives in budget.js. */

import { c, log } from './ui.js';
import { budget, skillGraph, TURNS } from './budget.js';

const n = (v) => v.toLocaleString('en-US');

function printTurn(name, t, graph) {
  log(`\n${c.bold(name)}  ${c.gray(`— reads ${n(t.total)}, writes ${n(t.output)}`)}`);
  if (t.patterns) log(`  ${c.gray(`patterns: ${t.patterns.join(', ')}`)}`);
  for (const i of t.items) {
    const label = i.estimated ? c.yellow(i.label) : i.label;
    const why = i.conditional ? c.gray(`  (for ${i.conditional.join(', ')})`) : '';
    log(`  ${c.gray(n(i.tokens).padStart(8))}  ${label}${why}`);
  }
  // What a turn did not read is the whole point of scoping it, and is
  // invisible unless the report says so.
  const skipped = skippedFor(t, graph);
  if (skipped.length) {
    log(`  ${c.gray('--------')}`);
    for (const sk of skipped) {
      log(
        `  ${c.gray('skipped'.padStart(8))}  ${c.gray(
          `${sk.id} (${n(sk.tokens)} — no ${sk.patterns.join(' / ')} volume)`
        )}`
      );
    }
  }
}

/** Conditional files this turn's patterns did not call for. */
function skippedFor(t, graph) {
  if (!t.patterns || !graph) return [];
  const charged = new Set(t.items.map((i) => i.label));
  const out = [];
  for (const s of graph.values()) {
    for (const r of s.conditional ?? []) {
      if (!charged.has(r.id)) out.push(r);
    }
  }
  return out;
}

export function printBudget({ turn } = {}) {
  const b = budget();

  if (turn) {
    const t = b.turns[turn];
    if (!t) {
      log(`${c.red('x')} unknown turn "${turn}" — expected one of ${Object.keys(TURNS).join(', ')}`);
      return 1;
    }
    printTurn(turn, t, skillGraph());
    log('');
    return 0;
  }

  log(`\ncalicoach context budget  ${c.gray(`~tokens, at ${b.charsPerToken} chars/token`)}\n`);
  log(`${'skill'.padEnd(26)}${'SKILL.md'.padStart(10)}${'refs'.padStart(9)}${'total'.padStart(9)}`);
  log('-'.repeat(54));
  for (const s of b.skills) {
    log(s.id.padEnd(26) + n(s.entry).padStart(10) + n(s.refs).padStart(9) + n(s.entry + s.refs).padStart(9));
  }
  log('-'.repeat(54));
  log(
    'TOTAL'.padEnd(26) +
      n(b.skills.reduce((a, s) => a + s.entry, 0)).padStart(10) +
      n(b.skills.reduce((a, s) => a + s.refs, 0)).padStart(9) +
      n(b.corpus).padStart(9)
  );

  log(`\nAlways resident (${b.skills.length} skill descriptions): ${n(b.resident)}`);

  log(`\n${c.bold('Per turn')}  ${c.gray('— derived from the links the skills carry')}\n`);
  log(`  ${'turn'.padEnd(14)}${'reads'.padStart(9)}${'writes'.padStart(9)}`);
  for (const [name, t] of Object.entries(b.turns)) {
    log(`  ${name.padEnd(14)}${n(t.total).padStart(9)}${n(t.output).padStart(9)}`);
  }
  log(`\n${c.gray('  calicoach budget --turn design   for the itemised breakdown')}\n`);
  return 0;
}
