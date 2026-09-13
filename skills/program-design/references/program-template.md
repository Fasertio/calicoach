# Program Template

The exact structure of `calicoach/programs/YYYY-MM-DD_block-N_<focus>.md`.
Athlete-facing prose is written in the athlete's language; headings stay English.

---

```markdown
# Block <N> — <focus> · <athlete>

> Dates: YYYY-MM-DD to YYYY-MM-DD (<N> weeks + deload)
> Track: <strength|skill|endurance|hybrid> · Days/week: <n> · Session length: <min> · Archetype: <foundation|hypertrophy|strength|skill|peaking>
> Review due: YYYY-MM-DD
> Cards: ../cards/<athlete>.md

## Block aim
<One sentence. What this block is for and what it will produce.>

## Goals this block serves
| Goal | Marker at start | Target at review |
|---|---|---|

## Active constraints
<!-- copied verbatim from athlete/screening.md -->
- [ID] <removed> · Instead: <substitute> · Earns it back: <criterion> · Re-test: YYYY-MM-DD

## Weekly volume budget
| Pattern | Hard sets/week | Notes |
|---|---|---|
| Vertical pull | | |
| Horizontal pull | | |
| Vertical push | | |
| Horizontal push | | |
| Knee-dominant | | |
| Hip hinge | | |
| Anti-extension core | | |
| Anti-rotation / lateral core | | |
| Straight-arm pull (sets) | | own progression clock |
| Skill TUT (s/week) | | <= +10%/week |
| **Push : Pull ratio** | | must be <= 1:1 |

Counts must equal the sets actually written into the sessions below, **including
optional work**. State any pattern deliberately below its landmark, with a plan.

## Session time check
| Session | Estimated | Budget |
|---|---|---|
| A | <min> | <min> |

## Weekly schedule
| Day | Session | Focus | Length |
|---|---|---|---|
| Mon | A | Pull + skill | 60 min |
| Wed | B | Push + legs | 60 min |
| Fri | C | Full body | 60 min |

## Notation
<!-- paste the legend from notation.md, keeping only the rows this program uses -->
| | |
|---|---|
| `3 e 4` | 3 sets weeks 1-3, 4 sets weeks 4-5 |
| `5 x 8-12"` | 5 sets, hold 8 to 12 seconds |
| `RIR 2` | stop the set with 2 reps left in the tank |
| `RPE 8` | hold until the position is about to break, not until it breaks |
| `3-1-1-0` | tempo: 3s down, 1s pause, 1s up, no pause |
| `x l` | per side |
| `\\` | see the note for that exercise |

## Warm-up (all sessions)
<!-- written ONCE for the whole block, not repeated per session -->
| Block | Drill | Dose |
|---|---|---|
| Pulse raiser | | 3 min |
| <joint> | | |
| Specific | 2-3 ramp-up sets of the session's first exercise | — |

## Cool-down (all sessions)
| Drill | Dose |
|---|---|

---

# Session A — <focus>   ·   Day <n> · <weekday> · <min> min

<!-- Warm-up and cool-down are in the block header. Add a line here only if this
     session needs something extra. -->

One table for the whole day, in the order it is performed. `Phase` is the
controlled vocabulary — Skill, Constraint work, Primary, Secondary, Prehab —
and stays in that form whatever language the rest of the program is written in;
the checker reads it to decide which exercises must carry a card.

