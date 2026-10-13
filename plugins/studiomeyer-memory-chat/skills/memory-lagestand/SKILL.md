---
name: memory-lagestand
description: Use when the user asks to capture a project status, decision, completed or rejected work, preference, or lesson in StudioMeyer Memory after a task.
---

# Curate a Memory status

Build a small set of durable entries from the user's stated outcome. Possible types are rules, completed work, rejected options, preferences, decisions, and lessons. Do not transmit the whole conversation to Memory.

1. State each proposed entry as one clear assertion. For a decision, include the choice and reason when known; do not invent an outcome. For a mistake, describe the cause and the useful correction rather than only the visible symptom.
2. If earlier state matters, call `recall_memory` with a focused topic and compare it with the user's current statement. Mark conflicts explicitly. A new `save_memory` call will not erase or amend the older entry.
3. When the user has asked for suggestions, show the proposed entries and wait for the user's selection before saving. When the user has already explicitly selected exact content to save, follow that instruction without requesting another confirmation.
4. Save only the selected entries, one assertion per call. Use `category: workflow` for a reusable procedure or rule; otherwise choose only among the exposed `insight`, `pattern`, and `research` categories. There is no dedicated decision tool in this connector.
5. Read back saved entries with one focused `recall_memory` query when practical. Report saved, duplicate, rejected, and inconclusive read-back outcomes accurately.

Never say an older entry was updated, superseded, or deleted by this workflow. If the user wants a canonical replacement, explain that the four-tool connector cannot perform it.
