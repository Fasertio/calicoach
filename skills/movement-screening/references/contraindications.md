# Contraindications Matrix

Convert findings into programming constraints. Every constraint has five parts:
**what is removed** (in prose and in tags), **what replaces it**, **what earns it
back**, and **when we re-test**. A constraint without a substitution is a failure
of coaching.

Copy the resulting `Active constraints` block into the header of every program
file while it is live.

---

## How to write a constraint

```
- [SHOULDER-01] No overhead pressing and no dips below humerus-parallel.
  Reason: painful arc 70-110 deg, right shoulder, 4/10.
  Forbids: overhead-press, overhead-load, dip
  Instead: landmine press, incline DB press to pain-free range, push-ups.
  Earns it back: pain-free full-range abduction + 20 s pain-free support hold.
  Re-test: 2026-10-04. Refer if unchanged.
```

`Forbids:` is the same removal, written in the controlled vocabulary in
[movement-tags.md](movement-tags.md). It is **mandatory**: it is what lets
`npx calicoach check` compare the constraint against every exercise in every
session and fail the program when one violates it. Prose alone protects nobody
in a two-thousand-line block.

Translate each item in the **Remove** column below into its tag. `Instead:` is
the escape hatch — the checker permits any variant the constraint itself names,
so a depth-limited dip under a `dip` constraint is allowed if you named that
exact variant.

IDs are stable and referenced from the program file. When lifted, mark
`LIFTED YYYY-MM-DD (by: re-test | clinician)` — never delete.

---

## Shoulder

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Painful arc 60–120° | overhead press, deep dips, behind-neck anything, kipping | landmine press, incline press to pain-free range, push-ups, ring rows | full pain-free abduction + 20 s support hold | 2–4 wk, refer at 4 wk if unchanged |
| Front-shoulder pain in support/dip | dips, RTO support, bench press to chest | push-ups, floor press, ring rows, face pulls | 30 s pain-free support hold | 2–4 wk |
| Overhead reach limited, no pain | barbell overhead press | landmine / incline press, thoracic + lat mobility, wall slides | wall reach pass (A1) | 4 wk |
| History of dislocation / apprehension | end-range external rotation under load, behind-neck, maximal-stretch pec work, "cross-body" ballistic work | controlled mid-range pressing and pulling, heavy cuff and scapular work | clinician clearance for end range | clinician-led |
| Scapular dyskinesis / cannot dissociate | any straight-arm skill, weighted pull-ups | scapular pull-ups/push-ups, serratus work, rows | 5 clean scapular pull-ups with 2 s hold | 3–4 wk |
| AC joint pain (top of shoulder, point-tender) | dips, deep bench, heavy horizontal adduction | vertical pulling, neutral-grip pressing to pain-free depth | pain-free full flexion + cross-body test | 2–4 wk, refer if trauma-related |

