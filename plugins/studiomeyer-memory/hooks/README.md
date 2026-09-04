# StudioMeyer Memory hooks

Two hooks ship with this plugin. They are live the moment the plugin is enabled and gone again when you disable it. There is nothing to paste into your settings.

| Event | What fires | What it costs you |
|---|---|---|
| `UserPromptSubmit` | `nex_search` on your prompt, five results | One read against your own tenant. |
| `SessionEnd` | `nex_session_end` with no arguments | One write. Closes the session the server opened for you. |

## Before you enable it

The first hook sends **every prompt you type** to `memory.studiomeyer.io`, into your own
tenant, isolated from everyone else's. That is what "recall on every prompt" means, and it
is the whole reason to install a memory plugin. Decide with your eyes open.

Nothing here costs money. Both calls count against your daily quota like any other call,
and on the free tier's 5,000 a day you will not notice them.

Two more things worth knowing. The result of a `UserPromptSubmit` hook is handed to the
model as context on every turn, so five recalled memories are five memories the model reads
before it answers you. That is the point, and it is also tokens. Lower the `limit` in
`hooks/hooks.json` if your sessions run long.

And the hook fires on the raw prompt, before Claude has understood it. It is a keyword
recall, not a considered search. When you want the considered one, ask for it.

## What this plugin deliberately does not hook

**`nex_summarize` is deliberately not a hook.** It needs a written summary, and only the
model can write one. A hook has no language: it can pass fields from the event, nothing
more. The old recipe called it anyway, with no `summary` at all.

**`nex_session_end` sits on `SessionEnd`, not on `Stop`.** `Stop` fires after every single
answer. Closing your memory session there would close it dozens of times a day, the first
time about ten seconds into your work.

**Nothing fires on `SubagentStop`.** The old recipe closed the session there, and the
`session_id` on that event is the parent's. It would have ended the session you were still
working in.

## Verify it actually fires

```bash
claude --debug
```
Type anything. The statusline flashes `Memory: recalling...`, and the debug log carries a
line beginning `Hooks: mcp_tool calling plugin:studiomeyer-memory:studiomeyer-memory/nex_search`.

If instead you see `MCP server '...' not connected`, the server has not finished
authenticating. Run any Memory tool once, click the Magic Link, and try again.

## Why the hooks moved

Until version 1.2.0 every plugin here shipped a `hooks/recipe.json` and an `install.sh`
that merged it into `~/.claude/settings.json`. The README explained that Claude Code's
plugin policy forbade shipping hooks directly.

That was wrong. A plugin has always been able to ship `hooks/hooks.json`, which Claude Code
merges with your own hooks while the plugin is enabled. What the policy forbids is a plugin
writing into your settings file, which is exactly what our install script did.

The detour had a price. Because `recipe.json` was never a file Claude Code loads, nothing
ever checked it against reality, and all twelve hook entries across the five plugins were
dead. See [../../docs/hooks.md](../../docs/hooks.md) for each fault and the rule that now
catches it.
