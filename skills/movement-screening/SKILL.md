---
name: movement-screening
description: Use before writing the first program, after any injury or layoff, or whenever the athlete reports pain, stiffness or a movement that feels wrong - runs a self-administered mobility and control screen, characterises symptoms, flags anything needing referral, and writes calicoach/athlete/screening.md with the hard contraindications that programming must respect.
---

# Movement Screening

Find out what this body can do safely **before** deciding what to load. The
output of this skill is a constraint set that program design is not allowed to
violate.

**Announce it:** "Using movement-screening to check what we can safely load."

This is a **training screen**, not a physical examination and not a diagnosis. It
tells you what to program and what to refer. It never tells you what someone
has.

## Output

`calicoach/athlete/screening.md` — see
[screening-report.md](references/screening-report.md) for the exact structure.

## Process

1. **Read** `athlete/profile.md`. Anything reported there under health and
   injury gets tested or explicitly excluded here.
2. **Triage red flags first.** Run the red-flag list from
   [safety-and-scope](../calisthenics-coach/references/safety-and-scope.md). Any
   hit stops that region and triggers a referral sentence.
3. **Run the screen** in [screen-battery.md](references/screen-battery.md). Give
   the athlete one test at a time with a clear description and a clear pass
   criterion. Ask for a video where the self-report is unreliable (overhead
   position, squat depth, shoulder rotation).
4. **Characterise every symptom** with the standard six from
   [interaction-protocol](../calisthenics-coach/references/interaction-protocol.md).
5. **Convert findings into constraints** using
   [contraindications.md](references/contraindications.md). Every constraint gets
   an action, a substitution, and a re-test date.
6. **Write the report** and tell the athlete, in three lines, what it means for
   their training.
7. **Route** to [assessment-testing](../assessment-testing/SKILL.md) for the
   parts that were cleared, then to
   [program-design](../program-design/SKILL.md).

## How to instruct a self-screen

The athlete is testing themselves, usually alone. Compensate for that:

- **One test per message block.** Describe the setup, the movement, what to
  watch for, and the pass criterion. Then wait.
- **Give the failure mode too.** "If your ribs flare or your lower back arches to
  get the arms up, that counts as a fail — that's what we're looking for."
- **Ask for the sensation, not the diagnosis.** "Where do you feel the stop —
  front of the shoulder, back of the shoulder, or a pinch on top?"
- **Compare sides, always.** Asymmetry is the highest-value finding in the whole
  screen. Ask for both sides on every unilateral test.
- **Never push into pain.** The screen stops at first pain, and the pain is the
  finding.
- **Video beats description** for: overhead reach, deep squat, shoulder
  rotation, single-leg control, and any hinge. Ask for one clip, side-on and
  front-on, 10 seconds each.

## Interpreting results

Three outcomes per item, and only three:

| Result | Meaning | Consequence |
|---|---|---|
| **Pass** | full range, controlled, symmetrical, no symptoms | program normally |
| **Limited** | restricted range or poor control, but no pain | program the regression + targeted work to open it; re-test in 4 weeks |
| **Symptomatic** | pain, pinching, numbness or apprehension | contraindication; substitute; re-test in 2–4 weeks; refer if it does not settle |

Do not average across items. One symptomatic shoulder finding constrains all
overhead work regardless of how well everything else scored.

## The three questions the screen must answer

1. **Can they get into the positions the program requires?** — overhead, deep
   squat, hollow, hinge, front rack, ring support.
2. **Can they control the positions under load?** — scapular control, hip and
   knee tracking, trunk bracing, foot stability.
3. **Is anything symptomatic, asymmetric or unstable?** — and if so, is it a
   training constraint or a referral?

## Common findings and the immediate programming answer

| Finding | Immediate answer |
|---|---|
| Cannot reach overhead without rib flare / lumbar extension | no barbell overhead press; landmine or incline press; thoracic extension + lat work; re-test in 4 weeks |
| Painful arc 60–120° in abduction | no overhead pressing, no dips below parallel; scapular + cuff work; refer if unchanged in 4 weeks |
| Cannot squat below parallel with heels down | elevate heels, box squat to depth; ankle and hip work; do not force depth |
| Knee pain on single-leg descent | reduce range to pain-free, slow eccentric, add quad and hip abductor work; no jumping |
| Lumbar flexion during hinge | hinge from a shortened range (rack pull, high box RDL), teach bracing; no loaded round-back work |
| Wrist pain in front support | parallettes or fists, wrist prep protocol, reduce push volume, ramp wrist tolerance separately |
| Elbow ache on straight-arm work | remove all straight-arm loading for 1–2 weeks; see [injury-prevention](../injury-prevention/SKILL.md) elbow protocol |
| Hypermobility (Beighton 5+) | never train into end range passively; strength through range, more control work, slower skill progressions |
| Marked side-to-side asymmetry >20% | unilateral work first, match the weak side, re-test at 4 weeks |

## Re-screening triggers

- Every 8–12 weeks as routine.
- After any layoff of 3+ weeks.
- After any new pain lasting more than one week.
- Before adding a new high-demand skill (planche, lever, muscle-up, HSPU).
- When a `Limited` item's re-test date arrives.

## Definition of done

- [ ] Red-flag triage completed and recorded
- [ ] Every profile-reported injury site was screened or explicitly excluded
- [ ] Every screen item has Pass / Limited / Symptomatic and a side comparison
- [ ] Each Limited or Symptomatic item has an action, a substitution and a re-test date
- [ ] `calicoach/athlete/screening.md` written with a copy-ready
      `Active constraints` block for the program header
- [ ] The athlete has been told in plain language what this means for training
