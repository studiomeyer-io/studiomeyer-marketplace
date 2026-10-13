# StudioMeyer Memory

This package connects Claude or OpenAI clients to the user's StudioMeyer Memory account through hosted OAuth. The connector contains no credentials. It offers four actions: recall saved memories, find named concepts, inspect one concept's observations and relationships, and save a specific fact or insight when the user asks. Four bundled skills cover safe tool use, selected-context briefings, status curation, and read-only hygiene previews.

## Install in Claude

Install the StudioMeyer Memory plugin through Claude's supported plugin interface. Open this plugin's Connectors tab, connect `studiomeyer-memory`, and sign in to your own StudioMeyer Memory account through the browser. Availability of plugin installation depends on your Claude account and interface.

## Connect in OpenAI

For an OpenAI client that supports a custom remote MCP connection and browser authorization, add `https://memory.studiomeyer.io/mcp-directory` as the server URL and complete the StudioMeyer sign-in flow. This package does not imply that a public ChatGPT directory listing has been approved or that every OpenAI interface offers custom connector installation. For an API integration, use your client's supported remote-MCP authentication flow; never put a reviewer credential in the public package.

## Use

The core skill recommends one assertion per saved entry and a focused read-back after a successful save. The context-start skill loads only user-selected names or topics, applies exclusions before reading, and can suggest next steps from returned context. This is a manual briefing, not a server session. The lagestand skill proposes durable status entries and saves only user-selected content. The hygiene skill previews possible duplicates or conflicts in a limited search result, without changing data.


Ask, for example, “What did I save about the launch plan?” or “Remember that our project uses PostgreSQL.” Service plan limits apply.

The plugin does not collect the current conversation, import chat history, start memory sessions, or run automatic prompt hooks. Reads leave saved knowledge and sessions unchanged; normal service metering and configured AI processing can still occur. A save adds requested content or reports an exact duplicate as already saved. It does not silently overwrite a similar fact.

The hosted service uses Hetzner Nuremberg for primary server/database hosting. Relevant saved content and search queries can be processed by OpenAI for embeddings and Anthropic for enabled AI features. Resend handles email; Sentry handles diagnostics. EU database storage does not mean all model processing takes place in the EU. This four-action connector has no export or account-deletion action. The service's readable Markdown export is a limited summary; deactivating an account does not erase its data.

[Technical walkthrough](https://studiomeyer.io/videos/studiomeyer-memory-directory-review-20261011.mp4): a real OAuth connection and five memory actions in an explicitly labeled demonstration client, followed by three original recorded Codex negative cases. It does not represent a Claude or ChatGPT interface.

Status: prepared for review; not submitted or approved. Operator retention, complete export/erasure and legal/provider information remain prerequisites for directory submission; see [privacy issue67](https://github.com/madetocreate/studiomeyer.io/issues/67).

Website: https://studiomeyer.io/en/services/memory  
Privacy: https://studiomeyer.io/en/privacy  
Terms: https://studiomeyer.io/en/terms  
Support: hello@studiomeyer.io
