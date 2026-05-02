---
description: Walk through StudioMeyer Memory autopilot setup for the current AI client
---

Help the user set up StudioMeyer Memory autopilot for the AI client they are currently using (Claude Code, Claude Desktop, Cursor, VS Code Copilot Chat, Codex, etc).

1. Call `nex_guide` from the `studiomeyer-memory` MCP server with `topic: "quickstart"` to load the latest setup recipe.
2. Then call `nex_guide` with `topic: "autopilot"` for the hook-based automation (SessionStart hook + Stop hook + memory policy).
3. Detect the user's current client from conversation context. If unclear, ask once.
4. Walk the user through the client-specific steps:
   - Adding the MCP server (URL: `https://memory.studiomeyer.io/mcp`)
   - First-time OAuth via Magic Link to their email
   - Optional: SessionStart and Stop hooks that auto-call `nex_session_start` and `nex_session_end`
5. Ask permission BEFORE writing or editing any user config file (`~/.claude/settings.json`, `claude_desktop_config.json`, etc).
6. After setup, call `nex_session_start` once to verify the connection works.
