# Changelog

All notable changes to the StudioMeyer Marketplace are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-04

Hooks now ship inside the plugins and work. Before this release they shipped as recipes to
paste into your own settings, and all twelve of them were dead.

### Fixed

**Every hook in the marketplace could not fire.** Measured against Claude Code 2.1.226, six
distinct faults across the five `hooks/recipe.json` files:

| Fault | Effect | Plugins hit |
|---|---|---|
| `server` held the bare key instead of `plugin:<plugin>:<server>` | The server lookup never resolved | all five |
| `${user_prompt}` is not a field, `UserPromptSubmit` delivers `prompt` | The query substituted to an empty string | memory, crm |
| `if` on a `Stop` hook | Claude Code drops any hook with an `if` on a non-tool event | geo |
| `if` holding four permission rules | Only the first is parsed, the rest are ignored | crm, geo |
| Matcher written as `mcp__<server>__<tool>` | A plugin's own tools carry `mcp__plugin_<plugin>_<server>__` | academy |
| Tool arguments the servers do not have | `session_id` for `sessionId`, `lesson_slug` for `slug`, and `crm_log_interaction` called without any of its four required fields | memory, crm, academy |

Three validators were green throughout, because all three checked the shape of the JSON and
none checked whether a hook could run. Each fault is written up with the evidence in
[docs/hooks.md](./docs/hooks.md).

**`memory-session-replay.md` had unparseable YAML frontmatter.** An unquoted
`(default: most recent)` in the description. Claude Code loaded the command with every
frontmatter field silently dropped. Found by `claude plugin validate`, which this repository
had never run.

**The Academy tool count was wrong everywhere.** Three surfaces said 21, three said 23.
Measured over stdio: the server serves **12** tools without an `ACADEMY_API_KEY` and **21**
with one. 23 was never true for either case. The plugin README also listed ten tools that
have never existed (`academy_list_recipes`, `academy_concept_graph` and eight more).

**`marketplace.json` carried three keys Claude Code ignores** (`metadata.homepage`,
`metadata.repository`, `metadata.license`). The official validator warns about each. The
same facts already live in every `plugin.json`, where they are read.

**The Crew persona hint emitted invalid hook output.** Its `hookSpecificOutput` had no
`hookEventName`, which is required.

### Added

- **`hooks/hooks.json` in four plugins.** Claude Code discovers this path by convention and
  merges the hooks while the plugin is enabled. No install script, no `jq` merge into your
  settings, no `curl | bash`.
- **`hooks/tools.json` per plugin**: the measured input schema of every tool a hook drives,
  read off the server source. The validator holds the hooks against it.
- **`tests/selftest-hooks.mjs`**: mutation proof. It copies the repository, plants each of
  the six shipped faults plus ten more of the same shape, and fails if the validator stays
  green. A validator nobody has seen fail is worth nothing.
- **`tests/validate-facts.mjs`** and **`facts.json`**: one source for every public number,
  checked in both directions. Each figure must appear on its listed surfaces, and figures
  that were once wrong in public must not come back.
- **`tests/validate-prose.mjs`**: no em-dash in shipped text, in any of its three HTML forms.
- **`.github/workflows/validate.yml`**: all five validators plus `claude plugin validate`, on
  every push and once a week. The weekly run is the point: the manifests barely change, but
  what they describe does.
- **`docs/hooks.md`**: where a hook lives, the six rules that were broken, what ships now,
  and how to verify a hook actually fired.
- **Five real Academy slash commands** (`/academy-start`, `/academy-search`,
  `/academy-lesson`, `/academy-recipes`, `/academy-progress`). The plugin previously had one
  command, and it only printed a hook recipe.
- **`userConfig` on the Academy plugin**: Claude Code asks for an optional API key while
  enabling it and passes it to the server. That was the interactive install script's job.
- **`displayName` and `$schema` on all five plugin manifests.**

### Changed

- **The hooks that ship are only the ones worth shipping.** Each is read-only, cheap, and
  the thing you installed the plugin for.

  | Plugin | Event | Tool |
  |---|---|---|
  | memory | `UserPromptSubmit` | `nex_search` |
  | memory | `SessionEnd` | `nex_session_end` |
  | crm | `UserPromptSubmit` | `crm_search` |
  | academy | `PostToolUse` after `academy_progress_complete` | `academy_quiz` |
  | crew | `SessionStart` | local shell script, no server call |
  | geo | none | |

- **Every plugin README now states what its hooks cost you** at the top: reads, writes,
  money, and whether anything leaves your machine. Memory and CRM send every prompt you type
  to their server, into your own tenant. That is the feature and it should not be a footnote.

### Removed

- `hooks/recipe.json`, `hooks/install.sh` and `commands/{name}-install-hooks.md` from all
  five plugins. They instructed users to write broken configuration into
  `~/.claude/settings.json`. The validator now fails if either file comes back, because a
  second source of hook config is what let the first one rot unchecked.
- **The GEO `Stop` hook.** `geo_check` sends your URL to eight providers and costs 0.30 to
  0.50 US dollars a run in search mode. Something that spends money should fire when you ask.
  Use `/geo-check`.
- **The Crew `Stop` feedback hook.** It wrote one row per session with a rating nobody chose.
  That is telemetry for us dressed as a feature for you.
- **The Memory `SubagentStop` hook.** It called `nex_session_end` with `${session_id}`, which
  on that event is the *parent* session. Had it resolved, it would have closed the session
  you were still working in.
- **The Memory `nex_summarize` hooks** on `Stop` and `PreCompact`. The tool requires a written
  summary and a hook cannot write prose.
- **The CRM `crm_log_interaction` hook.** It needs a `companyId`. A hook knows a file path.

### Notes

The old README explained that "plugin-installer policy in Claude Code does NOT permit
auto-injection of hooks (security policy)". That was a misreading. What the policy forbids is
a plugin writing into your settings file, which is precisely what our install script did.
Shipping `hooks/hooks.json` has always been allowed and is what the official Anthropic
plugins do.

The detour had a price. Because `recipe.json` was never a file Claude Code loads, nothing
ever held it against reality for four months.

## [1.1.0] - 2026-04-28

### Added

- Hook recipe bundles for all five plugins (`hooks/recipe.json`, `hooks/README.md`,
  `hooks/install.sh`, `commands/{name}-install-hooks.md`), targeting the `mcp_tool` hook type.
- The **studiomeyer-academy** plugin, new in this release. Open source MCP server
  (npm `mcp-academy`, MIT), spawned over stdio through `npx`.
- `tests/validate-hooks.mjs`, a zero-dependency validator for the recipe files.
- `marketplace.json` bumped to 1.1.0 with the Academy entry, five plugins in total.

> **Correction, added 2026-09-04.** None of the twelve hook entries in this release could
> fire, and the validator added alongside them could not have caught that: it checked the
> shape of the JSON, not whether a hook would run. The Academy tool count given here as 23
> was wrong in both directions; the real figures are 12 without a key and 21 with one. See
> the 1.2.0 entry.

## [1.0.0] - 2026-04-10

Initial public release. Four plugins (memory, crm, geo, crew) pointing at the hosted
endpoints on memory, crm, geo and crew `.studiomeyer.io`. Magic Link auth, EU Frankfurt
hosting.
