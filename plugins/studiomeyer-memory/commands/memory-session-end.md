---
description: Summarize and close the current StudioMeyer Memory session
---

The user wants to end the current session cleanly.

1. Call `nex_summarize` from the `studiomeyer-memory` MCP server to generate a session summary covering what was done, what was decided, and what remains open.
2. If the session was longer than 3 hours or covered significant new ground, also call `nex_reflect` with `days: 1` to extract meta-insights.
3. Call `nex_session_end` to close the session.
4. Show the user a 3-5 line recap:
   - What the session accomplished
   - Any open items carried forward
   - Learnings or decisions that were saved

Match the user's language (German or English).
