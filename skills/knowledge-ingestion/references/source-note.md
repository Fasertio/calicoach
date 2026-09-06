# Source Note Structure

One file per source: `calicoach/references/<slug>.md`. Plus one row per source in
`calicoach/references/INDEX.md`.

---

## INDEX.md row format

```markdown
| Slug | Title | Author | Type | Read? | Primary for | Added |
|---|---|---|---|---|---|---|
| overcoming-gravity | Overcoming Gravity (2nd ed.) | Steven Low | book | partial (owned by athlete, not supplied as text) | straight-arm progressions | 2026-09-06 |
| coach-rossi-notes | Scapular preparation notes | Coach Rossi | PDF | yes — `references/rossi-notes.pdf` | block 1 method | 2026-09-06 |
```

Anchors used in citations are the slugs: `references/INDEX.md#coach-rossi-notes`.

---

## Source note format

```markdown
# <Title>

| | |
|---|---|
| **Author** | |
| **Type** | book / PDF / course / coach's notes / video series |
| **Edition / date** | |
| **File** | `references/<file>` or "not supplied — title only" |
| **Read status** | read in full / read in part / **not read — title only** |
| **Why the athlete brought it** | their words |
| **Primary for** | which block(s) this source governs, if any |

## Programming-relevant extractions
| # | What it says | Category | Verdict | Adopted? |
|---|---|---|---|---|
| 1 | 8 weeks scapular work before straight-arm holds | progression order | aligned | yes |
| 2 | 5x10 s skill sets, 3 min rest | volume | different but reasonable | yes — adopted over the default 5x12 s |
| 3 | Start tuck planche in week 1 regardless of screen | progression order | conflicts with safety doctrine | no — see conflict log |

## Conflicts
### Conflict 1 — tuck planche timing
- **Source says:** start tuck planche holds in week 1.
- **Default says:** 8 weeks of bent-arm and scapular base first.
- **Why it matters here:** the elbow screen returned Limited (B2 straight-arm
  probe, mild symptoms).
- **Decision:** default, with a re-test on 2026-10-04.
- **Athlete informed:** yes, 2026-09-06. Athlete agreed / disagreed: <which>.

## Not verified
Anything from this source that could not be checked because the text was not
supplied. **Never programmed from.**
- <item>

## How this source is cited
`references/INDEX.md#<slug>`, plus the section name.
```

---

## Rules

- **Read status is honest.** "Not read — title only" is a common and acceptable
  state. It means: do not program from it, do not paraphrase it, and ask for the
  text if it matters.
- **Every extraction gets a verdict.** No silent adoption, no silent rejection.
- **Conflicts get a decision and a date**, and the athlete is told.
- **One primary source per block.** More than one governing method produces
  incoherent programming.
- **Sources do not expire, decisions do.** When a constraint is lifted, revisit
  the conflicts that were decided because of it.
