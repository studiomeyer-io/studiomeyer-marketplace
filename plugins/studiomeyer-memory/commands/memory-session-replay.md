---
description: Step-by-step replay of one StudioMeyer Memory session (default: most recent)
argument-hint: [session-id]
---

Replay one StudioMeyer Memory session step-by-step (start, observations, learnings, decisions, end).

1. Call `nex_session_replay` from the `studiomeyer-memory` MCP server.
   - If `$ARGUMENTS` looks like a UUID or short session-id, pass it as `sessionId`.
   - If empty, call without args — the server picks the most recent session.
2. The host renders the interactive horizontal step-walker inline (in MCP Apps capable hosts) OR returns the structured JSON with session metadata, observations, learnings and decisions. Both behaviors are correct.
3. Summarize what the session was about in two lines: project, duration, event count, key themes from the observations.
4. Do not invent any step. If the session has no observations, just report start and end.
