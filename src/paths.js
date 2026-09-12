import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Root of the installed npm package (one level above src/). */
export const packageRoot = path.resolve(here, '..');
export const skillsSource = path.join(packageRoot, 'skills');
export const commandsSource = path.join(packageRoot, 'commands');
export const templatesSource = path.join(packageRoot, 'templates');
export const pluginManifest = path.join(packageRoot, '.claude-plugin', 'plugin.json');
export const marketplaceManifest = path.join(packageRoot, '.claude-plugin', 'marketplace.json');

export function readPackageJson() {
  return JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
}

/**
 * Resolve where skills should be written.
 *   scope 'project' -> <cwd|dir>/.claude/skills
 *   scope 'user'    -> ~/.claude/skills
 */
export function resolveTarget({ scope = 'project', dir } = {}) {
  const base = scope === 'user' ? homedir() : path.resolve(dir || process.cwd());
  return {
    scope,
    base,
    claudeDir: path.join(base, '.claude'),
    skillsDir: path.join(base, '.claude', 'skills'),
  };
}

/**
 * Where slash commands are written. Namespaced by a `calicoach/` subdirectory
 * so `/calicoach:<name>` resolves the same way it does under a plugin install.
 */
export function resolveCommandsDir({ scope = 'project', dir } = {}) {
  return path.join(resolveTarget({ scope, dir }).claudeDir, 'commands', 'calicoach');
}

/** Where the athlete's living data lives. Always project-scoped. */
export function resolveWorkspace(dir) {
  const base = path.resolve(dir || process.cwd());
  const root = path.join(base, 'calicoach');
  return {
    base,
    root,
    athlete: path.join(root, 'athlete'),
    programs: path.join(root, 'programs'),
    logs: path.join(root, 'logs'),
    references: path.join(root, 'references'),
    reviews: path.join(root, 'reviews'),
  };
}
