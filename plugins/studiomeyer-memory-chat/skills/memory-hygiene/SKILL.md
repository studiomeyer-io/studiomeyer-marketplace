---
name: memory-hygiene
description: Use when the user asks to inspect StudioMeyer Memory for duplicates, contradictions, stale entries, or cleanup candidates before changing them.
---

# Preview Memory hygiene

The full connector has maintenance and deletion tools. Start with a read-only preview and identify the exact records before any change.

1. Define the scope. For an overview, use read-only status actions such as `nex_health`, `nex_insights`, `nex_contradictions` with `action: stats`, or `nex_decay` with `action: stats`. For a topic or entity, use focused `nex_search`, `nex_entity_search`, `nex_entity_open`, or `nex_entity_history`.
2. Show the saved wording or identifiers, why a duplicate, conflict, or stale entry is suspected, and the proposed action. Separate evidence from inference. Search results can be incomplete; do not call a sample an account-wide audit.
3. Ask the user which records, if any, to change. Choose `nex_learn_update`, `nex_learn_archive`, `nex_entity_invalidate`, `nex_entity_merge`, or contradiction resolution only for the selected records and supported action.
4. Read back the result and explain what changed, including any retained history.

Do not call `nex_deduplicate` for a preview: its default scan can automatically merge high-confidence entities. `nex_consolidate` and some other maintenance actions can also write. Never permanently delete a record without a specific request and final confirmation.
