---
description: Import a conversation export from ChatGPT, Claude, Gemini, Copilot, or Perplexity
argument-hint: <platform> <file-path>
---

The user wants to import their AI conversation history from another platform.

Arguments: **$ARGUMENTS** (expected format: `<platform> <file-path>`)

Supported platforms: `chatgpt`, `claude`, `gemini`, `copilot`, `perplexity`.

1. Parse the arguments. If the user did not provide both a platform and a file path, ask for the missing piece and stop.
2. Read the file to verify it exists and is readable.
3. Call `nex_import` from the `studiomeyer-memory` MCP server with:
   - `platform`: as given
   - `file_path`: absolute path
   - `action: "analyze"` first — this returns a preview of what would be imported without writing anything
4. Show the user the preview: estimated number of sessions, learnings, entities, and decisions that would be created.
5. Ask: "Import this? (yes/no)"
6. If yes, call `nex_import` again with `action: "import"`. Report the final counts.
7. If no, tell the user nothing was imported.

Never skip the preview step. Imports are append-only but still worth confirming.
