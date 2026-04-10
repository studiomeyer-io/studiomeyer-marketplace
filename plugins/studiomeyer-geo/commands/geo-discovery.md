---
description: Full discovery stack check (llms.txt, agents.json, robots.txt, JSON-LD, sitemap, FAQ schema) — no API keys needed
argument-hint: <url>
---

Run a full discovery stack audit on **$ARGUMENTS**.

1. Call `geo_discovery_stack` with `url: "$ARGUMENTS"`. This covers:
   - llms.txt (presence + validity)
   - agents.json (presence + AI capability declaration)
   - robots.txt (AI bot allow/block matrix)
   - JSON-LD (Organization, WebSite, FAQPage schemas)
   - sitemap.xml (present, reachable, URL count)
   - FAQ schema (present, properly marked up)
2. Also call `geo_json_ld_audit` to validate recommended properties per schema type.
3. Present a checklist format:
   - ✅ llms.txt — present and valid
   - ❌ agents.json — missing
   - ⚠️ robots.txt — ClaudeBot blocked
   - ...
4. For each failed or warning item, provide the specific fix with exact copy-paste content where possible (`geo_schema_generator` can generate missing JSON-LD blocks).

This command is the fastest way to get AI-ready because it skips the expensive LLM pings and focuses on machine-verifiable signals.