| # | Phase | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|---|
| 1 | Skill | | 5 x 8-12" | RPE 8 | | 150 s | [card](#exercise-card-name) |
| A1 | Primary | | 4 x 5 | RIR 2 | 3-1-1-0 | 180 s | [card](#exercise-card-name) |
| A2 | Primary | | | | | | |
| B1 | Secondary | | | | | | |
| B2 | Secondary | | | | | | |
| P1 | Prehab | | 3 x 15 | | | 45 s | |

*Do them top to bottom. A shared letter is a paired set: A1, rest, A2, rest,
repeat. A bare number is unpaired — finish all its sets before moving on.*

**How to run it**

Keep the table to numbers. Everything that needs a sentence — why this exercise
is here, what the quality standard is, which constraint it respects — goes here
as one bullet per `#`, so the table stays scannable mid-session.

- `1` — why it leads, and what ends the set.
- `A1/A2` — what the pairing is for, and the rest inside it.
- `B1/B2` —
- `P1` —

<repeat for Session B, C, ...>

---

# Progression plan

| Exercise | Week 1 | Week 2 | Week 3 | Week 4 | Deload | Progress when | Regress when |
|---|---|---|---|---|---|---|---|
| Pull-up | 4x5 | 4x6 | 4x7 | 5x7 | 3x5 | 4x7 @RIR>=2 x2 sessions | reps -20% x2, or elbow sx |

Each row must state a numeric progress trigger and a numeric regress trigger.

---

# Autoregulation

**Bad day** (slept <6 h, stress high, DOMS heavy):
<what to cut, what to keep>

**Short day** (half the time):
<which exercises survive, in order>

**Amber pain (3-4/10)**:
<take the named regression, cap at 4/10, log it>

**Red pain (>4/10, sharp, worsening, or lasting >24 h)**:
<stop that movement, use the named substitute, message the coach>

**Missed sessions:**
<1 missed: continue where you left off. 2+ missed in a week: repeat the week.
1 week missed: restart the week at 70% volume.>

---

# Exercise cards

<!-- Only cards this block introduces. Everything the athlete already has lives
     in the library named by `Cards:` above; run `npx calicoach cards` to see
     it. Linking beats restating — a rewritten card is the most expensive
     output this framework produces. -->

Full card per prescribed exercise — see exercise-library for the format.

## <Exercise name>
**Pattern** · **Primary muscles** · **Equipment** · **Difficulty**

**Why it is here:** <one line tying it to the block aim>

**Setup**
1.

**Execution**
1.

**Cues**
-

**Breathing** ·
**Tempo** ·

**Common faults**
| Fault | Why it matters | Fix |
|---|---|---|

**Risk notes**

**Regressions** (easier -> this)
1.

**Progressions** (this -> harder)
1.

**Substitutes** (same stimulus, different equipment/constraint)
-

**References**
-

---

# Deload week
| Change | Detail |
|---|---|
| Volume | 40-60% of week 4 sets |
| Intensity | unchanged |
| Skill work | technique only, 50% TUT |
| Prehab | unchanged (full) |

---

# What to log
Every session: exercise, sets, reps/time achieved, RIR/RPE, any pain 0-10 and
where, sleep, and one line on how it felt. Use
[session-logging](../../session-logging/SKILL.md).

# Review
Date: YYYY-MM-DD. We will retest: <markers>. Decision points: <what we will
decide based on the results>.

# Changelog
| Date | Change | Reason |
|---|---|---|
| YYYY-MM-DD | Block created | — |
```

---

## Notes on filling it in

- **The volume budget table is not decoration.** Count the hard sets you actually
  wrote into the sessions and make sure they match the budget. If they do not,
  the sessions are wrong, not the budget. Optional and finisher work counts.
- **Every `Card` column links to the exercise card in the same file.** No
  exercise appears in a session table without a card below. Cards may be
  generated from [exercise-library](../../exercise-library/SKILL.md), but they
  must be *in the program file* — the athlete should never have to look
  elsewhere.
- **The `Note` column is where the coaching lives.** Intra-set structure, the
  week-by-week change in words, the technical focus, the stop signal. Written in
  the athlete's language, second person.
- **The progression table must cover every exercise** that has a progression, not
  just the primary lifts, and every shorthand used in a session table must have a
  row here that spells the weeks out.
- **Warm-up and cool-down are written once**, in the block header. Repeating them
  per session makes the document unusable at the bar.
- **Constraints appear twice**: in the header block, and as `Risk notes` in the
  card of any exercise that sits near them.
- **Dates are real dates.** Every "re-test", "review" and "deload" has one, and
  the review's decision rules are written before the data exists.
- **See [example-block.md](example-block.md)** for a filled-in block with the
  design reasoning attached.
