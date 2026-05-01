---
name: memory-workflow
description: Use when the user is working with StudioMeyer Memory and you need to pick the right tool. Covers when to use search vs entity tools vs learn vs decide, how to structure queries, and how to avoid duplicate writes.
---

# StudioMeyer Memory Workflow

This skill teaches the right tool choice for any memory operation. The Memory server has 56 tools (53 core + 3 UI: nex_graph_view, nex_recall_timeline, nex_session_replay) — this is the decision tree for the 10 you will use most.

## Core principle

Memory has four types of content:

- **Learnings** — facts, insights, mistakes, patterns. Append-only with a confidence score. Use `nex_learn`.
- **Decisions** — tracked choices with rationale and outcome. Use `nex_decide`.
- **Entities** — typed nodes in the Knowledge Graph (people, projects, tools, services). Use `nex_entity_*`.
- **Sessions** — conversation containers with start/end markers. Use `nex_session_*`.

Search spans all four with `nex_search`. It is the default for "do we know anything about X?" questions.

## Decision tree

### User asks about something we might already know
→ `nex_search` with a natural-language query. Let `expand: true` (the default) handle synonym expansion. If the query is aggregation-heavy ("how many", "all the", "summarize"), set `agentic: true`.

### User wants to save a fact or insight
→ `nex_learn` with the right category:
- `mistake` — something that went wrong
- `pattern` — recurring technique
- `insight` — non-obvious realization
- `research` — findings from investigation
- `architecture` — design decision
- `workflow` — process
- `security` — security-relevant fact

### User makes a choice with a reason
→ `nex_decide` with `content`, `rationale`, `outcome` (if already known). Decisions can be linked with `nex_decide` follow-ups later.

### User mentions a person, project, tool, or service
→ `nex_entity_search` first to check for duplicates. If not found, `nex_entity_create`. Then `nex_entity_observe` to add facts and `nex_entity_relate` to link it to other entities.

### User asks "what's happening" or "what's next"
→ `nex_sprint` (current tasks) plus `nex_proactive` (stale items, open decisions, knowledge gaps).

### User wants a deeper read
- `nex_synthesize` — generate a guide from related learnings
- `nex_reflect` — extract meta-insights from recent work
- `nex_insights` — pre-computed insights from the last session

## Anti-patterns

- **Dumping entire conversations into `nex_learn`.** The server has a Gatekeeper that will reject low-signal saves. Distill first.
- **Calling `nex_search` with a single word like "crm".** Too broad, too many results. Use 3-6 meaningful words.
- **Creating a new entity every time.** Always `nex_entity_search` first. Merge with `nex_entity_merge` if a duplicate slipped through.
- **Starting a session you will not close.** Call `nex_session_end` at the end of real work. Orphan sessions pollute analytics.
- **Ignoring `nex_proactive` at session start.** It surfaces stale items the user forgot. Cost is near-zero.

## Hard limits that matter

- `nex_search` default limit is 20. Set `limit: 5` for quick checks, keep 20 for real investigations, cap at 100.
- Cross-agent search is default-on. If you want to filter by a specific agent, pass `agentId: "name"`.
- `recencyWeight` defaults to 0.3. For "what did we decide recently" set it to 0.7. For "is this a known pattern" set it to 0.1.

## Example recipes

**"Did we ever solve the Docker memory issue?"**
```
nex_search({ query: "docker memory issue container crash", recencyWeight: 0.2, limit: 10 })
```

**"Remember that we decided to use Supabase Frankfurt for all new SaaS projects."**
```
nex_decide({
  content: "Use Supabase EU Frankfurt for all new MCP SaaS projects",
  rationale: "GDPR compliance, latency for EU users, existing StudioMeyer PRO org",
  confidence: 0.9
})
```

**"Find everything about the GEO product."**
```
nex_entity_search({ query: "GEO", types: ["project", "service"] })
// then for the matching entity:
nex_entity_open({ entityId: "..." })
nex_entity_graph({ entityId: "...", depth: 2 })
```