## Elbow

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Pain at full extension under load | **all** straight-arm work (planche, lever, straight-arm pulldown), weighted pull-ups | bent-arm work in pain-free range, isometric elbow-flexor loading | pain-free lockout + 30 s straight-arm plank + 10 s lean | 2 wk cycles |
| Medial elbow pain (golfer's) | false-grip work, heavy grip, high-volume pulling, straight-arm | reduced-volume neutral-grip pulling, wrist-flexor isometrics -> heavy slow eccentrics | pain <2/10 during and 24 h after loading | weekly |
| Lateral elbow pain (tennis) | heavy pronated grip, high-volume pull-ups | neutral/supinated grip, wrist-extensor isometrics -> heavy slow resistance | as above | weekly |
| Distal biceps ache after lever/planche | back lever, front lever, all straight-arm pulls | tuck holds only if fully pain-free, otherwise bent-arm work | 3 pain-free sessions of isometric tolerance work | 2 wk |
| Prior elbow surgery / ulnar symptoms | end-range flexion under load, sustained elbow flexion, direct pressure | mid-range work only | clinician clearance | clinician-led |

Straight-arm elbow symptoms are the highest-consequence finding in calisthenics.
Err aggressively toward removal — see the tendinopathy protocol in
[injury-prevention](../../injury-prevention/SKILL.md).

## Wrist

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Pain in extended front support | floor push-ups, planche work, handstands on flat hands | parallettes, fists, push-up handles, wrist prep protocol | 60 s pain-free flat-hand front support | 2–3 wk |
| Extension < 70° | handstand on flat hands, deep push-up positions | parallettes, incline push-ups, wrist mobility progression | knee-to-wall equivalent for wrist (B3 pass) | 4 wk |
| TFCC / ulnar-side pain | weight-bearing in extension + ulnar deviation, false grip | neutral-wrist loading only (parallettes, dumbbells), grip work | pain-free load-bearing | refer if > 4 wk |

## Lumbar spine

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Pain with flexion (bending forward) | loaded spinal flexion, sit-ups, toes-to-bar, deep hinge | hip hinge from short range, anti-extension core, hip-dominant work, walking | pain-free hinge to parallel, 60 s plank | 2–4 wk |
| Pain with extension (arching) | overhead press, bridging, back extension end range, high-volume arch holds | hollow-body work, neutral-spine loading, anti-rotation | pain-free extension range under control | 2–4 wk |
| Radiating leg pain / numbness | **all loaded spinal work — refer** | pain-free upper-body work only | clinician clearance | clinician-led |
| Cannot maintain neutral under load | deadlift, heavy hinge, loaded carries | dowel hinge drills, hip thrust, back extension to neutral | 10 clean dowel hinges + 45 s side plank | 3–4 wk |

## Hip

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Anterior hip pinch at depth | deep squat, deep leg raises | squat to pain-free depth, box squat, hip airplane and 90/90 work | pain-free depth | 3–4 wk |
| Groin pain on adduction/abduction | wide-stance squats, Cossack, straddle work, human flag | narrow-stance work, isometric adductor loading (Copenhagen progression) | pain-free adduction squeeze at 6/10 effort | 2–4 wk |
| Hip flexor strain | high leg raises, L-sit, sprint, explosive knee drive | isometric hip flexion, gradual range | pain-free active straight-leg raise | 2–3 wk |

## Knee

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Anterior knee pain (patellofemoral) | jumping, deep loaded knee flexion, high-volume step-downs | pain-free-range squats, leg press to short range, isometric quad (Spanish squat, wall sit), glute-medius work | pain <2/10 during 10 slow step-downs | 2–4 wk |
| Patellar tendon pain | plyometrics, deep loaded jumps, pistol squats | isometric quad holds 5x45 s, then heavy slow resistance | pain <3/10 and settled within 24 h | weekly progression |
| Medial/lateral joint-line pain, locking, giving way | **all loading — refer** | upper body only | clinician clearance | clinician-led |
| Post-ACL / meniscus surgery | jumping, cutting, deep loaded flexion until cleared | clinician-prescribed loading only | clinician clearance | clinician-led |

## Ankle and foot

| Finding | Remove | Substitute | Earns it back | Re-test |
|---|---|---|---|---|
| Dorsiflexion < 8 cm knee-to-wall | flat-foot deep squat, pistol squat | heel-elevated squat, box squat, calf and ankle mobility | 10 cm both sides | 4 wk |
| Achilles pain | jumping, running, fast calf work | isometric calf holds -> heavy slow calf raises | pain <3/10, settled in 24 h | weekly |
| Recent sprain / instability | jumping, single-leg balance under load | bilateral work, balance progression, peroneal strengthening | pain-free single-leg 30 s balance | 2–4 wk |

## Systemic and population constraints

| Situation | Constraint |
|---|---|
| Hypermobility (Beighton 5+) | no passive end-range loading; soft lock at elbows and knees; strength through range; slower skill progressions; longer tissue timelines |
| Uncontrolled hypertension | no maximal Valsalva, no long maximal isometrics, no heavy overhead until cleared |
| Pregnancy / postpartum | clearance first; no supine work after the first trimester per clinician; no breath-holding; manage intra-abdominal pressure; scale impact and inversions |
| Osteoporosis / fragility fracture history | no loaded spinal flexion, no high-impact, progress load slowly, prioritise balance |
| Recent surgery < 6 months | clinician-prescribed loading only for that region |
| Under 16 | technique focus, submaximal loading, limited straight-arm volume, no maximal singles |
| Fluoroquinolone antibiotics (recent) | markedly reduce tendon loading and impact for the duration and several weeks after; discuss with the prescribing clinician |
| Beta-blockers | do not use heart-rate targets; use RPE |
| Type 1 / insulin-treated diabetes | glucose management around sessions per their clinician; never train alone if hypo history |

---

## Escalation rule

A constraint that has been re-tested twice without improvement, or any constraint
whose symptoms are worsening, stops being a training problem. Refer, keep
coaching the rest, and record the referral date in `profile.md`.
