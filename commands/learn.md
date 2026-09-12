---
description: Add a book, PDF or method as a source
argument-hint: <file or method>
allowed-tools: [Skill, Read, Write, Edit, Glob, Grep, Bash]
---

Where the athlete stands right now:

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

The state above is authoritative. Do not re-derive it by reading
`calicoach/athlete/*.md` or the program — it was computed from them.
If it reads `NO_WORKSPACE`, say so and route to `/calicoach:init` first.

Invoke the `knowledge-ingestion` skill (`calicoach:knowledge-ingestion` when installed as a
plugin) and index the source into `calicoach/references/` and state what it changes in the programming.

What the athlete said with the command: $ARGUMENTS
