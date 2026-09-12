# Design — Installable plugin and command surface

**Date:** 2026-09-09
**Status:** approved, not yet implemented

## Problem

calicoach ships fourteen skills and a CLI that copies them into
`.claude/skills/`. Two things are missing.

**It is not installable the way Claude Code installs things.** The user runs
`npx calicoach`, which writes files into their project. There is no
`/plugin marketplace add`, no `/plugin install`, no update path, and nothing an
agent other than Claude Code can consume without being told by hand where the
skills are.

**It has no command surface.** Every interaction begins with the athlete
writing a sentence that happens to match a skill description. That works, but
it is invisible: nothing tells the athlete that a movement screen exists, that
a block review is due, or what the next step in the coaching loop is. The loop
is the product, and the product has no affordances.

## Goals

1. `/plugin marketplace add Fasertio/calicoach` then
   `/plugin install calicoach@calicoach` installs the whole framework in
   Claude Code.
2. Thirteen `/calicoach:*` commands make the coaching loop discoverable and
   drive it.
3. `npx calicoach` keeps working, and gains an export for non-Claude agents.
4. The always-resident context cost does not grow.

## Non-goals

Hooks, MCP servers, subagents, per-agent plugin manifests (`.codex-plugin/`,
`.cursor-plugin/`), and any change to the fourteen skills' content. A command
that needs new doctrine is a signal the doctrine belongs in a skill, not in the
command.

---

## Architecture

### One source, three consumers

`skills/` remains the single source of truth. Nothing is copied into a second
location in the repository, and no skill file is edited by this work.

```
skills/**                             the fourteen skills, unchanged
commands/**                           thirteen command files, new
   |
   +-- .claude-plugin/plugin.json     Claude Code plugin
   |                                    skills   -> model-routed
   |                                    commands -> /calicoach:<name>
   |
   +-- npx calicoach                  .claude/skills/ + .claude/commands/calicoach/
   |
   +-- npx calicoach init --agent <id>  .agent/skills/ + AGENTS.md
```

The plugin consumes the repository in place — Claude Code clones it into its
plugin cache and reads `skills/` and `commands/` by convention. The CLI copies
the same two directories. The agent export copies `skills/` and generates an
index. No build step, no generated artifacts committed.

### Commands are thin routers

A command file is a preflight plus an intent. It never restates doctrine, never
lists the questions to ask, and never describes the output format — all of that
lives in the skill it routes to. This is the property that keeps the two
surfaces from diverging: there is exactly one place where "no program without a
profile" is written down.

Concretely, every command file is under forty lines and contains:

1. Frontmatter: `description`, `argument-hint`, `allowed-tools`.
2. A deterministic preflight line that injects workspace state.
3. One sentence naming the skill to invoke.
4. `$ARGUMENTS`, passed through as the athlete's own words.
5. The routing consequence of the preflight — which command to send the
   athlete to when a gate is not met.

### The preflight

Every command that touches athlete data begins with a line that runs the CLI
`status` command through the inline-bash form, and falls back to the literal
string `NO_WORKSPACE` when it cannot.

Inline bash in a command file is evaluated when the command expands, before the
model sees the prompt, so the state arrives as text rather than as a sequence
of file reads. This is the rule `docs/context-budget.md` already sets for the
framework — *prefer a CLI command to a reference file whenever the answer is
computable* — applied to the entry point. Establishing "who is this athlete and
where are they in the loop" costs roughly forty tokens instead of the three to
four thousand that opening `profile.md`, `screening.md`, `baseline.md` and the
newest program costs.

The command body states that the preflight output is authoritative, so the
model does not re-derive it by reading the files anyway.

**The plugin-root variable is only defined for plugin installs.** When the CLI
copies commands into `.claude/commands/calicoach/`, it rewrites that token to
the resolved absolute path of the installed `bin/calicoach.js`. The source file
stays single; the substitution happens at copy time in `src/commands.js`.

---

## The commands

Command names are namespaced by the plugin name, so the plugin must be called
`calicoach` for the table below to hold.

