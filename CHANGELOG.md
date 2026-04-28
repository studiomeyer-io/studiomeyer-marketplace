# Changelog

All notable changes to the StudioMeyer Marketplace are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-28

### Added

- **Hook recipe bundles** for all five plugins, targeting Claude Code v2.1.118+ `mcp_tool` hook type (released 2026-04-23). Each bundle ships:
  - `hooks/recipe.json` — exact JSON snippet for `~/.claude/settings.json` with declared `compatibility` (claudeCodeMinVersion + mcpServerName) and `compliance` (idempotent, maxLatencyMs, deterministic, sideEffectFreeWithoutTrigger, gdpr).
  - `hooks/README.md` — install / verify / uninstall guide.
  - `hooks/install.sh` — idempotent jq-merge into user's settings with backup, supports `--dry-run` and `--uninstall`.
  - `commands/{name}-install-hooks.md` — slash command that outputs the recipe ready for the user's settings.
- **studiomeyer-memory hooks** (4 events, 5 entries): Stop → `nex_summarize` + `nex_session_end`; PreCompact → `nex_summarize`; UserPromptSubmit → `nex_search`; SubagentStop → `nex_learn` (category=research).
- **studiomeyer-crm hooks** (2 events): UserPromptSubmit → `crm_search`; PostToolUse with `if`-filter on `*email*|*draft*` paths → `crm_log_interaction` (idempotent via `tool_use_id`).
- **studiomeyer-geo hooks** (1 event): Stop with `if`-filter on `*.md|*.mdx` → `geo_check`. Placeholder substitution (url + brand) at install-time via interactive prompt or `--url=`/`--brand=` flags.
- **studiomeyer-crew hooks** (1 event): Stop → `crew_feedback` (rating=4, tags=["auto-stop-hook"]). Optional bash hook `crew-auto-persona.sh` for cwd → persona suggestion on SessionStart.
- **studiomeyer-academy plugin** (NEW): Open Source MCP server (npm: `mcp-academy`, MIT). 23 tools — lessons, quiz, recipes, knowledge graph, certificates, AI tutor. Stdio transport via npx.
- **studiomeyer-academy hooks** (2 events): SessionStart → `academy_stats` + `academy_next_lesson`; PostToolUse with matcher `mcp__studiomeyer-academy__academy_progress_complete` → `academy_quiz` cascade.
- **`tests/validate-hooks.mjs`** — zero-dependency validator that checks every plugins/{name}/hooks/ directory against the v2.1.118 hook schema. Validates event names, hook types, mcp_tool fields (server/tool/timeout), `if`-filter syntax, and required compliance metadata.

### Changed

- **`marketplace.json`** bumped to 1.1.0 — added `studiomeyer-academy` entry (5 plugins total). Plugin descriptions updated to reference shipped hook recipes.

### Notes

- Plugin-installer policy in Claude Code does NOT permit auto-injection of hooks into user settings (security policy). Users install hooks manually via the per-plugin `install.sh` (idempotent jq-merge with backup) or via the slash command after the plugin is installed.
- The five recipe bundles correspond 1:1 to Academy Phase 16 recipes (`16.2-memory-hook-bundle` … `16.5-academy-hook-bundle`).

## [1.0.0] - 2026-04-10

Initial public release. Four plugins (memory, crm, geo, crew) targeting hosted SaaS endpoints (memory.studiomeyer.io, crm.studiomeyer.io, geo.studiomeyer.io, crew.studiomeyer.io). Magic Link auth. EU Frankfurt hosting.
