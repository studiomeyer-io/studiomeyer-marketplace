---
description: Show the currently active Crew persona and session duration
---

Show the user which persona is currently active.

1. Call `crew_status` from the `studiomeyer-crew` MCP server.
2. Show:
   - **Active persona** (or "None" if default)
   - **Activated at** (timestamp)
   - **Duration** (time since activation)
   - **Focus areas**
   - **Estimated token usage** (if the server provides it)
3. If no persona is active, suggest `/crew-list` to see available options.

Match the user's language.
