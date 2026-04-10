---
description: List all available Crew personas with categories
argument-hint: "[category]"
---

Show the user the available personas.

1. Call `crew_list` from the `studiomeyer-crew` MCP server. If `$ARGUMENTS` is provided, pass it as a category filter (e.g. `business`, `tech`, `creative`, `ops`).
2. Present as a short table grouped by category:
   - Name
   - Display name
   - One-line focus description
3. At the bottom show the count and a one-liner: "Activate with `/crew-activate <name>`."

Match the user's language.
