# StudioMeyer Ecosystem

The Marketplace bundles all StudioMeyer MCP products as Claude Code plugins. Five plugins as of v1.2.0. Hooks ship inside the plugins and load when you enable one.

## MCP Server Products

| Product | Tools | Connect | Hooks | Pricing |
|---------|-------|---------|-------|---------|
| **[Memory](https://github.com/studiomeyer-io/studiomeyer-memory)** | 56 | `memory.studiomeyer.io/mcp` | 2 (UserPromptSubmit recall, SessionEnd close) | Free / 9 EUR / 19 EUR |
| **[CRM](https://github.com/studiomeyer-io/studiomeyer-crm)** | 37 | `crm.studiomeyer.io/mcp` | 1 (UserPromptSubmit lookup) | Free / 9 EUR / 19 EUR |
| **[GEO](https://github.com/studiomeyer-io/studiomeyer-geo)** | 30 | `geo.studiomeyer.io/mcp` | none, on purpose | Free |
| **[Crew](https://github.com/studiomeyer-io/studiomeyer-crew)** | 13 personas | `crew.studiomeyer.io/mcp` | 1 (SessionStart persona hint, local script) | Free |
| **[Academy](https://github.com/studiomeyer-io/mcp-academy)** | 12 open, 21 with a key | npm: `mcp-academy` (stdio) | 1 (quiz after a finished lesson) | Free |

Only Memory and CRM have something to buy. GEO, Crew and Academy are free in full, and where a paid tier is announced but not bookable we list no price for it. See [docs/pricing.md](./docs/pricing.md).

Each product also works standalone through its MCP URL or npm package. The Marketplace adds slash commands, skills, subagents and working hooks on top.

## Open Source Tools

| Project | What it does |
|---------|-------------|
| **[AI Shield](https://github.com/studiomeyer-io/ai-shield)** | LLM security middleware (325 tests, zero deps) |
| **[Darwin Agents](https://github.com/studiomeyer-io/darwin-agents)** | Self-evolving AI agents with A/B testing |
| **[Agent Fleet](https://github.com/studiomeyer-io/agent-fleet)** | Multi-agent orchestration for Claude Code |
| **[MCP Video](https://github.com/studiomeyer-io/mcp-video)** | Video production via MCP (FFmpeg + Playwright) |

---

Built by [StudioMeyer](https://studiomeyer.io), an AI agency from Mallorca, Spain.
