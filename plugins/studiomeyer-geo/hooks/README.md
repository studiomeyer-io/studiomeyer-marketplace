# StudioMeyer GEO hooks

None, on purpose. This file explains the decision, because the plugin used to ship one.

## Before you enable it

`geo_check` sends your URL to eight LLM providers. In `search` mode that is 0.30 to 0.50
US dollars a run at the provider. Even the free `training` mode takes five to fifteen
seconds every time.

A hook fires without being asked. A tool that spends money and takes fifteen seconds should
not fire without being asked. Run it when you want it:

```
/geo-check https://your-site.example
```

## What this plugin deliberately does not hook

**The old `Stop` hook never fired once.** It carried an `if` filter to limit it to Markdown
edits, and Claude Code can only evaluate `if` on tool events. On `Stop` the hook is dropped
entirely, with one line in the debug log that nobody was reading:

```
Hook if condition "Edit(*.md|*.mdx)|Write(*.md|*.mdx)" cannot be evaluated for non-tool event Stop
```

Two more faults sat in the same four lines. The `server` field held the bare key rather
than the plugin-scoped name, so the lookup would have failed anyway, and the `if` value
held four permission rules where Claude Code parses one.

The shipped `hooks/README.md` even asked users to verify the filter with `claude --debug`
because we were unsure whether it worked. Nobody ran it. The measurement takes a minute
and would have saved four months.

## Verify it actually fires

Nothing to verify. If you want the audit on a schedule rather than on demand,
`geo_schedule` does it server-side, which is the right place for something that costs
money.

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
