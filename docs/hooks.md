# Hooks in this marketplace

Everything here was measured against Claude Code **2.1.226**, not remembered. Where a rule
comes from the binary rather than the docs, it says so.

## Where a hook lives

In the plugin that owns it, at `plugins/<name>/hooks/hooks.json`. Claude Code discovers
that path by convention, merges the hooks with your own while the plugin is enabled, and
drops them when you disable it.

```
plugins/studiomeyer-memory/
├── .claude-plugin/plugin.json
├── .mcp.json
└── hooks/
    ├── hooks.json     the hooks Claude Code loads
    ├── tools.json     the tool schemas the validator checks them against
    └── README.md      what fires, what it costs, how to verify
```

There is no install script and nothing to merge into `~/.claude/settings.json`. A plugin
writing into your settings file is what Claude Code's policy actually forbids. Shipping
`hooks/hooks.json` has always been allowed, and it is what the official Anthropic plugins
do.

## The six rules that were broken

Version 1.1.0 shipped five `hooks/recipe.json` files holding twelve hook entries. Every
single one was dead. Three validators were green, because all three checked the shape of
the JSON and none checked whether a hook could fire.

### 1. A plugin's own MCP server is not called by its bare name

A plugin that bundles a server in `.mcp.json` under the key `studiomeyer-memory` does not
register it under that key. Claude Code scopes it:

```js
// from the bundle: plugin MCP servers are keyed on load
function fh_(servers, pluginName, ...) {
  for (const [key, cfg] of Object.entries(servers)) {
    const scoped = `plugin:${pluginName}:${key}`;   // plugin:studiomeyer-memory:studiomeyer-memory
    ...
  }
}
```

An `mcp_tool` hook resolves its `server` field by exact name:

```js
const found = servers.find((s) => s.name === hook.server);
if (!found) return { ok: false, error: `MCP server '${hook.server}' not connected` };
```

So `"server": "studiomeyer-memory"` never resolves. The correct value is
`"server": "plugin:studiomeyer-memory:studiomeyer-memory"`.

The same scoping applies to matchers and `if` fields. A plugin's tools are callable as
`mcp__plugin_<plugin>_<server>__<tool>`, with any character outside `[a-zA-Z0-9_-]`
replaced by an underscore. Hyphens survive.

### 2. `${user_prompt}` is not a field

Substitution reads dotted paths out of the hook's JSON input:

```js
o.replace(/\$\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g, (_, path) => {
  const value = resolve(path);
  if (value === undefined || value === null) return "";   // silently empty
  return typeof value === "object" ? JSON.stringify(value) : String(value);
});
```

A path that does not exist becomes the empty string. No warning, no error. The
`UserPromptSubmit` input carries `prompt`, so `${user_prompt}` searched for nothing, in two
plugins, for four months.

Two consequences worth writing down:

- **Every hook input field must be checked against the event that delivers it.** The common
  fields are `session_id`, `transcript_path`, `cwd`, `prompt_id`, `permission_mode`,
  `agent_id`, `agent_type`, `effort`. Everything else is per event.
- **Substitution always yields a string.** Never aim one at a parameter declared as a
  number. `academy_quiz` takes `level` as a number, so a hook cannot fill it.

### 3. `if` outside a tool event kills the hook

```js
async function qoS(input) {
  if (input.hook_event_name !== "PreToolUse" && input.hook_event_name !== "PostToolUse"
   && input.hook_event_name !== "PostToolUseFailure"
   && input.hook_event_name !== "PermissionRequest"
   && input.hook_event_name !== "PermissionDenied") return;   // no evaluator
  ...
}
// and at the filter:
if (!evaluator) { log(`Hook if condition "${rule}" cannot be evaluated for non-tool event ${event}`); return false; }
```

`return false` drops the hook. The GEO plugin's only hook carried an `if` on `Stop`, so it
never ran. Its own README asked users to verify the filter with `claude --debug` because we
were not sure it worked. Nobody ran the check.

### 4. `if` takes one permission rule, not four

