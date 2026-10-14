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

Install the plugin, connect its `studiomeyer-memory` MCP server, and sign in through the browser. The four included skills explain common workflows and safe tool choices. Claude loads a skill when it considers the task relevant; a skill alone cannot guarantee a server call at the beginning of every Claude chat. To require `nex_session_start` in your own Claude chats, add that preference to your Claude global instructions. The separate `studiomeyer-memory` plugin in this marketplace includes Claude Code hooks, which can run on lifecycle events in supported surfaces; those hooks do not run in Claude chat.

## Use in OpenAI clients

Use the package's `mcp.json` in a client that supports remote MCP and OAuth, or connect `https://memory.studiomeyer.io/mcp` directly where supported. The OpenAI package uses the `studiomeyer-memory-full` identity because the earlier four-tool draft cannot change its MCP URL. Availability and automatic skill activation depend on the client. An uploaded package or repository commit does not by itself mean an OpenAI directory version is approved or published.

## Data and changes

The full server can create and update knowledge, import a user-supplied conversation export, merge entities, archive entries, and delete selected data. These actions should follow the user's specific request. Some maintenance tools have write effects even when their names sound like a scan: `nex_deduplicate` can automatically merge high-confidence matches. The hygiene skill therefore builds a read-only preview without calling it. Never send a whole conversation, uploaded file, credential, payment detail, identity document, or health record to Memory unless the user has specifically requested a supported and appropriate operation.

The service uses Hetzner Nuremberg for primary server and database hosting. Saved content and search queries can be processed by OpenAI for embeddings and Anthropic for enabled AI features. Resend handles email and Sentry handles diagnostics. See the current [privacy policy](https://studiomeyer.io/en/privacy) and [terms](https://studiomeyer.io/en/terms) for retention, export, deletion, and provider details. Some privacy follow-ups remain in [Issue 67](https://github.com/madetocreate/studiomeyer.io/issues/67).

Website: https://studiomeyer.io/en/services/memory  
Support: hello@studiomeyer.io
