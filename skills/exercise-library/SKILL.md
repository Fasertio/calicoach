---
name: exercise-library
description: Use whenever an exercise is prescribed, explained, substituted or corrected - defines the mandatory exercise card format (setup, execution, cues, faults, tempo, risk notes, regressions, progressions, references) and holds the catalogue of calisthenics and weight-room movements by pattern.
---

# Exercise Library

Every exercise that reaches the athlete arrives as a **full card**. A bare
"3x8 pull-ups" is never an acceptable output — the athlete is training alone,
and the card is the coach standing next to them.

**Announce it:** "Using exercise-library to detail <exercise>."

## The card format — mandatory

```markdown
## <Exercise name> (<translation on first use>)

| | |
|---|---|
| **Pattern** | vertical pull / horizontal push / knee-dominant / … |
| **Type** | compound · bent-arm / straight-arm / isometric / unilateral |
| **Primary muscles** | |
| **Secondary muscles** | |
| **Equipment** | |
| **Difficulty** | beginner / intermediate / advanced |
| **Skill prerequisite** | what must already be true before this is programmed |

**Why it is here:** <one line linking it to the block aim>

### Setup
1. <position, grip, spacing, foot placement — precise enough to reproduce alone>

### Execution
1. <numbered phases: start position, eccentric, bottom, concentric, lockout>
2. <what moves, what does not move, where the joint should be at each phase>

### Cues
- <2–5 short internal/external cues, the kind you would say out loud mid-set>

### Breathing
<when to inhale, exhale, whether to brace and how>

### Tempo
`ecc-pause-con-pause`, e.g. `3-1-1-0`, and why this tempo for this exercise.

### Range of motion standard
<what makes a rep count — the exact endpoints>

### Common faults
| Fault | Why it matters | Fix |
|---|---|---|

### Risk notes
<which structures are loaded, which screening constraints interact, the stop
signal specific to this exercise>

### Regressions (easier → this)
1. <ordered, each one a real step, not "do fewer reps">

### Progressions (this → harder)
1.

### Substitutes
<same stimulus, different equipment or working around a constraint>

### References
- <source name, author/organisation, what to look for>
- <search terms for video demonstration>
```

## Rules for writing cards

1. **Write for someone alone in a garage.** If a step could be misread, it will
   be. Specify grip width in relation to the body, foot distance in centimetres
   or body landmarks, bar height relative to the athlete.
2. **Execution is phase by phase.** Start position → eccentric → bottom position
   → concentric → lockout. Say what should *not* move as clearly as what should.
3. **Cues are short and sayable.** "Elbows to your back pockets", "screw your
   hands into the floor", "ribs down". Two to five, no more — athletes retain
   few.
4. **Faults come with a fix**, not just a warning.
5. **Risk notes name the structure**, e.g. "loaded shoulder extension with an
   internally rotated humerus stresses the long head of the biceps at the
   bicipital groove — stop at the first front-of-shoulder pinch."
6. **Regressions and progressions are ordered ladders**, and each rung is a
   change in leverage, range, stability or load — never just fewer reps.
7. **References are real and verifiable.** Cite named books, named
   organisations, and give search terms for video. **Never invent a URL, a page
   number, a study, or a citation.** See
   [reference-sources.md](references/reference-sources.md).
8. **Athlete-supplied sources take precedence for method.** If the athlete
   provided a book or a coach's method
   ([knowledge-ingestion](../knowledge-ingestion/SKILL.md)), cite it first and
   note where it differs from the default.
9. **Cards live in the program file.** A card may be generated from this
   catalogue, but the delivered program must contain it in full. The athlete
   should never have to look elsewhere to know how to perform a prescribed
   exercise. See
   [example-block.md](../program-design/references/example-block.md) for the
   depth standard in context.
10. **Add the block-specific note.** The card is generic; the note beside the
   exercise in the session table is not. It carries this block's technical
   focus, the intra-set structure, and the stop signal for *this* athlete.

## The catalogue

| Pattern | File |
|---|---|
| Vertical and horizontal pulling | [pull-exercises.md](references/pull-exercises.md) |
| Vertical and horizontal pushing | [push-exercises.md](references/push-exercises.md) |
| Legs: knee-dominant, hip hinge, unilateral, calf | [legs-exercises.md](references/legs-exercises.md) |
| Core: anti-extension, anti-rotation, flexion, compression | [core-exercises.md](references/core-exercises.md) |
| Grip, forearm, wrist | [grip-and-forearm.md](references/grip-and-forearm.md) |
| Citation keys (use these in every card) | [bibliography.md](references/bibliography.md) |
| Sourcing and citation rules | [reference-sources.md](references/reference-sources.md) |

Skill-specific ladders (planche, front lever, muscle-up, handstand, human flag,
pistol, HSPU, one-arm pull-up) live in
[skill-progressions](../skill-progressions/SKILL.md).

Barbell, dumbbell, machine and cable movements are catalogued in the files above
alongside their bodyweight counterparts, and integrated by
[weight-room-integration](../weight-room-integration/SKILL.md).

## Choosing an exercise

Ask, in order:

1. **Is it contraindicated?** Check `screening.md`. If yes, stop — pick the
   substitute.
2. **Can the athlete perform it with clean technique today?** If not, take the
   regression. The right exercise is the hardest one they can do *well*.
3. **Does it match the pattern the program budgeted?** Do not fill a horizontal
   pull slot with another vertical pull.
4. **Does it fit the equipment they confirmed?** Not the equipment you wish they
   had.
5. **Is it specific enough to the goal?** Straight-arm goal → straight-arm work.
6. **Does it have a clear progression path?** An exercise you cannot progress is
   a dead end.

## Substitution rules

When substituting, preserve — in this order of priority:

1. the **movement pattern** (a row substitutes for a row),
2. the **joint angle and contraction type** (straight-arm for straight-arm),
3. the **relative intensity** (RIR-matched, not rep-matched),
4. the equipment convenience.

Record every substitution in the program's changelog with its reason.

## Definition of done

- [ ] Every prescribed exercise has a complete card, no section omitted
- [ ] Execution is phase-by-phase and reproducible alone
- [ ] At least 2 regressions and 2 progressions, ordered
- [ ] Risk notes name the loaded structures and the stop signal
- [ ] References are real, named, and never fabricated
- [ ] The card was checked against `screening.md` constraints
