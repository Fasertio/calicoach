# Progression and Regression Rules

Every exercise in a program gets both, in writing, with numbers. This file is the
menu; the program file states which rule applies to which exercise.

---

## The shape of a rule

```
Progress: <numeric trigger> -> <exact next step>
Regress:  <numeric trigger> OR <symptom trigger> -> <exact previous step>, hold <duration>, then re-attempt
Ceiling:  <what happens at the top of the progression>
```

Both triggers must be checkable by the athlete alone, without judgement calls.

---

## Progression models

### Linear reps
For beginners on bent-arm work.
```
Progress: all sets at the target reps with clean form and RIR>=2 -> +1 rep per set next session
Ceiling:  3x12 -> move to the harder variation, restart at 3x6
Regress:  reps drop >20% for two consecutive sessions -> -2 reps per set for one week
```

### Double progression
The default for most rep work.
```
Range: 3x6-10
Progress: all sets reach 10 with RIR>=2 -> next variation, or +2.5 kg, restart at 6
Regress:  cannot reach 6 on the last set for two sessions -> previous variation or -2.5 kg
```

### Load progression (weighted calisthenics, weight room)
```
Progress: top of the rep range on all sets at RIR>=2 -> +2.5 kg upper body / +5 kg lower body
          (weighted pull-up: ~2.5% bodyweight per step, not what is on the rack)
Regress:  a missed rep target twice -> -10% load, rebuild
```

### Time progression (isometrics)

**Do not guess the hold time. Measure the maximum, then take a percentage of
it.** `[OG2]`

```
1. Test the max clean hold at the current leverage (quality clock).
2. Program working holds at 60-75% of that max. (Some coaches use 50%; use the
   lower end when the athlete is new to the position or the elbow is irritable.)
3. Progress the hold time within that band, then re-test the max.
```

| Max clean hold | Working hold (60–75%) |
|---|---|
| 6 s | 4 s |
| 8 s | 5–6 s |
| 10 s | 6–7 s |
| 12 s | 7–9 s |
| 15 s | 9–11 s |
| 20 s | 12–15 s |
| 25 s | 15–18 s |
| 30 s | 18–22 s |

```
Start:   5 sets at 60-75% of the tested max, RPE 8
Progress: all sets at the top of the band with clean position for two sessions
          -> re-test the max, recompute the band; or advance the leverage/band step
Regress: cannot hold 60% of the band's bottom -> previous leverage or band step
```

**Converting isometrics to reps for volume accounting** `[OG2]`:

> **1 concentric repetition ≈ 2 seconds of isometric hold.**

The equivalence holds up to about **15 repetitions or 30 seconds** — past that,
both become endurance work and neither builds much strength or size. So a
`5 x 12"` planche prescription is worth roughly 30 "reps" of volume, which lands
it in the strength range (see below) and lets you budget it against everything
else instead of treating skill work as free.

Quality clock: the timer stops the moment the position breaks — elbow bends,
hips sag, scapulae collapse, shoulders shrug. A 12 s set with 4 bad seconds is
an 8 s set, and it is recorded as 8.

### Leverage progression (skills, straight-arm)
The steps are fixed and never improvised. See
[skill-progressions](../../skill-progressions/SKILL.md) for the ladders.
```
Progress: target time held at the current leverage for two consecutive sessions,
          with no next-day joint symptoms -> advance one step, cut volume 30% that week
Regress:  cannot hold 60% of target at the current leverage, OR any elbow/shoulder
          symptom -> back one step for 2 weeks minimum
Rate cap: at most one leverage step per 2-3 weeks, per skill
```

### Density progression
For conditioning and endurance goals.
```
Same total work, rest reduced by 10-15 s per week, floor at 45 s
Progress: complete the work at the reduced rest with technique intact -> reduce again
Ceiling:  at the rest floor -> add work, reset rest
```

### Range progression
For mobility-limited or rehabilitating patterns.
```
Progress: pain-free at the current depth for two sessions -> +1 depth step
          (box height down 3-5 cm, or +5 deg)
Regress:  any pain above 3/10 -> previous depth, hold 1 week
```

### Band-assistance progression (assisted skills and holds)
The finest-grained progression available for a straight-arm skill, and the one
most often missed. A band step is a fraction of a leverage step, which is exactly
what tendon-limited work needs.

```
Prescription: advanced tuck front lever, 5 x 8-12" @ RPE 8, band M under the hips
Progress: every set reaches the TOP of the hold window with clean position, two
          consecutive sessions, and no next-day joint symptoms
          -> scale the band DOWN one step, reset to the BOTTOM of the window
Ceiling:  no band -> advance the leverage rung, back to a band if needed
Regress:  any set under 60% of the window bottom, OR the position breaks, OR any
          joint symptom -> back one band step for 2 weeks
```

Two rules make this work:

1. **One variable at a time.** The hold window progresses *within* a band level.
   The band changes only when the window is maxed. Never both in the same week.
2. **The window has an exit criterion at the top.** "Minimum 5 s, maximum 10 s —
   above 10 s we scale the band" tells the athlete to *stop* a good set, which is
   the behaviour that protects the tendon.

The same structure works for band-assisted pull-ups, muscle-ups, dips, planche
holds, back lever and one-arm progressions. Record the band by a stable label
(`loop M`, `loop L`) or by its approximate assistance in kg, and keep the labels
consistent across the block.

### Cluster sets
Same total reps, broken into blocks with a short intra-set rest. Buys quality
reps at a higher intensity than a straight set allows.

