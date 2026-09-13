#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  readPackageJson,
  resolveTarget,
  resolveWorkspace,
  resolveCommandsDir,
} from '../src/paths.js';
import { checkProgram } from '../src/check.js';
import { checkDoc, detectKind } from '../src/check-docs.js';
import {
  installSkills,
  scaffoldWorkspace,
  uninstallSkills,
  discoverSkills,
  doctor,
  printSkillTable,
} from '../src/install.js';
import {
  installCommands,
  uninstallCommands,
  discoverCommands,
} from '../src/commands.js';
import { exportForAgent, AGENT_IDS } from '../src/agents.js';
import { printBudget } from '../src/budget-report.js';
import { budget } from '../src/budget.js';
import { status, formatStatus } from '../src/status.js';
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
      else if (argv[i + 1] && !argv[i + 1].startsWith('-') && ['dir', 'only', 'agent', 'turn'].includes(k))
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
  ${c.cyan('status')}        Where the athlete stands: profile, screen, baseline, block, and
                what is due next. Read-only. ${c.gray('--json for machine use')}
  ${c.cyan('budget')}        What the framework costs in context, per skill and per coaching
                turn. ${c.gray('--turn <design|revise|log|review> to itemise one')}
  ${c.cyan('list')}          List the skills shipped with this package
  ${c.cyan('uninstall')}     Remove calicoach skills from the target .claude/skills
  ${c.cyan('doctor')}        Validate the package and report the current install status

${c.bold('OPTIONS')}
  -g, --global      Install into ~/.claude/skills instead of ./.claude/skills
      --dir <path>  Target directory (default: current working directory)
  -f, --force       Overwrite existing skill files (never touches your athlete data)
      --only <ids>  Comma-separated skill ids to install
      --strict      check: treat warnings as errors
      --agent <id>  init: target agent — claude (default), codex, cursor, generic.
                    Anything but claude exports to .agent/skills and AGENTS.md
      --json        status: emit JSON instead of the table
      --no-banner   Suppress the banner
  -h, --help        Show this help
  -v, --version     Print the version

