---
description: Write or revise the training block
argument-hint: [goal, constraint, or "revise"]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `program-design` skill (`calicoach:program-design` when installed as a
plugin) and design the block and write it to `calicoach/programs/`.

What the athlete said with the command: $ARGUMENTS

Doctrine gate: no program without a profile, no loading without a screen.
If the state shows either missing, say so in one sentence and route to
`/calicoach:onboard` or `/calicoach:screen` instead of writing a block.
