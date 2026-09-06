# Bibliography — Citation Keys

Stable keys for the sources this framework cites. Use the key in exercise cards
and programs; paste the rows you actually used into the program's
`# Bibliography` section so the athlete can follow them up.

Keys never change. Add new ones; do not renumber.

---

## Calisthenics and gymnastics strength

| Key | Source | Use it for |
|---|---|---|
| `[OG2]` | *Overcoming Gravity*, 2nd ed. (2016) — Steven Low, DPT | the reference work for bodyweight progressions, program construction, structural balance, isometric dosing, rest and tempo, and injury management |
| `[BSTA]` | *Bodyweight Strength Training Anatomy* (2013) — Bret Contreras | per-exercise functional anatomy, movement-pattern balance including the unilateral and core-plane axes, autoregulation, training variables |
| `[OT]` | *Overcoming Tendonitis* — Steven Low et al. | connective-tissue management written for bodyweight athletes |
| `[SOMMER]` | *Building the Gymnastic Body* — Christopher Sommer | gymnastics conditioning, straight-arm philosophy, progression order |
| `[USAG]` | USA Gymnastics / FIG conditioning materials | hollow, arch and compression positions |

## Strength and conditioning

| Key | Source | Use it for |
|---|---|---|
| `[NSCA]` | *Essentials of Strength Training and Conditioning* — NSCA | the standard textbook: mechanics, programming, periodisation, testing |
| `[ZAT]` | *Science and Practice of Strength Training* — Zatsiorsky & Kraemer | training theory, contraction types, volume/intensity relationships |
| `[RP]` | *Scientific Principles of Hypertrophy Training* — Israetel et al. | volume landmarks (MEV/MAV/MRV), fatigue management |
| `[PPST]` | *Practical Programming for Strength Training* — Rippetoe & Baker | novice and intermediate progression models |
| `[ACSM]` | ACSM position stands and guidelines | general exercise prescription, special populations |

## Anatomy and biomechanics

| Key | Source | Use it for |
|---|---|---|
| `[NEU]` | *Kinesiology of the Musculoskeletal System* — Neumann | joint mechanics, muscle actions, moment arms — the serious reference |
| `[GRAY]` | *Gray's Anatomy for Students* / *Netter's Atlas* | structural anatomy |
| `[EXRX]` | ExRx.net exercise directory | muscle involvement per exercise, quick verification |

## Injury, tendon and clinical context

| Key | Source | Use it for |
|---|---|---|
| `[TEND]` | Tendinopathy loading framework (isometric → heavy slow resistance → energy storage → sport-specific), as described by Cook, Purdam, Silbernagel and colleagues | the *structure* of graded tendon loading. Cite the approach, never a specific page |
| `[BK]` | *Clinical Sports Medicine* — Brukner & Khan | what is a training problem and what belongs to a clinician |
| `[BJSM]` | British Journal of Sports Medicine | current sports-medicine consensus statements |

## Movement and mobility

| Key | Source | Use it for |
|---|---|---|
| `[FMS]` | Functional Movement Screen materials — Cook et al. | the screening framework this battery is loosely informed by |
| `[FRC]` | Functional Range Conditioning / Kinstretch (CARs, PAILs/RAILs) | active mobility framework |
| `[SUPPLE]` | *Becoming a Supple Leopard* — Kelly Starrett | positional cueing — popular framework, mixed evidence; label it as such |

## Athlete-supplied sources

Sources the athlete provided get a key too, prefixed `ATH`:

| Key | Source | Where |
|---|---|---|
| `[ATH1]` | *(example)* Coach's scapular preparation notes | `references/INDEX.md#coach-notes` |

Register them through
[knowledge-ingestion](../../knowledge-ingestion/SKILL.md) first, and record
honestly whether the text was actually read.

---

## Using keys

In an exercise card:

```markdown
### References
- `[OG2]` — front lever progression order and straight-arm volume caps.
- `[NEU]` — scapulohumeral rhythm, and why an arced press avoids the painful range.
- Video search terms: "advanced tuck front lever band assisted"
```

In the program, a `# Bibliography` section listing only the keys used:

```markdown
# Bibliography
| Key | Source |
|---|---|
| `[OG2]` | *Overcoming Gravity*, 2nd ed. — Steven Low |
| `[NEU]` | *Kinesiology of the Musculoskeletal System* — Neumann |
```

`calicoach check` fails a program that cites a key it does not define.

## Rules that do not change

- **Never invent a citation.** No fabricated URLs, page numbers, study titles,
  authors or quotes. A key without a real source behind it is worse than no
  citation at all.
- **Give video search terms, not video links.** Links rot; search terms do not.
- **Label the type of claim** — established biomechanics, standard coaching
  practice, or one school's opinion. Squat depth, optimal rep ranges and
  stretching protocols are contested; say so.
- **"I can't point you to a source for this"** is a legitimate line. Use it
  rather than reaching for a key that does not really support the claim.

See [reference-sources.md](reference-sources.md) for the sourcing rules in full.
