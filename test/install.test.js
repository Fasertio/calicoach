import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  parseFrontmatter,
  discoverSkills,
  installSkills,
  scaffoldWorkspace,
  uninstallSkills,
  doctor,
} from '../src/install.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const cli = path.join(repoRoot, 'bin', 'calicoach.js');

function tmpdir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-test-'));
}

test('parseFrontmatter reads name and description', () => {
  const fm = parseFrontmatter('---\nname: foo\ndescription: bar baz\n---\n# hi\n');
  assert.equal(fm.name, 'foo');
  assert.equal(fm.description, 'bar baz');
});

test('parseFrontmatter folds continuation lines', () => {
  const fm = parseFrontmatter('---\nname: foo\ndescription: one\n  two\n---\n');
  assert.equal(fm.description, 'one two');
});

test('parseFrontmatter returns null without frontmatter', () => {
  assert.equal(parseFrontmatter('# no frontmatter here'), null);
});

test('every bundled skill has valid frontmatter and resolvable links', () => {
  const { skills, problems } = doctor();
  assert.deepEqual(problems, [], `doctor reported problems:\n${problems.join('\n')}`);
  assert.ok(skills.length >= 14, `expected 14+ skills, found ${skills.length}`);
});

test('the router skill routes to every other skill', () => {
  const skills = discoverSkills();
  const router = skills.find((s) => s.id === 'calisthenics-coach');
  assert.ok(router, 'calisthenics-coach skill is missing');
  const md = fs.readFileSync(path.join(router.dir, 'SKILL.md'), 'utf8');
  for (const s of skills) {
    if (s.id === 'calisthenics-coach') continue;
    assert.ok(md.includes(`../${s.id}/SKILL.md`), `router does not link to ${s.id}`);
  }
});

test('every skill has a Definition of done or an equivalent checklist', () => {
  for (const s of discoverSkills()) {
    const md = fs.readFileSync(path.join(s.dir, 'SKILL.md'), 'utf8');
    assert.ok(
      /## (Definition of done|The card format)/.test(md),
      `${s.id} has no definition-of-done section`
    );
  }
});

test('installSkills writes skills into .claude/skills and is idempotent', () => {
  const dir = tmpdir();
  const first = installSkills({ dir, scope: 'project' });
  assert.ok(first.written.length > 0);
  const skillMd = path.join(dir, '.claude', 'skills', 'calisthenics-coach', 'SKILL.md');
  assert.ok(fs.existsSync(skillMd));

  const second = installSkills({ dir, scope: 'project' });
  assert.equal(second.written.length, 0, 'second install should write nothing');
  assert.ok(second.skipped.length > 0);

  const forced = installSkills({ dir, scope: 'project', force: true });
  assert.equal(forced.written.length, first.written.length);

  fs.rmSync(dir, { recursive: true, force: true });
});

test('installSkills honours --only', () => {
  const dir = tmpdir();
  installSkills({ dir, only: ['program-design'] });
  const installed = fs.readdirSync(path.join(dir, '.claude', 'skills'));
  assert.deepEqual(installed, ['program-design']);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('scaffoldWorkspace creates the tree and never clobbers athlete data', () => {
  const dir = tmpdir();
  scaffoldWorkspace({ dir });
  const ws = path.join(dir, 'calicoach');
  for (const sub of ['athlete', 'programs', 'logs', 'reviews', 'references']) {
    assert.ok(fs.existsSync(path.join(ws, sub)), `missing ${sub}/`);
  }
  const profile = path.join(ws, 'athlete', 'profile.md');
  assert.ok(fs.existsSync(profile));

  fs.writeFileSync(profile, 'MY REAL DATA');
  scaffoldWorkspace({ dir, force: true });
  assert.equal(
    fs.readFileSync(profile, 'utf8'),
    'MY REAL DATA',
    'athlete data must survive even --force'
  );

  fs.rmSync(dir, { recursive: true, force: true });
});

test('uninstallSkills removes skills but leaves the workspace', () => {
  const dir = tmpdir();
  installSkills({ dir });
  scaffoldWorkspace({ dir });
  const { removed } = uninstallSkills({ dir });
  assert.ok(removed.length >= 14);
  assert.equal(fs.readdirSync(path.join(dir, '.claude', 'skills')).length, 0);
  assert.ok(fs.existsSync(path.join(dir, 'calicoach', 'athlete', 'profile.md')));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI init runs end to end in a clean directory', () => {
  const dir = tmpdir();
  const out = execFileSync(process.execPath, [cli, 'init', '--dir', dir, '--no-banner'], {
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
  assert.match(out, /skills ready/);
  assert.ok(fs.existsSync(path.join(dir, '.claude', 'skills', 'program-design', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(dir, 'calicoach', 'README.md')));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('CLI rejects an unknown command', () => {
  assert.throws(() =>
    execFileSync(process.execPath, [cli, 'nonsense', '--no-banner'], { encoding: 'utf8' })
  );
});

test('CLI --version prints the package version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  const out = execFileSync(process.execPath, [cli, '--version'], { encoding: 'utf8' });
  assert.equal(out.trim(), pkg.version);
});