${c.bold('GETTING STARTED')}
  ${c.gray('#')} as a Claude Code plugin
  ${c.gray('>')} /plugin marketplace add Fasertio/calicoach
  ${c.gray('>')} /plugin install calicoach@calicoach
  ${c.gray('>')} ${c.bold('/calicoach:init')}

  ${c.gray('#')} or from the terminal
  ${c.gray('$')} npx calicoach
  ${c.gray('>')} ${c.bold('/calicoach:onboard')}

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

  const agent = typeof args.flags.agent === 'string' ? args.flags.agent : 'claude';
  if (!AGENT_IDS.includes(agent)) {
    fail(`unknown agent "${agent}" — expected one of ${AGENT_IDS.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  if (!args.flags['no-banner'] && !['list', 'status', 'budget'].includes(cmd)) banner(pkg.version);

  switch (cmd) {
    case 'init': {
      // A non-Claude agent has no plugin format and no slash commands: it gets
      // the skills plus a generated AGENTS.md that indexes and routes them.
      if (agent !== 'claude') {
        step(`Exporting skills for ${agent}`);
        exportForAgent({ dir, agent });
        step('Athlete workspace');
        const agentWs = scaffoldWorkspace({ dir, force });
        finish(null, agentWs, null);
        break;
      }
      const skills = installTo({ scope, dir, force, only });
      const commands = installCommandsTo({ scope, dir, force });
      step('Athlete workspace');
      const wsReport = scaffoldWorkspace({ dir, force });
      finish(skills, wsReport, commands);
      break;
    }
    case 'skills': {
      const skills = installTo({ scope, dir, force, only });
      const commands = installCommandsTo({ scope, dir, force });
      finish(skills, null, commands);
      break;
    }
    case 'workspace': {
      step('Athlete workspace');
      const wsReport = scaffoldWorkspace({ dir, force });
      finish(null, wsReport, null);
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
      log(`
${c.bold('COMMANDS')}`);
      for (const cmd of discoverCommands()) {
        log(`  ${c.cyan(`/calicoach:${cmd.id}`.padEnd(22))}  ${c.gray(cmd.description)}`);
      }
      log('');
      break;
    }
    case 'uninstall': {
      step(`Removing skills from ${c.gray(resolveTarget({ scope, dir }).skillsDir)}`);
      const { removed } = uninstallSkills({ scope, dir });
      if (removed.length === 0) warn('nothing to remove');
      else ok(`removed ${removed.length} skill(s). Your calicoach/ data was left untouched.`);
      const { removed: cmds } = uninstallCommands({ scope, dir });
      if (cmds.length) ok(`removed ${cmds.length} command(s)`);
      break;
    }
    case 'doctor': {
      const { skills, commands, problems } = doctor();
      step('Package');
      ok(`${skills.length} skills bundled`);
      ok(`${commands.length} commands bundled`);
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
    case 'budget': {
      const turn = typeof args.flags.turn === 'string' ? args.flags.turn : undefined;
      if (args.flags.json) log(JSON.stringify(budget(), null, 2));
      else process.exitCode = printBudget({ turn });
      break;
    }
    case 'status': {
      const state = status({ dir });
      log(args.flags.json ? JSON.stringify(state, null, 2) : formatStatus(state));
      break;
    }
    default:
      fail(`unknown command: ${cmd}`);
      log(`Run ${c.cyan('npx calicoach --help')}`);
      process.exitCode = 1;
  }
}

/**
 * Documents to check: the given paths, or the whole workspace.
 *
 * The program is only as sound as what it was derived from, so a bare `check`
 * covers the profile, the screen and the baseline as well — a stale screen is
 * invisible from inside the program that respects it.
 */
function resolveCheckFiles(given, dir) {
  if (given.length) return given;
  const ws = resolveWorkspace(dir);
  const found = [];

  for (const name of ['profile.md', 'screening.md', 'baseline.md']) {
    const file = path.join(ws.athlete, name);
    if (fs.existsSync(file)) found.push(file);
  }
  for (const folder of [ws.programs, ws.reviews]) {
    if (!fs.existsSync(folder)) continue;
    found.push(
      ...fs
        .readdirSync(folder)
        .filter((f) => f.endsWith('.md') && !f.startsWith('_TEMPLATE'))
        .sort()
        .map((f) => path.join(folder, f))
    );
  }
  return found;
}

/** One line describing what the checker found in a file. */
function summarise(kind, stats) {
  if (kind !== 'program') return kind;
  return `program — ${stats.sessions} sessions, ${stats.exercises} exercises, ${stats.cards} cards, ${stats.constraints} constraints`;
}

function runCheck(given, { dir, strict }) {
  const files = resolveCheckFiles(given, dir);
  if (files.length === 0) {
    warn('nothing to check — pass a path, or run `npx calicoach init` to scaffold a workspace');
    return;
  }

  let errors = 0;
  let warnings = 0;
  let checked = 0;

  for (const file of files) {
    if (!fs.existsSync(file)) {
      fail(`not found: ${file}`);
      errors += 1;
      continue;
    }
    const md = fs.readFileSync(file, 'utf8');
    // A file handed in by path may sit anywhere; assume a program unless the
    // workspace layout says otherwise.
    const kind = detectKind(file) ?? 'program';
    const { findings, stats } =
      kind === 'program' ? checkProgram(md, { path: file }) : checkDoc(md, { path: file, kind });

    if (kind === 'log') continue;
    checked += 1;

    const errs = findings.filter((f) => f.level === 'error');
    const warns = findings.filter((f) => f.level === 'warn');
    errors += errs.length + (strict ? warns.length : 0);
    warnings += warns.length;

    step(`${displayPath(file)} ${c.gray(`(${summarise(kind, stats)})`)}`);

    for (const f of [...errs, ...warns]) {
      const where = f.line ? c.gray(`:${f.line}`) : '';
      const tag = f.level === 'error' ? c.red('error') : c.yellow(' warn');
      log(`  ${tag} ${c.gray(f.rule.padEnd(17))}${where ? where + ' ' : ''}${f.message}`);
    }
    if (findings.length === 0) ok('no findings');
  }

  for (const f of overdueReviews(files)) {
    warnings += 1;
    if (strict) errors += 1;
    step(`${displayPath(f.file)} ${c.gray('(workspace)')}`);
    log(`  ${c.yellow(' warn')} ${c.gray('stale'.padEnd(17))}${f.message}`);
  }

  log('');
  if (errors === 0 && warnings === 0) ok(`${checked} document(s) valid`);
  else if (errors === 0) ok(`${checked} document(s) valid ${c.gray(`(${warnings} warning(s))`)}`);
  else {
    fail(`${errors} error(s), ${warnings} warning(s)`);
    process.exitCode = 1;
  }
}

/**
 * A block whose review date has passed with no review written for it.
 * Only the workspace as a whole can see this: the program file is correct, and
 * the review simply does not exist.
 */
function overdueReviews(files) {
  const today = new Date().toISOString().slice(0, 10);
  const reviews = files.filter((f) => detectKind(f) === 'review');
  const out = [];

  for (const file of files.filter((f) => detectKind(f) === 'program')) {
    const due = /Review due:\s*(\d{4}-\d{2}-\d{2})/i.exec(fs.readFileSync(file, 'utf8'))?.[1];
    if (!due || due >= today) continue;
    const block = /block-(\d+)/i.exec(path.basename(file))?.[1];
    const reviewed = reviews.some((r) =>
      block ? new RegExp(`block-${block}-review`, 'i').test(path.basename(r)) : false
    );
    if (!reviewed) {
      out.push({
        file,
        message: `review was due ${due} and none is written — run progress-review before designing the next block`,
      });
    }
  }
  return out;
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

function installCommandsTo(opts) {
  step(`Installing commands into ${c.gray(resolveCommandsDir(opts))}`);
  return installCommands(opts);
}

function finish(skillReport, wsReport, cmdReport) {
  log('');
  if (skillReport) {
    ok(
      `${skillReport.skills.length} skills ready ${c.gray(
        `(${skillReport.written.length} files written, ${skillReport.skipped.length} skipped)`
      )}`
    );
  }
  if (cmdReport) {
    ok(
      `${cmdReport.written.length + cmdReport.skipped.length} commands ready ${c.gray(
        '(type /calicoach: to see them)'
      )}`
    );
  }
  if (wsReport) ok(`workspace at ${c.gray(displayPath(wsReport.ws.root))}`);
  log(`
${c.bold('Next step')} — open Claude Code in this folder and run:

  ${c.cyan('/calicoach:onboard')}

The coach will interview you, screen for injury risk, and write your first
program to ${c.gray('calicoach/programs/')}. ${c.gray('/calicoach:status tells you what is due.')}
`);
}

main().catch((err) => {
  fail(err?.message || String(err));
  process.exitCode = 1;
});
