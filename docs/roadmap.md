# Roadmap

Four tracks, each broken into phases that ship on their own. A phase is done
when `npm test` and `npm run doctor` are green and the worked example still
passes its own validator — that last one is the only objective handle on
"quality is unchanged", and it is stated as such rather than implied.

Measurements come from `npm run budget`, and `docs/budget-baseline.json` holds
them as of the last shipped phase. Regenerate before starting any phase; do not
trust a number in this file once the corpus has moved.

**Status: every phase is shipped or closed.** What each one actually delivered
— including the three estimates in this file that the measurements contradicted
— is recorded under the phase itself, in place of the prediction it replaced.

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

### A2 — Split the worked example — **shipped**

`example-block.md` is a fifth of the framework and is read before every first
program. It earns its size once — it is the only thing that conveys expected
depth — and then keeps charging for it.

- Split into `example-block.md` (block header, one complete session, one
  complete exercise card, the progression and autoregulation sections) and
  `example-block-full.md` (the remaining two sessions and fifteen cards).
- `program-design` reads the short one. It reads the full one only when the
  coach has not written a block for this athlete before, or on request.

**Delivered:** the design turn dropped 12,627 tokens, 18.7% — short of the 22%
predicted here, because the block itself is only ~5,550 tokens and the cards
were always the weight. Revising dropped by the same amount, 18.1%.

The done-criterion as written was impossible: an *excerpt* cannot pass `check`,
which requires every prescribed exercise to have a card. So the split is not an
excerpt. `example-block.md` is the whole block plus two representative cards —
a skill hold and a loaded compound — and it declares `Cards:
example-block-cards.md` in its header. `checkProgram` follows that declaration,
so the block still validates with all sixteen cards, 3 sessions, 20 exercises,
2 constraints: identical counts to before the split. A declaration pointing at
a file that does not exist is an error, because a card library that cannot be
read looks exactly like one where every card is present.

That resolution built A4's machinery early: a block reusing a previous block's
cards is the same mechanism.

**Two things this surfaced.** A card library placed in `calicoach/programs/`
gets validated as though it were a training block — A4 has to give a shared
library a defined home in the workspace contract. And `budget()` was counting
only *linked* references, so unlinking a file made it vanish from the corpus
total; it now counts what ships, or every deferral would read as a deletion.

### A3 — Load only the patterns being programmed — **shipped**

`exercise-library` ships pull, push, legs, core and grip as separate files and
loads them as a set. A block that programs four patterns pays for nine.

- Have `exercise-library` name its reference files by pattern and load only
  those the block's volume budget is non-zero for.

**Delivered, and the estimate here was wrong.** The saving depends entirely on
how narrow the block is, and this phase said "a typical design turn" as though
that were one number:

| Block | Design turn reads | vs before A3 |
|---|---|---|
| full body (the worked example) | 55,116 | **+116** |
| pull + push | 50,115 | −4,885 |
| pull only, e.g. a front lever block | 45,906 | −9,094 |

A full-body block loads nine of the ten patterns, so it opens every catalogue
anyway and pays 116 tokens for the instruction telling it not to. The saving is
real, and it is a saving for *narrow* blocks — which is most skill blocks, and
none of the foundation blocks that are the default for new athletes. Worth
keeping; not worth having claimed 8–12,000 across the board.

**Done, as specified:** `calicoach budget --turn design` lists what the turn
skipped and why — `push-exercises.md (4,209 — no vertical push / horizontal
push / straight-arm push volume)` — so it is demonstrated rather than asserted.
The design turn's pattern list is read out of the worked example's own volume
budget, not hard-coded, so the figure stays a measurement. A turn with no
pattern list is charged for every catalogue: an unknown block must not be
flattered.

### A4 — Stop rewriting cards that already exist — **shipped**

The largest saving in the framework, and the only one that touches output. A
second block for the same athlete regenerates sixteen exercise cards that are
already written, verbatim-equivalent, in the previous block.

- `calicoach cards` builds an index of every card in `calicoach/programs/`.
- A new block links to an existing card when the exercise and its constraints
  are unchanged, and writes a fresh one only when something actually differs.
- `check` already fails on a missing card; extend it to resolve a card through
  the index so a linked card counts as present.

**Delivered.** A repeat block writes **7,500 tokens instead of 23,000** — the
largest single saving in the framework, and the only one on the output side,
where tokens cost several times what reading costs.

| Turn | Reads | Writes |
|---|---|---|
| design, first block | 55,505 | 23,000 |
| design, repeat block | 55,805 | **7,500** |

The extra 300 tokens of reading is `calicoach cards`, which answers "what does
this athlete already have" in one table instead of re-reading the previous
block to find out.