```
Prescription: 3+3+3 with 20" between blocks, load = your 6RM, one cluster = one set
Progress: all blocks completed with clean technique, two sessions -> +2.5 kg,
          or -5" of intra-set rest, or +1 rep per block (pick ONE)
Regress:  a block breaks down -> reduce to 3+3, or drop the load 5%
```

The intra-set rest is part of the prescription. `5+5+5+5` without "20 seconds
between blocks" is not a prescription — it is a guess.

Use clusters for: heavy skill-adjacent reps, muscle-up singles, weighted pull-ups
near a max, and technique work where the last reps of a straight set would break
form.

### Rest-pause
One set to near-failure, then short rests and mini-sets to a rep target.

```
Prescription: 1 set to RIR 1, rest 15-20", continue to failure-1, repeat x2
Progress: total reps across the cluster up 10% -> add load
Regress:  total reps down 15% -> the exercise is too fatiguing for this slot
```

Never on straight-arm isometrics, overhead barbell work, or anything with a fall
risk.

### Total-rep (density) targets
A total-rep target with free set structure. Excellent for high-rep bodyweight
work, and it self-autoregulates — the athlete breaks the reps however the day
allows.

```
Prescription: 80 total reps of parallette push-ups, sets free, note the total time
Progress: +10 total reps per week, OR the same total in less time
Ceiling:  when the total stops being achievable in one session -> harder variation,
          reset the total to ~60% of the previous one
Regress:  total time up more than 20% for two sessions -> hold the total, do not add
```

Counting it in the volume budget: divide the total reps by the athlete's clean
set size to get an equivalent hard-set count (80 reps at sets of ~15 ≈ 5 sets).
Approximate is fine; ignoring it is not.

### Ladders
Ascending, or ascending then descending, across two or three exercises. A
conditioning finisher that keeps technique honest because the reps must stay
unbroken.

```
Prescription: 1 pull-up / 2 dips / 3 push-ups, add one rep per exercise each rung,
              45" rest between rungs. Stop ascending at the first set you have to
              break; recover as needed; descend back to 1-2-3 with every set unbroken.
Progress: reach a higher rung before breaking -> that is the progression, no change needed
Regress:  cannot descend unbroken -> lower the starting rung, or lengthen the rest
```

Ladders are counted in the volume budget as an estimate of the equivalent hard
sets they add. Optional finishers are counted too, or they should not be offered.

### Autoregulated (RIR-targeted)
For athletes with inconsistent recovery.
```
Prescription: 3-4 sets in the 6-10 range, stop each set at RIR 2
Progress: total reps across sets up 10% over two weeks -> tighten to RIR 1 or add load
Regress:  total reps down 15% for two weeks -> deload week
```

---

## The universal safety overrides

These outrank every progression rule above. Write them in every program.

1. **Any red pain (>4/10, sharp, worsening, or lasting >24 h) stops that
   movement immediately**, regardless of what the progression says.
2. **Two consecutive amber sessions on the same structure** is treated as red.
3. **No leverage advance in a week where sleep or stress was materially worse.**
4. **No progression on the first session back** from a break of 5+ days.
5. **Straight-arm volume never climbs more than 10% week over week**, even if
   every progression trigger fires.
6. **After any leverage advance, volume drops 30% for that week.**

---

## Weekly volume progression within a block

| Week | Volume | Intensity | Note |
|---|---|---|---|
| 1 | baseline (near MEV) | RIR 3 | learn the movements, set the standard |
| 2 | +1 set per pattern | RIR 2–3 | |
| 3 | +1 set per pattern | RIR 2 | |
| 4 | +1 set per pattern | RIR 1–2 | usually the hardest week |
| 5 | deload: 40–60% | unchanged | or extend to week 5–6 if recovery is good |

Stop adding volume the moment performance drops, sleep degrades, or joints start
talking. That week is the athlete's current MRV — note it in the review; it is
the most useful number you will collect all block.

---

## Deciding to regress — the honest triggers

Athletes under-regress. Make it mechanical:

| Trigger | Action |
|---|---|
| Reps down >20% for two consecutive sessions | -1 progression step, one week |
| Cannot hit the bottom of the rep range at RIR 2 | previous variation |
| Isometric under 60% of target hold | previous leverage |
| Technique fault appears that was not there before | previous variation until it is clean |
| Any amber pain twice on the same structure | remove that movement, substitute |
| Sleep <6 h for three nights | deload the week, do not regress the plan |
| Returning after 5+ days off | repeat the last completed week |
| Returning after 2+ weeks off | -1 step, 60% volume, rebuild over 2–3 weeks |

Regression is not failure and should never be framed as one. Say: "we're taking
the step back because it's the fastest route to the step forward."

---

## What counts as a rep

State the standard in the exercise card, and hold to it. A rep that breaks the
standard does not count toward progression.

| Movement | The rep counts if |
|---|---|
| Pull-up | dead hang start, arms fully extended, chin clearly over the bar, no kip, controlled descent |
| Dip | shoulders to at least humerus-parallel, full lockout, no swing |
| Push-up | straight body line, chest to fist height, full lockout, no hip sag or pike |
| Row | full extension at the bottom, chest touches, body straight |
| Squat | hip crease below knee (or the prescribed pain-free depth), heels down, knees tracking |
| Hinge | neutral spine maintained throughout, hips drive the movement |
| Leg raise | legs straight, no swing, controlled descent |
| Isometric | the prescribed position, held; the clock stops at the first break |

If the athlete's last two reps of every set break the standard, the prescription
is too hard — fix the prescription, not the standard.
