<!-- studiomeyer-mcp-stack-banner:start -->
> **Part of the [StudioMeyer MCP Stack](https://studiomeyer.io)**. Built in Mallorca 🌴 · ⭐ if you use it
<!-- studiomeyer-mcp-stack-banner:end -->

# StudioMeyer Marketplace for Claude Code


<!-- badges -->
[![validate](https://img.shields.io/github/actions/workflow/status/studiomeyer-io/studiomeyer-marketplace/validate.yml?branch=main&style=flat-square&label=validate)](https://github.com/studiomeyer-io/studiomeyer-marketplace/actions/workflows/validate.yml)
![License](https://img.shields.io/github/license/studiomeyer-io/studiomeyer-marketplace?style=flat-square&color=22c55e&label=license)
![Last commit](https://img.shields.io/github/last-commit/studiomeyer-io/studiomeyer-marketplace?style=flat-square&color=88c0d0&label=updated)
![GitHub stars](https://img.shields.io/github/stars/studiomeyer-io/studiomeyer-marketplace?style=flat-square&color=ffd700&logo=github&label=stars)
<!-- /badges -->Five MCP plugins for Claude Code: Memory, CRM, GEO, Crew, Academy. One command installs the full suite. The hooks ship inside the plugins and work the moment you enable one, with nothing to paste into your settings. Magic Link authentication. EU Frankfurt hosting.

## A note from us

We have been building tools and systems for ourselves for the past two years. The fact that this repo is small and has few stars is not because it is new. It is because we only just decided to share what we have built. It is not a fresh experiment, it is a long story with a recent commit.

We love building things and sharing them. We do not love social media tactics, growth hacks, or chasing stars and followers. So this repo is small. The code is real, it gets used, issues get answered. Judge for yourself.

If it helps you, sharing, testing, and feedback help us. If it could be better, an issue is more useful. If you build something with it, tell us at hello@studiomeyer.io. That genuinely makes our day.

From a small studio in Palma de Mallorca.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer
/plugin install studiomeyer-crm@studiomeyer
/plugin install studiomeyer-geo@studiomeyer
/plugin install studiomeyer-crew@studiomeyer
/plugin install studiomeyer-academy@studiomeyer
```

Or install just what you need. Each plugin works standalone.

## Plugins

| Plugin | Tools | What it does | Hooks | Pricing |
|---|---|---|---|---|
| [studiomeyer-memory](./plugins/studiomeyer-memory) | 56 | Persistent AI memory with knowledge graph, semantic search, multi-agent namespaces, contradiction detection, import from ChatGPT, Claude and Gemini | 2: recall on every prompt, close the session at the end | Free / 9 EUR / 19 EUR |
| [studiomeyer-crm](./plugins/studiomeyer-crm) | 37 | Headless CRM: contacts, companies, deals, pipeline, follow-ups, Stripe sync, health scores | 1: look up the customer behind every prompt | Free / 9 EUR / 19 EUR |
| [studiomeyer-geo](./plugins/studiomeyer-geo) | 30 | Generative Engine Optimization across 8 LLM platforms: discovery stack audits, schema generator, citation analysis | none, on purpose: an audit costs money, so it stays a command | Free |
| [studiomeyer-crew](./plugins/studiomeyer-crew) | 13 personas | 8 standard roles (CEO, CFO, CMO, CTO, PM, Analyst, Creative, Support) plus 5 specialists and 3 multi-persona workflows | 1: suggests a persona from your working directory, local only | Free |
| [studiomeyer-academy](./plugins/studiomeyer-academy) | 12, or 21 with a key | Memory-First AI Operator School: lessons, quizzes, recipes, knowledge graph, certificates, AI tutor. Open source npm: mcp-academy | 1: finishing a lesson pulls its quiz | Free |

All hosted plugins use the same StudioMeyer account: one Magic Link authenticates you across the suite. Academy is open source, on npm.

## Hooks

Every hook lives in the plugin that owns it, in `hooks/hooks.json`. Claude Code merges
them with your own hooks while the plugin is enabled, and drops them again when you
disable it. There is no install script, no `jq` merge into your settings, no
`curl | bash`.

Two of them send every prompt you type to a server: Memory's recall and CRM's customer
lookup. Both go to your own tenant, and both are the reason those plugins exist, but you
should know before you enable them. Each plugin README says exactly what fires, when, and
what it costs. Nothing here spends money without you asking.

### What changed in 1.2.0, and why it matters

Until this release the five plugins shipped `hooks/recipe.json` files with instructions to
merge them into `~/.claude/settings.json`. **All twelve hook entries in those recipes were
dead**, and three green validators said otherwise. Measured against Claude Code 2.1.226:

| Bug | Effect |
|---|---|
| `server` held the bare key, e.g. `studiomeyer-memory` | A plugin-bundled server registers as `plugin:<plugin>:<server>`, so the lookup never resolved |
| `${user_prompt}` | Not a field. `UserPromptSubmit` delivers `prompt`, so the query substituted to an empty string |
| `if` on a `Stop` hook | Claude Code can only evaluate `if` on tool events. Anywhere else it drops the hook |
| `if` holding four alternatives | A permission rule is exactly one rule. The rest were ignored |
| A matcher using `mcp__<server>__` | A plugin's own tools carry `mcp__plugin_<plugin>_<server>__` |
| `session_id`, `lesson_slug` as tool arguments | The servers want `sessionId` and `slug`, and required arguments were missing entirely |

Every one of those is now a rule in [`tests/validate-hooks.mjs`](./tests/validate-hooks.mjs),
and [`tests/selftest-hooks.mjs`](./tests/selftest-hooks.mjs) plants each bug back in and
fails if the validator stays green. A validator nobody has seen fail is worth nothing.

Full detail, including how to verify a hook actually fired: [docs/hooks.md](./docs/hooks.md).

## How it works

Each plugin is a thin installer. The actual servers are hosted MCP endpoints on our infrastructure:

- `https://memory.studiomeyer.io/mcp`
- `https://crm.studiomeyer.io/mcp`
- `https://geo.studiomeyer.io/mcp`
- `https://crew.studiomeyer.io/mcp`

Academy is the exception. It is the open source npm package `mcp-academy`, spawned over stdio through `npx`.

When you run a tool for the first time, Claude Code walks you through OAuth 2.1 + Magic Link:

1. Enter your email.
2. Check your inbox for a link from `hello@studiomeyer.io`.
3. Click the link.
4. Claude Code is connected. Tools work immediately.

No passwords. No credit card for the free tier. Tokens rotate automatically.

## What you get

- **Slash commands:** `/memory-search`, `/crm-dashboard`, `/geo-check`, `/crew-activate`, `/academy-lesson` and more.
- **Skills:** domain playbooks (Memory workflow, import guide, CRM workflow, GEO optimization, persona usage) that Claude draws on automatically.
- **Subagents:** specialized helpers (Memory Curator, Lead Qualifier, GEO Auditor) invoked for deeper tasks.
- **MCP tools:** the full tool set of each hosted server. Memory 56, CRM 37, GEO 30, plus Crew and Academy. Crew's count moves between releases and is not pinned. Academy serves 12 tools openly and 21 once you add a key.

See [docs/pricing.md](./docs/pricing.md) for tier details and [docs/magic-link-setup.md](./docs/magic-link-setup.md) for the auth flow.

## Why not just add the MCP URLs directly?

You can. Plugins add three things on top:

1. **Slash commands** that pre-frame Claude for common tasks, so you do not have to remember tool names.
2. **Skills** that Claude loads automatically for relevant work: CRM flow, memory curation, GEO audit.
3. **Subagents** for multi-step jobs that would otherwise pollute your main context.

The bare MCP URL gives you the tools. The plugin gives you the workflow around them.

## Infrastructure

- **Hosting:** Supabase EU Frankfurt (Germany), SOC 2 Type II, GDPR-ready
- **Auth:** OAuth 2.1 + PKCE S256 + Magic Link email verification (Resend SMTP)
- **Rate limits:** Per tier, per OAuth token
- **Uptime:** Monitored via Telegram + auto-heal on Prod
- **Security:** Zero-Knowledge credential storage (CRM), per-tenant isolation (all plugins), 1.800+ automated tests across the suite

## Support

- **Docs:** https://studiomeyer.io
- **Email:** hello@studiomeyer.io
- **Issues:** https://github.com/studiomeyer-io/studiomeyer-marketplace/issues

## About StudioMeyer

[StudioMeyer](https://studiomeyer.io) is an AI and design studio based in Palma de Mallorca, working with clients worldwide. We build custom websites and AI infrastructure for small and medium businesses. Production stack on Claude Agent SDK, MCP and n8n, with Sentry, Langfuse and LangGraph for observability and an in-house guard layer.

## License

MIT. See [LICENSE](./LICENSE).

Plugin code is MIT. The MCP server implementations behind each endpoint are proprietary StudioMeyer software. You are free to fork, modify, and redistribute the plugin manifests, commands, skills, and subagents in this repository.