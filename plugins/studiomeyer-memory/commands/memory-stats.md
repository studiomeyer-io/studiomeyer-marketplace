---
description: Health overview of StudioMeyer Memory — counts, sprint state, action items
---

Give the user a quick health overview of their StudioMeyer Memory.

1. Call `nex_health` from the `studiomeyer-memory` MCP server for current counts and degradation status.
2. Call `nex_proactive` for stale learnings, open decisions, knowledge gaps and pattern clusters that need attention.
3. Optionally call `nex_sprint` for the current sprint state if it looks active.
4. Render a compact summary:
   - Counts: total learnings, decisions, entities, sessions
   - Health flags: any degradations, gatekeeper status
   - Top 3 proactive action items with the suggested next-step tool
   - Sprint state if relevant: active tasks, blockers
5. Stay factual. Do not invent items not returned by the server.
