# StudioMeyer Memory for Claude chat and OpenAI

This plugin connects the signed-in user's account to the full StudioMeyer Memory MCP server at `https://memory.studiomeyer.io/mcp`. It exposes the server's 56 tools. The separate four-tool `/mcp-directory` interface is not used by this version.

## What the 56 tools cover

- Sessions and continuity: `nex_session_start`, `nex_context`, `nex_proactive`, `nex_sprint`, `nex_summarize`, and `nex_session_end`.
- Recall and search: `nex_recall`, `nex_search`, learning search, entity search, history, and graph traversal.
- Recording knowledge: `nex_learn`, `nex_decide`, `nex_skill`, entity creation, observations, and relationships.
- Maintenance and analysis: contradiction review, insights, health, decay, deduplication, consolidation, and archive actions.
- Other workflows: goals, delegation, agent reports, exports, user-requested conversation import, and interactive graph and timeline tools.

Call `nex_guide` for the complete tool reference. All tools are available to Free and paid accounts, subject to their plan limits. OAuth connects each user to their own account.

## Use in Claude

Install the plugin, connect its `studiomeyer-memory` MCP server, and sign in through the browser. A connector connection and a skill-plugin installation are separate operations. Claude loads an installed skill when it considers the task relevant; the plugin cannot guarantee a server call at the beginning of every chat. A standing instruction can establish a start-of-work workflow. The separate `studiomeyer-memory` plugin in this marketplace includes Claude Code hooks; those hooks do not run in Claude chat.

The four skills cover tool choice (`use-studiomeyer-memory`), session briefings (`memory-context-start`), durable project status (`memory-lagestand`), and scoped cleanup (`memory-hygiene`). They preserve existing authorization and a current opt-out. Their canonical source is the `skills/` directory in [mcp-nex](https://github.com/madetocreate/mcp-nex); this plugin carries the release's copy.

## Use in OpenAI clients

Use the package's `mcp.json` in a client that supports remote MCP and OAuth, or connect `https://memory.studiomeyer.io/mcp` directly where supported. The OpenAI package retains the `studiomeyer-memory-full` identity; the Claude package uses `studiomeyer-memory-chat`.

OpenAI's [MCP skill import](https://developers.openai.com/plugins/build/mcp-server#import-skills-from-the-mcp-server) reads a server's skill catalog during plugin submission. The imported files become a fixed snapshot of that plugin version; deploying changed files to the server does not update an already published plugin. A new import and submission are needed for that distribution path. A direct MCP connection alone does not install the skills. Client support determines availability and activation. An uploaded package or repository commit does not by itself mean a directory version is approved or published.

## Data and changes

The full server can create and update knowledge, import a user-supplied conversation export, merge entities, archive entries, and delete selected data. These actions follow the user's request or an agreed workflow. Some maintenance tools have write effects even when their names sound like a scan: `nex_deduplicate` can automatically merge high-confidence matches. The hygiene skill uses supported reads with `readOnly: true` and, where exposed, `trackUsage: false` instead. These controls prevent Memory writes and session bookkeeping, not service metering or configured provider processing.

Clients should pass a stable `conversationId` on every call that exposes it, with a distinct ID for each conversation. A project or agent label does not isolate conversations. If an imported connector schema lacks these fields, the skills disclose the limitation instead of sending unsupported arguments or promising isolation and write-free previews. Refreshing a server deployment does not prove that a client has refreshed its tool definitions.

Routine saves contain selected facts, not an unrequested full conversation or unrelated file contents. Imports require a user-supplied export and an authorized import scope. Corrections use the affected record's ID; similar new learning content is not an automatic replacement. Session closure follows the user's actual conversation end, not each completed task.

The service uses Hetzner Nuremberg for primary server and database hosting. Saved content and search queries can be processed by OpenAI for embeddings and Anthropic for enabled AI features. Resend handles email and Sentry handles diagnostics. See the current [privacy policy](https://studiomeyer.io/en/privacy) and [terms](https://studiomeyer.io/en/terms) for retention, export, deletion, and provider details. Some privacy follow-ups remain in [Issue 67](https://github.com/madetocreate/studiomeyer.io/issues/67).

Website: https://studiomeyer.io/en/services/memory  
Support: hello@studiomeyer.io

## Release verification

Run `python3 scripts/sync-memory-skills.py --source-root /path/to/mcp-nex`
from the marketplace after committing the server's canonical skills, then repeat
with `--check`. Build release ZIPs with
`python3 scripts/build-memory-chat-packages.py --source-root /path/to/mcp-nex --output-dir /path/to/release --self-test`.
The builder compares every skill and the source version against the pinned Git
objects in the canonical checkout before writing archives. Fetch the approved
server commit before using that checkout. Public CI checks package
self-consistency with `--check-only`; it cannot read the private server repository
and produces no release ZIPs. A matching adjacent digest alone is not source
provenance. Portal rescan and installation checks remain separate release steps.
