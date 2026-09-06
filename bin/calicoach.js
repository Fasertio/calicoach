#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { readPackageJson, resolveTarget, resolveWorkspace } from '../src/paths.js';
import { checkProgram } from '../src/check.js';
import {
  installSkills,
  scaffoldWorkspace,
  uninstallSkills,
  discoverSkills,
  doctor,
  printSkillTable,
} from '../src/install.js';
import { c, log, banner, step, ok, fail, warn } from '../src/ui.js';

const pkg = readPackageJson();

function parseArgs(argv) {
  const args = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--') continue;
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) args.flags[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('-') && ['dir', 'only'].includes(k))
        args.flags[k] = argv[++i];
      else args.flags[k] = true;
    } else if (a.startsWith('-') && a.length > 1) {
      for (const ch of a.slice(1)) {
        args.flags[{ g: 'global', f: 'force', h: 'help', v: 'version', y: 'yes' }[ch] || ch] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function help() {
  banner(pkg.version);
  log(`${c.bold('USAGE')}
  npx calicoach [command] [options]

${c.bold('COMMANDS')}
  ${c.cyan('init')}          Install the coaching skills and scaffold the athlete workspace (default)
  ${c.cyan('skills')}        Install only the Claude skills (no workspace files)
  ${c.cyan('workspace')}     Create only the athlete workspace (no skills)
  ${c.cyan('check')} [files] Validate a delivered program: volume budget arithmetic, push:pull
                ratio, missing cards, missing progression triggers, session time,
                dates, constraints and citation keys.
                Defaults to calicoach/programs/*.md
  ${c.cyan('list')}          List the skills shipped with this package
  ${c.cyan('uninstall')}     Remove calicoach skills from the target .claude/skills
  ${c.cyan('doctor')}        Validate the package and report the current install status

${c.bold('OPTIONS')}
  -g, --global      Install into ~/.claude/skills instead of ./.claude/skills
      --dir <path>  Target directory (default: current working directory)
  -f, --force       Overwrite existing skill files (never touches your athlete data)
      --only <ids>  Comma-separated skill ids to install
      --strict      check: treat warnings as errors
      --no-banner   Suppress the banner
  -h, --help        Show this help
  -v, --version     Print the version

${c.bold('GETTING STARTED')}
  ${c.gray('$')} npx calicoach
  ${c.gray('$')} claude
  ${c.gray('>')} ${c.bold('Use the calisthenics-coach skill to onboard me as a new athlete.')}

${c.gray('Not medical advice. See README.md for scope and safety limits.')}
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0] || 'init';

  if (args.flags.help) return help();
  if (args.flags.version) return log(pkg.version);

  const scope = args.flags.global ? 'user' : 'project';
  const dir = typeof args.flags.dir === 'string' ? args.flags.dir : undefined;
  const force = Boolean(args.flags.force);
  const only =
    typeof args.flags.only === 'string'
      ? args.flags.only.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

  if (!args.flags['no-banner'] && cmd !== 'list') banner(pkg.version);

  switch (cmd) {
    case 'init': {
      const skills = installTo({ scope, dir, force, only });
      step('Athlete workspace');
      const wsReport = scaffoldWorkspace({ dir, force });
      finish(skills, wsReport);
      break;
    }
    case 'skills': {
      const skills = installTo({ scope, dir, force, only });
      finish(skills, null);
      break;
    }
    case 'workspace': {
      step('Athlete workspace');
      const wsReport = scaffoldWorkspace({ dir, force });
      finish(null, wsReport);
      break;
    }
    case 'check': {
      const files = args._.slice(1);
      runCheck(files, { dir, strict: Boolean(args.flags.strict) });
      break;
    }
    case 'list': {
      const skills = discoverSkills();
      log('');
      printSkillTable(skills);
      log('');
      break;
    }
    case 'uninstall': {
      step(`Removing skills from ${c.gray(resolveTarget({ scope, dir }).skillsDir)}`);
      const { removed } = uninstallSkills({ scope, dir });
      if (removed.length === 0) warn('nothing to remove');
      else ok(`removed ${removed.length} skill(s). Your calicoach/ data was left untouched.`);
      break;
    }
    case 'doctor': {
      const { skills, problems } = doctor();
      step('Package');
      ok(`${skills.length} skills bundled`);
      if (problems.length) {
        for (const p of problems) fail(p);
        process.exitCode = 1;
      } else ok('all skills valid (frontmatter + links)');

      const t = resolveTarget({ scope, dir });
      const ws = resolveWorkspace(dir);
      step('Install status');
      log(`  skills dir : ${c.gray(t.skillsDir)}`);
      log(`  workspace  : ${c.gray(ws.root)}`);
      break;
    }
    default:
      fail(`unknown command: ${cmd}`);
      log(`Run ${c.cyan('npx calicoach --help')}`);
      process.exitCode = 1;
  }
}

/** Program files to check: the given paths, or every non-template program. */
function resolveProgramFiles(given, dir) {
  if (given.length) return given;
  const ws = resolveWorkspace(dir);
  if (!fs.existsSync(ws.programs)) return [];
  return fs
    .readdirSync(ws.programs)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'))
    .sort()
    .map((f) => path.join(ws.programs, f));
}

function runCheck(given, { dir, strict }) {
  const files = resolveProgramFiles(given, dir);
  if (files.length === 0) {
    warn('no program files found — pass a path, or write one to calicoach/programs/');
    return;
  }

  let errors = 0;
  let warnings = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`not found: ${file}`);
      errors += 1;
      continue;
    }
    const { findings, stats } = checkProgram(fs.readFileSync(file, 'utf8'), { path: file });
    const errs = findings.filter((f) => f.level === 'error');
    const warns = findings.filter((f) => f.level === 'warn');
    errors += errs.length + (strict ? warns.length : 0);
    warnings += warns.length;

    step(`${displayPath(file)} ${c.gray(
      `(${stats.sessions} sessions, ${stats.exercises} exercises, ${stats.cards} cards, ${stats.constraints} constraints)`
    )}`);

    for (const f of [...errs, ...warns]) {
      const where = f.line ? c.gray(`:${f.line}`) : '';
      const tag = f.level === 'error' ? c.red('error') : c.yellow(' warn');
      log(`  ${tag} ${c.gray(f.rule.padEnd(17))}${where ? where + ' ' : ''}${f.message}`);
    }
    if (findings.length === 0) ok('no findings');
  }

  log('');
  if (errors === 0 && warnings === 0) ok(`${files.length} program(s) valid`);
  else if (errors === 0) ok(`${files.length} program(s) valid ${c.gray(`(${warnings} warning(s))`)}`);
  else {
    fail(`${errors} error(s), ${warnings} warning(s)`);
    process.exitCode = 1;
  }
}

/** Relative path when it is actually shorter and inside the cwd, absolute otherwise. */
function displayPath(target) {
  const rel = path.relative(process.cwd(), target);
  if (!rel) return '.';
  return rel.startsWith('..') || path.isAbsolute(rel) ? target : rel;
}

function installTo(opts) {
  const target = resolveTarget({ scope: opts.scope, dir: opts.dir });
  step(`Installing skills into ${c.gray(target.skillsDir)}`);
  return installSkills(opts);
}

function finish(skillReport, wsReport) {
  log('');
  if (skillReport) {
    ok(
      `${skillReport.skills.length} skills ready ${c.gray(
        `(${skillReport.written.length} files written, ${skillReport.skipped.length} skipped)`
      )}`
    );
  }
  if (wsReport) ok(`workspace at ${c.gray(displayPath(wsReport.ws.root))}`);
  log(`
${c.bold('Next step')} — open Claude Code in this folder and say:

  ${c.cyan('Use the calisthenics-coach skill to onboard me as a new athlete.')}

The coach will interview you, screen for injury risk, and write your first
program to ${c.gray('calicoach/programs/')}.
`);
}

main().catch((err) => {
  fail(err?.message || String(err));
  process.exitCode = 1;
});
