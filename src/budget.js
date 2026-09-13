/**
 * What a coaching turn costs, derived from the skills rather than declared.
 *
 * The corpus is ~118,000 tokens and almost none of it is resident: the cost
 * that matters is one turn. This module answers "what does designing a block
 * actually read?" by walking the links the skills already carry, so the answer
 * moves when the skills move instead of when someone remembers to update a
 * list.
 *
 * Two kinds of link, and the difference is the whole model:
 *
 *   ../other-skill/SKILL.md              a ROUTE — one is taken, not all
 *   references/x.md                      a READ — the skill loads it
 *   ../other-skill/references/x.md       also a READ, just not its own file
 *
 * `calisthenics-coach` links to all fourteen skills. Charging a turn for every
 * one of them would say a coaching turn costs the whole framework, which is
 * exactly the thing progressive disclosure prevents.
 */

import fs from 'node:fs';
import path from 'node:path';

import { skillsSource } from './paths.js';

const CHARS_PER_TOKEN = 4;

const tokens = (file) =>
  fs.existsSync(file) ? Math.round(fs.readFileSync(file, 'utf8').length / CHARS_PER_TOKEN) : 0;

/** A link target, relative to the skills root, as a stable id. */
const relId = (file) => path.relative(skillsSource, file).replace(/\\/g, '/');

/**
 * The skills, each with what it reads and where it can route.
 * Links inside fenced code blocks are illustrative, not real — `doctor`
 * already treats them that way, and so does this.
 */
export function skillGraph() {
  const graph = new Map();
  if (!fs.existsSync(skillsSource)) return graph;

  for (const dir of fs.readdirSync(skillsSource, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const skillMd = path.join(skillsSource, dir.name, 'SKILL.md');
    if (!fs.existsSync(skillMd)) continue;

    const md = stripFences(fs.readFileSync(skillMd, 'utf8'));
    const reads = new Map();
    const routes = new Set();

    for (const m of md.matchAll(/\]\(([^)\s#]+\.md)(?:#[^)\s]*)?\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:)/.test(href)) continue;
      const resolved = path.resolve(path.dirname(skillMd), href);

      if (/SKILL\.md$/i.test(href)) {
        const routed = path.basename(path.dirname(resolved));
        if (routed !== dir.name) routes.add(routed);
        continue;
      }
      reads.set(relId(resolved), { id: relId(resolved), tokens: tokens(resolved) });
    }

    const description = /^description:\s*(.+)$/m.exec(fs.readFileSync(skillMd, 'utf8'))?.[1] ?? '';
    graph.set(dir.name, {
      id: dir.name,
      entry: tokens(skillMd),
      description: Math.round(description.length / CHARS_PER_TOKEN),
      reads: [...reads.values()].sort((a, b) => b.tokens - a.tokens),
      routes: [...routes].sort(),
    });
  }
  return graph;
}

/** Blank fenced blocks, keeping line count stable, as `doctor` does. */
function stripFences(md) {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return '';
      }
      return inFence ? '' : line;
    })
    .join('\n');
}

/**
 * The turns worth measuring. Each names skills, never files — the files come
 * from the graph, which is the point. `workspace` is what the turn reads from
 * the athlete's own documents, which no link can tell us; it is reported
 * separately and labelled as an estimate.
 */
export const TURNS = {
  design: {
    route: ['calisthenics-coach'],
    read: ['program-design', 'exercise-library'],
    workspace: 'status preflight',
    writes: 'a whole block',
  },
  revise: {
    route: ['calisthenics-coach'],
    read: ['program-design'],
    workspace: 'status preflight + the current block',
    writes: 'part of a block',
  },
  log: {
    route: ['calisthenics-coach'],
    read: ['session-logging'],
    workspace: 'status preflight + the current block',
    writes: 'a session log',
  },
  review: {
    route: ['calisthenics-coach'],
    read: ['progress-review'],
    workspace: 'status preflight + the current block + a block of logs',
    writes: 'a review',
  },
};

/**
 * What the athlete's own documents cost a turn. These are estimates — the only
 * ones here — because they depend on a workspace that does not exist yet when
 * the framework is measured.
 */
const WORKSPACE_COST = {
  'status preflight': 40,
  'the current block': 23000,
  'a block of logs': 9600,
};

/**
 * What a turn writes. Output prices at several times input, so a turn that
 * reads less but rewrites a block is not the saving it looks like — this is
 * the half that decides whether a change is worth making.
 */
const OUTPUT_COST = {
  'a whole block': 23000,
  'part of a block': 6000,
  'a session log': 700,
  'a review': 2500,
};

export function turnCost(
  { route = [], read = [], workspace = '', writes = '' } = {},
  graph = skillGraph()
) {
  const items = [];
  const charged = new Set();

  const descriptions = [...graph.values()].reduce((n, s) => n + s.description, 0);
  items.push({ label: 'skill descriptions (always resident)', tokens: descriptions });

  for (const id of route) {
    const s = graph.get(id);
    if (!s || charged.has(`${id}/SKILL.md`)) continue;
    charged.add(`${id}/SKILL.md`);
    items.push({ label: `${id} SKILL.md ${dim('routes only')}`, tokens: s.entry });
  }

  for (const id of read) {
    const s = graph.get(id);
    if (!s) continue;
    if (!charged.has(`${id}/SKILL.md`)) {
      charged.add(`${id}/SKILL.md`);
      items.push({ label: `${id} SKILL.md`, tokens: s.entry });
    }
    for (const r of s.reads) {
      if (charged.has(r.id)) continue;
      charged.add(r.id);
      items.push({ label: r.id, tokens: r.tokens });
    }
  }

  for (const part of workspace.split('+').map((p) => p.trim()).filter(Boolean)) {
    items.push({
      label: `${part} ${dim('(estimate)')}`,
      tokens: WORKSPACE_COST[part] ?? 0,
      estimated: true,
    });
  }

  return {
    items,
    total: items.reduce((n, i) => n + i.tokens, 0),
    output: OUTPUT_COST[writes] ?? 0,
    writes,
  };
}

// The rendering layer adds colour; the data layer must not.
const dim = (s) => `— ${s}`;

export function budget() {
  const graph = skillGraph();
  const skills = [...graph.values()].map((s) => ({
    id: s.id,
    entry: s.entry,
    refs: s.reads.filter((r) => r.id.startsWith(`${s.id}/`)).reduce((n, r) => n + r.tokens, 0),
  }));

  return {
    charsPerToken: CHARS_PER_TOKEN,
    resident: [...graph.values()].reduce((n, s) => n + s.description, 0),
    corpus: skills.reduce((n, s) => n + s.entry + s.refs, 0),
    skills: skills.sort((a, b) => b.entry + b.refs - (a.entry + a.refs)),
    turns: Object.fromEntries(
      Object.entries(TURNS).map(([name, t]) => [name, turnCost(t, graph)])
    ),
  };
}
