---
description: Output the StudioMeyer Academy hook recipe — SessionStart auto-loads stats + next lesson; PostToolUse auto-fetches quiz after lesson complete.
allowed-tools: Bash(cat:*), Read
argument-hint: ""
---

The StudioMeyer Academy plugin ships two mcp_tool hook recipes: SessionStart (academy_stats + academy_next_lesson) and PostToolUse (academy_quiz cascade after academy_progress_complete). The user has invoked this command to install them.

Run this Bash command to output the recipe JSON:

```bash
cat ${CLAUDE_PLUGIN_ROOT}/hooks/recipe.json
```

After you have the recipe contents, walk the user through three install paths:

1. **Helper script (recommended):** `bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-academy/hooks/install.sh)` — idempotent jq-merge with backup.

2. **Manual copy-paste:** Show them the `hooks` key from the recipe and instruct them to merge it into `~/.claude/settings.json`.

3. **Verify:** `claude` then watch for "Academy: loading stats..." and "Academy: finding next lesson..." in the statusline. The assistant's first response should reference current XP and recommended next lesson.

**The two hooks:**

| Event | Matcher | Tool | Why |
|---|---|---|---|
| SessionStart | (always) | `academy_stats` + `academy_next_lesson` | Every session knows your XP + rank + next lesson without `/academy-stats` |
| PostToolUse | `mcp__studiomeyer-academy__academy_progress_complete` | `academy_quiz` (lesson_slug from tool_input) | After completing a lesson, the quiz is fetched automatically — closes the loop without "and now check the quiz" prompt |

**The cascade is opt-in.** If the user prefers to decide manually when to take the quiz, suggest removing the `PostToolUse` entry from the merged settings.

**Optional — UserPromptSubmit recipe-trigger:** Recipe 16.5 also has a bash hook that nudges toward `academy_concept_search` + `academy_list_recipes` on "how do I X" prompts. Bash because topic-extraction needs regex. Not shipped here as `mcp_tool` — see the recipe for the bash variant.

**Compatibility:** Requires Claude Code v2.1.118 or later. Server-name is `studiomeyer-academy` (registered by the plugin's `.mcp.json`). The npm package `mcp-academy` is auto-installed on first call via `npx`.

**GDPR:** Academy data flows to user's own tenant on `studiomeyer.academy`. No leaderboards unless opt-in.

Source: [Recipe 16.5 on the Academy](https://studiomeyer.academy/recipes/16.5-academy-hook-bundle).
