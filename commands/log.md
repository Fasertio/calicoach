---
description: Record a session, or adjust today's before you train
argument-hint: [how it went]
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `session-logging` skill (`calicoach:session-logging` when installed as a
plugin) and record the session to `calicoach/logs/`, applying the autoregulation rules.

What the athlete said with the command: $ARGUMENTS
