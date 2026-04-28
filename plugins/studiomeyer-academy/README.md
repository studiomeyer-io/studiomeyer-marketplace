# StudioMeyer Academy — Memory-First AI Operator School for Claude Code

23 tools spanning lessons, quiz, recipes, knowledge graph, certificates, and AI tutor. Open Source MCP server (`mcp-academy` on npm, MIT). Works with Claude Code, Cursor, Codex. Free.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-academy@studiomeyer
```

The plugin registers the `mcp-academy` npm package as a stdio-spawned MCP server under the name **`studiomeyer-academy`** (see [`.mcp.json`](./.mcp.json)). First call downloads the npm package automatically via `npx`.

> **Note on server name.** The Academy recipe [16.5](https://studiomeyer.academy/recipes/16.5-academy-hook-bundle) and the [mcp-academy README](https://www.npmjs.com/package/mcp-academy) reference the server as `academy` for direct npm-install paths (`claude mcp add academy npx -- -y mcp-academy`). The marketplace plugin uses the prefixed name `studiomeyer-academy` for consistency with the rest of the suite. **The `recipe.json` shipped here uses `studiomeyer-academy` to match the plugin install path.** If you installed `mcp-academy` directly under a different name, replace `studiomeyer-academy` in the recipe with whatever name you used in `claude mcp add`.

## What you get

- **MCP server** with 23 tools across 6 domains:
  - Lessons (`academy_lessons`, `academy_lesson`, `academy_next_lesson`, `academy_progress_complete`)
  - Quiz (`academy_quiz`, `academy_quiz_submit`)
  - Recipes (`academy_list_recipes`, `academy_get_recipe`, `academy_my_recipes`, `academy_save_recipe_note`, `academy_start_recipe`, `academy_validate_step`, `academy_next_step`)
  - Concepts (`academy_concept_search`, `academy_concept_open`, `academy_concept_graph`)
  - Stats / Progress (`academy_stats`, `academy_levels`, `academy_review`, `academy_review_grade`, `academy_certificates`)
  - Tutor (`academy_tutor`)
- **Slash commands** (`/academy-stats`, `/academy-install-hooks`, …) that pre-frame Claude for common actions
- **Hook recipes** (in `hooks/`) — auto-load stats and next-lesson on `SessionStart`, optional auto-quiz after `academy_progress_complete`
- **Skills** that walk Claude through Academy workflows
- **Subagents** for tutor-style explanations

## Pricing

Free tier covers all 23 tools and the full lesson tree. Recipe access is gated by tier:

- **Free:** Phase 1-5 recipes (~25 recipes) + all concepts
- **Pro €19/mo:** All 16 phases (~51 recipes incl. Phase 16 Hooks)
- **Team €49/mo:** Pro + multi-user dashboards

See [pricing.md](https://studiomeyer.academy/pricing) on the Academy.

## Verify

After install:

```bash
claude
# In claude:
/academy-stats
```

Should show your XP, rank, league, current streak, recommended next lesson.

## Source

- [mcp-academy on npm](https://www.npmjs.com/package/mcp-academy)
- [Academy site](https://studiomeyer.academy)
- [GitHub: mcp-academy source](https://github.com/studiomeyer-io/mcp-academy)
- [Recipe 16.5 — Academy hook bundle](https://studiomeyer.academy/recipes/16.5-academy-hook-bundle)

## License

MIT.
