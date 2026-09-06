---
name: program-design
description: Use to write or revise a training program (scheda) - a full training block with weekly structure, exercise selection, sets, reps, tempo, rest, progression rules and full exercise cards, written as Markdown to calicoach/programs/. Use when the athlete asks for a workout, a new block, a program change, or a plan for a specific goal.
---

# Program Design

Turn the profile, the screen and the baseline into a block the athlete can
actually run — safely, and with a written rule for what happens when it goes
well and when it goes badly.

**Announce it:** "Using program-design to build your block."

## Preconditions — check before writing anything

| Required | Where | If missing |
|---|---|---|
| Profile | `calicoach/athlete/profile.md` | run [athlete-onboarding](../athlete-onboarding/SKILL.md) |
| Screening constraints | `calicoach/athlete/screening.md` | run [movement-screening](../movement-screening/SKILL.md) |
| Baseline numbers | `calicoach/athlete/baseline.md` | run [assessment-testing](../assessment-testing/SKILL.md), or mark every derived number `estimated` |
| Previous block review | `calicoach/reviews/` | first block: skip; otherwise run [progress-review](../progress-review/SKILL.md) first |

Read all of them from disk. Do not work from conversation memory.

## Output

`calicoach/programs/YYYY-MM-DD_block-N_<focus>.md`, following
[program-template.md](references/program-template.md) exactly.

The file contains the whole block — not one week, not one session. Every
prescribed exercise carries a full exercise card
([exercise-library](../exercise-library/SKILL.md) defines the card format).

**Read [example-block.md](references/example-block.md) before writing your
first program.** It is a complete worked block with the design commentary
attached — the depth, the arithmetic and the tone expected. Prescription
shorthand is defined in [notation.md](references/notation.md).

---

## The eleven design steps

### 1. State the block aim in one sentence
"Build the pulling base and shoulder tolerance needed to start front lever work,
without provoking the right shoulder." If you cannot write this sentence, you do
not understand the goal yet — go back and ask.

### 2. Set the constraints
Copy the `Active constraints` block from `screening.md` into the program header,
verbatim — including each constraint's `Forbids:` line. Every exercise choice
below is checked against it. If a constraint would be violated, the exercise does
not go in — no exceptions, no "just be careful".

The `Forbids:` tags are what let the validator check this for you, exercise by
exercise, instead of trusting your eye over two thousand lines. If you genuinely
want a restricted pattern back in a permitted form, name that exact variant in
the constraint's `Instead:` — that is a coaching decision, and it has to be
written down as one. See
[movement-tags.md](../movement-screening/references/movement-tags.md).

### 3. Choose the block archetype
Pick from [block-archetypes.md](references/block-archetypes.md) based on the
athlete's band, goal and history. Foundation blocks are the default for anyone
new, returning, or carrying constraints — including athletes who feel strong.

### 4. Set frequency and split
From `profile.md`: realistic days, session length, time of day. Use the split
table in
[coaching-principles](../calisthenics-coach/references/coaching-principles.md).
Build for the days that survive a bad week; add optional work for good weeks.

### 5. Allocate weekly volume per pattern
Use the volume landmarks table. Start near MEV for this athlete's band, not at
the top of the range. Write the planned weekly hard-set count per pattern into
the program — it is a budget, and it must add up.

Patterns to account for every week: vertical pull, horizontal pull, vertical
push, horizontal push, knee-dominant, hip hinge, anti-extension core,
anti-rotation/lateral core, plus skill TUT if a skill is targeted.

Check the **push:pull ratio** — pull volume equal to or greater than push volume,
always. Bodyweight training is structurally biased toward pushing, because
pulling is the only pattern that needs equipment; the rule is a correction for
that bias, not a preference.

Then run the **six-axis balance audit** in
[structural-balance.md](references/structural-balance.md): horizontal push/pull,
vertical push/pull, knee/hip-dominant, core planes, and bilateral/unilateral.
The unilateral axis and the core-plane axis are the two most often missing.

### 6. Select exercises
For each pattern, pick the variation that matches the athlete's band, equipment
and constraints. Rules:

- **Skill-specific work first** if there is a skill goal — the skill or its
  nearest technical regression, performed fresh.
- **One primary movement per pattern per session.** Extra variety is accessory
  volume, not a second primary.
- **Every exercise needs a regression and a progression** already chosen. Write
  both into the card.
- **Prefer the version the athlete can do with clean technique today**, not the
  one that looks like the goal.
- Bring in weight-room movements via
  [weight-room-integration](../weight-room-integration/SKILL.md) whenever they
  are the better tool — loading a hinge, isolating a lagging muscle, or training
  a pattern that a constraint has removed from bodyweight work.
- Include prehab from [injury-prevention](../injury-prevention/SKILL.md) — it is
  part of the program, not an optional extra.

