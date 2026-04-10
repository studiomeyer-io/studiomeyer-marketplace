# StudioMeyer Marketplace for Claude Code

Hosted MCP plugins for Claude Code — Memory, CRM, GEO, and Agent Personas.
One command installs the full suite. Magic Link authentication. EU Frankfurt hosting.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer
/plugin install studiomeyer-crm@studiomeyer
/plugin install studiomeyer-geo@studiomeyer
/plugin install studiomeyer-crew@studiomeyer
```

Or install just what you need — each plugin works standalone.

## Plugins

| Plugin | Tools | What it does | Pricing |
|---|---|---|---|
| [studiomeyer-memory](./plugins/studiomeyer-memory) | 53 | Persistent AI memory with knowledge graph, semantic search, multi-agent namespaces, contradiction detection, import from ChatGPT/Claude/Gemini | Free / $29 / $49 |
| [studiomeyer-crm](./plugins/studiomeyer-crm) | 33 | Headless CRM — contacts, companies, deals, pipeline, follow-ups, Stripe sync, health scores | Free / $29 / $49 |
| [studiomeyer-geo](./plugins/studiomeyer-geo) | 23 | Generative Engine Optimization across 8 LLM platforms — discovery stack audits, schema generator, citation analysis | Free / EUR 49 / EUR 99 |
| [studiomeyer-crew](./plugins/studiomeyer-crew) | 10 | 8 expert personas (CEO, CFO, CMO, CTO, PM, Analyst, Creative, Support) + 3 multi-persona workflows | Free |

All plugins use the same StudioMeyer account — one Magic Link authenticates you across the suite.

## How it works

Each plugin is a thin installer. The actual servers are hosted MCP endpoints on our infrastructure:

- `https://memory.studiomeyer.io/mcp`
- `https://crm.studiomeyer.io/mcp`
- `https://geo.studiomeyer.io/mcp`
- `https://crew.studiomeyer.io/mcp`

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

## License

MIT. See [LICENSE](./LICENSE).

Plugin code is MIT. The MCP server implementations behind each endpoint are proprietary StudioMeyer software. You are free to fork, modify, and redistribute the plugin manifests, commands, skills, and subagents in this repository.
