---
description: Run a full GEO audit on a URL across 8 LLM platforms
argument-hint: <url> [brand]
---

Run a GEO audit for **$ARGUMENTS**.

1. Parse the argument. First token is the URL, optional second is the brand name. If brand is missing, extract it from the domain.
2. Tell the user this is a full check and will take ~30-60 seconds.
3. Call `geo_check` from the `studiomeyer-geo` MCP server with:
   - `url`: the URL
   - `brand`: the brand name
4. While waiting, also trigger `geo_discovery_stack` in parallel if possible — it works without API keys and gives instant value.
5. When results come back, present:
   - **Overall GEO score** — 0-100 with one-line interpretation
   - **Sub-scores** — Brand awareness, Citation strength, Share of voice, Sentiment, Discovery stack, Content quality
   - **Top 3 quick wins** — the highest-impact fixes from `geo_recommendations`
   - **Platform breakdown** — which of the 8 LLMs mentioned the brand, which did not
6. End with a one-line suggestion: should the user run `/geo-discovery` or `/geo-citations` next?

Do not invent scores. Only report what the server returned.
