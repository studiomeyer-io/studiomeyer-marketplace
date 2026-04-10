---
description: Show current sprint state from StudioMeyer Memory
---

Show the user the current sprint state.

1. Call `nex_sprint` from the `studiomeyer-memory` MCP server.
2. Present the result as three short sections:
   - **Active tasks** — numbered list
   - **Blocked** — items flagged as blocked with the blocker if available
   - **Open decisions** — decisions that were made but never reviewed or followed up
3. If everything is empty, say so honestly. Do not invent tasks.
4. End with a one-line suggestion for what to tackle first, based on priority and effort.

Match the user's language.
