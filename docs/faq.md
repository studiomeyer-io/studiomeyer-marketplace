# FAQ

## Do I need to sign up before installing?

No. Install the plugin, run your first command, and the Magic Link flow walks you through signup on the fly.

## Is the plugin code open source?

Yes. Everything in this repository is MIT-licensed — the marketplace manifest, plugin manifests, slash commands, skills, and subagents. The MCP servers behind the hosted endpoints are proprietary StudioMeyer software.

## Can I run the servers myself?

Not today. The hosted servers are closed source. If you want on-premise or self-hosted variants, mail `hello@studiomeyer.io` — we offer Custom MCP engagements starting at EUR 499.

## What data is stored?

- **Memory:** The memories you create, the knowledge graph entities you observe, the sessions you start. All tenant-isolated on Supabase EU Frankfurt.
- **CRM:** Contacts, companies, deals, notes, interactions you write. All tenant-isolated.
- **GEO:** Brands you track, check results, trend history. Only if you are on the Pro or Team tier — Free tier does not persist anything.
- **Crew:** No per-user state. Persona activations are ephemeral in the session.

No training on your data. No selling to third parties. See [studiomeyer.io/privacy](https://studiomeyer.io).

## Can I use this with Claude Desktop or Cowork?

The plugins here target Claude Code. The underlying MCP servers work with any MCP client including Claude Desktop, Cowork, Cursor, ChatGPT — just paste the MCP URL directly. The plugin wrapper (slash commands + skills + subagents) is Claude Code specific.

## Is there rate limiting?

Yes. Per-tier daily quotas on the server, plus per-OAuth-token limits to prevent runaway scripts. Free tiers give you enough to evaluate and run a real workflow; Pro unlocks production usage.

## Which plugin should I start with?

- **Memory** if you want Claude to remember things across sessions.
- **CRM** if you run sales or account management and want Claude to manage contacts and deals.
- **GEO** if you care whether ChatGPT and Gemini mention your brand.
- **Crew** if you want instant role-playing personas (CEO, CFO, CTO) without paying extra.

All four are free to try. Start with whichever matches the problem you have today.

## I found a bug.

Open an issue at `https://github.com/studiomeyer-io/studiomeyer-marketplace/issues` or mail `hello@studiomeyer.io`. Include the plugin name, the command you ran, and what you expected versus what happened.
