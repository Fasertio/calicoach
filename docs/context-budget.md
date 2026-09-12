# Context Budget

Skills are paid for in context, every turn they are used. This is the framework's
footprint, where it concentrates, and what each planned change costs or saves.

Regenerate the numbers with:

```bash
npm run budget          # table
node scripts/context-budget.js --json
```

Tokens are estimated at 4 characters each. The ratios are what matter; the
absolute figures are indicative.

---

## The footprint

| | Tokens | What it means |
|---|---|---|
| Whole corpus | **~118,000** | every skill and reference bundled |
| Always resident | **~1,120** | the 14 skill descriptions, the only unavoidable cost |
| Heaviest turn (designing a block) | **~69,000 in / ~23,000 out** | everything `program-design` asks to be read, then the block itself |
| The thirteen commands | **0 resident** | 2,470 tokens of bodies, 155 of descriptions — none of it in the system prompt |

The gap between 118,000 and 1,120 is the whole design: **progressive
disclosure**. Having calicoach installed costs about a thousand tokens. Only the
skill actually invoked loads its `SKILL.md`, and only the references that skill
names load after that.

## The command layer

Thirteen `/calicoach:*` commands cost nothing when they are not used. Claude
Code lists their names and descriptions when the athlete types `/`, and loads a
body only on invocation, so the always-resident figure above is unchanged by
their arrival.

They are a net saving. Every command opens by running `calicoach status`, whose
output replaces the reading that used to happen before a coaching turn could
begin:

| Establishing where the athlete stands | Tokens |
|---|---|
| reading the profile, the screen, the baseline and the newest program | ~3,000 |
| one `calicoach status` preflight | ~40 |

That is the third rule below — *prefer a CLI command to a reference file
whenever the answer is computable* — applied to the way a turn starts rather
than to what it reads in the middle. It also removes a failure the reading
could not: the state is computed the same way every time, so "no profile yet"
cannot be missed by a model that skimmed.

## Where it concentrates

| Skill | SKILL.md | References | Total | Share |
|---|---|---|---|---|
| `program-design` | 4,032 | 34,155 | **38,187** | 32% |
| `exercise-library` | 1,772 | 19,014 | 20,786 | 18% |
| `skill-progressions` | 1,509 | 9,715 | 11,224 | 10% |
| `calisthenics-coach` | 1,953 | 6,942 | 8,895 | 8% |
| `movement-screening` | 1,656 | 6,508 | 8,164 | 7% |
| the other nine | 12,991 | 15,872 | 28,463 | 25% |

Two facts drive every decision below:

1. **`example-block.md` alone is 23,187 tokens — a fifth of the entire
   framework in one file.** `program-design` asks for it before the first
   program.
2. **Output, not reading, is the expensive half.** A full block with sixteen
   exercise cards is roughly the size of the worked example. Output tokens
   typically price at several times input, so ~23,000 tokens of block can cost
   more than the ~69,000 tokens of reading that produced it.

Everything that reduces *regenerations* therefore beats everything that reduces
*reading*.

---

## What Phase 0 changed

### Added

| Item | Tokens | Loaded when |
|---|---|---|
| `movement-tags.md` | ~1,055 | only by `movement-screening` |
| `Forbids:` line per constraint | ~10 | inside a document already being read |

About 1,100 tokens, confined to one skill's reference set.

### Removed

**A self-audit that could not be trusted.** Verifying "does any exercise violate
an active constraint?" previously meant re-reading the whole program — ~23,000
tokens — and reasoning exercise by exercise, across sixteen cards and three
session tables, without missing one. `npx calicoach check` answers the same
question in a tool call whose output is a few hundred tokens, and answers it
deterministically.

**A staleness sweep.** Knowing whether the screen, the profile or the baseline
had aged out meant opening all three (~3,000 tokens) and comparing dates by hand,
every time it mattered. It is now one line of check output — and, being cheap, it
actually gets done.

**Some proportion of regenerations.** Every constraint violation, blank
mandatory field or unfilled MRV signal caught by the checker is a rewrite that
does not happen. One avoided rewrite of a block saves ~23,000 output tokens —
more than twenty times what Phase 0 added.

Net: the framework got about 1% larger and removed its most expensive
verification loop.

---

## Where the remaining weight is

**`example-block.md` (23,187).** The single biggest lever. It earns its size — it
is the only thing that conveys the expected depth — but it is read on every
first program, and its value drops sharply once the coach has written one.
Splitting it into a short shape-and-tone excerpt with the full block behind an
explicit request would cut the heaviest turn by roughly a quarter.

**`exercise-library` references (19,014).** Currently loaded as a set. Pull, push,
legs, core and grip are separate files already; loading only the patterns being
programmed would save 8–12,000 tokens on a typical turn.

**Fourteen skills, 24,913 tokens of `SKILL.md`.** Averaging ~1,780 each. This is
the part that grows fastest as skills are added, and it is the part with the
least slack.

---

## The rule for what comes next

The roadmap adds skills. Each one costs context whether or not it fires, because
its description is always resident and its `SKILL.md` loads whenever it routes.

- **`SKILL.md` stays under ~1,500 tokens** (roughly 150 lines). Everything else
  goes in `references/`, named from the skill so it loads only on demand.
- **A description earns its ~80 tokens** by being specific enough to route
  correctly. A vague description costs the same and loads the wrong skill.
- **Prefer a CLI command to a reference file** whenever the answer is
  computable. A deterministic script returns tens of tokens where a reference
  costs thousands and still has to be reasoned over.

That last rule is why Phases 2 and 3 are net *savings*, not costs:

| Planned | Replaces | Reading cost today | After |
|---|---|---|---|
| `calicoach trends` | reading every log for a block review — 24 sessions × ~400 tokens | ~9,600 | ~500 |
| ~~`calicoach status`~~ — shipped | opening the program, profile, screen and reviews to work out what is due | ~3,000 | ~40 |
| `roadmap.md` | re-deriving the long-term plan from the last review each block | ~2,000 | ~600 |

Phase 4 (population coverage, peaking, mobility, conditioning) is the one that
genuinely adds weight — on the order of 15–25,000 tokens of new references. It
pays for itself only if those references stay behind their skills and never load
for an athlete they do not apply to.
