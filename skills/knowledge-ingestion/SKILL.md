---
name: knowledge-ingestion
description: Use when the athlete supplies extra sources - a book, PDF, coach's notes, a course, a method or a training philosophy they want followed - to index them into calicoach/references/, extract what actually changes the programming, resolve conflicts with the default approach, and cite them correctly in programs and exercise cards.
---

# Knowledge Ingestion

Athletes arrive with sources: a book they trust, a coach they trained under, a
method they follow. Use them. They carry information about what this athlete will
actually adhere to, and often they are good.

**Announce it:** "Using knowledge-ingestion to add \<source\> to your references."

## Output

- `calicoach/references/INDEX.md` — the register of every source.
- `calicoach/references/<slug>.md` — one note per source: what it says, what it
  changes, and where it conflicts.
- Files the athlete supplied stay where they are; the note records their path.

## Process

### 1. Register the source
Record: title, author, type (book / PDF / course / notes / video series / coach),
edition or date, where the file lives (or that it is not available in text), and
why the athlete brought it.

### 2. Read what is available
If the athlete supplied an actual file, read it. If they supplied a title only,
say plainly what you do and do not know about that work, and do **not**
reconstruct its contents from memory as though you had read it.

> "I know *Overcoming Gravity* well enough to program from it. I don't have your
> coach's PDF — send it and I'll work from the actual text rather than guessing."

### 3. Extract only what changes programming
Ignore philosophy that does not alter a decision. Capture:

| Category | Example |
|---|---|
| Progression order | "scapular strength for 8 weeks before any straight-arm work" |
| Volume and frequency | "3 skill exposures per week, 5 sets of 10 s" |
| Exercise selection | "prefers rings over bar for all pulling" |
| Technical standards | "full lockout required, no partial reps counted" |
| Rest and tempo | "3 min between skill sets" |
| Testing protocols | "retest every 4 weeks with the same warm-up" |
| Hard rules | "never train straight-arm two days in a row" |
| Contraindications | anything the source forbids |

### 4. Compare against the defaults
For each extracted item, mark it:

| Verdict | Meaning | Action |
|---|---|---|
| **Aligned** | same as the default approach | adopt, note the source |
| **Different but reasonable** | a defensible alternative | **adopt the athlete's source** — it is their method and their adherence |
| **Conflicts with safety doctrine** | violates a screening constraint, a load guardrail, or the red-flag rules | do not adopt; explain why in one or two sentences; offer the closest safe version |
| **Cannot verify** | you do not have the text | say so; do not paraphrase from memory |

### 5. Write the note
Use the structure in [source-note.md](references/source-note.md).

### 6. Apply it
Athlete-supplied sources take precedence for **method and philosophy** — order of
progressions, exercise preferences, technical standards, training style. They
never override:

- a screening contraindication,
- the load guardrails in
  [injury-prevention](../injury-prevention/SKILL.md),
- the red-flag and referral rules in
  [safety-and-scope](../calisthenics-coach/references/safety-and-scope.md).

Say this once when a conflict arises, show both positions, and let the athlete
decide within those bounds.

## Handling conflicts well

```
Your book has you starting tuck planche holds in week 1. My default is 8 weeks of
scapular and bent-arm work first, because your elbow screen came back Limited.

Both are defensible for a healthy athlete. Given the screen, I'm going with the
slower version and we re-test the elbow on 4 October — if it's clean, we jump
straight to the book's timeline from there.

If you'd rather run the book's version now, say so and I'll build it with
tighter stop rules.
```

Position, reason, decision, offer. Then move on.

## Citation

Once ingested, cite the source in the exercise cards and the program:

```markdown
### References
- Athlete's source: `references/INDEX.md#coach-rossi-notes`, section "scapular
  preparation" — recommends 8 weeks of scapular work before straight-arm holds.
- *Overcoming Gravity* (2nd ed.), Steven Low — same progression order.
```

## What not to do

- **Do not fabricate.** Never paraphrase a book you were only given the title of.
  Never invent page numbers, chapters, quotes or study citations.
- **Do not adopt uncritically.** A source that contradicts a screening
  constraint does not get followed because it is in a book.
- **Do not dismiss dismissively.** "That's outdated" is not an argument. Give the
  reason, or adopt it.
- **Do not let sources multiply.** Three conflicting methods in one program is
  worse than any one of them. Pick a primary source per block and say which.

## Definition of done

- [ ] Source registered in `references/INDEX.md`
- [ ] A note written per source, with the extracted programming-relevant items
- [ ] Each item marked aligned / different-but-reasonable / conflicts / unverified
- [ ] Conflicts surfaced to the athlete with both positions and a decision
- [ ] Nothing fabricated; unread sources explicitly labelled as unread
- [ ] Adopted items cited in the program and the affected exercise cards
- [ ] A primary source named for the current block
