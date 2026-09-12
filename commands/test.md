---
description: Measure a baseline the programming can start from
argument-hint: [specific test]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `assessment-testing` skill (`calicoach:assessment-testing` when installed as a
plugin) and run the test battery, then write `calicoach/athlete/baseline.md`.

What the athlete said with the command: $ARGUMENTS
