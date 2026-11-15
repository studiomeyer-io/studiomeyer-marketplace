# studiomeyer-academy

The Memory-First AI Operator School, inside Claude Code. Six levels, a full lesson tree, 58 written recipes and an AI tutor. The MCP server behind it is open source: [`mcp-academy`](https://www.npmjs.com/package/mcp-academy) on npm, MIT.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-academy@studiomeyer
```

The npm CLI reads public Academy content without an account. The optional **Academy API key** prompt is a legacy setting: entering a key no longer grants personal access. Personal tools require the hosted OAuth connection documented in [mcp-academy](https://github.com/studiomeyer-io/mcp-academy), and their availability depends on granted scopes.

The plugin spawns the npm package over stdio, so the first call downloads it through `npx`. Nothing to install by hand.

## What you get

### Tools

**29 public tools in the current npm CLI**, including compatibility aliases:

| Area | Tools |
|---|---|
| Start, paths and modules | `academy_start`, `academy_welcome`, `academy_paths`, `academy_path`, `academy_module` |
| Lessons and teaching | `academy_lesson`, `academy_teach`, `academy_tutor_context` |
| Library and prompts | `academy_library`, `academy_prompts`, `academy_prompt` |
| Playbooks, recipes and concepts | `academy_playbooks`, `academy_playbook`, `academy_recipes`, `academy_recipe`, `academy_concepts` |
| Glossary and coaching | `academy_glossary`, `academy_glossary_term`, `academy_coaching` |
| Search and suggestions | `academy_search`, `search`, `fetch`, `academy_suggest` |
| Catalog and previews | `academy_premium_catalog`, `academy_premium_preview` |
| Legacy curriculum and aliases | `academy_legacy_levels`, `academy_levels`, `academy_legacy_lessons`, `academy_lessons` |

The legacy API-key setting returns the same public tool list. It does not add personal tools. Personal access uses hosted OAuth, so no fixed account-tool total is claimed here.

### Slash commands

| Command | What it does |
|---|---|
| `/academy-start` | What the Academy is, the six levels, where to begin |
| `/academy-search <topic>` | Find lessons, recipes and playbooks on a subject |
| `/academy-lesson <slug or topic>` | Open one lesson and get taught it, not shown it |
| `/academy-recipes [topic]` | List the hands-on guides, or walk through one |
| `/academy-progress` | Legacy personal-learning command; unavailable in the public CLI |

### Hook

One, in [`hooks/hooks.json`](./hooks/hooks.json). Finishing a lesson pulls its quiz:

| Event | What fires | Cost |
|---|---|---|
| `PostToolUse` after `academy_progress_complete` | `academy_quiz` for that lesson | one read, no money |

The hook is loaded while the plugin is enabled. Its personal source tool is absent from the current public npm CLI, even when a legacy API key is set, so the matcher does not fire there. Personal tools require a separate hosted OAuth connection.

## Pricing

Free, and there is nothing to buy. No paid tier, no card, no account needed to read.

Of the 88 recipes, 58 are written and open. The other 30 are not for sale either: 25 are placeholders for phases 11 to 15 that still have to be written, and 5 stay internal on purpose.

An account buys you saved progress, quizzes and certificates. That is all it buys.

## Run it yourself

The server is open source, so you do not have to take our word for what it does:

```bash
npx -y mcp-academy@latest
```

## Source

- [mcp-academy on npm](https://www.npmjs.com/package/mcp-academy)
- [Academy site](https://studiomeyer.academy)
- [mcp-academy source on GitHub](https://github.com/studiomeyer-io/mcp-academy)

## License

MIT.
