---
description: Deactivate the current Crew persona and return to default Claude behavior
---

Deactivate the current Crew persona.

1. Call `crew_deactivate` from the `studiomeyer-crew` MCP server.
2. Confirm with one line: "Persona deactivated. Back to default."
3. If the user just finished a significant piece of work with the persona, suggest `crew_feedback` with a rating 1-5 — this improves persona evolution.

Match the user's language.
