# StudioMeyer GEO — Hook Recipes

One `mcp_tool` hook that auto-audits your AI-visibility score whenever you edit a Markdown file. Stop hook with `if`-filter on `*.md`/`*.mdx` keeps it from firing on pure code changes.

> **Requires Claude Code v2.1.118 or later** (released 2026-04-23).

## What gets installed

| Event | Filter | Tool | Why |
|---|---|---|---|
| `Stop` | `if: Edit(*.md\|*.mdx)\|Write(*.md\|*.mdx)` | `geo_check` (mode=training) | Re-score AI visibility every time you finish a session that touched Markdown |

The hook fires on `Stop` only when at least one Edit/Write to a `.md` or `.mdx` file happened in the session. Pure JavaScript or config edits do not trigger a GEO check.

> **Verify the `if`-filter on Stop with `claude --debug` once.** The Permission-Rule `if`-filter syntax (`Tool(glob)|Tool(glob)`) is documented for tool-use events (PreToolUse/PostToolUse). Whether Claude Code v2.1.118 evaluates it on `Stop` by checking tools used during the session is **runtime-version-dependent**. If your version doesn't, `geo_check` will fire on every session stop including pure code-edit sessions — `mode: training` is free but each call still takes 5-15s. Run `claude --debug` once after install to confirm the filter actually narrows the trigger.

## Important — Replace placeholders before installing

The shipped `recipe.json` has placeholder values:

- `url`: `https://example.com` → replace with your homepage, `/blog`, `/docs`, etc. Must be public.
- `brand`: `Your Brand` → replace with the brand name LLMs should associate with the URL.

The helper script (Option A below) will prompt you for both values before merging.

## Compliance

- **Idempotent.** Same URL+brand+mode within the 1-hour cache window returns identical scores.
- **Fast.** `geo_check` in `training` mode: 5-15s. In `search` mode: 30-50s (8 parallel LLM API calls). 60s timeout covers worst case.
- **Deterministic.** Same input, same output (within cache window).
- **Side-effect-free without user trigger.** Read-only (queries LLMs, doesn't modify them).
- **GDPR.** Sends URL + brand to 8 LLM provider APIs. Use only public URLs. Don't audit internal staging environments.

## Install

### Option A — Helper script (recommended)

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-geo/hooks/install.sh)
```

Prompts for `url` and `brand`, then idempotently merges into `~/.claude/settings.json`. Backup created automatically.

### Option B — Manual copy-paste

Open [`recipe.json`](./recipe.json), replace the two placeholders (`url` and `brand`), then merge the `hooks` key into the top-level `hooks` object in `~/.claude/settings.json`.

### Option C — Slash command

```bash
/plugin install studiomeyer-geo@studiomeyer
/geo-install-hooks
```

## Verify it works

Edit any `.mdx` file in a Claude Code session, then end with Ctrl-D:

```bash
cd /your/content/repo
claude
# In claude: "edit blog/2026-04-28-my-post.mdx — add one sentence at the top"
# Ctrl-D
```

Watch the statusline — "GEO: auto-audit after content edit..." should flash for ~5-15 seconds. Check the dashboard at https://geo.studiomeyer.io/dashboard — a new run should appear under your URL with a 0-100 score.

## Cost notes

- `mode: "training"` (default) is **free** — uses LLM training-data recall, no native web-search.
- `mode: "search"` costs $0.30-0.50/run because it triggers 8 native web-search API calls in parallel.
- The 1-hour cache window means a flurry of edits in quick succession only triggers one billable run.

If you want every session to spend on `mode: "search"`, edit the merged `recipe.json` after install and add `"mode": "search"` to the `input` object.

## Optional — UserPromptSubmit context-injection

The Academy recipe 16.4 also describes a bash hook that nudges the assistant to call `geo_simulate` on visibility-related questions. That hook lives in `~/.claude/hooks/geo-trigger-check.sh` and isn't shipped here as a `mcp_tool` recipe (bash needs to extract the URL from the prompt — too fragile for `mcp_tool`). See the [recipe](https://studiomeyer.academy/recipes/16.4-geo-crew-hook-bundle) for the bash variant.

## Uninstall

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-geo/hooks/install.sh) --uninstall
```

## Source

- [Recipe 16.1 — mcp_tool hook intro](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro)
- [Recipe 16.4 — GEO + Crew hook bundles](https://studiomeyer.academy/recipes/16.4-geo-crew-hook-bundle)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [StudioMeyer GEO MCP](https://geo.studiomeyer.io)
