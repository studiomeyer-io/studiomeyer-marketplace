# StudioMeyer Memory — Hook Recipes

Four `mcp_tool` hooks that turn the Memory MCP from "a tool I call manually" into "a memory layer that always knows what I did". Stop, PreCompact, UserPromptSubmit, SubagentStop — all idempotent, all fast, all GDPR-compliant.

> **Requires Claude Code v2.1.118 or later** (released 2026-04-23). Older versions don't support `type: "mcp_tool"` hooks.

## What gets installed

| Event | Tool | Why |
|---|---|---|
| `Stop` | `nex_summarize` + `nex_session_end` | Auto-persist every session without manual calls |
| `PreCompact` | `nex_summarize` | Snapshot before Claude Code drops context |
| `UserPromptSubmit` | `nex_search` (limit 5) | Pre-fetch relevant memories before the assistant responds |
| `SubagentStop` | `nex_session_end` | Close the parent session_id when a subagent finishes (idempotent NOOP if already ended) |

All four tools satisfy the [five-rule check](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro):

- **Idempotent.** `nex_summarize` and `nex_session_end` are NOOP on duplicate. `nex_search` is read-only.
- **Fast.** Typical <2s against a warm DB. Cold start <8s. Well under the 30s timeout.
- **Deterministic.** Same session_id → same summary. Same query → similar (recency-decayed) recall.
- **Side-effect-free without user trigger.** `nex_search` is read-only. Writes happen only on user-implicit triggers (Stop, SubagentStop).
- **GDPR.** All data flows to your own Memory tenant on `memory.studiomeyer.io`. No third parties.

> **Note on subagent findings.** The Academy recipe 16.2 example uses a `${last_assistant_message}` substitution variable to feed `nex_learn` from the SubagentStop event. As of Claude Code v2.1.118, that variable is **not** in the canonical substitution list (`${cwd}`, `${tool_input.field}`, `${tool_name}`, `${session_id}`, `${duration_ms}`, `${user_prompt}`). To avoid sending the literal string `${last_assistant_message}` to `nex_learn`, this bundle uses `nex_session_end` on `SubagentStop` instead. To capture a subagent's findings as a learning, call `nex_learn` explicitly from the parent assistant after the subagent returns.

## Install

### Option A — Helper script (recommended)

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-memory/hooks/install.sh)
```

The script:
1. Backs up your existing `~/.claude/settings.json` to `~/.claude/settings.json.bak-{timestamp}`.
2. Merges the four hooks idempotently using `jq` (so re-running won't duplicate hooks).
3. Verifies the resulting JSON parses.
4. Prints a 1-line `claude --debug` smoke test.

### Option B — Manual copy-paste

Open `~/.claude/settings.json` and add the contents of [`recipe.json`](./recipe.json) (just the `hooks` key) into the existing top-level `hooks` object. If `hooks` doesn't exist yet, copy the whole `hooks` block in.

### Option C — Slash command

After installing the `studiomeyer-memory` plugin via:

```bash
/plugin install studiomeyer-memory@studiomeyer
```

run:

```bash
/memory-install-hooks
```

The command outputs the snippet ready for your settings.

## Verify it works

```bash
claude
# Type something, then Ctrl-D
```

Watch the statusline:
- "Memory: summarizing session..."
- "Memory: closing session..."

Check the dashboard at https://memory.studiomeyer.io/dashboard — your latest session should be listed under "Sessions" with an auto-generated summary.

For the SubagentStop hook:

```bash
claude
# "use the research subagent to find 3 articles about MCP hooks"
# Wait for the subagent to finish
```

Watch the statusline — "Memory: closing subagent session..." flashes. The dashboard at https://memory.studiomeyer.io/dashboard will show your session marked closed (idempotent — re-firing is a NOOP).

## Uninstall

If you used the helper script:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-memory/hooks/install.sh) --uninstall
```

Or restore the backup:

```bash
mv ~/.claude/settings.json.bak-{timestamp} ~/.claude/settings.json
```

Or open `~/.claude/settings.json` and remove the four hook entries manually.

## Troubleshooting

**Hook silently doesn't fire?**

```bash
claude --debug
```

`--debug` prints hook-execution details. Common causes: typo in `server` name (must be `studiomeyer-memory` exactly), MCP server not connected (`/mcp` shows it as offline), or `claude --debug` shows a `tool not found` because the server is still booting up.

**UserPromptSubmit hook feels too aggressive?**

Every prompt costs one `nex_search` call (typically <200ms). If you'd rather only fire on trigger phrases ("hatten wir das schon", "what did we discuss"), use the bash hook variant from recipe [16.2](https://studiomeyer.academy/recipes/16.2-memory-hook-bundle) instead.

**SubagentStop hook is firing too often?**

The shipped `SubagentStop` hook calls `nex_session_end` (idempotent NOOP if the session is already ended). If a long-running session spawns many subagents, you'll see the statusline flash on each subagent return — but the actual DB writes are NOOP after the first. Remove the entry from settings.json if the statusline flashes annoy you.

## Source

- [Recipe 16.1 — mcp_tool hook intro](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro)
- [Recipe 16.2 — Memory hook bundle (full walkthrough)](https://studiomeyer.academy/recipes/16.2-memory-hook-bundle)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [StudioMeyer Memory MCP Documentation](https://memory.studiomeyer.io)
