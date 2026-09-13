import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { commandsSource, skillsSource } from '../src/paths.js';
import { parseFrontmatter } from '../src/install.js';

const EXPECTED = [
  'check',
  'exercise',
  'init',
  'learn',
  'log',
  'onboard',
  'pain',
  'program',
  'review',
  'screen',
  'skill',
  'status',
  'test',
];

const files = () => fs.readdirSync(commandsSource).filter((f) => f.endsWith('.md')).sort();
const body = (name) => fs.readFileSync(path.join(commandsSource, `${name}.md`), 'utf8');

test('every expected command ships, and no others', () => {
  assert.deepEqual(
    files().map((f) => f.replace(/\.md$/, '')),
    EXPECTED
  );
});

test('every command has a description and declares its tools', () => {
  for (const f of files()) {
    const fm = parseFrontmatter(fs.readFileSync(path.join(commandsSource, f), 'utf8'));
    assert.ok(fm, `${f}: no frontmatter`);
    assert.ok(fm.description?.length > 15, `${f}: description too short`);
    assert.ok(fm['allowed-tools']?.includes('Bash'), `${f}: preflight needs Bash`);
  }
});

test('every skill a command names actually exists', () => {
  const known = new Set(
    fs
      .readdirSync(skillsSource, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  );

  for (const f of files()) {
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    for (const m of md.matchAll(/`(?:calicoach:)?([a-z]+(?:-[a-z]+)+)`\s+skill/g)) {
      assert.ok(known.has(m[1]), `${f}: names unknown skill "${m[1]}"`);
    }
  }
});

test('every /calicoach: command a command references exists', () => {
  for (const f of files()) {
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    for (const m of md.matchAll(/\/calicoach:([a-z]+)/g)) {
      assert.ok(EXPECTED.includes(m[1]), `${f}: references unknown command /calicoach:${m[1]}`);
    }
  }
});

test('no command exceeds 40 lines', () => {
  for (const f of files()) {
    const lines = fs.readFileSync(path.join(commandsSource, f), 'utf8').trimEnd().split('\n').length;
    assert.ok(lines <= 40, `${f}: ${lines} lines — a command carries intent, not doctrine`);
  }
});

/** init, status and check are backed by the CLI directly, not by a skill. */
const CLI_BACKED = ['init.md', 'status.md', 'check.md'];

test('every skill-routing command injects state instead of reading files', () => {
  for (const f of files()) {
    if (CLI_BACKED.includes(f)) continue;
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    assert.match(md, /calicoach\.js" status --no-banner/, `${f}: no preflight`);
    assert.match(md, /\$ARGUMENTS/, `${f}: does not pass the athlete's own words through`);
  }
});

test('every command runs the bundled CLI rather than reasoning from files', () => {
  for (const f of files()) {
    const md = fs.readFileSync(path.join(commandsSource, f), 'utf8');
    assert.match(md, /!`node "\$\{CLAUDE_PLUGIN_ROOT\}\/bin\/calicoach\.js"/, `${f}: no CLI preflight`);
  }
});

test('the program command states the doctrine gate it could violate', () => {
  const md = body('program');
  assert.match(md, /\/calicoach:onboard/);
  assert.match(md, /\/calicoach:screen/);
});

test('the pain command re-triages red flags before loading advice', () => {
  assert.match(body('pain'), /movement-screening/);
});

import os from 'node:os';

import { installCommands, uninstallCommands, discoverCommands } from '../src/commands.js';
import { resolveCommandsDir } from '../src/paths.js';

const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'calicoach-cmd-'));

test('discoverCommands reads the id and description of each command', () => {
  const found = discoverCommands();
  assert.equal(found.length, EXPECTED.length);
  assert.ok(found.every((cmd) => cmd.description.length > 15));
  assert.ok(found.some((cmd) => cmd.id === 'program'));
});

test('installing writes every command into .claude/commands/calicoach', () => {
  const dir = tmpdir();
  const report = installCommands({ dir });
  const dest = resolveCommandsDir({ dir });

  assert.equal(report.written.length, EXPECTED.length);
  assert.deepEqual(
    fs.readdirSync(dest).sort(),
    EXPECTED.map((id) => `${id}.md`)
  );
});

test('installed commands point at a CLI that exists', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const md = fs.readFileSync(path.join(resolveCommandsDir({ dir }), 'program.md'), 'utf8');

  assert.doesNotMatch(md, /CLAUDE_PLUGIN_ROOT/, 'the token must be resolved at copy time');
  const cliPath = /node "([^"]+calicoach\.js)"/.exec(md)?.[1];
  assert.ok(cliPath, 'the preflight must still invoke the CLI');
  assert.ok(fs.existsSync(cliPath), `rewritten CLI path does not exist: ${cliPath}`);
});

test('installing twice does not clobber without --force', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const second = installCommands({ dir });

  assert.equal(second.written.length, 0);
  assert.equal(second.skipped.length, EXPECTED.length);
});

test('uninstall removes the commands it installed', () => {
  const dir = tmpdir();
  installCommands({ dir });
  const { removed } = uninstallCommands({ dir });

  assert.equal(removed.length, EXPECTED.length);
  assert.equal(fs.existsSync(resolveCommandsDir({ dir })), false);
});

// --- the README documents what actually ships ------------------------------

const repoRoot = path.join(commandsSource, '..');

/** The `/calicoach:x | description` rows of a README's command table. */
function readmeTable(file) {
  const md = fs.readFileSync(path.join(repoRoot, file), 'utf8');
  const rows = new Map();
  for (const m of md.matchAll(/^\|\s*`\/calicoach:([a-z]+)`\s*\|\s*(.+?)\s*\|\s*$/gm)) {
    rows.set(m[1], m[2]);
  }
  return rows;
}

for (const file of ['README.md', 'README.it.md']) {
  test(`${file} lists exactly the commands that ship`, () => {
    assert.deepEqual([...readmeTable(file).keys()].sort(), EXPECTED);
  });
}

test('README.md quotes each command description verbatim', () => {
  const rows = readmeTable('README.md');
  for (const f of files()) {
    const id = f.replace(/\.md$/, '');
    const fm = parseFrontmatter(fs.readFileSync(path.join(commandsSource, f), 'utf8'));
    assert.equal(
      rows.get(id),
      fm.description,
      `README.md and commands/${f} disagree about what /calicoach:${id} does`
    );
  }
});