### 7. Prescribe the dose
For every exercise: **sets x reps (or seconds) @ intensity, tempo, rest**.

- Intensity is RIR for reps, RPE for isometrics, %BW or kg for loaded work.
- **Isometric holds are dosed from a measured maximum**, not guessed: test the
  max clean hold, then program 60–75% of it. Table in
  [progression-rules.md](references/progression-rules.md).
- Tempo as four digits `ecc-pause-con-pause`. **The default is `10X0`** — a
  controlled 1 s eccentric and an explosive concentric. Slow eccentrics are a
  tool with a stated reason (tissue tolerance, a technical fault, tendon
  loading), not a habit.
- Rest in seconds, prescribed by purpose: 180–300 s strength and skill work,
  180–240 s combined strength/hypertrophy, 60–240 s hypertrophy, 30–90 s easy
  accessory and core work.
- Use the shorthand in [notation.md](references/notation.md) in the session
  tables, and paste its legend block into the program. Any shorthand must have a
  matching row in the progression table that spells the weeks out.
- Never prescribe "to failure" on straight-arm isometrics, overhead barbell work,
  or anything with a fall risk.

**Then check the session fits.** Estimate the time and compare it to the
athlete's stated session length:

```
session minutes ~= warm-up + cool-down
                 + SUM over exercises of  sets x (work seconds + rest seconds) / 60
work seconds per set ~= reps x (sum of the four tempo digits), or the hold time
```

If the estimate exceeds the budget, fix it **in this order**:

1. **Pair antagonists and halve the rest.** Horizontal push with horizontal
   pull, knee-dominant with hip-dominant, planche with front lever. Each
   exercise's rest becomes the other's work, and a session can fit roughly twice
   the work. Never pair movements that share muscles. See
   [structural-balance.md](references/structural-balance.md).
2. **Raise the frequency** if the athlete has the days — four 30-minute sessions
   fit more balanced work than two 60-minute ones.
3. **Cut an exercise**, from the pattern furthest above its landmark.

Never cut the warm-up, never cut the prehab, never compress rest on heavy or
skill work below the pairing floor. State the estimate in the program if it is
tight — an honest 62 minutes against a 60-minute budget is fine; an unstated 78
is not.

### 7b. Write the notes
The notes column is where the coaching actually lives. Sets and reps are close to
meaningless without it. For each exercise, the note carries whatever the numbers
cannot:

- the intra-set structure (`5+5+5+5` needs "20 s between blocks");
- the week-by-week change in plain words;
- the one technical focus for this exercise, this block;
- the specific stop signal, naming the structure where it matters;
- a video request where you cannot judge from a written report.

Write notes in the athlete's language, in the second person, the way you would
say them out loud.

### 8. Write the progression and regression rules
Every exercise gets both, in writing, with numbers. See
[progression-rules.md](references/progression-rules.md).

```
Progress: 3x8 clean at RIR>=2 for two consecutive sessions -> add one rep per set,
          up to 3x10, then move to Ring Row feet-elevated.
Regress:  reps drop >20% for two sessions, OR any elbow symptom -> back to
          Ring Row at 45 deg, hold 2 weeks, then re-attempt.
```

### 9. Write the autoregulation rules
What the athlete does on a bad day, a short day, and a painful day. This section
is mandatory in every program:

- **Bad day** (poor sleep, high stress): keep the exercises, cut the last set of
  each accessory, keep intensity, drop skill work to 60% of planned TUT.
- **Short day** (half the time): do the first two exercises only, at full
  prescription. Never compress by cutting rest on heavy work.
- **Amber pain** (3–4/10): take the written regression, keep it under 4/10,
  report it in the log.
- **Red pain** (>4/10, sharp, or worsening): stop that movement, substitute the
  named alternative, message the coach.

### 10. Schedule the deload and the review
Week 4, 5 or 6 depending on archetype. Deload = same exercises, same intensity,
40–60% of the volume. Put the review date in the file.

### 11. Validate, then deliver
Write the file, then run the validator:

```
npx calicoach check calicoach/programs/<file>.md
```

It checks the arithmetic and the cross-references you cannot reliably check by
eye: whether the volume budget matches the sets you actually wrote, the push:pull
ratio, missing cards, missing progression triggers, session time against the
stated length, real dates, citation keys — and, above all, **whether any
prescribed exercise violates an active constraint**.

Run it over the whole workspace with a bare `npx calicoach check`: it validates
the profile, the screen and the baseline too, and tells you when one of them has
gone stale underneath the program you are about to write.

**A program is not finished until it passes with no errors.** Fix what it finds,
rerun it, then work the checklist at the bottom of this file for the things no
parser can judge. Then summarise in chat in under 15 lines.

---

