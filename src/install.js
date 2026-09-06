import fs from 'node:fs';
import path from 'node:path';
import {
  skillsSource,
  templatesSource,
  resolveTarget,
  resolveWorkspace,
} from './paths.js';
import { c, add, skip, warn, step, log } from './ui.js';

/** Parse the leading YAML frontmatter block of a SKILL.md (name/description only). */
export function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  if (!m) return null;
  const out = {};
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(raw);
    if (kv) {
      key = kv[1];
      out[key] = kv[2].trim().replace(/^["']|["']$/g, '');
    } else if (key && /^\s+\S/.test(raw)) {
      out[key] = `${out[key]} ${raw.trim()}`.trim();
    }
  }
  return out;
}

/** Discover every skill shipped with the package. */
export function discoverSkills() {
  if (!fs.existsSync(skillsSource)) return [];
  return fs
    .readdirSync(skillsSource, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(skillsSource, d.name);
      const skillMd = path.join(dir, 'SKILL.md');
      if (!fs.existsSync(skillMd)) return null;
      const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8')) || {};
      return {
        id: d.name,
        dir,
        name: fm.name || d.name,
        description: fm.description || '',
        files: countFiles(dir),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function countFiles(dir) {
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    n += e.isDirectory() ? countFiles(path.join(dir, e.name)) : 1;
  }
  return n;
}

function copyDir(src, dest, { force }, report) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d, { force }, report);
    } else if (fs.existsSync(d) && !force) {
      report.skipped.push(d);
    } else {
      fs.copyFileSync(s, d);
      report.written.push(d);
    }
  }
}

/** Copy a template only if the destination does not exist (never clobbers athlete data). */
function seed(srcFile, destFile, report) {
  if (fs.existsSync(destFile)) {
    report.skipped.push(destFile);
    return;
  }
  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.copyFileSync(srcFile, destFile);
  report.written.push(destFile);
}

export function installSkills({ scope = 'project', dir, force = false, only } = {}) {
  const target = resolveTarget({ scope, dir });
  const skills = discoverSkills().filter((s) => !only || only.includes(s.id));
  const report = { written: [], skipped: [], target, skills };

  fs.mkdirSync(target.skillsDir, { recursive: true });
  for (const s of skills) {
    const dest = path.join(target.skillsDir, s.id);
    const before = report.written.length;
    copyDir(s.dir, dest, { force }, report);
    const changed = report.written.length - before;
    if (changed > 0) add(`${c.bold(s.id)} ${c.gray(`(${changed} file${changed === 1 ? '' : 's'})`)}`);
    else skip(`${s.id} (already up to date, use --force to overwrite)`);
  }
  return report;
}

export function scaffoldWorkspace({ dir, force = false } = {}) {
  const ws = resolveWorkspace(dir);
  const report = { written: [], skipped: [], ws };

  for (const d of [ws.root, ws.athlete, ws.programs, ws.logs, ws.references, ws.reviews]) {
    fs.mkdirSync(d, { recursive: true });
  }

  const seeds = [
    ['workspace-README.md', path.join(ws.root, 'README.md')],
    ['athlete-profile.md', path.join(ws.athlete, 'profile.md')],
    ['screening.md', path.join(ws.athlete, 'screening.md')],
    ['program.md', path.join(ws.programs, '_TEMPLATE-program.md')],
    ['session-log.md', path.join(ws.logs, '_TEMPLATE-session-log.md')],
    ['exercise-card.md', path.join(ws.root, '_TEMPLATE-exercise-card.md')],
    ['review.md', path.join(ws.reviews, '_TEMPLATE-review.md')],
    ['references-index.md', path.join(ws.references, 'INDEX.md')],
    ['gitignore', path.join(ws.root, '.gitignore')],
  ];

  for (const [tpl, dest] of seeds) {
    const src = path.join(templatesSource, tpl);
    if (!fs.existsSync(src)) {
      warn(`missing template: ${tpl}`);
      continue;
    }
    if (force && fs.existsSync(dest) && path.basename(dest).startsWith('_TEMPLATE')) {
      fs.copyFileSync(src, dest);
      report.written.push(dest);
      add(path.relative(ws.base, dest));
      continue;
    }
    const before = report.written.length;
    seed(src, dest, report);
    if (report.written.length > before) add(path.relative(ws.base, dest));
    else skip(`${path.relative(ws.base, dest)} (exists, left untouched)`);
  }
  return report;
}

export function uninstallSkills({ scope = 'project', dir } = {}) {
  const target = resolveTarget({ scope, dir });
  const removed = [];
  for (const s of discoverSkills()) {
    const dest = path.join(target.skillsDir, s.id);
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
      removed.push(s.id);
      add(`removed ${s.id}`);
    }
  }
  return { removed, target };
}

/** Every markdown file inside a skill directory. */
function markdownFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) markdownFiles(p, acc);
    else if (e.name.endsWith('.md')) acc.push(p);
  }
  return acc;
}

/**
 * Validate the shipped skills: frontmatter present and consistent, and every
 * relative markdown link resolves (including cross-skill ../other/SKILL.md).
 */
export function doctor() {
  const problems = [];
  const skills = discoverSkills();
  if (skills.length === 0) problems.push('no skills found in package');

  for (const s of skills) {
    const skillMd = path.join(s.dir, 'SKILL.md');
    const fm = parseFrontmatter(fs.readFileSync(skillMd, 'utf8'));
    if (!fm) {
      problems.push(`${s.id}: missing YAML frontmatter`);
    } else {
      if (!fm.name) problems.push(`${s.id}: frontmatter has no "name"`);
      if (fm.name && fm.name !== s.id)
        problems.push(`${s.id}: frontmatter name "${fm.name}" does not match directory`);
      if (!fm.description) problems.push(`${s.id}: frontmatter has no "description"`);
      if (fm.description && fm.description.length > 1024)
        problems.push(`${s.id}: description longer than 1024 chars`);
    }

    // Every relative link in every markdown file must resolve.
    for (const file of markdownFiles(s.dir)) {
      const md = fs.readFileSync(file, 'utf8');
      const from = path.relative(skillsSource, file).replace(/\\/g, '/');
      for (const m of md.matchAll(/\]\(([^)\s]+\.md)(#[^)\s]*)?\)/g)) {
        const href = m[1];
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const resolved = path.resolve(path.dirname(file), href);
        if (!fs.existsSync(resolved)) {
          problems.push(`${from}: broken link -> ${href}`);
        }
      }
    }
  }
  return { skills, problems };
}

export function printSkillTable(skills) {
  const width = Math.max(...skills.map((s) => s.id.length));
  for (const s of skills) {
    log(`  ${c.cyan(s.id.padEnd(width))}  ${c.gray(truncate(s.description, 96))}`);
  }
}

function truncate(s, n) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

export { step };
