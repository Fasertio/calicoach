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

---

## The eleven design steps

### 1. State the block aim in one sentence
"Build the pulling base and shoulder tolerance needed to start front lever work,
without provoking the right shoulder." If you cannot write this sentence, you do
not understand the goal yet — go back and ask.

### 2. Set the constraints
Copy the `Active constraints` block from `screening.md` into the program header,
verbatim. Every exercise choice below is checked against it. If a constraint
would be violated, the exercise does not go in — no exceptions, no "just be
careful".

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
always.

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
- Tempo as four digits `ecc-pause-con-pause`, e.g. `3-1-1-0`. Say why when it
  is unusual.
- Rest in seconds, and it is real: 150–240 s for heavy compound and skill work,
  60–120 s for accessories, 45–90 s for prehab.
- Never prescribe "to failure" on straight-arm isometrics, overhead barbell work,
  or anything with a fall risk.

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

### 11. Sanity-check before delivering
Run the checklist at the bottom of this file. Then write the file, then summarise
in chat in under 15 lines.

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
- [ ] `Active constraints` copied into the header and every exercise checked
      against them
- [ ] Weekly hard-set budget per pattern written and totalled
- [ ] Push:pull ratio >= 1:1 in favour of pull
- [ ] Skill work (if any) scheduled fresh, with capped TUT
- [ ] Every exercise has: dose, tempo, rest, intensity, progression rule,
      regression rule, and a full exercise card with references
- [ ] Prehab block present in every session
- [ ] Autoregulation rules written (bad day / short day / amber / red)
- [ ] Deload and review dates scheduled
- [ ] File written to `calicoach/programs/YYYY-MM-DD_block-N_<focus>.md`
- [ ] Chat summary under 15 lines, leading with what matters most this block