## Session template

Every session in the program follows this order:

| Phase | Time | Content |
|---|---|---|
| 1. Prepare | 8–12 min | pulse raiser, joint prep for today's joints, specific ramp-up sets |
| 2. Skill | 10–20 min | only if there is a skill goal; fresh, RIR 3–5, stop on quality loss |
| 3. Primary strength | 15–25 min | 1–2 compound movements, heaviest work of the day |
| 4. Secondary | 15–20 min | 2–3 movements, hypertrophy or pattern volume |
| 5. Prehab / isolation | 8–12 min | cuff, scapular, elbow, hip, knee, grip |
| 6. Cool-down | 5 min | breathing, gentle mobility for today's joints |

If the athlete has 45 minutes, cut phase 4, not phase 1 or 5.

**Write the warm-up and the cool-down once, for the whole block**, in a
`Warm-up (all sessions)` section near the top — not repeated inside every
session. Add a per-session line only where a session needs something extra
(a specific ramp-up, a second wrist exposure). This is how real programs are
delivered, and it makes the sessions readable at the bar.

---

## Common design mistakes — check yourself against these

| Mistake | Symptom in your draft | Fix |
|---|---|---|
| Volume budget doesn't add up | you never counted hard sets per pattern | write the budget table and total it |
| Push > pull | more pressing than pulling | rebalance to >= 1:1 pull:push |
| Skill work buried mid-session | planche after a pull block | move it to phase 2 |
| Two straight-arm skills at once | planche and front lever both progressing | pick one primary, other is maintenance |
| No regression written | "if it's hard, do less" | name the exact regression and the trigger |
| Progression with no exit criterion | "add reps each week" | specify the target and what happens at the top |
| Constraints not visible | screening said no overhead, program has OHP | copy constraints into the header and check each exercise |
| No prehab | jumps straight from warm-up to work | phase 5 is not optional |
| Tempo everywhere for no reason | `4-2-1-1` on every accessory | tempo has a purpose or it is `2-0-1-0` |
| Deload missing | 6 weeks of climbing volume | schedule it in the file |
| Program is a workout list | no aim, no rules, no review date | add the header sections |
| Session does not fit the time | 9 exercises in a 45-minute slot | run the time estimate in step 7; cut an exercise |
| Shorthand with no expansion | `2-` and `4 e 6` in the tables, nothing in the progression plan | every shorthand gets a week-by-week row |
| Empty notes column | "3x8" with no coaching | the note carries the focus, the structure and the stop signal |
| Warm-up copy-pasted into every session | four identical 12-line blocks | one `Warm-up (all sessions)` section |
| Optional work uncounted | "extra finisher if you feel good" outside the budget | count it, or do not offer it |

---

## Revising an existing program

Do not rewrite from scratch. Read the current program and the logs since it
started, then:

1. Identify what actually happened (adherence, regressions taken, symptoms).
2. Change the minimum number of variables. One primary change per revision.
3. Append to the program's `Changelog` with the date, the change, and the reason.
4. Tell the athlete what changed and why, in three lines.

If more than three things need to change, the block is over — run
[progress-review](../progress-review/SKILL.md) and design the next block.

---

## Definition of done

- [ ] Profile, screening and baseline read from disk
- [ ] Block aim written in one sentence
- [ ] `Active constraints` copied into the header with their `Forbids:` lines,
      and every exercise checked against them, line by line
- [ ] Weekly hard-set budget per pattern written and **totalled against the sets
      actually written into the sessions** — including optional work
- [ ] Push:pull ratio >= 1:1 in favour of pull
- [ ] Any pattern deliberately below its landmark is stated as such, with a plan
- [ ] Skill work (if any) scheduled fresh, with capped TUT and a <=10%/week climb
- [ ] Every exercise has: dose, tempo, rest, intensity, a note, a progression
      rule, a regression rule, and a full exercise card with references
- [ ] Notation legend pasted in, and every shorthand expanded in the progression
      plan
- [ ] Warm-up and cool-down written once for the block
- [ ] Prehab present in every session
- [ ] Session time estimated and within the athlete's stated session length
- [ ] Autoregulation rules written (bad day / short day / amber / red / missed)
- [ ] Deload and review dates scheduled, with the review's decision rules written
      before the data exists
- [ ] File written to `calicoach/programs/YYYY-MM-DD_block-N_<focus>.md`
- [ ] **`npx calicoach check <file>` passes with no errors**
- [ ] Chat summary under 15 lines, leading with what matters most this block

## What the checker cannot judge

It verifies that the document holds together. It cannot tell you whether the
exercise selection suits this athlete, whether the aim is the right aim, or
whether a note reads like a coach wrote it. A program that passes the checker can
still be bad coaching — the checker only guarantees it is not *incoherent*.
