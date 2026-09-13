---
description: Show the full card for one exercise
argument-hint: <exercise name>
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `exercise-library` skill (`calicoach:exercise-library` when installed as a
plugin) and produce the full exercise card — setup, execution, cues, faults, tempo, risk notes, regressions, progressions, references.

What the athlete said with the command: $ARGUMENTS
