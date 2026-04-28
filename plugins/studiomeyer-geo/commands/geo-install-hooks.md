---
description: Output the StudioMeyer GEO hook recipe with placeholder substitution. One mcp_tool hook on Stop with if-filter that auto-audits AI visibility after Markdown edits.
allowed-tools: Bash(cat:*), Read
argument-hint: ""
---

The StudioMeyer GEO plugin ships one hook recipe that auto-audits AI visibility whenever the user edits a `.md` or `.mdx` file. The user has invoked this command to install it.

Run this Bash command to output the recipe JSON:

```bash
cat ${CLAUDE_PLUGIN_ROOT}/hooks/recipe.json
```

After you have the recipe contents, **WALK THE USER THROUGH PLACEHOLDER REPLACEMENT BEFORE INSTALL**. The shipped recipe has two placeholders:

- `url`: `https://example.com` — must be replaced with the URL the user wants to audit.
- `brand`: `Your Brand` — must be replaced with the brand name to query.

Ask the user:
1. "Which URL should the hook audit when you edit Markdown? (e.g. your homepage, /blog, /docs)"
2. "What brand name should LLMs associate with that URL?"

Then offer the three install paths:

1. **Helper script (recommended):** `bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-geo/hooks/install.sh)` — interactively prompts for url + brand, idempotent jq-merge.

2. **Manual copy-paste:** Show them the `hooks` key from the recipe with their values substituted in, instruct them to merge into `~/.claude/settings.json`.

3. **Verify:** Edit any `.mdx` in a Claude Code session, Ctrl-D — they should see "GEO: auto-audit after content edit..." in the statusline. Dashboard at geo.studiomeyer.io/dashboard should log the run.

**The hook:**

| Event | Filter | Tool | Why |
|---|---|---|---|
| Stop | `if: Edit(*.md\|*.mdx)\|Write(*.md\|*.mdx)` | `geo_check` (mode=training, free) | Re-score AI visibility after each session that touched markdown |

**Cost note:** `mode: "training"` (default) is free. `mode: "search"` costs $0.30-0.50/run for native web-search. 1-hour cache window means quick repeats are free.

**GDPR note:** `geo_check` sends URL + brand to 8 LLM provider APIs. Use only public URLs.

**Compatibility:** Requires Claude Code v2.1.118 or later. GEO MCP must be connected.

Source: [Recipe 16.4 on the Academy](https://studiomeyer.academy/recipes/16.4-geo-crew-hook-bundle).
