---
description: Output the StudioMeyer Memory hook recipe ready to merge into ~/.claude/settings.json. Lists the four mcp_tool hooks (Stop, PreCompact, UserPromptSubmit, SubagentStop) with usage notes and the install command.
allowed-tools: Bash(cat:*), Read
argument-hint: ""
---

The StudioMeyer Memory plugin ships four hook recipes that turn the Memory MCP into a fully agentic memory layer for Claude Code v2.1.118+. The user has invoked this command to install them.

Run this Bash command to output the recipe JSON:

```bash
cat ${CLAUDE_PLUGIN_ROOT}/hooks/recipe.json
```

After you have the recipe contents, walk the user through three install paths in this order:

1. **Helper script (recommended):** `bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-memory/hooks/install.sh)` — idempotent jq-merge into `~/.claude/settings.json`, with backup. Re-running is a NOOP (won't duplicate hooks). Use `--dry-run` first to preview, `--uninstall` to revert.

2. **Manual copy-paste:** Show them the `hooks` key from the recipe and instruct them to merge it into the top-level `hooks` object in `~/.claude/settings.json`.

3. **Verify:** `claude` then a prompt then Ctrl-D — they should see "Memory: summarizing session..." flash in the statusline. Dashboard at https://memory.studiomeyer.io/dashboard should show the new session.

**The four hooks:**

| Event | Tool | Why |
|---|---|---|
| Stop | `nex_summarize` + `nex_session_end` | Auto-persist every session |
| PreCompact | `nex_summarize` | Snapshot before context compaction |
| UserPromptSubmit | `nex_search` (limit 5) | Pre-fetch relevant memories every prompt |
| SubagentStop | `nex_learn` (category=research, confidence=0.6) | Ingest subagent findings automatically |

**Compatibility:** Requires Claude Code v2.1.118 or later. Memory MCP must be connected (`/mcp` lists `studiomeyer-memory` as alive).

**Caveat about UserPromptSubmit:** Fires on every user prompt — typically <200ms but adds up over heavy sessions. If the user finds it too aggressive, suggest swapping to the bash variant from [recipe 16.2](https://studiomeyer.academy/recipes/16.2-memory-hook-bundle) (keyword filtered).

**GDPR:** All data flows to the user's own Memory tenant on memory.studiomeyer.io. No third parties. The user can delete the tenant any time via the dashboard.

Source: [Recipe 16.2 on the Academy](https://studiomeyer.academy/recipes/16.2-memory-hook-bundle).
