# StudioMeyer Crew — Hook Recipes

One `mcp_tool` hook that auto-logs session feedback when Claude Code stops. Persona-activation is a separate bash hook (cwd-detection needs regex matching that `mcp_tool` cannot do).

> **Requires Claude Code v2.1.118 or later** (released 2026-04-23).

## What gets installed

| Event | Tool | Why |
|---|---|---|
| `Stop` | `crew_feedback` (rating=4, tags=["auto-stop-hook"]) | Default 4-star feedback so the next session has continuity |

The user can override mid-session by calling `crew_feedback` explicitly with a different rating + note. Phase 1 Crew is in test mode, so feedback is data-collection only — no Stripe gate.

## Compliance — caveat: NOT idempotent

`crew_feedback` writes one row per call. If `Stop` fires twice (e.g. user resumes a paused session), you get two feedback rows with the same `auto-stop-hook` tag. **This is acceptable for analytics** but worth knowing.

- **Latency.** <500ms typical.
- **Deterministic.** Same input, same output (returns row id).
- **Side-effect.** Writes one row. The user implicitly triggered it by ending the session.
- **GDPR.** Crew tenant data isolated per user.

## Install

### Option A — Helper script (recommended)

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crew/hooks/install.sh)
```

### Option B — Manual copy-paste

Open `~/.claude/settings.json` and merge the `hooks.Stop` entry from [`recipe.json`](./recipe.json) into the existing top-level `hooks` object.

### Option C — Slash command

```bash
/plugin install studiomeyer-crew@studiomeyer
/crew-install-hooks
```

## Verify it works

```bash
claude
# Type something, then Ctrl-D
```

Watch the statusline — "Crew: logging feedback..." should flash. Check the dashboard at https://crew.studiomeyer.io/dashboard — a new feedback entry with tag `auto-stop-hook` should appear.

## Optional — SessionStart persona-activation (bash hook, separate)

The Academy recipe 16.4 also describes a `SessionStart` bash hook that suggests the right persona based on `cwd` ("studiomeyer" → cto, "kunden" → pm, "blog" → cmo, etc.). It cannot be a `mcp_tool` because the cwd → persona mapping needs regex matching that `mcp_tool` doesn't support.

To install:

```bash
mkdir -p ~/.claude/hooks
curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crew/hooks/crew-auto-persona.sh \
  -o ~/.claude/hooks/crew-auto-persona.sh
chmod +x ~/.claude/hooks/crew-auto-persona.sh
```

Then add the `SessionStart` entry to your settings (the helper `install.sh --with-bash-hooks` flag does this for you).

## Uninstall

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crew/hooks/install.sh) --uninstall
```

## Source

- [Recipe 16.1 — mcp_tool hook intro](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro)
- [Recipe 16.4 — GEO + Crew hook bundles](https://studiomeyer.academy/recipes/16.4-geo-crew-hook-bundle)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [StudioMeyer Crew MCP](https://crew.studiomeyer.io)
