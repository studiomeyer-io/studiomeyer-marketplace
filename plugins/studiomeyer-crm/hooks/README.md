# StudioMeyer CRM — Hook Recipes

Two `mcp_tool` hooks that integrate the CRM into your Claude Code workflow without manual `crm_search` or `crm_log_interaction` calls. Customer-mentions become instant context. Email-drafts become automatic interaction logs.

> **Requires Claude Code v2.1.118 or later** (released 2026-04-23). Older versions don't support `type: "mcp_tool"` hooks.

## What gets installed

| Event | Matcher / Filter | Tool | Why |
|---|---|---|---|
| `UserPromptSubmit` | (always) | `crm_search` (limit 3) | Pre-fetch top-3 fuzzy matches on every prompt — pipeline stage, last interaction, open deals |
| `PostToolUse` | `Edit\|Write` with `if: Edit(*email*)\|Write(*email*)\|Edit(*draft*)\|Write(*draft*)` | `crm_log_interaction` (type=email-draft, dedup by `tool_use_id`) | Auto-log email drafts when you save them to a file with "email" or "draft" in the path |

Both tools satisfy the [five-rule check](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro):

- **Idempotent.** `crm_search` is read-only. `crm_log_interaction` dedupes server-side via `tool_use_id` — re-firing on the same Edit returns the existing record.
- **Fast.** Both <300ms typical against a warm Postgres.
- **Deterministic.** `crm_search` ranks by relevance + recency; same query → same ranking. `crm_log_interaction` returns `{success, id}`.
- **Side-effect-free without user trigger.** `crm_search` is read-only. `crm_log_interaction` writes, but only fires after the user explicitly drafted an email.
- **GDPR.** Customer data stays in your own CRM tenant on `crm.studiomeyer.io`. No third parties.

## Caveat — UserPromptSubmit fires on every prompt

Every user prompt costs one `crm_search` (typically <200ms). For most users this is fine. If you find it too aggressive, swap `UserPromptSubmit` to the bash variant from [recipe 16.3](https://studiomeyer.academy/recipes/16.3-crm-hook-bundle) which only fires on capitalized multi-word patterns like `Acme Corp`.

## Install

### Option A — Helper script (recommended)

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crm/hooks/install.sh)
```

Backs up existing settings, idempotently merges via `jq`, validates JSON. Re-running is a NOOP.

### Option B — Manual copy-paste

Open `~/.claude/settings.json` and merge the `hooks` key from [`recipe.json`](./recipe.json) into the existing top-level `hooks` object.

### Option C — Slash command

```bash
/plugin install studiomeyer-crm@studiomeyer
/crm-install-hooks
```

## Verify it works

```bash
claude
# Type: "draft a quick reply to Acme Corp about pricing"
```

Watch the statusline — "CRM: customer lookup..." should flash. Then check the dashboard at https://crm.studiomeyer.io/dashboard.

To trigger the email-draft logger:

```bash
# In claude:
# "save this draft to /tmp/email-acme-pricing.md"
```

The dashboard should show a new "email-draft" interaction logged for Acme Corp.

## Uninstall

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crm/hooks/install.sh) --uninstall
```

## Troubleshooting

**`crm_log_interaction` runs but no record appears?**

Check that the file path contains `email` or `draft` — the `if`-filter is case-sensitive. `Email` in caps will not match `*email*`. The Permission-Rule syntax is documented in the [Claude Code Permissions Reference](https://code.claude.com/docs/en/settings).

**`crm_search` returns no results even though the customer exists?**

`crm_search` uses fuzzy matching. Very short prompts (<3 chars) or punctuation-heavy text won't match anything. Check directly:

```bash
# In claude:
/crm-dashboard
```

## Source

- [Recipe 16.1 — mcp_tool hook intro](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro)
- [Recipe 16.3 — CRM hook bundle (full walkthrough)](https://studiomeyer.academy/recipes/16.3-crm-hook-bundle)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [StudioMeyer CRM MCP](https://crm.studiomeyer.io)
