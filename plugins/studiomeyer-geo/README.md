# studiomeyer-geo

Generative Engine Optimization (GEO) for Claude Code. Measure and improve how often and how well a brand gets mentioned in ChatGPT, Gemini, Perplexity, Claude, Grok, DeepSeek, Meta AI, and Microsoft Copilot.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-geo@studiomeyer
```

First tool call triggers OAuth 2.1 + Magic Link.

## What you get

### MCP server
30 tools from `https://geo.studiomeyer.io/mcp`. **Most of them work without any LLM API key.** You can audit robots.txt, llms.txt, JSON-LD, entity consistency, content freshness, and generate schema blocks for free.

**Base tools (7)**
- `geo_check`: full GEO pipeline across 8 LLM platforms (requires at least one LLM API key)
- `geo_discovery_stack`: audit llms.txt, agents.json, robots.txt, JSON-LD, sitemap, FAQ schema
- `geo_calculate_score`, `geo_platforms`, `geo_preview_prompts`, `geo_analyze_response`, `geo_recommendations`

**Specialist tools (5)**
- `geo_robots_audit`: 14-bot allow/block matrix with `/_next/` precedence detection
- `geo_llms_txt_validate`: llmstxt.org parser + link checking
- `geo_json_ld_audit`: JSON-LD extraction with recommended properties per schema type
- `geo_entity_consistency`: brand variant scanner (page + mention level)
- `geo_content_freshness`: Last-Modified, og:modified_time, dateModified with 14 i18n default paths

**Advanced tools (4)**
- `geo_simulate`: estimate GEO score without any LLM calls (heuristic sub-scores)
- `geo_schema_generator`: generate missing JSON-LD blocks (Organization, WebSite, FAQPage)
- `geo_citation_sources`: citability score (authority links, stats, sameAs, quotes)
- `geo_content_audit`: 10-dimension single-page audit based on the KDD 2024 GEO paper

**Agency tools (3)**
- `geo_brands`: list/add/remove tracked brands
- `geo_compare`: side-by-side comparison of two brands
- `geo_bulk_check`: run all tracked brands at once

**Account tools (4)**, free like the rest, they just need a signed-in account because they store data
- `geo_history`, `geo_trends`, `geo_schedule`, `geo_alerts`

### Slash commands
- `/geo-check <url>`: full GEO audit of a URL
- `/geo-robots <url>`: robots.txt + llms.txt audit without API keys
- `/geo-citations <brand> <industry>`: citability analysis for a brand
- `/geo-discovery <url>`: full discovery stack check

### Hooks

None, on purpose.

`geo_check` sends your URL to eight LLM providers. In search mode that is real money per
run, and even in the free training mode it is slow. A hook fires without you asking, so a
tool that spends money does not belong in one. Run `/geo-check` when you want an audit.

An earlier version of this plugin did ship a `Stop` hook for it. It never once fired:
Claude Code can only evaluate an `if` filter on tool events, and an `if` on `Stop` drops
the hook entirely. Nobody noticed, because the validator checked the file's shape rather
than whether the hook could run.

### Skill
- **geo-optimization:** the GEO playbook: what to fix first, how the score is calculated, what each sub-score rewards

## Pricing

GEO is currently **free**: all 30 tools, no card. The Magic Link sign-in is the only thing you need, and only for the four tools that store data (`geo_history`, `geo_trends`, `geo_schedule`, `geo_alerts`). That is an account requirement, not a payment.

Paid tiers (history at scale, scheduled checks, multi-brand dashboards) are built and announced but not on sale, so no prices are quoted here and we promise no date. Managed monitoring and a full GEO service exist as a project, quoted individually after a free intro call.

## Why GEO matters

AI assistants increasingly replace search for brand discovery. If ChatGPT does not mention your brand when a user asks "best CRM for freelancers", you lose the lead. GEO measures that gap and gives you the specific fixes to close it: llms.txt, JSON-LD schema, entity consistency, discovery stack readiness.

Most GEO tools start at $99/mo. We start at free. Most of our 30 tools work without any LLM API key because the real gold is in the discovery stack audit, not the LLM ping.

## Support

- Docs: https://studiomeyer.io/en/services/geo-mcp/
- MCP Endpoint: https://geo.studiomeyer.io/mcp
- Email: hello@studiomeyer.io
