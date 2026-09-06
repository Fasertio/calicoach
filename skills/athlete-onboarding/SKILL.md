---
name: athlete-onboarding
description: Use at the very start of coaching, or whenever the athlete profile is missing or stale - conducts the structured intake interview covering goals, training history, injuries and pain, schedule, equipment, lifestyle and preferences, then writes calicoach/athlete/profile.md. Also use to re-interview when a goal, injury, schedule or equipment situation changes.
---

# Athlete Onboarding

Produce a complete, honest picture of the athlete before a single set is
programmed. Everything downstream — screening, program design, progression —
reads from the file this skill writes.

**Announce it:** "Using athlete-onboarding to build your athlete profile."

## Output

`calicoach/athlete/profile.md`, following the structure in
[profile-structure.md](references/profile-structure.md).

If the file already exists, read it first, then run only the sections that are
missing or stale. Never re-ask something already answered — confirm it instead:
"Still training 4 days, still no shoulder pain — correct?"

## Process

1. **Set expectations.** One short message: what you will ask, roughly how long
   (5 batches, ~10 minutes), why it matters, and the scope line — this is
   coaching, not medical advice.
2. **Interview in batches** of 3–6 questions, in the athlete's language, using
   [question-bank.md](references/question-bank.md). Announce the batch number.
3. **Chase only what changes the program.** Missing data that does not change
   anything is recorded as `unknown` and moved on from.
4. **Reflect back.** Summarise what you heard in ~10 lines and ask for
   corrections before writing.
5. **Write the file.** Include an `Open questions` section for everything still
   unknown, and a `Coach's read` section — your synthesis, explicitly labelled as
   interpretation.
6. **Hand off.** Route to [movement-screening](../movement-screening/SKILL.md).
   Never go straight to program design from here.

## The five batches

| # | Batch | Purpose |
|---|---|---|
| 1 | Identity and basics | age, sex, height, weight, sport background, why now |
| 2 | Goals | what, by when, how it will be measured, what matters most |
| 3 | History and health | training history, injuries, pain, conditions, medication, surgeries |
| 4 | Logistics | days, session length, time of day, equipment, environment, travel |
| 5 | Lifestyle and preferences | sleep, work, stress, nutrition frame, likes/dislikes, coaching style |

Batch 3 is the one that prevents injuries. Do not compress it. If any pain is
mentioned, run the standard six pain questions from
[interaction-protocol](../calisthenics-coach/references/interaction-protocol.md)
before moving on.

## Goal discipline

A goal is not usable until it is **specific, measurable, time-bound and
verifiable by a test**. Convert every vague goal:

| Athlete says | Convert to |
|---|---|
| "get stronger" | "add 15 kg to my weighted pull-up 5RM in 16 weeks" |
| "learn the planche" | "hold a clean straddle planche for 5 s in 12 months; advanced tuck 10 s by month 4" |
| "get lean" | "reduce waist circumference by 5 cm over 16 weeks while holding pull-up reps" |
| "be more athletic" | "unbroken 10 pull-ups, 20 dips, bodyweight-equivalent squat, 30 s freestanding handstand by month 6" |
| "fix my back" | referral first; training goal becomes "train pain-free 3x/week, build hinge tolerance" |

Rank goals. **Maximum two primary goals per block**; everything else is
explicitly labelled `maintain` or `parked`. Say this to the athlete — competing
goals is the most common reason a program produces nothing.

Sanity-check timelines against
[realistic-timelines.md](references/realistic-timelines.md) and tell the athlete
early if their target is not compatible with their training age. Do it once,
factually, with the achievable alternative next to it.

## Equipment matters more than athletes expect

Get concrete. "I have a home gym" is not an answer. Confirm each item, its
height/spacing, and whether it is anchored safely — see
[equipment-checklist.md](references/equipment-checklist.md). Program only what
exists. If a goal requires equipment they lack, say so in the same message and
propose the substitute or the cheapest acquisition that unblocks it.

## Red flags during onboarding

If the athlete reports anything on the red-flag list in
[safety-and-scope](../calisthenics-coach/references/safety-and-scope.md), stop
that thread, record it, advise referral in one plain sentence, and continue the
interview for the regions that are unaffected.

## Definition of done

- [ ] All five batches asked, or explicitly deferred with a reason
- [ ] Every goal is specific, measurable and time-bound
- [ ] Every reported pain has the standard six answers recorded
- [ ] Equipment confirmed item by item, including anchor safety
- [ ] Available days, session length and time of day are concrete numbers
- [ ] Scope/medical-limits line acknowledged and recorded
- [ ] `calicoach/athlete/profile.md` written, with `Open questions` and
      `Coach's read` sections
- [ ] **`npx calicoach check calicoach/athlete/profile.md` passes** — no blank
      mandatory field, every capacity number tagged with its source
- [ ] Athlete routed to `movement-screening`
