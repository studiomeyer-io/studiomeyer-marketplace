# studiomeyer-memory

Hosted AI memory for Claude Code. 56 tools covering learning, search, knowledge graph, sessions, skills, decisions, import, maintenance, and interactive 3D knowledge graph visualization.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer
```

First tool call triggers OAuth 2.1 + Magic Link. Check your inbox, click the link, done.

## What you get

### MCP server
56 tools from `https://memory.studiomeyer.io/mcp`, including:

- **Search:** `nex_search` (semantic + trigram + FTS with temporal decay + RRF fusion), `nex_entity_search`, `nex_recall`
- **Write:** `nex_learn`, `nex_decide`, `nex_entity_create`, `nex_entity_observe`, `nex_entity_relate`
- **Session:** `nex_session_start`, `nex_proactive`, `nex_sprint`, `nex_session_end`, `nex_summarize`
- **Knowledge Graph:** `nex_entity_graph`, `nex_entity_open`, `nex_entity_history`, `nex_entity_merge`
- **Visualization (MCP Apps spec 2026-01-26, renders inline in claude.ai / VS Code Copilot Chat / Goose / Postman / MCPJam):** `nex_graph_view` (interactive 3D force-graph with cinema-mode + time-travel slider), `nex_recall_timeline` (vertical chronological timeline of learnings + decisions + sessions), `nex_session_replay` (step-by-step walkthrough of any session)
- **Intelligence:** `nex_contradictions`, `nex_synthesize`, `nex_reflect`, `nex_insights`, `nex_deduplicate`
- **Import:** `nex_import` — ChatGPT, Claude, Gemini, Copilot, Perplexity conversation exports
- **Maintenance:** `nex_decay`, `nex_consolidate`, `nex_learn_archive`, `nex_health`

Run `nex_guide` inside Claude to see the full reference. Hosts without UI-resource support (Claude Code CLI, Cursor) see the structured JSON response — fully backward-compatible.

### Slash commands
- `/memory-session-start` — load last session context and proactive suggestions
- `/memory-session-end` — summarize and close the current session
- `/memory-search <query>` — search everything with temporal decay
- `/memory-learn <content>` — save a learning (insight, pattern, mistake, decision)
- `/memory-sprint` — current sprint state (tasks, blockers, decisions)
- `/memory-import <platform> <file>` — import a conversation export
- `/memory-show-graph` — render the knowledge graph as an interactive 3D view (MCP Apps; falls back to text in CLI hosts)
- `/memory-recall-timeline` — vertical chronological timeline of recent learnings, decisions, sessions
- `/memory-session-replay` — step-by-step replay of one session (default: most recent)
- `/memory-stats` — health overview: counts, sprint status, action items
- `/memory-setup` — walk through Memory autopilot setup for the current AI client

### Skills
- **memory-workflow** — when to use search vs entity vs learn vs decide
- **memory-import-guide** — step-by-step import recipes for each supported platform

### Subagent
- **memory-curator** — scans a completed conversation and proposes curated learnings and entities worth saving

## Pricing

| Tier | Price | Limits |
|---|---|---|
| Free | $0 | 200 calls/day, 1.000 entities |
| Pro | $29/mo | 5.000 calls/day, 25.000 entities |
| Team | $49/mo | Unlimited, 20 API keys, shared |

All 56 tools in every tier. See [../../docs/pricing.md](../../docs/pricing.md).

## Auth

OAuth 2.1 + Magic Link. See [../../docs/magic-link-setup.md](../../docs/magic-link-setup.md).

## Support

- Docs: https://studiomeyer.io/en/services/memory/
- MCP Endpoint: https://memory.studiomeyer.io/mcp
- Email: hello@studiomeyer.io
