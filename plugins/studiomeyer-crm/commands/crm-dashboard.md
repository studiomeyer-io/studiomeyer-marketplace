---
description: Show the StudioMeyer CRM dashboard — pipeline, MRR, health, follow-ups, alerts
---

Show the user their CRM dashboard.

1. Call `crm_dashboard` from the `studiomeyer-crm` MCP server. This returns pipeline stages, MRR/ARR, health scores, recent activity, and alerts in one call.
2. Present the result in four sections:
   - **Pipeline** — count and value per stage
   - **Revenue** — current MRR, ARR, month-over-month delta
   - **Health** — accounts at risk (score < 50) with the dominant risk factor
   - **Alerts** — overdue follow-ups, stale deals, stage regressions
3. End with a one-line recommendation: which single action would have the biggest impact today.

Match the user's language. Do not invent numbers — use only what the server returned.
