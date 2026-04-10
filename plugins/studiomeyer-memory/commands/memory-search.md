---
description: Search StudioMeyer Memory across learnings, decisions, sessions, entities, and skills
argument-hint: <query>
---

Search the user's StudioMeyer Memory for: **$ARGUMENTS**

1. Call `nex_search` from the `studiomeyer-memory` MCP server with `query: "$ARGUMENTS"` and `limit: 10`. Let `expand: true` (the default) handle synonym and temporal expansion.
2. If the query looks fuzzy or aggregation-heavy (contains words like "all", "how many", "summarize", "total"), also set `agentic: true` so the server does iterative retrieval with a completeness check.
3. Present the top 5 results as a short list:
   - Type (learning / decision / entity / session / skill)
   - One-line summary
   - Date
   - Confidence or relevance score if notable
4. If none of the results feel relevant, tell the user directly and suggest rephrasing or broadening the query. Do not pad with weak matches.

Do not invent details not in the search result. Cite only what the server returned.
