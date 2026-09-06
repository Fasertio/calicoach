---
name: session-logging
description: Use when the athlete reports how a session went, wants today's workout adjusted on the fly, or needs a readiness check before training - records the session to calicoach/logs/, applies the autoregulation rules, and flags anything that should change the program.
---

# Session Logging

The log is the feedback loop. Without it you are writing programs into a void and
guessing at what happened.

**Announce it:** "Using session-logging to record and adjust."

## Output

`calicoach/logs/YYYY-MM-DD_wWdD.md` — one file per completed session, following
[log-structure.md](references/log-structure.md).

## Two modes

### Mode A — Before the session: readiness check

Five questions, thirty seconds:

1. Sleep last night (hours, and rested y/n)?
2. Soreness 0–10, and where?
3. Any joint talking to you today? (site + 0–10)
4. Energy / motivation 0–10?
5. Time available today?

Then apply:

| Readiness | Signal | Adjustment |
|---|---|---|
| **Green** | slept 7 h+, no joint complaints, energy ≥6 | run the session as written |
| **Amber** | slept 5–7 h, mild soreness, energy 4–5 | keep the exercises and the intensity, cut the last set of each accessory, skill work at 60% TUT |
| **Red** | slept <5 h, a joint at 3+/10, energy ≤3, or ill | cut to the first two exercises at RIR 3, full prehab, no skill work, no new leverage. Or take a rest day — say that plainly if it is the right call |
| **Short** | less time than the session needs | phases 1, 2, 3 and 5 only — never cut the warm-up or the prehab |

Never let an athlete attempt a **new leverage step or a max** on an amber or red
day. Write that rule into every program.

### Mode B — After the session: record and respond

Record what actually happened, then decide whether anything changes.

## Recording rules

- **Record what was done, not what was prescribed.** If they did 3x6 instead of
  4x8, the log says 3x6.
- **Record RIR or RPE per exercise**, at least for the primaries.
- **Record pain by site and number**, even at 1/10. A pattern of 1s and 2s over
  three weeks is the earliest warning you will get.
- **Record the quality clock** for isometrics — clean seconds only.
- **Record the conditions** — sleep, stress, time of day, anything unusual.
- **One line of subjective feel.** Athletes say more in one free sentence than in
  five scales.

## Responding — the decision tree

```
Did anything hurt above 2/10?
  yes -> characterise it (standard six). Red? -> stop that movement, substitute,
         update screening.md, tell the athlete.
         Amber? -> take the written regression, keep it under 4/10, watch it.
         Second amber on the same structure? -> treat as red.
  no  -> continue

Did performance drop >20% versus the last session on the same exercise?
  yes -> one bad day, or a pattern? Check the last 3 logs.
         Pattern + poor sleep -> deload the week.
         Pattern + good recovery -> the progression is too fast; regress a step.
  no  -> continue

Did they hit every progress trigger?
  yes -> advance per the written rule; if it is a leverage step, cut volume 30%
         that week.
  no  -> hold; nothing changes.

Did they miss sessions?
  1 missed  -> continue where they left off
  2+ missed -> repeat the week
  1 week+   -> restart the week at 70% volume
```

## What NOT to do after a single log

- Do not redesign the program after one bad session. One session is noise.
- Do not add exercises because something "felt easy". The volume budget exists.
- Do not advance a leverage because a hold felt good on one day. Advances need
  two consecutive sessions and no next-day symptoms.
- Do not silently change anything. Every change goes in the program changelog.

## Responding in chat

Keep it short. Athletes who get an essay after every session stop logging.

- Green session, on plan: one or two lines. "Solid. That's the trigger for
  week 3 — 4x7 next Monday."
- Something changed: three or four lines. What you noticed, what changes, what
  they do next session.
- Something concerning: characterise it, state the change, set the review point.

## Weekly roll-up

At the end of each training week, produce a five-line summary in the log
directory or in chat:

1. Sessions completed / planned.
2. Total hard sets per pattern versus budget.
3. Skill TUT versus cap.
4. Any pain reports, with the trend.
5. The one change for next week.

## Definition of done

- [ ] Session written to `calicoach/logs/` with actual (not prescribed) numbers
- [ ] RIR/RPE and pain scores recorded per exercise where relevant
- [ ] Isometrics recorded as quality seconds
- [ ] Decision tree applied; any change written into the program changelog
- [ ] `screening.md` updated if a new constraint appeared
- [ ] Response to the athlete kept short and actionable