A rule is `Tool` or `Tool(content)`, parsed once. `Edit(*email*)|Write(*email*)|Edit(*draft*)|Write(*draft*)`
is four rules in one string, and only the first is read. A `|` **inside** the parentheses
is content and is fine: `Edit(*.md|*.mdx)` is one valid rule. To match several tools, write
several hook entries.

### 5. Arguments must match the server, exactly

The hooks passed `session_id` where `nex_session_end` declares `sessionId`, and
`lesson_slug` where `academy_quiz` declares `slug`. `crm_log_interaction` requires
`companyId`, `channel`, `direction` and `content`; the hook passed `type`, `summary` and
`tool_use_id`, which are not parameters of that tool at all.

Each plugin now carries `hooks/tools.json`, the measured input schema of every tool it
drives from a hook. The validator holds the hooks against it: unknown parameter, missing
required parameter, or a substitution aimed at a non-string field, all fail.

### 6. Some things cannot be a hook at all

- **`nex_summarize`** needs a written summary. A hook has no language. It moves fields from
  an event into a call and nothing else.
- **`crm_log_interaction`** needs to know which company an edit belongs to. The event knows
  a file path.
- **`geo_check`** costs money at eight providers. Something that spends money should fire
  when you ask, not when you stop typing.
- **Account tools without a key** are absent from the tool list, not merely refused. On the
  Academy that is nine of 21 tools.
- **`SessionStart` runs before the MCP servers connect.** An `mcp_tool` hook there logs
  `MCP server '...' not connected` and gives up. Use a `command` hook, or a different event.

## What ships now

| Plugin | Event | Tool | Cost |
|---|---|---|---|
| memory | `UserPromptSubmit` | `nex_search` | one read, your tenant |
| memory | `SessionEnd` | `nex_session_end` | one write, no arguments |
| crm | `UserPromptSubmit` | `crm_search` | one read, your tenant |
| academy | `PostToolUse` after `academy_progress_complete` | `academy_quiz` | one read, needs a key |
| crew | `SessionStart` | local shell script | nothing, no server call |
| geo | none | | |

Memory and CRM send every prompt you type to their server, into your own tenant. That is
the feature, and each plugin README says so at the top rather than in a footnote.

## Verifying a hook

`claude --debug`, then watch for one of three lines:

```
Hooks: mcp_tool calling plugin:studiomeyer-memory:studiomeyer-memory/nex_search with 2 arg(s)
Hooks: mcp_tool hook skipped, MCP server '...' not connected
Hook if condition "..." cannot be evaluated for non-tool event Stop
```

The first is success. The second means the server has not authenticated yet: run any tool
of that plugin once and click the Magic Link. The third means the hook is being dropped.

A green statusline message is not proof. It appears before the call.

## The validator

```bash
node tests/validate.mjs         # manifests, commands, skills, agents
node tests/validate-hooks.mjs   # can each hook actually fire
node tests/validate-facts.mjs   # every public number against facts.json
node tests/validate-prose.mjs   # no em-dash in shipped text
node tests/selftest-hooks.mjs   # plant each old bug, prove the validator goes red
node tests/smoke.mjs            # the hosted endpoints answer
node tests/verify-facts-live.mjs  # facts.json against the running servers
```

The last one is the answer to an obvious objection: `facts.json` and
`hooks/tools.json` are transcribed by hand, so what stops them going stale? Every
hosted server states its own tool count in its `llms.txt`, unauthenticated, and the
Academy server can be started and asked. The check reads both and fails on a
mismatch.

`selftest-hooks.mjs` is the one that matters. It copies the repository, plants each of the
six faults above plus ten more of the same shape, and fails if the validator stays green. A
validator nobody has seen fail is worth nothing, which is the whole lesson of this release.

## Adding a hook

1. Write it in `plugins/<name>/hooks/hooks.json`.
2. If it calls a tool, put that tool's real input schema in `hooks/tools.json`. Read it off
   the server source. Do not type it from memory.
3. `node tests/validate-hooks.mjs`.
4. `claude --debug` and watch it fire. A green test says the hook is well-formed. Only the
   log says it ran.
5. Say in the plugin's `hooks/README.md` what it costs the user: reads, writes, money, and
   whether anything leaves their machine.
