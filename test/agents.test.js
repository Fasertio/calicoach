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

test('an unknown agent id is refused by name', () => {
  const dir = tmpdir();
  assert.throws(() => exportForAgent({ dir, agent: 'copilot' }), /unknown agent "copilot"/);
});
