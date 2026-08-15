---
description: Save a learning, insight, pattern, mistake, or decision to StudioMeyer Memory
argument-hint: <content to remember>
---

The user wants to save something to memory: **$ARGUMENTS**

1. Decide the category based on the content:
   - `mistake` — something that went wrong and must not be repeated
   - `pattern` — a recurring technique or structure worth reusing
   - `insight` — a non-obvious realization
   - `research` — findings from investigation
   - `architecture` — system-level design fact
   - `workflow` — how a process should run
   - `security` — a security-relevant fact
2. Call `nex_learn` from the `studiomeyer-memory` MCP server with:
   - `content`: the full content from the user
   - `category`: from step 1
   - `confidence`: 0.9 for factual user-provided info, 0.7 for inferred
   - `project`: pass it through when the user named one. Left out, the save inherits the session's project, which is usually what you want. For something that holds regardless of project, pass `"global"`.
3. If the server returns a `duplicate_of` field, tell the user that a similar learning already exists and link to it. Do not complain — this is the gatekeeper working correctly.
4. Confirm the save with one line: category + first 60 chars of the content.

Match the user's language.
