---
description: Output the StudioMeyer Crew hook recipe — one mcp_tool hook on Stop for crew_feedback. Optional bash SessionStart hook for persona-activation explained separately.
allowed-tools: Bash(cat:*), Read
argument-hint: ""
---

The StudioMeyer Crew plugin ships one mcp_tool hook recipe (Stop → crew_feedback) plus an optional bash hook for persona-activation. The user has invoked this command to install them.

Run this Bash command to output the recipe JSON:

```bash
cat ${CLAUDE_PLUGIN_ROOT}/hooks/recipe.json
```

After you have the recipe contents, walk the user through three install paths:

1. **Helper script (recommended):** `bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crew/hooks/install.sh)` — idempotent jq-merge with backup. Use `--with-bash-hooks` to also install the persona-suggestion bash hook into `~/.claude/hooks/crew-auto-persona.sh`.

2. **Manual copy-paste:** Show them the `hooks.Stop` entry from the recipe and instruct them to merge it into `~/.claude/settings.json`.

3. **Verify:** `claude`, then a prompt, then Ctrl-D — they should see "Crew: logging feedback..." in the statusline. Dashboard at crew.studiomeyer.io/dashboard should show a new entry with tag `auto-stop-hook`.

**The Stop hook:**

| Event | Tool | Why |
|---|---|---|
| Stop | `crew_feedback` (rating=4, tags=["auto-stop-hook"]) | Default 4-star session feedback |

**Caveat — NOT idempotent.** `crew_feedback` writes one row per call. If Stop fires twice you get two rows. Acceptable for analytics, worth flagging to the user.

**The optional bash hook (persona-activation on SessionStart):**

The mapping cwd → persona needs regex matching that `mcp_tool` cannot do. The bash hook lives in `~/.claude/hooks/crew-auto-persona.sh` and injects a context hint nudging the assistant to call `crew_activate({persona})`. The default mapping:

```
*studiomeyer*|*academy*|*nex-hq*       → cto
*aklow*|*kunden*|*pet-platform*        → pm
*blog*|*content*|*marketing*           → cmo
*legal*|*agb*|*datenschutz*            → legal-advisor
*finance*|*billing*|*stripe*           → cfo
*support*|*inbox*|*tickets*            → support-lead
*                                       → cto (default)
```

The user can edit the case statement after install to add their own paths.

**Compatibility:** Requires Claude Code v2.1.118 or later. Crew MCP must be connected.

**GDPR:** Crew tenant data isolated per user.

Source: [Recipe 16.4 on the Academy](https://studiomeyer.academy/recipes/16.4-geo-crew-hook-bundle).
