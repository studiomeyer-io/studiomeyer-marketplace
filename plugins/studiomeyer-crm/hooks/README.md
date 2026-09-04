# StudioMeyer CRM hooks

One hook ships with this plugin. It is live the moment the plugin is enabled and gone again when you disable it. There is nothing to paste into your settings.

| Event | What fires | What it costs you |
|---|---|---|
| `UserPromptSubmit` | `crm_search` on your prompt, three results | One read against your own tenant. |

## Before you enable it

It sends **every prompt you type** to `crm.studiomeyer.io`, into your own tenant. That is
what "auto-lookup" means: mention a customer and Claude already has their record. Decide
with your eyes open.

Nothing here costs money. The call counts against your daily quota like any other.

Two more things worth knowing. The result of a `UserPromptSubmit` hook is handed to the
model as context on every turn, so five recalled memories are five memories the model reads
before it answers you. That is the point, and it is also tokens. Lower the `limit` in
`hooks/hooks.json` if your sessions run long.

And the hook fires on the raw prompt, before Claude has understood it. It is a keyword
recall, not a considered search. When you want the considered one, ask for it.

## What this plugin deliberately does not hook

**`crm_log_interaction` is deliberately not a hook.** It requires `companyId`, `channel`,
`direction` and `content`. A hook knows the file you edited, not which company it belongs
to. The old recipe fired it after every edit to a path containing "email" or "draft",
passing three fields that do not exist in the schema and none of the four required ones.
It could never have worked, and its documentation described a deduplication key the server
has never had.

Logging an interaction belongs in the conversation, where the company is known. Ask for it,
or let the `crm-workflow` skill do it.

## Verify it actually fires

```bash
claude --debug
```
Type anything. The statusline flashes `CRM: customer lookup...`, and the debug log carries
a line beginning `Hooks: mcp_tool calling plugin:studiomeyer-crm:studiomeyer-crm/crm_search`.

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
