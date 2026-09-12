---
description: Create the calicoach workspace in this project and show what is installed
argument-hint: [--global]
allowed-tools: [Bash, Read]
---

Set up calicoach in the current project.

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" workspace --no-banner 2>&1 || echo "bundled CLI unavailable — run: npx calicoach"`

Then report, in three lines:

1. Where the workspace was created, and whether it already existed.
2. That the athlete's data is theirs — Markdown under `calicoach/`, never
   overwritten without being told.
3. The next step: `/calicoach:onboard` to be interviewed.

Arguments: $ARGUMENTS
