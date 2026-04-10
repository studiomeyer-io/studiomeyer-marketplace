---
description: Audit robots.txt + llms.txt for AI crawler access (no API keys needed)
argument-hint: <url>
---

Run a discovery stack audit on **$ARGUMENTS** without using any LLM API keys.

1. Call `geo_robots_audit` with `url: "$ARGUMENTS"`. This gives the full 14-bot allow/block matrix including ChatGPT, GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.
2. Call `geo_llms_txt_validate` with `url: "$ARGUMENTS"`. This checks whether the site has a valid llms.txt, parses it per llmstxt.org spec, and link-checks the referenced URLs.
3. Present results in three sections:
   - **Critical issues** — AI bots being blocked unintentionally
   - **llms.txt status** — present, valid, links-ok
   - **Warnings** — `/_next/` disallow overriding Allow rules, missing crawler budgets, etc.
4. If there are critical issues, list the exact fix for each.

This command costs nothing on the server side and runs in under 10 seconds. Use it as the default first step before any full GEO check.
