# Sourcing and Citation Rules

Every exercise card ends with references. They must be real and checkable.

---

## The rules

1. **Never invent a citation.** No fabricated URLs, page numbers, study titles,
   author names, DOIs or quotes. If you are not certain a specific source says
   something, do not attribute it.
2. **Prefer named works and organisations over links.** A book title plus author
   plus chapter topic is verifiable forever; a URL rots and is easy to get wrong.
3. **Give video search terms, not video links.** Write
   `Video search terms: "front lever tuck progression tutorial"` rather than a
   specific URL you cannot verify.
4. **Athlete-supplied sources come first.** If the athlete has provided books or
   a coach's method through
   [knowledge-ingestion](../../knowledge-ingestion/SKILL.md), cite those by their
   entry in `calicoach/references/INDEX.md`, with the section or chapter, and
   note where they differ from the default approach.
5. **Label the type of claim.** Distinguish "established biomechanics",
   "standard coaching practice", and "one school's opinion". Depth in a squat,
   optimal rep ranges, and stretching protocols are contested — say so rather
   than presenting one school as settled fact.
6. **Say when you don't know.** "I'm not certain of the evidence here; this is
   how I'd program it and why" is a legitimate and useful answer.

---

## Citation keys

Cite by **stable key** — `[OG2]`, `[NSCA]`, `[NEU]` — and paste the rows you used
into the program's `# Bibliography` section. The keys live in
[bibliography.md](bibliography.md), and `calicoach check` fails a program that
cites a key it does not define.

## Default source shelf

These are widely available, well-known works and bodies. Cite them by name and
topic; do not invent page numbers.

### Calisthenics and gymnastics strength

| Source | Use it for |
|---|---|
| *Overcoming Gravity* (2nd ed.), Steven Low | the reference work for bodyweight progressions, program construction, straight-arm strength, and injury management in calisthenics |
| *Overcoming Poor Posture* / *Overcoming Tendonitis*, Steven Low et al. | tendon loading and connective-tissue management for bodyweight athletes |
| USA Gymnastics / FIG conditioning materials | gymnastics conditioning positions (hollow, arch, compression) |
| GymnasticBodies / Christopher Sommer methodology | straight-arm strength philosophy and progression order |
| *Building the Gymnastic Body*, Christopher Sommer | foundational gymnastics conditioning |

### Strength and conditioning

| Source | Use it for |
|---|---|
| *Essentials of Strength Training and Conditioning* (NSCA) | the standard textbook: mechanics, programming, periodisation, testing |
| *Science and Practice of Strength Training*, Zatsiorsky & Kraemer | training theory, intensity and volume relationships |
| *Practical Programming for Strength Training*, Rippetoe & Baker | novice/intermediate progression models |
| *Scientific Principles of Hypertrophy Training*, Israetel et al. (Renaissance Periodization) | volume landmarks (MEV/MAV/MRV), fatigue management |
| ACSM position stands and guidelines | general exercise prescription, special populations |

### Anatomy and biomechanics

| Source | Use it for |
|---|---|
| *Anatomy Trains*, Thomas Myers | fascial continuity framing (useful as a model, contested as anatomy — label it) |
| *Kinesiology of the Musculoskeletal System*, Neumann | joint mechanics, muscle actions, the serious reference |
| *Gray's Anatomy for Students* / *Netter's Atlas* | structural anatomy |
| ExRx.net exercise directory | muscle involvement per exercise, quick verification |

### Injury, tendon and rehabilitation context

| Source | Use it for |
|---|---|
| Published tendinopathy loading frameworks (isometric → heavy slow resistance → energy storage) — Cook, Purdam, Silbernagel and colleagues | the structure of graded tendon loading. Cite the *approach*, not a specific page |
| *Clinical Sports Medicine*, Brukner & Khan | sports-medicine reference for what is and is not a training problem |
| BJSM (British Journal of Sports Medicine) | current sports-medicine consensus statements |

Always pair any injury-related citation with the scope reminder: this is
coaching, not treatment.

### Mobility and movement

| Source | Use it for |
|---|---|
| FRC / Kinstretch (controlled articular rotations, PAILs/RAILs) | active mobility framework |
| *Becoming a Supple Leopard*, Kelly Starrett | positional cueing (popular framework, mixed evidence — label it) |
| Original FMS materials, Cook et al. | movement-screening framework this skill's battery is loosely informed by |

---

## Citation format in a card

```markdown
### References
- *Overcoming Gravity* (2nd ed.), Steven Low — front lever progression order and
  volume caps for straight-arm work.
- NSCA *Essentials of Strength Training and Conditioning* — rowing mechanics and
  loading standards.
- Athlete's source: `references/INDEX.md#ido-portal-notes`, section on scapular
  preparation — recommends a longer scapular-strength phase than the default here.
- Video search terms: "tuck front lever progression", "front lever scapular
  depression cue".
```

## When sources disagree

Say so explicitly, give both positions, state which you are using and why, and
let the athlete decide:

> Low recommends 8–12 weeks of bent-arm base before straight-arm work; the method
> in your book starts straight-arm holds earlier. I'm going with the more
> conservative version because your elbow screen showed a limitation — we can
> revisit at the re-test on 4 October.

## What not to cite

- Anonymous social-media claims presented as evidence.
- "Studies show" without a study you can actually name.
- Anything you are reconstructing from memory with low confidence.

If the honest answer is "this is standard coaching practice and I can't point you
to a specific source", write exactly that.
