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
