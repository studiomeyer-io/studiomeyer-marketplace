# StudioMeyer Academy hooks

One hook ships with this plugin. It is live the moment the plugin is enabled and gone again when you disable it.

| Event | What fires | What it costs you |
|---|---|---|
| `PostToolUse` after `academy_progress_complete` | `academy_quiz` for the lesson you just finished | One read. Needs an Academy API key, see below. |

## Before you enable it

Finish a lesson, get its quiz, without asking for it. That is the whole hook.

Without an API key it costs you exactly nothing, because it never runs: the tool that
triggers it does not exist. The server exposes 12 public tools without a key and 21 with
one, and `academy_progress_complete` is on the account side. A matcher pointing at a tool
that is not in the list simply never matches.

## What this plugin deliberately does not hook

**Nothing fires on `SessionStart` any more.** The old recipe loaded `academy_stats` and
`academy_next_lesson` there. Two problems, either one fatal. Both are account tools, absent
without a key. And `SessionStart` runs before the MCP servers have finished connecting, so
even with a key the call lands on a server that is not there yet:

```
Hooks: mcp_tool hook skipped, MCP server '...' not connected
```

Your progress is one command away instead: `/academy-progress`.

**The quiz call passes `slug`, not `lesson_slug`.** The old recipe used `lesson_slug`,
which the tool has never accepted. And it cannot pass `level`, because every substituted
value arrives as a string and `level` is declared a number.

## Verify it actually fires

```bash
claude --debug
```
Finish a lesson. The statusline flashes `Academy: loading quiz...`. Without a key, nothing
happens, which is correct.

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
