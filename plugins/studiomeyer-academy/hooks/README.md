# StudioMeyer Academy — Hook Recipes

Two `mcp_tool` hooks that surface Academy state automatically: SessionStart loads stats + next lesson; PostToolUse auto-fetches the quiz when you complete a lesson.

> **Requires Claude Code v2.1.118 or later** (released 2026-04-23).

## What gets installed

| Event | Matcher | Tool | Why |
|---|---|---|---|
| `SessionStart` | (always) | `academy_stats` + `academy_next_lesson` | Every session starts with XP, rank, league, recommended next lesson — without typing a command |
| `PostToolUse` | `mcp__studiomeyer-academy__academy_progress_complete` | `academy_quiz` (lesson_slug from tool_input) | When you finish a lesson, the quiz is fetched automatically |

The cascade pattern (lesson-complete → quiz-fetch) is opt-in. Remove the `PostToolUse` entry if you'd rather decide manually when to do the quiz.

## Compliance

All three tools are read-only:

- **Idempotent.** All pure reads — same time, same stats; same lesson, same quiz.
- **Fast.** Each <500ms.
- **Deterministic.** Same input, same output.
- **Side-effect-free.** Read-only.
- **GDPR.** Data flows to your own Academy tenant on `studiomeyer.academy`. No leaderboards unless you opt-in.

## Install

### Option A — Helper script (recommended)

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-academy/hooks/install.sh)
```

### Option B — Manual copy-paste

Open `~/.claude/settings.json` and merge the `hooks` key from [`recipe.json`](./recipe.json) into the existing top-level `hooks` object.

### Option C — Slash command

```bash
/plugin install studiomeyer-academy@studiomeyer
/academy-install-hooks
```

## Verify it works

```bash
claude
```

You should see two status messages flash on session start: "Academy: loading stats..." and "Academy: finding next lesson...". The assistant's first response should reference your current XP and the recommended next lesson without you asking.

To test the cascade:

```bash
# In claude:
# Complete a lesson via your usual flow (academy_lesson + academy_progress_complete)
```

Status: "Academy: loading quiz..." should flash. The assistant inlines the quiz, you answer, `academy_quiz_submit` closes the loop.

## Optional — UserPromptSubmit recipe-trigger (bash hook)

The Academy recipe 16.5 also describes a `UserPromptSubmit` bash hook that nudges the assistant toward `academy_concept_search` + `academy_list_recipes` when the user asks "how do I X" / "wie mache ich X". It's a `command` hook (bash) because extracting topic from prompt needs regex. See the [recipe](https://studiomeyer.academy/recipes/16.5-academy-hook-bundle) for the bash variant.

## Uninstall

```bash
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-academy/hooks/install.sh) --uninstall
```

## Source

- [Recipe 16.1 — mcp_tool hook intro](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro)
- [Recipe 16.5 — Academy hook bundle](https://studiomeyer.academy/recipes/16.5-academy-hook-bundle)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [mcp-academy on npm](https://www.npmjs.com/package/mcp-academy)
