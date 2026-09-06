# examples/

Real-world source material used to calibrate the framework's output format.

**This folder is not shipped in the npm package.** `package.json` `files` lists
only `bin`, `src`, `skills`, `templates`, `README.md` and `LICENSE`, so nothing
here is published.

| File | What it is |
|---|---|
| `scheda daniel 2.pdf` | Original PDF — a real delivered program (*Dragon Street Workout — Calisthenics program 2026*) |
| `scheda-daniel-2.md` | Faithful Markdown transcription of that PDF, with a notation legend |

## Why it is here

A real coach's delivered program is the best available calibration for what the
framework should produce. The transcription was read for **format and notation**,
not copied as content:

| Observed in the source | Where it went in the framework |
|---|---|
| Warm-up and cool-down stated once for the whole block, not repeated per session | `program-design/references/program-template.md` — `Warm-up (all sessions)` |
| Per-exercise coach notes as the primary coaching channel | `program-template.md` — notes are a required column, not an afterthought |
| Compact multi-week notation (`2-`, `4 e 6`, `\\`, `rt`) | `program-design/references/notation.md` |
| Cluster sets (`5+5+5+5` with 20" intra-set rest) | `program-design/references/progression-rules.md` |
| Total-rep density targets (`80 rep, +10/week`) | `progression-rules.md` |
| Ladder finishers (`1 pull / 2 dip / 3 push`, up and back down) | `progression-rules.md` |
| Resistance band (*loop*) as the fine-grained load axis for planche and lever holds, progressed by *scaling the band down* | `skill-progressions/references/planche.md`, `levers.md` |
| Hold-time windows with an explicit exit criterion (`min 5" max 10", above 10" change the progression`) | already matched the framework's own exit-criterion rule |
| Inline video requests per exercise (`manda video`) | `program-template.md` — a `Video` flag per exercise |
| Explicit elbow warning tied to a specific structure (long head of biceps) | already matched the framework's straight-arm doctrine |

## Copyright and privacy

The PDF is a third-party coach's work, kept here for private reference in a
private repository. The published worked example
(`skills/program-design/references/example-block.md`) is **original content** for
a different athlete with a different exercise selection — it reproduces the
*format*, never the source's programming.

If this repository is ever made public, delete this folder first.
