---
description: Full-text search across companies, contacts, deals, notes, interactions, leads
argument-hint: <query>
---

Search StudioMeyer CRM for: **$ARGUMENTS**

1. Call `crm_search` from the `studiomeyer-crm` MCP server with `query: "$ARGUMENTS"`. The server runs a 3-phase cascade: Full-Text Search with German stemming, then trigram fuzzy with umlaut handling, then ILIKE prefix fallback. DACH queries work even with typos and partial words.
2. Present the result grouped by entity type:
   - Companies
   - Contacts
   - Deals
   - Notes
   - Interactions
   - Leads
3. For each hit: one-line summary with the matched field highlighted.
4. If the top hit is a strong match, offer a follow-up action ("open timeline?", "show deal?").

Match the user's language.
