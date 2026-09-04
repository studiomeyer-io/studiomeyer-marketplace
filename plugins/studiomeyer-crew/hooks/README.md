# StudioMeyer Crew hooks

One hook ships with this plugin. It runs a local shell script, calls no server and writes nothing.

| Event | What fires | What it costs you |
|---|---|---|
| `SessionStart` | `crew-auto-persona.sh`, in this directory | Nothing. It reads your working directory and prints a suggestion. |

## Before you enable it

The script maps the directory you opened to a persona and hands Claude a one-line hint.
Edit the `case` statement in [`crew-auto-persona.sh`](./crew-auto-persona.sh) to change the
mapping. It is your copy, in the plugin, not a file we reach into.

## What this plugin deliberately does not hook

**`crew_feedback` is deliberately not a hook.** The old recipe fired it on every `Stop`
with a hard-coded rating of 4 and the tag `auto-stop-hook`. Its own metadata admitted it
was not idempotent and not side-effect free.

That is telemetry for us dressed as a feature for you. A rating nobody chose is not a
rating. If you want to tell us something, call `crew_feedback` yourself and mean it.

(It would not have fired either. Like every other hook in the old recipes, its `server`
field held the bare key instead of the plugin-scoped name.)

## Verify it actually fires

```bash
claude --debug
```
Start a session in a project directory. The statusline flashes
`Crew: matching persona to directory...` and Claude opens knowing which persona fits.

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
