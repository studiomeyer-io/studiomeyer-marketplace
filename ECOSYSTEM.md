# StudioMeyer Ecosystem

The Marketplace bundles all StudioMeyer MCP products as Claude Code plugins. Five plugins as of v1.1.0, all shipping `mcp_tool` hook recipes for Claude Code v2.1.118+.

## MCP Server Products

| Product | Tools | Connect | Hook Recipes | Pricing |
|---------|-------|---------|--------------|---------|
| **[Memory](https://github.com/studiomeyer-io/studiomeyer-memory)** | 53 | `memory.studiomeyer.io/mcp` | 4 (Stop, PreCompact, UserPromptSubmit, SubagentStop) | Free / $29 / $49 |
| **[CRM](https://github.com/studiomeyer-io/studiomeyer-crm)** | 33 | `crm.studiomeyer.io/mcp` | 2 (UserPromptSubmit, PostToolUse with if-filter) | Free / $29 / $49 |
| **[GEO](https://github.com/studiomeyer-io/studiomeyer-geo)** | 24 | `geo.studiomeyer.io/mcp` | 1 (Stop with if-filter on *.md\|*.mdx) | Free / EUR 49 / EUR 99 |
| **[Crew](https://github.com/studiomeyer-io/mcp-crew)** | 10 | `crew.studiomeyer.io/mcp` | 1 (Stop) + optional cwd-aware bash hook | Free |
| **[Academy](https://github.com/studiomeyer-io/mcp-academy)** | 23 | npm: `mcp-academy` (stdio) | 2 (SessionStart, PostToolUse cascade) | Free / EUR 19 / EUR 49 |

Each product also works standalone via the MCP URL or npm package — the Marketplace adds slash commands, skills, subagents, and now hook recipes on top.

## Open Source Tools

| Project | What it does |
|---------|-------------|
| **[AI Shield](https://github.com/studiomeyer-io/ai-shield)** | LLM security middleware (325 tests, zero deps) |
| **[Darwin Agents](https://github.com/studiomeyer-io/darwin-agents)** | Self-evolving AI agents with A/B testing |
| **[Agent Fleet](https://github.com/studiomeyer-io/agent-fleet)** | Multi-agent orchestration for Claude Code |
| **[MCP Video](https://github.com/studiomeyer-io/mcp-video)** | Video production via MCP (FFmpeg + Playwright) |

---

Built by [StudioMeyer](https://studiomeyer.io) — AI agency from Mallorca, Spain.
