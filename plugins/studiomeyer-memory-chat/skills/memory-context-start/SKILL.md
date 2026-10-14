---
name: memory-context-start
description: Use when the user requests a Memory session, prior-context briefing, or proactive suggestions at the start of work.
---

# Start a real Memory session

The full connector exposes `nex_session_start` and `nex_proactive`. A relevant skill may load automatically in Claude chat, but the plugin cannot guarantee a tool call in every new chat. Users who want an unconditional start should add a standing instruction in their Claude settings or use a supported Claude Code hook.

1. Honor an explicit Memory opt-out. If the user gave exclusions, apply them before retrieval. A broad session bootstrap may return excluded material, so use focused `nex_search` or `nex_entity_open` instead when the exclusions cannot be enforced by `nex_session_start`.
2. Otherwise call `nex_session_start` once. It resumes a fresh active session if there is one. Pass a project only when it clearly matches the user's work.
3. Read its `contextLoaded`, context summary, and suggestions. If the user requests fresh suggestions beyond that response, call `nex_proactive` with relevant context. Do not invent server-generated alerts.
4. Present a short briefing of pertinent saved items, open work, and up to three useful next steps. Distinguish remembered claims from current verified facts.
5. Close with `nex_session_end` only when the user explicitly ends the session. Do not save a summary, decision, or learning without a user request or an agreed standing workflow.
