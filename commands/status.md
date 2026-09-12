---
description: Where you are in the coaching loop and what is due next
allowed-tools: [Bash]
---

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" status --no-banner 2>/dev/null || echo NO_WORKSPACE`

Relay the state above as-is. Do not open any file to expand on it — every
line was computed from the workspace. Add at most one sentence of your own,
naming the command in `next`.

If it reads `NO_WORKSPACE`, say calicoach is installed but this project has
no workspace yet, and route to `/calicoach:init`.
