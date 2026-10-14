---
name: memory-lagestand
description: Use when the user asks to record a project's status, decisions, completed or rejected work, preferences, and lessons in StudioMeyer Memory.
---

# Curate a Memory status

Build a small set of durable entries from the user's stated outcome. Keep rules, completed work, rejected options, preferences, decisions, and lessons distinct. Do not transmit the whole conversation.

1. Read the relevant previous state with `nex_recall`, `nex_search`, or `nex_sprint` when a correction or conflict may matter.
2. Phrase each proposed entry as one clear assertion. For a mistake, capture the cause and useful correction. Mark uncertain conclusions as tentative.
3. When the user asked for suggestions, show the proposed entries and wait for their selection. When exact content was already selected, save it without requesting a second confirmation.
4. Use `nex_decide` for a real choice and its reasoning; use `nex_learn` for a lesson, rule, preference, or workflow. Use `nex_entity_observe` or `nex_entity_relate` for a graph fact or link. Update `nex_sprint` only when the user asked to maintain that working state.
5. Read back the affected entry when practical and report whether it was added, updated, skipped, or rejected. Use `nex_session_end` only when the user explicitly ends the session.

Do not silently remove or supersede older entries. Use the server's dedicated update or invalidation tools only after the affected record and requested change are clear.