| Command | argument-hint | Routes to |
|---|---|---|
| `/calicoach:init` | `[--global]` | scaffolds `calicoach/`, reports install state |
| `/calicoach:status` | — | CLI `status`, no skill |
| `/calicoach:onboard` | `[anything you want to tell me]` | `athlete-onboarding` |
| `/calicoach:screen` | `[area or symptom]` | `movement-screening` |
| `/calicoach:test` | `[specific test]` | `assessment-testing` |
| `/calicoach:program` | `[goal, constraint, or "revise"]` | `program-design` |
| `/calicoach:log` | `[how it went]` | `session-logging` |
| `/calicoach:review` | `[block number]` | `progress-review` |
| `/calicoach:pain` | `<where> [since when]` | `injury-prevention` |
| `/calicoach:skill` | `<planche, front-lever, muscle-up, ...>` | `skill-progressions` |
| `/calicoach:exercise` | `<exercise name>` | `exercise-library` |
| `/calicoach:learn` | `<file or method>` | `knowledge-ingestion` |
| `/calicoach:check` | `[paths] [--strict]` | CLI `check`, no skill |

`anatomy-and-biomechanics`, `weight-room-integration` and
`recovery-and-nutrition` get no command. They are reached from inside the flows
that need them or by plain language, and a command each would add surface
without adding a way in.

### Bootstrapping under a plugin install

A plugin install puts the skills and commands on disk but creates no
`calicoach/` workspace — the athlete's data belongs to their project, not to
the plugin cache. `/calicoach:init` closes that gap by running the CLI bundled
inside the plugin itself, so the first run needs neither `npx` nor the network.
Every other command's preflight reports `NO_WORKSPACE` until it has run, and
says so by routing the athlete to `/calicoach:init`.

### Skill naming across installs

A plugin namespaces its skills: `calicoach:program-design`. A CLI install does
not: `program-design`. Command bodies name the bare id and note the namespaced
form in parentheses, which resolves correctly under both.

### Doctrine gates in commands

`/calicoach:program` is the one command that can violate the framework's
central rule. Its body states the gate explicitly: if the preflight reports no
profile or no screen, say so and route to `/calicoach:onboard` or
`/calicoach:screen` rather than writing a block. The provisional-week escape
hatch stays in `calisthenics-coach`, where it already is; the command does not
restate it.

`/calicoach:pain` routes to `injury-prevention`, and its body carries one extra
instruction: re-run red-flag triage from `movement-screening` before any
loading advice. This is the only command that names two skills, and it does so
because pain is the entry point where getting the order wrong is dangerous.

---

## New CLI: `calicoach status`

The preflight needs it and `docs/context-budget.md` already plans it. It is
read-only and deterministic.

**Output** — one screen, and `--json` for machine use:

```
athlete    Daniel - profile 2026-09-06 (3d)
screen     2026-09-06 (3d) - 2 active constraints
baseline   2026-09-07 (2d)
program    block-1 foundation - week 2 of 6 - review due 2026-10-04
logs       6 sessions - last 2026-09-08 (1d)
next       run week 2 day 3, or /calicoach:log to record the last one
```

**Rules:**

- A document that exists but is still the seeded template counts as missing.
  Reuse `isUntouchedTemplate()` from `src/check-docs.js` — `scaffoldWorkspace`
  seeds `profile.md` and `screening.md`, so existence alone proves nothing.
- Staleness uses the thresholds already exported as `STALE_AFTER` in
  `src/check-docs.js`. No second set of numbers.
- The current week is derived from the newest program's start date and the
  count of logs against it, not from a field the athlete has to maintain.
- `next` is a single sentence naming a command. Its decision order is the
  coaching loop: no profile → onboard; no screen → screen; no baseline → test;
  no program → program; review overdue → review; otherwise → the next session.
- No network, no writes, exit code 0 even when the workspace is empty. An empty
  workspace is a state to report, not an error.

New module `src/status.js` exporting `status({ dir })`, which returns a plain
object, and `formatStatus(state)` for the human rendering. `bin/calicoach.js`
gains the `status` case and the `--json` flag.

---

## Agent export

`npx calicoach init --agent <claude|codex|cursor|generic>`.

