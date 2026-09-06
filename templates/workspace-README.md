# calicoach workspace

This folder is your training record. Claude reads it at the start of every
coaching session — it is the source of truth, not the chat history.

```
calicoach/
  athlete/
    profile.md        who you are, your goals, history, constraints, equipment
    screening.md      movement screen results and the hard limits on programming
    baseline.md       measured test results (created after your first testing week)
  programs/
    _TEMPLATE-program.md
    YYYY-MM-DD_block-N_<focus>.md    your training block (the scheda)
  logs/
    _TEMPLATE-session-log.md
    YYYY-MM-DD_wWdD.md               one file per completed session
  reviews/
    _TEMPLATE-review.md
    YYYY-MM-DD_block-N-review.md     end-of-block analysis
  references/
    INDEX.md          books, PDFs and coach's notes you want followed
  _TEMPLATE-exercise-card.md
```

## How to use it

**Start:**

```
Use the calisthenics-coach skill to onboard me as a new athlete.
```

**Every session afterwards:**

| You want | Say |
|---|---|
| A readiness check before training | "Ready to train — 7 h sleep, energy 6, shoulder fine." |
| To log what you did | "Log today's session: ..." |
| Your program explained | "Why is the straight-arm pulldown in there?" |
| An exercise detailed | "Give me the full card for the tuck front lever." |
| Something adjusted | "My elbow was at 3/10 on the pulldown today." |
| A new block | "Block 1 is done — review it and plan block 2." |
| To add a book or method | "I want to follow \<book\>; here's the PDF." |

## Rules the coach follows

- No program without a profile, and no loading without a screen.
- Every exercise arrives as a full card: setup, execution, cues, faults, tempo,
  risk notes, regressions, progressions and references.
- Every constraint from your screen is carried into the program header and
  respected.
- Every symptom you report gets characterised, classified and answered with a
  substitution — never ignored.
- Nothing is fabricated. If a source was not read, it says so.

## The pain traffic light

| Light | Signal | What you do |
|---|---|---|
| Green | 0–2/10, warms up and disappears | continue |
| Amber | 3–4/10, no worse afterwards, settles in 24 h | take the written regression, keep it under 4/10, log it |
| Red | >4/10, sharp, worsening, or still there after 24–48 h | stop that movement, use the named substitute, tell the coach |

Two amber sessions on the same structure count as red.

## Scope

This is coaching guidance, not medical advice. Red flags — pain after a trauma,
night pain, numbness, sudden weakness, a joint that gives way, chest pain,
systemic symptoms — mean stop and see a clinician. The coach will say so and
keep training whatever is safe in the meantime.

## Privacy

Everything here stays on your machine. If this folder lives in a git repository
you share, check `calicoach/.gitignore` — health information is personal data.
