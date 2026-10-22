# FAQ

## Do I need to sign up before installing?

No. Install the plugin, run your first command, and the Magic Link flow walks you through signup on the fly.

## Is the plugin code open source?

Yes. Everything in this repository is MIT-licensed: the marketplace manifest, plugin manifests, slash commands, skills, and subagents. The MCP servers behind the hosted endpoints are proprietary StudioMeyer software.

## Can I run the servers myself?

Not today. The hosted servers are closed source. If you want an on-premise or self-hosted variant, mail `hello@studiomeyer.io`. We build custom MCP servers as a project, quoted per scope after a free intro call, so there is no list price to quote here.

## What data is stored?

- **Memory:** The memories you create, the knowledge graph entities you observe, the sessions you start. Tenant-scoped primary storage at Hetzner Nuremberg, Germany. Enabled AI features can send selected content to configured model providers; see the Memory plugin README and privacy policy.
- **CRM:** Contacts, companies, deals, notes, interactions you write. All tenant-isolated.
- **GEO:** Brands you track, check results, trend history. Only if you are signed in, because those four tools write to a database. Without an account nothing is persisted. This is not a paid feature: GEO has no paid tier today.
- **Crew:** No per-user state. Persona activations are ephemeral in the session.
- **Academy:** Nothing, unless you create an account. Then your progress, quiz results and certificates.

See the current [privacy policy](https://studiomeyer.io/en/privacy) for processing, provider and retention details.

## Can I use this with Claude Desktop or Cowork?

The original plugins target Claude Code, including its hooks and subagents. The separate [Memory chat package](../plugins/studiomeyer-memory-chat) also supplies skills for supported Claude and OpenAI plugin installations. A direct remote MCP connection exposes tools but does not by itself install plugin skills. Availability, activation and OAuth setup depend on the host; Claude Code hooks do not run in Claude chat. OpenAI server-imported skills are a snapshot of the submitted plugin version and need a new import when changed.

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
