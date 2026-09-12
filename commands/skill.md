---
description: Program a calisthenics skill progression
argument-hint: <planche, front-lever, muscle-up, handstand, flag, pistol>
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `skill-progressions` skill (`calicoach:skill-progressions` when installed as a
plugin) and pick the right rung, set the volume, and define the advance and regress criteria.

What the athlete said with the command: $ARGUMENTS
