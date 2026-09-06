# Program Template

The exact structure of `calicoach/programs/YYYY-MM-DD_block-N_<focus>.md`.
Athlete-facing prose is written in the athlete's language; headings stay English.

---

```markdown
# Block <N> — <focus> · <athlete>

> Dates: YYYY-MM-DD to YYYY-MM-DD (<N> weeks + deload)
> Days/week: <n> · Session length: <min> · Archetype: <foundation|hypertrophy|strength|skill|peaking>
> Review due: YYYY-MM-DD

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
| Skill TUT (s/week) | | |
| **Push : Pull ratio** | | must be <= 1:1 |

## Weekly schedule
| Day | Session | Focus | Length |
|---|---|---|---|
| Mon | A | Pull + skill | 60 min |
| Wed | B | Push + legs | 60 min |
| Fri | C | Full body | 60 min |

---

# Session A — <focus>

## 1. Prepare (10 min)
| Drill | Dose | Note |
|---|---|---|

## 2. Skill (15 min)
| Exercise | Sets x time | Intensity | Rest | Card |
|---|---|---|---|---|

## 3. Primary strength
| # | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|
| A1 | | 4 x 5 | RIR 2 | 3-1-1-0 | 180 s | [card](#exercise-card-name) |

## 4. Secondary
| # | Exercise | Sets x reps | Intensity | Tempo | Rest | Card |
|---|---|---|---|---|---|---|

## 5. Prehab / isolation
| Exercise | Sets x reps | Intensity | Rest | Card |
|---|---|---|---|---|

## 6. Cool-down (5 min)
| Drill | Dose |
|---|---|

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
  the sessions are wrong, not the budget.
- **Every `Card` column links to the exercise card in the same file.** No
  exercise appears in a session table without a card below.
- **The progression table must cover every exercise** that has a progression, not
  just the primary lifts.
- **Constraints appear twice**: in the header block, and as `Risk notes` in the
  card of any exercise that sits near them.
- **Dates are real dates.** Every "re-test", "review" and "deload" has one.
