# Movement Tags — the machine-checkable half of a constraint

A constraint says what is removed twice: once in prose, for the athlete to read,
and once in tags, for `npx calicoach check` to enforce against every exercise in
every program. The prose is what a human trusts. The tags are what catches the
overhead press that slipped into week 4 of a two-thousand-line block.

```
- [SHOULDER-01] No overhead pressing. No dips below humerus-parallel.
  Reason: painful arc 70-110 deg, right shoulder, 4/10.
  Forbids: overhead-press, overhead-load, dip
  Instead: landmine press, incline DB press to pain-free range, push-ups.
  Earns it back: pain-free full-range abduction + 20 s pain-free support hold.
  Re-test: 2026-10-04. Refer if unchanged.
```

## Rules

- **`Forbids:` is mandatory** on every constraint, in `screening.md` and in the
  program header. A constraint without it fails the check, because nothing would
  hold the program to it.
- **Only these tags are valid.** An unrecognised token fails the check rather
  than being ignored — an invented tag is a silent hole. If a real
  contraindication cannot be expressed here, add it to the matrix in
  [contraindications.md](contraindications.md) first, then to
  `src/movement-tags.js`.
- **A constraint that genuinely removes nothing mechanical** writes
  `Forbids: none` and says why in the reason.
- **`Instead:` is the escape hatch.** The checker permits any exercise the
  constraint itself names as a substitute, so a depth-limited dip under a `dip`
  constraint is allowed *if you named that exact variant*. Naming it is the
  coaching decision; the check just makes you make it deliberately.
- The checker also reads a card's optional `Attributes` row for movements the
  lexicon cannot recognise by name. Declaration **adds** to detection; a card
  can never tag its way out of a constraint.

## The vocabulary

| Tag | What it means |
|---|---|
| `overhead-press` | pressing with the humerus travelling above roughly 120° |
| `overhead-load` | any loaded position with the arms overhead |
| `behind-neck` | loading at end-range external rotation behind the head |
| `dip` | the dip pattern, where depth drives shoulder and sternoclavicular load |
| `support-hold` | a straight-arm support on bar or rings |
| `straight-arm` | straight-arm loading — the elbow and shoulder tendon clock |
| `false-grip` | false-grip loading of the wrist flexors |
| `weighted` | external load added to a bodyweight movement |
| `kipping` | ballistic kipping |
| `loaded-spinal-flexion` | loading the spine into flexion |
| `end-range-spinal-extension` | loading the spine at end-range extension |
| `loaded-hinge` | a loaded hip hinge |
| `deep-squat` | squatting below the pain-free or mobility-available depth |
| `deep-knee-flexion` | loaded knee flexion past roughly 90° |
| `pistol` | the pistol squat pattern |
| `impact` | impact and plyometric loading |
| `flat-hand-loading` | weight-bearing on a flat hand in wrist extension |
| `wide-stance-hip` | loading the adductors at length |
| `high-hip-flexion` | loaded hip flexion above roughly 90° |
| `end-range-external-rotation` | loading the shoulder at end-range external rotation |
| `stretched-pec` | loading the pec at maximal length |
| `heavy-grip` | high grip demand |
| `pronated-grip` | loaded pronated-grip work |
| `sustained-elbow-flexion` | holding the elbow flexed under load |
| `single-leg-balance` | balancing on one leg under load |
| `maximal-single` | a maximal single repetition |
| `maximal-valsalva` | maximal breath-holding against a closed glottis |
| `long-maximal-isometric` | a long isometric held at maximal effort |

## Choosing tags for a finding

Work from the **Remove** column of the matching row in
[contraindications.md](contraindications.md) and translate each removed item
into its tag. "Remove overhead press, deep dips, behind-neck anything, kipping"
becomes `Forbids: overhead-press, overhead-load, dip, behind-neck, kipping`.

Tag the **quality**, not the exercise. `dip` removes the pattern; the permitted
depth-limited version comes back through `Instead:`. That way the constraint
still protects the athlete when a future block picks a different dip variation.
