# StudioMeyer Academy hooks

One legacy hook ships with this plugin. It is loaded while the plugin is enabled, but its personal source tool is absent from the current public npm CLI.

| Event | What fires | What it costs you |
|---|---|---|
| `PostToolUse` after `academy_progress_complete` | `academy_quiz` for the lesson you just finished | Inactive in the public npm CLI; personal tools require hosted OAuth. |

## Before you enable it

Finish a lesson, get its quiz, without asking for it. That is the whole hook.

The current npm CLI exposes 29 public tools. The legacy `ACADEMY_API_KEY` setting does
not add personal tools, and `academy_progress_complete` is absent from this list. The
matcher therefore does not fire in this CLI configuration. Personal tools require the
hosted OAuth connection and depend on granted scopes.

## What this plugin deliberately does not hook

**Nothing fires on `SessionStart` any more.** The old recipe loaded `academy_stats` and
`academy_next_lesson` there. Two problems, either one fatal. Both are account tools, absent
from the current public CLI. And `SessionStart` runs before the MCP servers have finished
connecting, so an MCP call there lands on a server that is not there yet:

```
Hooks: mcp_tool hook skipped, MCP server '...' not connected
```

The legacy `/academy-progress` command also needs personal tools; it cannot read progress
through the current public npm CLI.

**The quiz call passes `slug`, not `lesson_slug`.** The old recipe used `lesson_slug`,
which the tool has never accepted. And it cannot pass `level`, because every substituted
value arrives as a string and `level` is declared a number.

## Verify it actually fires

```bash
claude --debug
```
With the current public npm CLI, finishing a lesson does not trigger this hook, because
`academy_progress_complete` is absent. Adding a legacy API key does not change that.

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
