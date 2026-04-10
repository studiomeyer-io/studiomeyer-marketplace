---
description: Show the deal pipeline with stage breakdown, forecast, and MRR/ARR
---

Show the user the current pipeline.

1. Call `crm_get_pipeline` from the `studiomeyer-crm` MCP server.
2. Present as a short table:
   - Stage name
   - Count
   - Total value
   - Weighted value (by stage probability)
3. Below the table, show:
   - **Forecast** — weighted pipeline total
   - **MRR** — current monthly recurring revenue
   - **ARR** — current annual recurring revenue
4. If any stage has a high count but low movement over time, flag it ("lots sitting in proposal — bottleneck?").

Match the user's language. Do not invent stages that are not in the response.
