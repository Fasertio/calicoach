# Roadmap

Four tracks, each broken into phases that ship on their own. A phase is done
when `npm test` and `npm run doctor` are green and the worked example still
passes its own validator — that last one is the only objective handle on
"quality is unchanged", and it is stated as such rather than implied.

Measurements come from `npm run budget`, and `docs/budget-baseline.json` holds
them as of the last shipped phase. Regenerate before starting any phase; do not
trust a number in this file once the corpus has moved.

**Shipped:** [A1](#a1--make-the-turn-measurable--shipped),
[C1](#c1--tier-the-screen--shipped), [D1](#d1--the-commands).

| Track | What it is for | Risk if rushed |
|---|---|---|
| [A](#a--token-cost) | spend fewer tokens for the same coaching | a cheaper coach that quietly programs worse |
| [B](#b--endurance-and-skill-tracks) | blocks built around a skill or an engine, not just strength | a track that ignores the screen's constraints |
| [C](#c--a-shorter-way-in) | stop making the athlete answer more than is needed | a screen too thin to catch a real contraindication |
| [D](#d--how-it-talks) | sound like a coach, not like a document | terseness that drops a safety instruction |

The tracks are independent except where noted: **C1 depends on A1**, because
shortening the screen changes what a coaching turn reads, and that has to be
measurable before and after.

---

## A — Token cost

**Goal.** Cut the cost of the two expensive moments — designing a block and
re-reading to revise one — without changing what the athlete receives.

**Where the weight actually is.** The whole corpus is ~118,000 tokens but only
~1,118 are resident. The problem is not the corpus, it is one turn:

| Designing a block | Tokens |
|---|---|
| `example-block.md` | 23,183 |
| `exercise-library` (SKILL + all references) | 20,786 |
| other `program-design` references | 11,296 |
| `coaching-principles.md` | 4,030 |
| `program-design` SKILL.md | 4,166 |
| everything else | 6,071 |
| **input** | **69,532** |
| **output** — a block the size of the worked example | **23,183** |

Output prices at several times input, so **the block written is the single most
expensive object in the framework**, and anything that avoids re-writing one
beats anything that avoids reading.

### A1 — Make the turn measurable — **shipped**

`npm run budget` models one hypothetical turn from file sizes. That is enough to
rank files and not enough to prove a change helped.

- Add `calicoach budget --turn <design|revise|log|review>` that reports what a
  named turn actually reads, derived from the skill's own reference links
  rather than a hand-maintained list in the script.
- Commit a baseline JSON. Every later phase in this track reports its delta
  against it.

**Delivered.** Five turns are reported, derived from the skills' own links; the
design turn lands 2.7% from the hand-built model, held there by a test.
`docs/budget-baseline.json` is the reference the remaining phases measure
against.

**It also corrected the premise of this track.** Revising a block reads *more*
than designing one — 69,841 against 67,627 — because the existing block is read
back in full while designing pays a 40-token preflight and writes the block
instead. That strengthens A4 and adds a phase that was not here before: a
revision path that reads only the session being changed.

### A2 — Split the worked example

`example-block.md` is a fifth of the framework and is read before every first
program. It earns its size once — it is the only thing that conveys expected
depth — and then keeps charging for it.

- Split into `example-block.md` (block header, one complete session, one
  complete exercise card, the progression and autoregulation sections) and
  `example-block-full.md` (the remaining two sessions and fifteen cards).
- `program-design` reads the short one. It reads the full one only when the
  coach has not written a block for this athlete before, or on request.

**Expected:** the design turn drops by roughly 15,000 tokens, about 22%.
**Done when:** both files pass `calicoach check` independently, and the short
one still shows every structure the template requires at least once.

### A3 — Load only the patterns being programmed

`exercise-library` ships pull, push, legs, core and grip as separate files and
loads them as a set. A block that programs four patterns pays for nine.

- Have `exercise-library` name its reference files by pattern and load only
  those the block's volume budget is non-zero for.

**Expected:** 8,000–12,000 tokens off a typical design turn.
**Done when:** a block with no leg work demonstrably does not read
`legs-exercises.md` — asserted by A1's per-turn report, not by inspection.

### A4 — Stop rewriting cards that already exist

The largest saving in the framework, and the only one that touches output. A
second block for the same athlete regenerates sixteen exercise cards that are
already written, verbatim-equivalent, in the previous block.

- `calicoach cards` builds an index of every card in `calicoach/programs/`.
- A new block links to an existing card when the exercise and its constraints
  are unchanged, and writes a fresh one only when something actually differs.
- `check` already fails on a missing card; extend it to resolve a card through
  the index so a linked card counts as present.

**Expected:** a repeat block costs ~8,000 output tokens instead of ~23,000.
**Done when:** block 2 for the example athlete passes `check` with most cards
linked rather than copied, and the linked cards are byte-identical to what it
would have written.

**Explicitly not in this track:** shortening exercise cards, trimming coaching
prose, or dropping references. Those change the product. This track changes
what is loaded and what is regenerated — nothing the athlete reads.

---

## B — Endurance and skill tracks

**Goal.** A block whose shape follows the athlete's path, rather than a strength
block with skill work bolted on.

**What exists.** `skill-progressions` holds the ladders for planche, levers,
handstand, muscle-up, flag, pistol and one-arm pull-up — the rungs and the
advance criteria, but not how to build a week around them.
`block-archetypes.md` has foundation, hypertrophy, strength, skill and peaking.
Conditioning and endurance do not exist anywhere in the framework.

### B1 — Name the track and let it drive the block

- Add `track` to the profile: `strength` (today's default), `skill`,
  `endurance`, `hybrid`.
- `program-design` selects the archetype, the volume landmarks and the session
  shape from the track instead of always reasoning from goals alone.
- `/calicoach:program` reports the active track in its preflight, so the athlete
  can see which set of rules produced their block.

**Done when:** the same profile with two different tracks produces two
structurally different blocks, both passing `check`.

### B2 — Skill-track session templates

A skill block is not a strength block with holds added. It is high frequency,
low fatigue, quality-capped: the skill leads every session, volume is measured
in time under tension rather than sets, and the exit criterion is a hold, not a
rep.

- Session templates per skill family — straight-arm (levers, planche),
  balance (handstand), transition (muscle-up) — in `skill-progressions`.
- Straight-arm volume caps and leverage-advance rate limits, already doctrine
  in `injury-prevention`, enforced as numbers in the volume budget.

**Done when:** `check` fails a skill block that advances leverage faster than
the guardrail allows. A rule that only prose states is a rule that will be
broken.

### B3 — The endurance track

New skill `conditioning-and-endurance`, because nothing in the corpus covers it
and stretching `program-design` to hold it would push a file that is already the
heaviest in the framework.

- Energy systems, work:rest structures, and the interference question: how much
  conditioning a strength or skill block can absorb before it costs adaptation.
- Bodyweight-first: circuits, EMOM, density work, carries — machines optional.
- Its own volume axis in the budget, so conditioning volume is counted rather
  than invisible.

**Cost:** ~6,000–9,000 tokens of new references, plus ~80 resident for the
description. It only pays for itself if those references stay behind the skill
and never load for an athlete who is not on the track — which A1 can verify.

**Done when:** an endurance block passes `check`, and a strength block for an
athlete not on the track does not read a single conditioning reference.

---

## C — A shorter way in

**Goal.** Stop asking more than the programming needs.

**The finding that changes this track.** The flexibility questions are not in
onboarding. `athlete-onboarding` asks about mobility exactly once, as a
follow-up when the athlete volunteers "I'm flexible". What is long is the
**movement screen**: eighteen tests across five sections — shoulder and thoracic
(5), elbow and wrist (4), hip, knee and ankle (5), trunk (2), plus the Beighton
hypermobility screen. It runs immediately after the interview, so from the
athlete's chair it is all one long intake.

Editing `athlete-onboarding` would therefore have changed nothing. This track
targets `movement-screening`.

### C1 — Tier the screen — **shipped**

**Depends on A1** — this changes what a turn reads, and the effect has to be
measurable.

**What shipped.** Every test in `screen-battery.md` now declares a `Tier:` and
the movement patterns it `Gates:`, and `src/screen-tests.js` reads those
declarations rather than restating them. Core is seven tests — A3, A4, B2, B3,
C1, C4, D1 — plus red-flag triage. A conditional test is owed only when a core
test gating the same pattern came back as something other than a clean pass.

`calicoach check` fails a block that loads a pattern whose **core** gating test
has no result, and one whose conditional tests were escalated and left
unanswered. A workspace with no screen at all warns once instead of failing per
pattern — that is the labelled provisional week the doctrine already permits.

**Measured:** the screen turn writes ~1,700 tokens against ~3,800 for the
nineteen-test version. The reading cost is unchanged, and saying otherwise
would be false: `screen-battery.md` is one file and loads whole either way. The
saving is in what the athlete answers and what gets written down.

- **Core**, always run: the tests that produce a hard contraindication for any
  athlete — painful arc, straight-arm load tolerance, wrist extension, deep
  squat, red-flag triage.
- **Conditional**, run only when something asks for it: the goal loads that
  joint, the profile reports a relevant injury, or a core test failed. The
  ankle and single-leg battery has no business running before an upper-body
  pulling block.
- The screen records which tests were skipped and why. `check` already reports a
  stale screen; extend it to report a screen that is missing a test the current
  block's patterns require.

**Delivered:** a typical first screen is eight or nine tests instead of
nineteen, and a block containing a pattern whose gating test was skipped is a
`check` error — so the screen got shorter and the contraindications it
guarantees got *stronger*, because the gap is now detected rather than assumed
away.

### C2 — Fold the interview into fewer turns

- Ask in batches that belong together rather than one field at a time, and stop
  asking for anything the athlete has already said in passing.
- Anything not needed before the first program moves to `Open questions` in the
  profile and gets asked when it matters.

**Done when:** a complete profile is reachable in noticeably fewer exchanges,
with the same fields filled. `check` already enforces that every mandatory field
is answered or explicitly `unknown`, so this cannot quietly drop content.

---

## D — How it talks

**Goal.** Read like a coach who knows you, not like a document being recited.

This is the track most likely to do damage, because verbosity and safety are
entangled: the pain traffic light, the referral language and the constraint
rationale are long *on purpose*. So this track has a floor, stated before the
work starts: **nothing that carries a safety instruction, a referral, or the
reason a constraint exists gets shortened.**

### D1 — The commands

Done, in `52878d1`. Thirteen descriptions rewritten in the second person, short
enough to read in the slash menu, with README.md quoting them verbatim under
test so the two cannot drift.

### D2 — The interaction protocol

`calisthenics-coach/references/interaction-protocol.md` governs how the coach
interviews, delivers and says no.

- Prefer the concrete over the hedged: "that shoulder is not ready for
  overhead pressing yet" over a paragraph of qualification.
- Announce the skill once, not in every message.
- Cut the restatement of what the athlete just said back to them.

**Done when:** the worked example's coaching prose is measurably shorter with no
change to what it instructs — checked by re-reading it against the safety floor
above, not by a word count alone.

### D3 — The delivered program

The block header, the notation legend and the autoregulation section are read
once and then skipped forever.

- Move the notation legend behind a link to `notation.md` rather than repeating
  it in every block.
- Keep the pain traffic light where it is. It is the one piece of boilerplate
  that has to be in the document the athlete actually has open.

**Done when:** the example block is shorter and still passes `check`, which
verifies every required section is present — so this cannot delete a section by
accident, only tighten one.

---

## Order

~~A1 first~~ and ~~then C1~~ — both shipped. A2 and A4 next, in that order — A2 is contained, A4 is the largest saving
and the most invasive. B and D can run in parallel with any of it; B3 should
wait until A3 lands, or the new references will be loading for athletes who do
not need them, which is exactly the mistake the budget rule exists to prevent.
