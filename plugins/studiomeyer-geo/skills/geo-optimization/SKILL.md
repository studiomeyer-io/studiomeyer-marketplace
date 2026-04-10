---
name: geo-optimization
description: Use when the user wants to improve their AI visibility (GEO score) across ChatGPT, Gemini, Perplexity, Claude, Grok, DeepSeek, Meta AI, and Copilot. Covers the full optimization playbook, what each sub-score rewards, fix prioritization, and discovery stack requirements.
---

# GEO Optimization Playbook

The StudioMeyer GEO server measures AI visibility across 8 LLM platforms and gives you the specific fixes to raise it. This skill is the map.

## The GEO score (0-100)

Composed of six weighted sub-scores:

1. **Brand Awareness** — does the LLM even know the brand?
2. **Citation Strength** — when mentioned, is it cited with a link, or just name-dropped?
3. **Share of Voice** — how often is the brand mentioned versus competitors in the same category?
4. **Sentiment** — positive, neutral, or negative (negation-aware: "not bad" is positive)
5. **Discovery Stack** — llms.txt, agents.json, JSON-LD, robots.txt all correct?
6. **Content Quality** — citability signals (authority links, statistics, quotes, `sameAs`)

Thresholds: 80 = excellent, 70 = good, below 50 = needs work.

## Fix priority (cheapest to highest impact)

### Tier 1 — Discovery stack (free, ~1 day)
- **llms.txt** — machine-readable site description per llmstxt.org spec. Tells LLMs what your site is about and which URLs matter.
- **agents.json** — declare your site's AI capabilities (tools, endpoints, auth).
- **robots.txt** — check that GPTBot, ClaudeBot, PerplexityBot, Google-Extended are **not** blocked unless you have a reason. Especially watch for `/_next/` disallow patterns that accidentally block bundled assets.
- **JSON-LD** — Organization, WebSite, FAQPage schemas with recommended properties. Use `geo_schema_generator` to produce copy-paste-ready blocks.
- **Entity consistency** — pick one canonical brand name and use it everywhere. "StudioMeyer", "Studio Meyer", "StudioMeyer.io" are three entities to an LLM.

### Tier 2 — Content quality (days to weeks)
- **Authority links** — link out to reputable sources from every substantive page. LLMs treat well-sourced pages as more citable.
- **Statistics** — concrete numbers with sources ("2.8x higher citation rate" with a link to the study) raise citability dramatically. KDD 2024 paper showed +30-40% citations when pages add stats + quotes.
- **Quote blocks** — named quotes from real people with attribution.
- **`sameAs` links** — Wikidata, Crunchbase, LinkedIn, GitHub. These are identity anchors LLMs use to cross-reference.
- **Content freshness** — `dateModified`, Last-Modified header, og:modified_time. Stale content gets down-weighted.

### Tier 3 — Active presence (ongoing)
- Appear on high-authority sites (guest posts, podcast mentions, Wikipedia if applicable).
- Build citation-worthy content: original research, benchmarks, comparison tables.
- Monitor competitor share of voice and close gaps.

## Tool recipes

### Quick audit (no API keys, under 30 seconds)
```
geo_discovery_stack({ url })
geo_robots_audit({ url })
geo_llms_txt_validate({ url })
geo_json_ld_audit({ url })
geo_entity_consistency({ url, brand })
```

### Full audit (one LLM API key needed)
```
geo_check({ url, brand })
// includes discovery stack + LLM pings across 8 platforms
```

### Estimated score without any LLM calls (free-tier funnel)
```
geo_simulate({ url, brand, industry })
```

### Before a launch
```
/geo_before_launch <url> <brand>
// 8-point checklist with BLOCK/PASS gates
```

### Generate missing schema
```
geo_schema_generator({ url, schema: "Organization" })
geo_schema_generator({ url, schema: "WebSite" })
geo_schema_generator({ url, schema: "FAQPage" })
```

## Common mistakes

- **Blocking `/_next/` in robots.txt.** Next.js sites need these assets crawlable. Check the precedence — `Allow: /_next/static/` needs to come before any broader disallow.
- **Multiple JSON-LD blocks with conflicting data.** Pick one Organization block per page. Conflicting data confuses extractors.
- **Brand name fragmentation.** Every page says "StudioMeyer.io", "StudioMeyer", "Studio Meyer" — fragmented entity signal = 2.8x lower citation rate (Semrush data).
- **Chasing raw mentions without citations.** Mentions without citations are vanity metrics. Citation strength is what moves the GEO score.
- **Running `geo_check` daily without a plan.** Full checks cost LLM calls. Use `geo_simulate` for daily monitoring and `geo_check` for monthly benchmarks.

## Platforms and their biases

- **ChatGPT (GPT-4o)** — strong on mainstream brands, citation-heavy
- **Gemini** — strong on Google Knowledge Graph entities
- **Perplexity** — citation-first by design, rewards well-sourced content
- **Claude** — conservative, cites less often but mentions more accurately
- **Grok** — X/Twitter-weighted, rewards active X presence
- **DeepSeek** — varies, newer and less predictable
- **Meta AI** — rewards Facebook/Instagram presence
- **Microsoft Copilot** — rewards Bing-indexed content heavily, driven by Bing AI citations

If the user has uneven scores across platforms, the sub-score breakdown usually points to the issue.

## Pro features

- `geo_history` and `geo_trends` — track score changes over time
- `geo_schedule` — daily, weekly, or monthly automatic checks
- `geo_alerts` — get notified on score drops or new issues
- `geo_brands` — multi-brand tracking for agencies

These require Pro tier (EUR 49/mo) because they need database storage. Free tier gives you the audit tools — Pro gives you the history.
