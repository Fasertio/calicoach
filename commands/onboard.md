---
description: Interview you and write your athlete profile
argument-hint: [anything you want to tell me]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `athlete-onboarding` skill (`calicoach:athlete-onboarding` when installed as a
plugin) and run the intake interview, then write `calicoach/athlete/profile.md`.

What the athlete said with the command: $ARGUMENTS
