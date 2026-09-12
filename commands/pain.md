---
description: Something hurts — triage it and adjust the load
argument-hint: <where> [since when]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `injury-prevention` skill (`calicoach:injury-prevention` when installed as a
plugin) and work out what to stop, what to keep, and how to load it.

What the athlete said with the command: $ARGUMENTS

Before any loading advice, re-run the red-flag triage from the
`movement-screening` skill. If a red flag is present, stop, refer, and
coach only what is unambiguously safe. If the picture has changed since
the last screen, route to `/calicoach:screen`.
