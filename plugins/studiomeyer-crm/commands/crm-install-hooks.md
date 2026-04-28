---
description: Output the StudioMeyer CRM hook recipe ready to merge into ~/.claude/settings.json. Two mcp_tool hooks — UserPromptSubmit auto-lookup and PostToolUse email-draft logger with if-filter — plus install instructions.
allowed-tools: Bash(cat:*), Read
argument-hint: ""
---

The StudioMeyer CRM plugin ships two hook recipes that integrate the CRM into Claude Code v2.1.118+ without manual tool calls. The user has invoked this command to install them.

Run this Bash command to output the recipe JSON:

```bash
cat ${CLAUDE_PLUGIN_ROOT}/hooks/recipe.json
```

After you have the recipe contents, walk the user through three install paths in this order:

1. **Helper script (recommended):** `bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crm/hooks/install.sh)` — idempotent jq-merge with backup. `--dry-run` to preview, `--uninstall` to revert.

2. **Manual copy-paste:** Show them the `hooks` key from the recipe and instruct them to merge it into the top-level `hooks` object in `~/.claude/settings.json`.

3. **Verify:** `claude`, then "draft a reply to Acme Corp", then save to `/tmp/email-test.md`. They should see "CRM: customer lookup..." and "CRM: logging email draft..." in the statusline.

**The two hooks:**

| Event | Filter | Tool | Why |
|---|---|---|---|
| UserPromptSubmit | (none, fires every prompt) | `crm_search` (limit 3) | Top-3 fuzzy matches injected into context |
| PostToolUse | `Edit\|Write` with `if: Edit(*email*)\|Write(*email*)\|Edit(*draft*)\|Write(*draft*)` | `crm_log_interaction` (type=email-draft, dedup via `tool_use_id`) | Auto-log only when the file path indicates an email or draft |

**Important — `if`-filter syntax:** Permission-Rule pattern (`Tool(glob)|Tool(glob)`). Pipe-separated alternatives, glob inside parens. Path matching is case-sensitive. `Email` ≠ `email`.

**Caveat:** `UserPromptSubmit` fires on every prompt — that's one `crm_search` call per prompt (typically <200ms). If the user thinks that's too aggressive, point them at the bash variant in recipe 16.3.

**Compatibility:** Requires Claude Code v2.1.118 or later. CRM MCP must be connected (`/mcp` lists `studiomeyer-crm`).

**GDPR:** All customer data flows to the user's own CRM tenant on crm.studiomeyer.io. No third parties. Tenant-isolated.

Source: [Recipe 16.3 on the Academy](https://studiomeyer.academy/recipes/16.3-crm-hook-bundle).
