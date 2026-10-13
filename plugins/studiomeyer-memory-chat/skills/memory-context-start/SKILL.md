---
name: memory-context-start
description: Use when the user asks to begin work by loading named StudioMeyer Memory context or requests a briefing and suggestions from selected saved topics.
---

# Start with selected Memory context

This is a user-invoked briefing, not an automatic server session. The four-tool directory connector has no `session_start` or proactive-suggestions tool.

1. Identify the exact names or topics the user wants loaded. Apply any stated exclusions before making a Memory call. If neither names nor topics are given, ask for the scope; do not search the whole account merely because a chat began.
2. Use `get_entity` for an exact saved entity name. Use `find_entities` only when the name is approximate or the user wants candidates. Use `recall_memory` for a selected topic; its result is a relevance search, not an exact named-entry lookup.
3. Present a short briefing: what was found, what was missing or uncertain, and which exclusions were honored. Separate stored statements from current facts.
4. If the user requested proactive ideas, suggest at most three next actions grounded in the returned entries and the current request. Label them as your suggestions, not as server-generated alerts or saved tasks. Do not save or act on them without a further user request.

Never call Memory when the user has opted out. Do not create or claim to resume a server session. Do not fetch unrelated people or projects while building the briefing.
