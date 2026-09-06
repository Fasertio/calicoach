# calicoach

A Claude skill framework that turns Claude Code into an expert calisthenics and
strength coach — one that onboards you, screens you for injury risk, writes your
program in Markdown, and follows you through it.

```bash
npx calicoach
```

Then open Claude Code in that folder and say:

```
Use the calisthenics-coach skill to onboard me as a new athlete.
```

---

## What it does

| | |
|---|---|
| **Onboards** | a structured intake interview — goals, training history, injuries, schedule, equipment, lifestyle — written to `calicoach/athlete/profile.md` |
| **Screens** | a self-administered movement screen that produces hard contraindications the programming must respect |
| **Tests** | a measured baseline, so progressions start from real numbers instead of guesses |
| **Programs** | a full training block (the *scheda*) in Markdown: weekly structure, sets, reps, tempo, rest, progression *and* regression rules, autoregulation, deload and review dates |
| **Details** | every prescribed exercise ships as a full card — setup, phase-by-phase execution, cues, breathing, common faults, risk notes, regressions, progressions, and references |
| **Integrates weights** | barbell, dumbbell, cable and machine work where they beat the bodyweight option, or where a constraint removed one |
| **Protects** | joint prep, prehab, tendon-loading protocols, load guardrails, and a pain traffic-light written into every program |
| **Follows up** | session logs, readiness checks, on-the-fly adjustment, block reviews |
| **Learns your sources** | give it a book, a PDF, or your coach's notes, and it programs from them |

Everything is written to disk. Your training record is Markdown files you own,
not a chat transcript that scrolls away.

---

## Install

```bash
# project scope — installs into ./.claude/skills and scaffolds ./calicoach
npx calicoach

# user scope — available in every project
npx calicoach --global

# skills only, no workspace
npx calicoach skills

# see what is bundled
npx calicoach list

# validate the install
npx calicoach doctor
```

| Option | Effect |
|---|---|
| `-g, --global` | install into `~/.claude/skills` |
| `--dir <path>` | target directory (default: cwd) |
| `-f, --force` | overwrite existing skill files (never touches your athlete data) |
| `--only <ids>` | comma-separated skill ids |
| `--no-banner` | quieter output |

`npx calicoach uninstall` removes the skills and leaves `calicoach/` alone.

---

## The skills

| Skill | Use it for |
|---|---|
| `calisthenics-coach` | the entry point — doctrine, workspace contract, routing |
| `athlete-onboarding` | the intake interview and the athlete profile |
| `movement-screening` | the movement screen, red-flag triage, contraindications |
| `assessment-testing` | measured baselines and retests |
| `program-design` | writing and revising the training block |
| `exercise-library` | the mandatory exercise-card format and the movement catalogue |
| `skill-progressions` | planche, levers, handstand, muscle-up, flag, pistol, one-arm pull-up |
| `weight-room-integration` | barbell, dumbbell, cable and machine work |
| `injury-prevention` | warm-ups, prehab, tendon loading, load guardrails |
| `session-logging` | readiness checks, session logs, on-the-fly adjustment |
| `progress-review` | end-of-block analysis and the next-block brief |
| `knowledge-ingestion` | your books, PDFs and coach's notes |
| `anatomy-and-biomechanics` | why an exercise works and why a position is risky |
| `recovery-and-nutrition` | sleep, food, stress — scope-limited, with referral rules |

---

## Your workspace

```
calicoach/
  athlete/
    profile.md        who you are, goals, history, constraints, equipment
    screening.md      screen results and the hard limits on programming
    baseline.md       measured test results
  programs/
    2026-09-06_block-1_foundation.md
  logs/
    2026-09-08_w1d1.md
  reviews/
    2026-10-04_block-1-review.md
  references/
    INDEX.md          your books, PDFs and coach's notes
```

Claude reads these at the start of every coaching turn. They are the source of
truth, not the conversation.

---

## Design principles

**Injury avoidance beats stimulus.** Connective tissue adapts in months while
muscle adapts in weeks. Straight-arm volume caps, leverage-advance rate limits,
grip rotation, mandatory prehab and a written pain traffic light are all in
service of one thing: a program that survives contact with the athlete.

**No program without a profile; no loading without a screen.** The coach refuses
to guess at your goals, your injuries or your equipment. If you insist, it gives
you a deliberately submaximal provisional week and says so.

**Every exercise arrives complete.** A bare "3x8 pull-ups" is never an acceptable
output. You train alone; the card is the coach standing next to you.

**Nothing is fabricated.** References are named books and organisations plus
video search terms — never invented URLs, page numbers or studies. A source the
coach has not read is labelled as unread and is not programmed from.

**Your sources win on method.** Bring a book or a coach's method and it takes
precedence for progression order, exercise preference and style. It never
overrides a screening contraindication or a load guardrail — and when it
conflicts, you are shown both positions and you decide.

---

## Scope and safety

calicoach is a coaching assistant. It is **not** a medical device, a diagnosis, a
physiotherapy plan, or clearance to return to sport after injury.

It triages red flags — pain after trauma, night pain, numbness, sudden weakness,
a joint that gives way, chest pain, systemic symptoms — and tells you to see a
clinician, plainly and without alarm, while continuing to coach whatever is
unambiguously safe. Pregnancy, cardiovascular, respiratory or metabolic disease,
recent surgery, osteoporosis and a history of disordered eating all require
clearance first.

Train sensibly. Get the anchor checked before you hang from it.

---

## Requirements

Node.js 18+. No dependencies.

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE).
