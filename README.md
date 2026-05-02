<!-- studiomeyer-mcp-stack-banner:start -->
> **Part of the [StudioMeyer MCP Stack](https://studiomeyer.io)** — Built in Mallorca 🌴 · ⭐ if you use it
<!-- studiomeyer-mcp-stack-banner:end -->

# StudioMeyer Marketplace for Claude Code

Five MCP plugins for Claude Code — Memory, CRM, GEO, Crew, Academy. One command installs the full suite. Each plugin ships hook recipes for Claude Code v2.1.118+ `mcp_tool` lifecycle automation. Magic Link authentication. EU Frankfurt hosting.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer
/plugin install studiomeyer-crm@studiomeyer
/plugin install studiomeyer-geo@studiomeyer
/plugin install studiomeyer-crew@studiomeyer
/plugin install studiomeyer-academy@studiomeyer
```

Or install just what you need — each plugin works standalone.

## Plugins

| Plugin | Tools | What it does | Hooks | Pricing |
|---|---|---|---|---|
| [studiomeyer-memory](./plugins/studiomeyer-memory) | 53 | Persistent AI memory with knowledge graph, semantic search, multi-agent namespaces, contradiction detection, import from ChatGPT/Claude/Gemini | 4 (auto-persist sessions, snapshot before compact, recall on prompt, ingest subagent reports) | Free / $29 / $49 |
| [studiomeyer-crm](./plugins/studiomeyer-crm) | 33 | Headless CRM — contacts, companies, deals, pipeline, follow-ups, Stripe sync, health scores | 2 (auto-lookup customers, auto-log email drafts) | Free / $29 / $49 |
| [studiomeyer-geo](./plugins/studiomeyer-geo) | 23 | Generative Engine Optimization across 8 LLM platforms — discovery stack audits, schema generator, citation analysis | 1 (auto-audit AI visibility after Markdown edits) | Free / EUR 49 / EUR 99 |
| [studiomeyer-crew](./plugins/studiomeyer-crew) | 10 | 8 expert personas (CEO, CFO, CMO, CTO, PM, Analyst, Creative, Support) + 3 multi-persona workflows | 1 (auto-feedback) + optional cwd-aware persona suggestion | Free |
| [studiomeyer-academy](./plugins/studiomeyer-academy) | 23 | Memory-First AI Operator School — lessons, quiz, recipes, knowledge graph, certificates, AI tutor. Open Source npm: mcp-academy | 2 (auto-load stats + next lesson on session start, auto-quiz after lesson) | Free / EUR 19 / EUR 49 |

All hosted plugins use the same StudioMeyer account — one Magic Link authenticates you across the suite. Academy is open-source (npm).

## Hook Recipes (v1.1.0+)

Every plugin ships a `hooks/` directory with a `recipe.json` (the exact JSON snippet for `~/.claude/settings.json`), a `README.md` (install/verify/uninstall guide), an `install.sh` (idempotent jq-merge with backup), and a slash command (`/{name}-install-hooks`) that outputs the recipe inline.

Plugin-installer policy in Claude Code does NOT permit auto-injection of hooks (security policy). Users install hooks manually via:

```bash
# Recommended: helper script with idempotent jq-merge + backup
bash <(curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-memory/hooks/install.sh)

# Or via slash command after the plugin is installed:
/memory-install-hooks
```

All hook tools satisfy the [five-rule check](https://studiomeyer.academy/recipes/16.1-mcp-tool-hook-intro): idempotent, fast (<60s), deterministic, side-effect-free without user trigger, GDPR-aware. The [validate-hooks.mjs](./tests/validate-hooks.mjs) script enforces the schema.

## How it works

Each plugin is a thin installer. The actual servers are hosted MCP endpoints on our infrastructure:

- `https://memory.studiomeyer.io/mcp`
- `https://crm.studiomeyer.io/mcp`
- `https://geo.studiomeyer.io/mcp`
- `https://crew.studiomeyer.io/mcp`

Academy is the exception — open-source npm package `mcp-academy` (stdio transport via `npx`).

When you run a tool for the first time, Claude Code walks you through OAuth 2.1 + Magic Link:

1. Enter your email.
2. Check your inbox for a link from `hello@studiomeyer.io`.
3. Click the link.
4. Claude Code is connected. Tools work immediately.

No passwords. No credit card for the free tier. Tokens rotate automatically.

## What you get

- **Slash commands** — `/memory-search`, `/crm-dashboard`, `/geo-check`, `/crew-activate` and more.
- **Skills** — domain playbooks (Memory workflow, import guide, CRM workflow, GEO optimization, persona usage) that Claude draws on automatically.
- **Subagents** — specialized helpers (Memory Curator, Lead Qualifier, GEO Auditor) invoked for deeper tasks.
- **MCP tools** — the full tool set of each hosted server (53 + 33 + 23 + 10 = 119 tools).

See [docs/pricing.md](./docs/pricing.md) for tier details and [docs/magic-link-setup.md](./docs/magic-link-setup.md) for the auth flow.

## Why not just add the MCP URLs directly?

You can. Plugins add three things on top:

1. **Slash commands** that pre-frame Claude for common tasks — no need to remember tool names.
2. **Skills** that Claude loads automatically for relevant work — CRM-flow, memory-curation, GEO-audit.
3. **Subagents** for multi-step jobs that would otherwise pollute your main context.

The bare MCP URL gives you the tools. The plugin gives you the workflow around them.

## Infrastructure

- **Hosting:** Supabase EU Frankfurt (Germany), SOC 2 Type II, GDPR-ready
- **Auth:** OAuth 2.1 + PKCE S256 + Magic Link email verification (Brevo SMTP)
- **Rate limits:** Per tier, per OAuth token
- **Uptime:** Monitored via Telegram + auto-heal on Prod
- **Security:** Zero-Knowledge credential storage (CRM), per-tenant isolation (all plugins), 1.800+ automated tests across the suite

## Support

- **Docs:** https://studiomeyer.io
- **Email:** hello@studiomeyer.io
- **Issues:** https://github.com/studiomeyer-io/studiomeyer-marketplace/issues

## About StudioMeyer

[StudioMeyer](https://studiomeyer.io) is an AI and design studio from Palma de Mallorca, building custom websites and AI infrastructure for small and medium businesses. Production stack on Claude Agent SDK, MCP and n8n, with Sentry, Langfuse and LangGraph for observability and an in-house guard layer.

## License

MIT. See [LICENSE](./LICENSE).

Plugin code is MIT. The MCP server implementations behind each endpoint are proprietary StudioMeyer software. You are free to fork, modify, and redistribute the plugin manifests, commands, skills, and subagents in this repository.