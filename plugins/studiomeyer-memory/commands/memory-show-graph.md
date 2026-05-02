---
description: Render the StudioMeyer Memory knowledge graph as an interactive 3D view (MCP Apps)
argument-hint: [entity-id-or-name]
---

Render the user's StudioMeyer Memory knowledge graph as an interactive 3D force-graph.

1. Call `nex_graph_view` from the `studiomeyer-memory` MCP server.
   - If `$ARGUMENTS` is provided, pass it as `entityId` (or as a name to search first via `nex_entity_search` and use the resolved id) plus `depth: 2`.
   - If no argument, call without args — the server returns the global graph.
2. The host either renders the interactive 3D view inline (MCP Apps capable hosts: claude.ai Web/Desktop, VS Code Copilot Chat, Goose, Postman, MCPJam) OR returns the structured JSON with entities, relations and stats. Both behaviors are correct.
3. Summarize what came back in two lines: number of entities, number of relations, dominant entity types. Do not invent any node that is not in the response.
4. If the host rendered the view, tell the user they can hover a node to pin its detail panel, drag to rotate, scroll to zoom, and use the time-travel slider to see the graph as of a past date.
