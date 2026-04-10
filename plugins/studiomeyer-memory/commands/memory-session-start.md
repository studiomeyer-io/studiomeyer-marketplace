---
description: Load the previous session context and proactive suggestions from StudioMeyer Memory
argument-hint: "[project]"
---

The user wants to start a new session with memory context.

1. Call `nex_session_start` from the `studiomeyer-memory` MCP server. If the user provided a project argument (`$ARGUMENTS`), pass it as `project`. Otherwise call without arguments.
2. Call `nex_proactive` with the same `project` argument to get stale learnings, open decisions, and knowledge gaps.
3. Summarize the result for the user in 4-6 lines:
   - Session number and last session's headline
   - Active sprint tasks (top 3)
   - Any blocked items
   - Proactive suggestions ranked by priority
4. End with: "Was steht an?" (German) or "What's up?" (English), matching the user's language.

Do not dump the raw JSON. Extract the important facts.
