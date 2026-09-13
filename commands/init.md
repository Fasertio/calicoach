---
description: Set up the calicoach workspace in this project
allowed-tools: [Bash, Read]
---

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" workspace --no-banner 2>&1 || echo "bundled CLI unavailable — run: npx github:Fasertio/calicoach"`

Say in two or three lines where the workspace is, that the files under
`calicoach/` are the athlete's and are never overwritten without saying so,
and that `/calicoach:onboard` is the next step.

The workspace is always project-scoped — there is no global variant, and the
skills are installed separately, by the plugin or by the CLI.
