---
description: Run the movement screen and record your hard constraints
argument-hint: [area or symptom]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `movement-screening` skill (`calicoach:movement-screening` when installed as a
plugin) and run the screen, triage red flags, then write `calicoach/athlete/screening.md`.

What the athlete said with the command: $ARGUMENTS
