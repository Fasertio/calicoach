---
name: progress-review
description: Use at the end of a training block, when progress stalls, when the athlete wants to change direction, or when deciding whether to deload - analyses the logs against the plan, retests the block's markers, and writes a review with an explicit brief for the next block.
---

# Progress Review

Close the loop. A block that is not reviewed teaches nothing, and the next block
repeats its mistakes.

**Announce it:** "Using progress-review to close out block \<N\>."

## Output

`calicoach/reviews/YYYY-MM-DD_block-N-review.md` — see
[review-structure.md](references/review-structure.md).

## Inputs — read all of them from disk

- the block's program file, including its changelog,
- every log from the block,
- `athlete/baseline.md` (previous numbers),
- `athlete/screening.md` (constraints and re-test dates),
- `athlete/profile.md` (goals and their target dates).

## The six questions a review answers

### 1. What did the athlete actually do?
Adherence: sessions completed vs planned, hard sets per pattern vs budget, skill
TUT vs cap. Report the real numbers. A block where 60% of sessions happened is a
different experiment from the one you designed, and it must be interpreted as
such.

### 2. Did the markers move?
Retest what the block targeted — and only that; a full battery is for every
12–16 weeks ([assessment-testing](../assessment-testing/SKILL.md)). Compare
against the same standard and the same conditions.

### 3. Why did they move, or not?
Distinguish honestly between:

| Cause | Evidence |
|---|---|
| The program worked | adherence high, markers up, recovery fine |
| Under-dosed | adherence high, markers flat, no fatigue signals, RIR consistently 3+ |
| Over-dosed | performance declining late in the block, sleep down, joints talking |
| Under-adhered | sessions missed; the program was never actually tested |
| Wrong exercise selection | pattern volume hit, specific marker flat |
| Life | stress, travel, illness, work — record it without judgement |
| Too early to tell | connective-tissue-limited goals need more than one block |

Do not attribute a flat block to "not trying hard enough". That is almost never
the diagnosis, and it is never a useful one.

### 4. What did the body say?
Pain reports across the block: sites, trends, whether they resolved. Any
constraint that should be lifted, added or escalated to a referral. Update
`screening.md`.

### 5. What is the athlete's current MRV signal?
The week where performance first dropped or recovery degraded is the most useful
number in the block. Record it — it sets the volume ceiling for the next block.

### 6. What is the brief for the next block?
One sentence of aim, the archetype, the frequency, the primary skill (if any),
and the two or three changes from this block. Then hand off to
[program-design](../program-design/SKILL.md).

## Deload or continue?

| Signal | Decision |
|---|---|
| Markers up, recovery fine, motivation good | deload 1 week, then the next block |
| Markers up, recovery degrading | deload 1 week, next block starts at lower volume |
| Markers flat, adherence high, no fatigue | **no deload needed** — the block was under-dosed; add volume or intensity |
| Markers flat, adherence low | repeat a modified version of the block; fix the adherence constraint first |
| Markers down, fatigue high | deload 1–2 weeks, then a foundation or restoration block |
| Pain trending up in any structure | deload, apply the loading protocol, re-screen before the next block |

## Changing direction

When an athlete wants to change goals mid-stream:

1. Finish the current block if it has 2 weeks or less left — a completed block
   produces information; an abandoned one does not.
2. Re-run the goals batch from
   [athlete-onboarding](../athlete-onboarding/SKILL.md) and update `profile.md`.
3. Check the new goal's timeline against
   [realistic-timelines](../athlete-onboarding/references/realistic-timelines.md).
4. Write the change into the profile changelog with the date and the reason.

Goal-hopping every block is the most common reason athletes plateau. Say it once
— kindly, with the numbers — and then support the decision they make.

## Talking about the results

- Lead with what improved, specifically and with numbers.
- Be honest about what did not, and give the reason you actually believe.
- Never soften a flat block into a fake win. Athletes can tell, and it costs you
  their trust for the block that follows.
- End with the one thing the next block is for.

## Definition of done

- [ ] All logs, the program and the baseline read from disk
- [ ] Adherence quantified: sessions, hard sets per pattern, skill TUT
- [ ] Block markers retested under the same standards and conditions
- [ ] Cause analysis written, and it distinguishes dose from adherence
- [ ] Pain trends summarised; `screening.md` updated (constraints added/lifted)
- [ ] MRV signal recorded
- [ ] Deload decision made and justified
- [ ] Next-block brief written: aim, archetype, frequency, primary skill, changes
- [ ] Review file written to `calicoach/reviews/`
- [ ] **`npx calicoach check` passes over the whole workspace**
