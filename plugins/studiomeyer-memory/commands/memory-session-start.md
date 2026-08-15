---
description: Load the previous session context and proactive suggestions from StudioMeyer Memory
argument-hint: "[project]"
---

The user wants to start a new session with memory context.

1. Call `nex_session_start` from the `studiomeyer-memory` MCP server. Pass a `project`: the argument the user gave (`$ARGUMENTS`), otherwise the slug of the repo you are working in. The project decides which knowledge ranks first in the briefing and where knowledge saved in this session gets filed, so name the one you are actually working in. Only call without a project when there genuinely is none: that keeps saves untagged, which is neutral, while a wrong name files them in the wrong place.
2. Call `nex_proactive` with the same `project` argument. It reports stale learnings, open decisions, knowledge gaps, pattern clusters, skill fail-rates, unfinished tasks, stale observations, and entries saved without a project.
3. Summarize the result for the user in 4-6 lines:
   - Session number and last session's headline
   - Active sprint tasks (top 3)
   - Any blocked items
   - Proactive suggestions ranked by priority
4. End with: "Was steht an?" (German) or "What's up?" (English), matching the user's language.

Do not dump the raw JSON. Extract the important facts.