**Done, as specified:** block 2 for the worked-example athlete validates with
**zero card findings** — all sixteen cards resolve through the library rather
than being restated. The block file is 6,123 tokens against the ~23,400 the
same block would be with every card inline.

**The workspace contract gained `calicoach/cards/`**, which A2 had left open: a
library in `programs/` was being validated as though it were a training block.
`detectKind` now knows the difference, and `checkDoc` holds a library to the
same card format a block is held to — an incomplete card is *more* dangerous
there, because several blocks link to it.

**It also caught a latent bug from A2.** The `Cards:` declaration was parsed
with a character class that excluded the letter `n` as well as whitespace, so
any library whose filename contained an `n` silently failed to resolve. A2's
own tests passed only because `example-block-cards.md` and `cards.md` happen to
contain no `n`. `daniel.md` does.

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

### B1 — Name the track and let it drive the block — **shipped**

- Add `track` to the profile: `strength` (today's default), `skill`,
  `endurance`, `hybrid`.
- `program-design` selects the archetype, the volume landmarks and the session
  shape from the track instead of always reasoning from goals alone.
- `/calicoach:program` reports the active track in its preflight, so the athlete
  can see which set of rules produced their block.

**Delivered.** `src/tracks.js` holds the four tracks as data — which archetypes
each permits, what leads a session, which volume axis it must carry. The profile
declares one, the block header repeats it, and `calicoach status` reports it, so
every command's preflight shows which set of rules is in force.

The done-criterion as written could not be tested — it asks for two generated
blocks, and nothing here generates. The enforceable version is stronger: the
checker holds a block to the track it claims. A `skill` block whose Skill TUT
axis is empty is an error, because that is a strength block wearing a label.
An archetype the track does not permit is an error. An unrecognised track is an
error rather than a shrug, while saying nothing means `strength` — a profile
written before tracks existed is a strength athlete.

**It caught the worked example on the first run.** The example is a front lever
block with `Archetype: skill` and no track, so it defaulted to `strength`, which
does not permit that archetype. It now declares `Track: skill`.

`endurance` and `hybrid` are declared but deliberately not programmable: the
checker errors with *"conditioning-and-endurance is not built yet"* rather than
letting a block half-program an energy system. B3 removes that error by
building the skill.

### B2 — Skill-track session templates — **shipped**

A skill block is not a strength block with holds added. It is high frequency,
low fatigue, quality-capped: the skill leads every session, volume is measured
in time under tension rather than sets, and the exit criterion is a hold, not a
rep.

- Session templates per skill family — straight-arm (levers, planche),
  balance (handstand), transition (muscle-up) — in `skill-progressions`.
- Straight-arm volume caps and leverage-advance rate limits, already doctrine
  in `injury-prevention`, enforced as numbers in the volume budget.

**Delivered.** `src/guardrails.js` turns two pieces of doctrine into
arithmetic, using the numbers the skills already state rather than new ones:

- **`tendon-loading.md`:** straight-arm and skill-TUT volume climbs ≤ 10% a
  week. Computed from the volume budget, compounded across the weeks its
  columns actually span — 6 to 8 between week 1 and week 5 is not a 33% jump,
  it is four weeks at 7.5%.
- **`skill-progressions`:** one leverage step per 2–3 weeks. Read off the
  progression plan's weekly columns, where a change of band is a leverage step
  and a change of kilograms is not — adding weight to a pull-up moves along a
  load ladder, not a leverage ladder, and the two have different clocks.

The cap binds wherever straight-arm volume exists, not only on a skill block:
`tendon-loading.md` states it unconditionally, and a tendon does not read the
track.

The worked example is held to both in the test suite. A guardrail its own
gold-standard example fails is a guardrail with the wrong number, and checking
that first is what stopped an earlier, naive version of the rule — one that
compared adjacent progression-plan cells and would have failed the example on
a perfectly sound 15 s to 17 s step.

`session-templates.md` adds the other half: the shape of a day for the three
skill families — straight-arm, balance, transition — split that way because the
failure modes differ. Straight-arm skills fail at the elbow, balance skills at
the wrist and at attention, transition skills at the shoulder under speed.

### B3 — The endurance track — **shipped**

New skill `conditioning-and-endurance`, because nothing in the corpus covers it
and stretching `program-design` to hold it would push a file that is already the
heaviest in the framework.

- Energy systems, work:rest structures, and the interference question: how much
  conditioning a strength or skill block can absorb before it costs adaptation.
- Bodyweight-first: circuits, EMOM, density work, carries — machines optional.
- Its own volume axis in the budget, so conditioning volume is counted rather
  than invisible.

**Delivered, and cheaper than estimated:** 1,234 tokens of `SKILL.md` — inside
the 1,500 rule — and 2,457 of references, against the 6,000–9,000 predicted.
Resident cost went from 1,118 to 1,208, the 90 tokens of one more description.

**Done, and verified rather than assumed:** `calicoach budget` reports every
turn, and the conditioning references appear in none of them. An athlete who is
not on the track pays the 90-token description and nothing else — which was the
condition this phase had to meet to be worth shipping at all.

An `endurance` or `hybrid` block now validates, and a block on either track
whose budget carries no `Conditioning` row is an error: *a block that does not
train the thing the track is for is that track in name only*. The `unbuilt`
marker B1 left on both tracks is gone.

**The content leads with the interference cost**, because that is the thing
athletes get wrong: conditioning costs strength far more than strength costs
conditioning, and the structures that feel most like training — hard intervals,
moderate circuits — cost the most strength per unit of fitness. The two
protocols that are nearly free, short maximal efforts and genuinely easy steady
work, are the two nobody wants to do.

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

### C2 — Fold the interview into fewer turns — **shipped**

- Ask in batches that belong together rather than one field at a time, and stop
  asking for anything the athlete has already said in passing.
- Anything not needed before the first program moves to `Open questions` in the
  profile and gets asked when it matters.

**Delivered.** Five batches became three, and the three are the ones that gate
the first program:

- Identity and goals were two batches and are one. An athlete who says what
  they want has already said a good deal about who they are.
- Lifestyle and preferences are no longer asked before the first program. They
  shape recovery advice and coaching tone, not the first block's safety.
- History and health is untouched and explicitly marked *never compressed,
  never deferred* — it is the only batch whose absence makes a program unsafe
  rather than merely generic. Shortening an intake is only safe if it is
  obvious which part must not be shortened.

A new first step: **harvest before asking.** Read what the athlete already
wrote — the opening message, whatever `/calicoach:onboard` carried in — and
skip what it already answered, out loud rather than silently. Half of batch 1
is usually already on the screen, and asking for it again is the fastest way to
sound like a form.

Nothing is lost by deferring: `check` fails a profile with a blank mandatory
field, so anything unanswered is written as `unknown` and carried in
`Open questions`, where it stays visible.

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

### D2 — The interaction protocol — **shipped**

`calisthenics-coach/references/interaction-protocol.md` governs how the coach
interviews, delivers and says no.

- Prefer the concrete over the hedged: "that shoulder is not ready for
  overhead pressing yet" over a paragraph of qualification.
- Announce the skill once, not in every message.
- Cut the restatement of what the athlete just said back to them.

**Delivered** as three named habits rather than an instruction to be brief,
because "be less verbose" is exactly the kind of guidance that gets applied to
the wrong sentences:

- hedging instead of deciding — uncertainty belongs in a clause, not a
  paragraph, and a decision that genuinely depends on an unknown should name
  the unknown and ask;
- announcing the skill more than once — the athlete does not need the machinery
  narrated;
- restating what they just said — reflect back once, at the end of the
  interview, where it catches errors; everywhere else it is filler with the
  shape of attention.

And the floor, written into the protocol itself rather than left in this file:
anything carrying a safety instruction, a referral, or the reason a constraint
exists is not shortened. Cutting those is a safety change wearing an editorial
costume.

### D3 — The delivered program — **closed, mostly by being wrong**

This phase assumed the notation legend was boilerplate worth moving. Measured,
it is **197 tokens**, and every row in it is shorthand the block actually
writes. There is nothing there to save, and the proposed fix — a link to
`notation.md` — was worse than the problem: that file lives in the plugin, not
in the athlete's workspace, so the link would be dead in the one document the
athlete actually has open.

What survives is the rule that keeps it that way, now in `program-design`: the
legend carries **only the shorthand this block uses**. A legend listing notation
the block never writes is boilerplate the athlete learns to skip, and the habit
of skipping the legend is how a tempo gets misread.

The autoregulation section and the pain traffic light are untouched, per the
floor in D2.

---

## Order

Track A is complete: ~~A1~~, ~~A2~~, ~~A3~~, ~~A4~~ — as is ~~C1~~. Track B is complete: ~~B1~~, ~~B2~~, ~~B3~~. every phase is shipped or closed, in that order — A2 is contained, A4 is the largest saving
and the most invasive. B and D can run in parallel with any of it; B3 should
wait until A3 lands, or the new references will be loading for athletes who do
not need them, which is exactly the mistake the budget rule exists to prevent.
