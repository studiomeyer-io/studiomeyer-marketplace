---
description: Analyze citability signals for a brand (authority links, stats, sameAs, quotes)
argument-hint: <url>
---

Run a citability analysis on **$ARGUMENTS**.

1. Call `geo_citation_sources` with `url: "$ARGUMENTS"`. This returns a citability score 0-100 with a breakdown of:
   - Authority links (outbound to reputable sources)
   - Statistics and concrete numbers
   - `sameAs` JSON-LD linking to Wikidata, Crunchbase, LinkedIn
   - Quote blocks from named sources
   - Research links
2. Also call `geo_content_audit` with the same URL for the 10-dimension audit based on the KDD 2024 GEO paper (+30-40% citations when done right).
3. Present:
   - **Citability score** — 0-100
   - **What is working** — sub-scores above 70
   - **What is missing** — sub-scores below 50, with the specific fix
   - **Top improvement** — the single change that would raise the score most
4. If the score is below 40, tell the user this page needs substantial work before it gets cited by any AI. If above 70, tell them they are in the top tier.

Be honest about the numbers. Do not soften weak scores.
