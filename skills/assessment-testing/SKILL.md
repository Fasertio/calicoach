---
name: assessment-testing
description: Use after screening and before the first program, and again at the end of every block, to measure the athlete's actual starting point - strength tests, skill holds, mobility markers and work capacity - and write calicoach/athlete/baseline.md. Also use when the athlete asks "what level am I" or wants to retest a specific standard.
---

# Assessment & Testing

Replace self-reported estimates with measurements. Every progression rule in the
program depends on a real starting number.

**Announce it:** "Using assessment-testing to measure your starting point."

## Output

`calicoach/athlete/baseline.md` — a dated table of measured values. Never
overwrite an old baseline; append a new dated column so trends are visible.

## Rules of testing

1. **Never test what the screen constrained.** A contraindicated pattern is not
   tested; it is marked `not tested — [CONSTRAINT-ID]`.
2. **Test fresh.** Testing happens at the start of a session, after a full
   warm-up, on a day the athlete slept normally. A test done tired is a
   measurement of tiredness.
3. **One quality per session, at most three tests.** Fatigue contaminates
   everything after the first maximal effort.
4. **Define the standard before the attempt.** Full ROM, no kipping, hold quality
   criteria — say it, then judge it. Reps that break the standard do not count.
5. **Stop at technical failure, not muscular failure**, for anything with a fall
   risk or a straight-arm component.
6. **Record conditions.** Bodyweight, time of day, sleep, and what preceded the
   test. Numbers without conditions are not comparable.
7. **Retest identically.** Same standard, same order, same warm-up, same time of
   day.

## Test order within a session

Skill/technique -> maximal strength -> rep max -> isometric holds -> work
capacity -> mobility markers. Never the reverse.

Spread a full battery over 2–3 sessions in one week. Do not test everything in
one day and call the resulting numbers a baseline.

---

## Core battery

### Strength

| Test | Standard | Record |
|---|---|---|
| **Max strict pull-ups** | dead hang start, arms fully extended, chin clearly over the bar, no kipping, no leg drive | reps |
| **Max strict dips** | shoulders to at least humerus-parallel (deeper only if screened clean), full lockout, no swing | reps |
| **Max push-ups** | body straight, chest to fist height, full lockout, 1 s cadence | reps |
| **Max inverted rows** | body straight, chest touches bar/rings, full extension at the bottom | reps + bar height |
| **Weighted pull-up 5RM** | only if 10+ strict bodyweight reps | kg + %BW |
| **Weighted dip 5RM** | only if 15+ strict bodyweight reps | kg + %BW |
| **Squat pattern** | goblet or barbell 5RM, or max bodyweight squats to depth | kg or reps |
| **Hinge pattern** | RDL or trap-bar 5RM, or max hip thrusts | kg |
| **Dead hang** | passive then active, no straps | seconds |

### Isometric / skill holds

Hold quality criteria are absolute. The clock stops at the first loss of
position.

| Hold | Quality criteria | Record |
|---|---|---|
| Hollow body | low back flat on the floor throughout | seconds |
| Plank / side plank | straight line, no hip drop | seconds |
| L-sit (parallettes) | legs straight, hips at or above hands, knees locked | seconds |
| Support hold (bar/rings) | elbows locked, shoulders depressed | seconds |
| Tuck front lever | back parallel to floor, arms straight, scapulae depressed | seconds |
| Tuck planche | hips at shoulder height, arms straight, scapulae protracted | seconds |
| Planche lean | measure shoulder-past-wrist distance in cm, arms straight | cm at 10 s |
| Back lever (tuck) | arms straight, body parallel | seconds |
| Wall handstand (chest-to-wall) | straight line, ribs down, no arch | seconds |
| Freestanding handstand | best of 3 attempts | seconds |
| Hanging leg raise | straight legs, toes to bar, no swing | reps |

### Mobility markers

Carry these over from [movement-screening](../movement-screening/SKILL.md);
re-measure the numeric ones.

| Marker | Record |
|---|---|
| Knee-to-wall dorsiflexion | cm, each side |
| Wall overhead reach | pass / gap in cm |
| Deep squat hold | seconds, heels down |
| Apley gap | cm, each side |
| Active straight-leg raise | degrees, each side |
| Shoulder external rotation at 90° abduction | degrees, each side |

### Work capacity (optional, if goals require it)

| Test | Protocol | Record |
|---|---|---|
| Pull-up density | max reps in 5 min, sets of 3–5 | total reps |
| Push-up density | max reps in 5 min | total reps |
| Squat endurance | max bodyweight squats in 2 min | reps |
| Aerobic base | 12-min run, 2 km row, or 500 m ski | distance / time |

Do not run capacity tests in the same session as maximal strength tests.

---

## Level bands

Use to set expectations and pick the right program archetype. Bands are for
programming, not for judgement — say them neutrally or not at all.

| Marker | Beginner | Intermediate | Advanced | Elite |
|---|---|---|---|---|
| Strict pull-ups | 0–5 | 6–12 | 13–20 | 20+ or +50% BW x5 |
| Strict dips | 0–8 | 9–18 | 19–30 | +50% BW x5 |
| Push-ups | 0–15 | 16–35 | 36–60 | 60+ |
| Hollow hold | <20 s | 20–45 s | 45–75 s | 75 s+ |
| L-sit | 0–5 s | 5–20 s | 20–45 s | 45 s+ |
| Front lever | none | tuck | advanced tuck / straddle | full 10 s+ |
| Planche | none | frog / tuck | advanced tuck / straddle | full |
| Handstand | wall only | wall 60 s | freestanding 30 s | freestanding press |
| Muscle-up | none | 1–3 assisted/kipping | 1–5 strict | 5+ strict, ring |

The athlete's band is the **lowest** of their markers for the pattern being
programmed, not the highest. A person with 15 pull-ups and a 15 s hollow hold is
a beginner for core-dependent skills.

---

## Writing the baseline

```markdown
# Baseline — <athlete>

| Test | 2026-09-06 | 2026-11-01 | Standard used |
|---|---|---|---|
| Strict pull-ups | 7 | | dead hang, chin over bar, no kip |
| ... | | | |

## Conditions
| Date | Bodyweight | Time | Sleep prev. night | Notes |
|---|---|---|---|---|

## Not tested
| Test | Reason |
|---|---|
| Overhead press 5RM | [SHOULDER-01] painful arc |

## Level read
- Pull pattern: intermediate
- Push pattern: beginner (limited by shoulder constraint)
- Core: beginner
- Legs: intermediate
- **Programming band: beginner-intermediate hybrid**
```

## Retest cadence

- End of every block (4–6 weeks) — retest only the markers the block targeted.
- Full battery every 12–16 weeks.
- Never retest a maximal effort more often than every 3 weeks; the test itself
  is a training stress.

## Definition of done

- [ ] Only screened-safe patterns were tested
- [ ] Every test has a written standard and the athlete knew it beforehand
- [ ] Conditions recorded (bodyweight, time, sleep)
- [ ] Contraindicated tests recorded as `not tested` with the constraint ID
- [ ] `baseline.md` updated with a new dated column, old data intact
- [ ] Programming band stated for each movement pattern
- [ ] Routed to [program-design](../program-design/SKILL.md)
