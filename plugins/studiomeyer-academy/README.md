# studiomeyer-academy

The Memory-First AI Operator School, inside Claude Code. Six levels, a full lesson tree, 58 written recipes and an AI tutor. The MCP server behind it is open source: [`mcp-academy`](https://www.npmjs.com/package/mcp-academy) on npm, MIT.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-academy@studiomeyer
```

Claude Code asks for an **Academy API key** while enabling the plugin. Leave it empty if you just want to read: the course content is open. Enter one to get progress, quizzes and certificates. You can add it later through `/plugin`.

The plugin spawns the npm package over stdio, so the first call downloads it through `npx`. Nothing to install by hand.

## What you get

### Tools

**12 without a key.** All of the course content:

| Area | Tools |
|---|---|
| Orientation | `academy_welcome`, `academy_levels` |
| Lessons | `academy_lessons`, `academy_lesson` |
| Recipes | `academy_recipes`, `academy_recipe` |
| Playbooks | `academy_playbooks`, `academy_playbook` |
| Search | `academy_search`, `academy_tutor_context`, `search`, `fetch` |

**21 with a key.** The nine account tools on top: `academy_stats`, `academy_next_lesson`, `academy_progress_complete`, `academy_quiz`, `academy_quiz_submit`, `academy_review`, `academy_review_grade`, `academy_certificates`, `academy_tutor`.

Without a key those nine are not merely locked, they are absent from the tool list. That matters for hooks and matchers: a rule pointing at one of them simply never matches.

### Slash commands

| Command | What it does |
|---|---|
| `/academy-start` | What the Academy is, the six levels, where to begin |
| `/academy-search <topic>` | Find lessons, recipes and playbooks on a subject |
| `/academy-lesson <slug or topic>` | Open one lesson and get taught it, not shown it |
| `/academy-recipes [topic]` | List the hands-on guides, or walk through one |
| `/academy-progress` | XP, rank, streak, next lesson (needs a key) |

### Hook

One, in [`hooks/hooks.json`](./hooks/hooks.json). Finishing a lesson pulls its quiz:

| Event | What fires | Cost |
|---|---|---|
| `PostToolUse` after `academy_progress_complete` | `academy_quiz` for that lesson | one read, no money |

It is active as long as the plugin is enabled. There is nothing to paste into your settings. Without an API key the source tool does not exist, so the matcher never fires and the hook costs you nothing.

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
