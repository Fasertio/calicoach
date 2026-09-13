/** Rendering for `calicoach budget`. The data lives in budget.js. */

import { c, log } from './ui.js';
import { budget, TURNS } from './budget.js';

const n = (v) => v.toLocaleString('en-US');

function printTurn(name, t) {
  log(`\n${c.bold(name)}  ${c.gray(`— reads ${n(t.total)}, writes ${n(t.output)}`)}`);
  for (const i of t.items) {
    const label = i.estimated ? c.yellow(i.label) : i.label;
    log(`  ${c.gray(n(i.tokens).padStart(8))}  ${label}`);
  }
}

export function printBudget({ turn } = {}) {
  const b = budget();

  if (turn) {
    const t = b.turns[turn];
    if (!t) {
      log(`${c.red('x')} unknown turn "${turn}" — expected one of ${Object.keys(TURNS).join(', ')}`);
      return 1;
    }
    printTurn(turn, t);
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
  log(`  ${'turn'.padEnd(10)}${'reads'.padStart(9)}${'writes'.padStart(9)}`);
  for (const [name, t] of Object.entries(b.turns)) {
    log(`  ${name.padEnd(10)}${n(t.total).padStart(9)}${n(t.output).padStart(9)}`);
  }
  log(`\n${c.gray('  calicoach budget --turn design   for the itemised breakdown')}\n`);
  return 0;
}
