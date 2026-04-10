---
name: memory-import-guide
description: Use when the user wants to import conversation history from ChatGPT, Claude, Gemini, Microsoft Copilot, or Perplexity into StudioMeyer Memory. Covers export steps per platform, file formats, and how to run the import safely.
---

# Memory Import Guide

StudioMeyer Memory can ingest conversation history from five platforms via `nex_import`. This skill is the recipe book for each one.

## How import works

1. **Export** the conversation history from the source platform to a file on disk.
2. **Analyze** — `nex_import` with `action: "analyze"` shows a preview of what would be imported without writing anything.
3. **Confirm** the preview with the user.
4. **Import** — `nex_import` with `action: "import"` writes sessions, learnings, entities, and decisions into the user's tenant.

Always run analyze first. Imports are append-only but still worth confirming, especially when there are thousands of messages.

## Platform-specific export recipes

### ChatGPT
1. Settings → Data Controls → Export Data
2. You get a ZIP by email. Unzip it.
3. The file you want is `conversations.json` (sometimes `conversations.jsonl` on newer exports).
4. Run `nex_import` with `platform: "chatgpt"` and the file path.

### Claude
1. Settings → Account → Export Data
2. Unzip. Use `conversations.json`.
3. `nex_import` with `platform: "claude"`.

### Gemini
1. Google Takeout → Select "Gemini" → Export
2. You get a ZIP with an HTML or JSON bundle.
3. `nex_import` with `platform: "gemini"`.

### Microsoft Copilot
1. Copilot settings → Activity → Export
2. JSON file.
3. `nex_import` with `platform: "copilot"`.

### Perplexity
1. Perplexity settings → Export conversations
2. JSON file.
3. `nex_import` with `platform: "perplexity"`.

## What gets extracted

`nex_import` uses Haiku (fast, cheap) to extract:

- **Sessions** — one per conversation, with start/end timestamps from the source
- **Learnings** — salient facts, insights, and patterns from the conversation
- **Entities** — people, projects, tools, services mentioned
- **Decisions** — explicit choices the user made with stated rationale
- **Relations** — links between extracted entities

The extraction is conservative. It will not invent facts. If a conversation is pure chit-chat, very little will be saved.

## Running the import

Prefer absolute paths. The server runs in a different directory than Claude Code.

```
nex_import({ platform: "chatgpt", file_path: "/absolute/path/to/conversations.json", action: "analyze" })
```

Response includes:
- `estimated_sessions`
- `estimated_learnings`
- `estimated_entities`
- `estimated_decisions`
- `sample_session_titles`

Show these numbers to the user. If they agree, run again with `action: "import"`.

## Gotchas

- **Large exports take minutes.** ChatGPT exports with 500+ conversations can take 5-10 minutes. Tell the user to be patient.
- **Dedup is server-side.** The Gatekeeper rejects duplicates automatically. If you re-import the same file, nothing new shows up — that is correct.
- **Free tier quota.** Imports count toward the daily call limit. Big imports may hit it. Pro or Team tier removes the concern.
- **PII.** The server does not scrub personal data. If the user's export contains emails, addresses, or credentials, those will be ingested as-is and searchable. Warn the user before importing exports from shared accounts.

## Post-import

After a big import, suggest:
1. `nex_deduplicate` with `action: "scan"` — finds fuzzy duplicates the strict gatekeeper missed
2. `nex_consolidate` — merges similar clusters
3. `nex_synthesize` — generates high-level guides from the imported material

These are optional but make the imported memory more navigable.
