---
description: Review the block and brief the next one
argument-hint: [block number]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `progress-review` skill (`calicoach:progress-review` when installed as a
plugin) and analyse the logs against the plan, then write the review to `calicoach/reviews/`.

What the athlete said with the command: $ARGUMENTS

If the state shows no program, there is nothing to review — say so and
route to `/calicoach:program`.
