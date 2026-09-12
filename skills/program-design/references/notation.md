# Prescription Notation

The compact notation real coaches use in a delivered program. Use it in the
session tables so the scheda stays readable at the bar, and expand it in the
`Progression plan` table and the exercise cards.

**Rule:** the notation is shorthand, never a substitute for the written rule. Any
`2-`, `4 e 6` or `\\` in a session table must have a matching row in the
`Progression plan` table that states the numbers week by week. If it does not,
the athlete cannot run the block without asking you.

---

## Order and pairing

The `#` column carries both. The table is performed top to bottom.

| `#` | Means |
|---|---|
| `1`, `2` | unpaired — finish every set before moving on |
| `A1`, `A2` | a paired set — A1, rest, A2, rest, repeat until both are done |
| `A1`, `A2`, `A3` | a triplet, run the same way |
| `B3` after `B1`/`B2` | a third movement run *after* the B pair, not inside it |
| `P1`, `P2` | prehab, at the end |

A shared letter is the only thing that means "paired". If two exercises are not
meant to be alternated, do not give them the same letter.

## Sets and reps

| Notation | Meaning | Must also appear as |
|---|---|---|
| `4` | 4 sets, unchanged across the block | — |
| `4 x 8` | 4 sets of 8 | — |
| `4 x 6-8` | 4 sets, 6 to 8 reps (double progression) | progression rule with the advance trigger |
| `2-` | starts at 2 sets, **+1 set per week** | a row showing wk1 2, wk2 3, wk3 4, wk4 5, wk5 6 |
| `4 e 6` | 4 sets early in the block, 6 later | the week the switch happens |
| `2 e 3` | same convention applied to reps | the week the switch happens |
| `3\4` | 3 or 4 sets, athlete's discretion by readiness | the rule for choosing |
| `max` | rep or hold out to **technical** failure inside the stated window | the technical stop criterion |
| `rt` | *rep totali* — a total-rep target; sets are free | the starting total and the weekly increment |
| `80-` | start at 80 total reps, increasing weekly | the increment (e.g. +10/week) |
| `2 x l` | 2 reps **per side** (*per lato*) | — |
| `\\` | not applicable, or fully specified in the notes | the note must then be complete |

## Clusters, holds and combinations

| Notation | Meaning |
|---|---|
| `5+5+5+5` | cluster set: four blocks of 5 reps, short intra-set rest (state it: e.g. 20") |
| `1+1+1` | cluster of singles with intra-set rest (state it: e.g. 30") |
| `6+12"` | compound set: 6 reps, then a 12-second hold, without releasing |
| `5 x 10"` | 5 sets of a 10-second hold |
| `5 x 8-12"` | 5 sets, hold window 8 to 12 seconds — advance when every set reaches the top |
| `min 5" / max 10"` | hold window with an exit criterion: above the max, change the progression |
| `ladder 1-2-3 up/down` | ascending then descending ladder; the rules live in the notes |
| `AMRAP-1` | as many reps as possible, stopping one rep short of failure |
| `EMOM 10'` | every minute on the minute for 10 minutes |

## Load

| Notation | Meaning |
|---|---|
| `BW` | bodyweight |
| `+10 kg` | bodyweight plus external load (belt or vest) |
| `+15% BW` | load as a percentage of bodyweight |
| `24 kg` | absolute load, dumbbell/kettlebell/barbell |
| `loop M` / `loop L` | band assistance by band strength — **progress by scaling the band down** |
| `band ~15 kg` | band assistance expressed as approximate equivalent assistance |
| `deficit 5 cm` | range extended by elevating the hands or feet |

## Intensity

| Notation | Meaning |
|---|---|
| `RIR 2` | stop the set with 2 reps left in reserve |
| `RIR 1-2` | window |
| `RPE 8` | for isometrics: stop when the position is about to break |
| `@tech` | stop at technical failure, not muscular failure |

## Tempo

Four digits, `eccentric-pause-concentric-pause`, in seconds.

| Notation | Meaning |
|---|---|
| `3-1-1-0` | 3 s down, 1 s pause at the bottom, 1 s up, no pause at the top |
| `2-0-1-1` | 2 s down, no pause, 1 s up, 1 s squeeze at the top |
| `5-0-1-0` | 5 s eccentric — used for tissue tolerance and technique |
| `3-0-3-0` | heavy slow resistance, the tendon-loading tempo |
| `X` in the concentric slot | intent-fast concentric, e.g. `3-0-X-0` |

## Rest

Always in seconds, always real.

| Work | Rest |
|---|---|
| Skill / straight-arm isometrics | 120–180" |
| Heavy compound (RIR 1–2, ≤6 reps) | 180–300" |
| Compound (6–12 reps) | 90–150" |
| Accessory | 60–120" |
| Prehab | 45–90" |
| Intra-cluster | 15–30" |

---

## Legend block — required in every program

Paste this into every program file, in the athlete's language, so the notation is
never ambiguous. Include only the rows the program actually uses.

```markdown
## Notation
| | |
|---|---|
| `2-` | starts at 2 sets, +1 set each week (see Progression plan) |
| `4 e 6` | 4 sets weeks 1-3, 6 sets weeks 4-5 |
| `5 x 8-12"` | 5 sets, hold 8 to 12 seconds |
| `RIR 2` | stop with 2 reps left in the tank |
| `RPE 8` | hold until the position is about to break — not until it breaks |
| `3-1-1-0` | tempo: 3s down, 1s pause, 1s up, no pause |
| `rt 80-` | 80 total reps, sets free, +10 reps per week |
| `loop M` | medium band assistance — we scale the band down as you get stronger |
| `2 x l` | 2 reps per side |
| `\\` | see the note for this exercise |
```

Also link the athlete-facing glossary for RIR, RPE, TUT, hard set and the
quality clock if the program uses them.

---

## What the notation must never hide

| Never compress | Always write in full |
|---|---|
| the progression trigger | "all sets at 10 reps, RIR≥2, two sessions → +2.5 kg" |
| the regression trigger | "reps drop >20% two sessions, or any elbow symptom → previous variation, 2 weeks" |
| the technical standard | "chin clearly over the bar, dead-hang start, no kip" |
| the stop signal | "stop at the first inner-elbow ache, not at the end of the set" |
| the intra-set rest in a cluster | `5+5+5+5` is meaningless without "20" between blocks" |
| the hold-quality rule | "the clock stops at the first loss of position" |
