---
description: Validate the program and the documents it was built from
argument-hint: [paths] [--strict]
allowed-tools: [Bash, Read, Edit]
---

!`node "${CLAUDE_PLUGIN_ROOT}/bin/calicoach.js" check --no-banner $ARGUMENTS 2>&1 || true`

The checker output above is deterministic and complete for what it covers:
volume-budget arithmetic, push:pull ratio, structural balance, missing cards,
missing progression triggers, session time, dates, citation keys, and every
exercise against the active constraints.

Report what it found. For each error, name the fix in one line. Do not edit
any file unless the athlete asks — and never "fix" a constraint violation by
weakening the constraint.

If it reports nothing to check, route to `/calicoach:init`.
