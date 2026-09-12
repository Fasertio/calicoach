/**
 * Installing the slash commands for a non-plugin install.
 *
 * The command files are written once, for the plugin, where Claude Code
 * defines `${CLAUDE_PLUGIN_ROOT}`. A CLI install has no such variable, so the
 * token is resolved to this package's own `bin/calicoach.js` as the file is
 * copied. One source, two destinations, no second copy to keep in step.
 */

import fs from 'node:fs';
import path from 'node:path';

import { commandsSource, packageRoot, resolveCommandsDir } from './paths.js';
import { parseFrontmatter } from './install.js';
import { c, add, skip } from './ui.js';

const PLUGIN_ROOT_TOKEN = /\$\{CLAUDE_PLUGIN_ROOT\}/g;

/** Every command shipped with the package. */
export function discoverCommands() {
  if (!fs.existsSync(commandsSource)) return [];
  return fs
    .readdirSync(commandsSource)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const file = path.join(commandsSource, f);
      const fm = parseFrontmatter(fs.readFileSync(file, 'utf8')) || {};
      return { id: f.replace(/\.md$/, ''), file, description: fm.description || '' };
    });
}

export function installCommands({ scope = 'project', dir, force = false } = {}) {
  const dest = resolveCommandsDir({ scope, dir });
  const report = { written: [], skipped: [], dir: dest };

  fs.mkdirSync(dest, { recursive: true });
  for (const cmd of discoverCommands()) {
    const target = path.join(dest, `${cmd.id}.md`);
    if (fs.existsSync(target) && !force) {
      report.skipped.push(target);
      skip(`/calicoach:${cmd.id} (exists, use --force to overwrite)`);
      continue;
    }
    const body = fs
      .readFileSync(cmd.file, 'utf8')
      .replace(PLUGIN_ROOT_TOKEN, packageRoot.replace(/\\/g, '/'));
    fs.writeFileSync(target, body);
    report.written.push(target);
    add(c.bold(`/calicoach:${cmd.id}`));
  }
  return report;
}

export function uninstallCommands({ scope = 'project', dir } = {}) {
  const dest = resolveCommandsDir({ scope, dir });
  const removed = [];
  if (!fs.existsSync(dest)) return { removed };

  for (const cmd of discoverCommands()) {
    const target = path.join(dest, `${cmd.id}.md`);
    if (fs.existsSync(target)) {
      fs.rmSync(target);
      removed.push(cmd.id);
    }
  }
  if (fs.readdirSync(dest).length === 0) fs.rmSync(dest, { recursive: true });
  return { removed };
}