`claude` is the default and behaves exactly as today, plus commands. The other
three share one path in `src/agents.js`:

- copy `skills/` to `.agent/skills/`
- generate `AGENTS.md` at the project root
- scaffold `calicoach/` as usual

`AGENTS.md` is generated from the skills themselves — id, description and
routing line read out of each `SKILL.md` frontmatter and the routing table in
`calisthenics-coach`. It is never hand-written, so it cannot drift. If
`AGENTS.md` already exists, the generated block is delimited by
`<!-- calicoach:start -->` and `<!-- calicoach:end -->` markers and only that
region is replaced.

Commands are not exported: they are a Claude Code concept. `AGENTS.md`
documents the equivalent phrasings in prose.

---

## Manifests

`.claude-plugin/plugin.json` carries `name` (`calicoach`), `version`,
`description`, `author`, `homepage`, `repository`, `license` and `keywords`.

The `skills` and `commands` fields are omitted deliberately: both directories
sit at the conventional paths, and an explicit list is a second place to forget
to update.

`.claude-plugin/marketplace.json` declares one plugin with `"source": "./"`, so
the repository is its own marketplace and `/plugin marketplace add
Fasertio/calicoach` is enough.

The version in `plugin.json` and the version in `package.json` must match.
`calicoach doctor` enforces it.

---

## Verification

New tests, run by `npm test`:

`test/plugin.test.js`

- `plugin.json` and `marketplace.json` parse, and required fields are present
- the plugin version equals the package version
- the marketplace's single plugin is named `calicoach`, which is what makes the
  commands resolve as `/calicoach:*`

`test/commands.test.js`

- every file in `commands/` has frontmatter with a non-empty `description`
- every skill named in a command body exists in `skills/`
- every `/calicoach:<name>` referenced from a command body exists in
  `commands/`
- installing commands rewrites the plugin-root token to a path that exists
- no command file exceeds 40 lines — the guard against a command growing its
  own doctrine

`test/status.test.js`

- empty workspace, template-only workspace, and a fully populated one each
  produce the expected `next` step
- a seeded-but-unfilled `profile.md` reports as missing, not present
- an overdue review is reported as overdue
- `--json` output shape is stable
- exit code is 0 for every workspace state

`calicoach doctor` additionally checks the manifests, the version match, and
the command frontmatter, so a broken plugin fails before it is published.

---

## Files

```
NEW    .claude-plugin/plugin.json
       .claude-plugin/marketplace.json
       commands/*.md                       13 files
       src/status.js
       src/commands.js
       src/agents.js
       test/plugin.test.js
       test/commands.test.js
       test/status.test.js
MOD    bin/calicoach.js       + status, + --agent, + --json; install commands
       src/install.js         installCommands() alongside installSkills()
       src/paths.js           commandsSource, resolveCommandsDir
       package.json           version 0.2.0; files[] += .claude-plugin, commands
       README.md              plugin install as the primary path
       docs/context-budget.md the command layer's cost
```

## Context budget

Commands are not resident: Claude Code lists their names and descriptions when
the athlete types `/`, and loads a body only on invocation. The thirteen
descriptions are roughly 260 tokens and are not part of the system prompt, so
the ~1,120-token always-resident figure in `docs/context-budget.md` is
unchanged.

The preflight is a net saving. A coaching turn that previously opened four
documents to work out where the athlete stood — three to four thousand tokens —
now starts from forty tokens of `status` output. `docs/context-budget.md` gains
a row for this, and the numbers are regenerated with `npm run budget`.

## Risks

**A command drifts from its skill.** Mitigated by the forty-line cap and the
test that every named skill exists — but the cap is a proxy, not a proof. The
real defence is the review rule: a change that adds doctrine to a command file
is wrong by construction.

**The plugin-root substitution fails silently.** If the rewrite misses, the
preflight prints `NO_WORKSPACE` and the model falls back to reading files —
degraded, not broken. The test asserts the rewritten path exists.

**Two install paths diverge.** A plugin install and a CLI install produce
different skill namespaces. Command bodies name both forms. `calicoach doctor`
reports which install is active.
