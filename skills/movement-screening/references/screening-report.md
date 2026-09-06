# Screening Report Structure

`calicoach/athlete/screening.md`. The `Active constraints` block is copied
verbatim into the header of every program file while it is live.

```markdown
# Movement Screening — <athlete>

> Date: YYYY-MM-DD · Screened by: self-administered, coach-guided
> This is a training screen, not a medical examination or a diagnosis.

## Red flag triage
| Flag | Present? | Detail | Action |
|---|---|---|---|
| Acute trauma / pop / swelling | no | | |
| Locking, catching, giving way | no | | |
| Sudden strength loss | no | | |
| Numbness / pins and needles | no | | |
| Night pain | no | | |
| Worsening despite rest | no | | |
| Systemic symptoms | no | | |

**Outcome:** none / referral advised for <region> on YYYY-MM-DD.

## Screen results
| # | Item | L | R | Result | Notes | Re-test |
|---|---|---|---|---|---|---|
| A1 | Wall overhead reach | | | Pass/Limited/Symptomatic | | |
| A2 | Apley reach | | | | | |
| A3 | Painful arc | | | | | |
| A4 | Scapular pull-up | | | | | |
| A5 | Support hold | | | | | |
| B1 | Elbow extension | | | | | |
| B2 | Straight-arm tolerance | | | | | |
| B3 | Wrist extension | | | | | |
| B4 | Wrist flexion / grip | | | | | |
| C1 | Deep squat | | | | | |
| C2 | Knee-to-wall | | | | | |
| C3 | Step-down control | | | | | |
| C4 | Hip hinge | | | | | |
| C5 | Active SLR | | | | | |
| D1 | Hollow hold | | | | | |
| D2 | Plank / side plank | | | | | |
| D3 | Dead bug | | | | | |
| E | Beighton score | /9 | | | | |

## Symptom detail
For each symptomatic site, the standard six:

### <Site, side>
- Where exactly:
- When it appears (phase, range):
- Duration and trend:
- Intensity worst / now:
- Aggravates / eases:
- Red flags: none / <list>

## Asymmetries
| Item | L | R | Difference | Action |
|---|---|---|---|---|

## Active constraints
<!-- COPY THIS BLOCK INTO EVERY PROGRAM HEADER WHILE LIVE -->

- [ID] <what is removed>.
  Reason: <finding>.
  Instead: <substitution>.
  Earns it back: <criterion>.
  Re-test: YYYY-MM-DD.

<!-- END BLOCK -->

## Lifted constraints
| ID | Lifted | By | Note |
|---|---|---|---|

## Priorities from this screen
1. <highest-value thing to fix, and how it enters the program>
2.
3.

## What this means for training — plain language
Three lines, maximum. What we will do, what we will not do yet, and what unlocks
the rest.

## Next screen due
YYYY-MM-DD (routine 8–12 weeks, or earlier on trigger)
```

## Rules

- Every `Limited` or `Symptomatic` row must appear in either `Active constraints`
  or `Priorities`. Nothing gets screened and then ignored.
- Re-test dates are real dates, not "in a few weeks".
- Constraints are never deleted — they move to `Lifted constraints` with a date
  and a reason.
- If the screen produced no constraints, say so explicitly: `Active constraints:
  none. Program without restriction; re-screen YYYY-MM-DD.`
