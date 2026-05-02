---
description: Vertical chronological timeline of recent learnings, decisions and sessions from StudioMeyer Memory
argument-hint: [days]
---

Render a vertical chronological timeline of the user's recent memory activity.

1. Parse `$ARGUMENTS` as an integer day count. If empty or non-numeric, default to 14.
2. Call `nex_recall_timeline` from the `studiomeyer-memory` MCP server with `days: <parsed>` and `limit: 200`.
3. The host renders the interactive timeline inline (in MCP Apps capable hosts) OR returns the structured JSON with learnings, decisions and sessions ordered by date. Both behaviors are correct.
4. Summarize the result in two lines: total items, breakdown by type (learn / decide / session), date range covered.
5. Do not invent items. If the response is empty, say so directly and suggest the user widens the day window.
