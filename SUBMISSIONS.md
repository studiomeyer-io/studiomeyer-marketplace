# Submission Tracking

Status der Listings fuer den StudioMeyer Plugin Marketplace. Jeder Eintrag enthaelt
Copy-Paste Content fuer manuelle Submissions wo CLI/API nicht erlaubt ist.

**Repo:** https://github.com/studiomeyer-io/studiomeyer-marketplace
**Install:** `/plugin marketplace add studiomeyer-io/studiomeyer-marketplace`

---

## Status-Uebersicht

| Plattform | Typ | Status | Reichweite |
|---|---|---|---|
| GitHub Public Repo | Core | ✅ LIVE 2026-04-10 | Direkt-Install |
| claudemarketplaces.com | Auto-Crawler | 🔄 ~24h nach Push | 2.500+ Marketplaces indexiert |
| Chat2AnyLLM/awesome-claude-plugins | JSON-PR | 🟡 PR in Vorbereitung | ~1K Stars |
| anthropics/claude-plugins-official | In-App Form | 🟡 Draft ready (manuell) | Offizieller Anthropic Kurator |
| hesreallyhim/awesome-claude-code | GitHub Issue (manuell) | 🟡 Draft ready (manuell) | ~3K+ Stars, kuratiert |
| Reddit r/ClaudeAI | Launch Post | ⏳ Draft ready | 300K+ Subs |
| dev.to | Blog Post | ⏳ Optional | ~5K Ecosystem |
| Product Hunt | Launch | ⏳ Plan KW17+ | Grosser Hebel |

---

## 1. claudemarketplaces.com (Auto-Index)

**Was zu tun ist:** Nichts. Wartet auf auto-crawl.
**Quelle:** Reddit r/ClaudeAI Maintainer-Zitat: *"publish your marketplace and it'll be listed on claudemarketplaces.com in 24 hrs"*.
**Pruefung:** 2026-04-11 ~22:00 UTC manuell besuchen: `https://claudemarketplaces.com/` suchen nach "studiomeyer".

---

## 2. Chat2AnyLLM/awesome-claude-plugins (JSON PR)

**Typ:** Automatische PR an `Chat2AnyLLM/code-assistant-manager` → Datei `code_assistant_manager/plugin_repos.json`.
**Wie:** Fork + Branch + Edit + PR via gh CLI.
**Status:** Siehe `scripts/submit-chat2anyllm.sh` in diesem Repo.
**Eintrag der hinzugefuegt wird:**

```json
"studiomeyer-marketplace": {
  "name": "studiomeyer-marketplace",
  "description": "StudioMeyer MCP Suite for Claude Code — 4 hosted plugins (Memory, CRM, GEO, Crew). 119 tools, 21 slash commands, 5 skills, 3 subagents. Magic Link auth, EU Frankfurt. Free tier.",
  "enabled": true,
  "type": "marketplace",
  "repoOwner": "studiomeyer-io",
  "repoName": "studiomeyer-marketplace",
  "repoBranch": "main"
}
```

---

## 3. anthropics/claude-plugins-official (In-App Form — manuell)

**Typ:** Submission via `console.claude.com/plugins/submit` ODER via `/plugin` Command in Claude Code → "Submit plugin" button.
**Wichtig:** Es gibt KEINEN PR-Workflow. Muss im Browser gemacht werden.
**Aktuelle Verzoegerung:** Issue #997 (shidoyu/scout, 2026-03-23) zeigt dass Reviews Wochen dauern koennen.

### Submission-Content (Copy-Paste für jedes der 4 Plugins separat)

Submit **jedes Plugin einzeln** — Anthropic's Form erwartet pro-Plugin Metadaten.

---

### Plugin 1/4: studiomeyer-memory

- **Name:** `studiomeyer-memory`
- **Display Name:** StudioMeyer Memory
- **Marketplace Source:** `studiomeyer-io/studiomeyer-marketplace`
- **Category:** Knowledge Management / AI Memory
- **Short Description (1 line):**
  > Hosted AI memory with 53 tools. Knowledge graph, semantic search, import from ChatGPT/Claude/Gemini. Magic Link auth. Free tier.
- **Full Description:**
  > StudioMeyer Memory is a hosted MCP server that gives Claude persistent, intelligent memory across sessions. 53 tools covering learning, search, entities, sessions, skills, decisions, import, and maintenance. Includes a knowledge graph with typed relations, semantic search via pgvector embeddings, session tracking, multi-agent namespaces, contradiction detection, skill tracking, and import from ChatGPT, Claude, Gemini, Copilot, and Perplexity. Magic Link email verification — no passwords. OAuth 2.1 with PKCE. EU Frankfurt hosting (Supabase Pro, SOC 2 Type II). Free tier (200 calls/day), Pro $29/mo (5,000 calls/day), Team $49/mo (unlimited).
- **Plugin includes:** 6 slash commands (`/memory-session-start`, `/memory-session-end`, `/memory-search`, `/memory-learn`, `/memory-sprint`, `/memory-import`), 2 skills (memory-workflow decision tree, memory-import-guide with per-platform recipes), 1 subagent (memory-curator for curated learning proposals), full MCP server with 53 tools.
- **Authentication:** OAuth 2.1 + Magic Link (Brevo SMTP)
- **License:** MIT (plugin manifest + commands + skills + agents)
- **Homepage:** https://memory.studiomeyer.io
- **Repository:** https://github.com/studiomeyer-io/studiomeyer-marketplace
- **Author Email:** hello@studiomeyer.io
- **Security notes:** Plugin is a thin client. Server code stays proprietary. No credentials in the plugin. Tenant-isolated per-user, rate-limited per tier, all user data in EU Frankfurt.

---

### Plugin 2/4: studiomeyer-crm

- **Name:** `studiomeyer-crm`
- **Display Name:** StudioMeyer CRM
- **Marketplace Source:** `studiomeyer-io/studiomeyer-marketplace`
- **Category:** Productivity / Sales / CRM
- **Short Description (1 line):**
  > Headless MCP-native CRM with 33 tools. Companies, contacts, deals, pipeline, Stripe sync. Free tier.
- **Full Description:**
  > StudioMeyer CRM is the first MCP-native headless CRM. 33 tools for companies, contacts, deals, pipeline, leads, follow-ups, notes, timeline, health scores, Stripe sync, audit log, HubSpot/Pipedrive CSV import, and full-text search with German stemming (3-phase cascade with umlaut handling). Zero-Knowledge credential storage (AES-256-GCM) via browser form — no API keys pasted in chat. Webhook + Telegram event system for stage changes and won/lost deals. OAuth 2.1 with PKCE, Magic Link verification, Supabase EU Frankfurt. Free (50 companies), Pro $29/mo (500 companies), Team $49/mo (unlimited).
- **Plugin includes:** 6 slash commands (`/crm-dashboard`, `/crm-contact`, `/crm-deal`, `/crm-pipeline`, `/crm-followups`, `/crm-search`), 1 skill (crm-workflow with Lead→Contact→Deal→Pipeline flow + daily routine), 1 subagent (lead-qualifier that extracts and scores leads from unstructured text), full MCP server with 33 tools.
- **Authentication:** OAuth 2.1 + Magic Link
- **License:** MIT
- **Homepage:** https://crm.studiomeyer.io
- **Repository:** https://github.com/studiomeyer-io/studiomeyer-marketplace
- **Author Email:** hello@studiomeyer.io

---

### Plugin 3/4: studiomeyer-geo

- **Name:** `studiomeyer-geo`
- **Display Name:** StudioMeyer GEO
- **Marketplace Source:** `studiomeyer-io/studiomeyer-marketplace`
- **Category:** Marketing / SEO / AI Visibility
- **Short Description (1 line):**
  > Generative Engine Optimization across 8 LLM platforms. 23 tools. 19 work without API keys. Free tier.
- **Full Description:**
  > StudioMeyer GEO measures and improves AI visibility across ChatGPT, Gemini, Perplexity, Claude, Grok, DeepSeek, Meta AI, and Microsoft Copilot. 23 tools including robots.txt audit, llms.txt validator, JSON-LD audit with schema generator, entity consistency scanner (detects fragmented brand names), content freshness checker, citation source analysis, 10-dimension content audit based on the KDD 2024 GEO paper, and simulated GEO scoring without any LLM API calls. 19 of 23 tools work without any LLM API key — zero-friction onboarding. OAuth 2.1 with Magic Link verification. Supabase EU Frankfurt (dedicated project). Free (all 23 tools, no history), Pro EUR 49/mo (history, trends, scheduled checks, PDF reports), Team EUR 99/mo (multi-brand dashboard, bulk checks, white-label).
- **Plugin includes:** 4 slash commands (`/geo-check`, `/geo-robots`, `/geo-citations`, `/geo-discovery`), 1 skill (geo-optimization playbook with fix-tier prioritization and platform biases), 1 subagent (geo-auditor for deep audits with ranked fix lists and copy-paste schema generation), full MCP server with 23 tools plus 5 MCP prompts (`/geo_full_audit`, `/geo_quick_wins`, `/geo_before_launch`, `/geo_competitor_intel`, `/geo_track_over_time`).
- **Authentication:** OAuth 2.1 + Magic Link
- **License:** MIT
- **Homepage:** https://geo.studiomeyer.io
- **Repository:** https://github.com/studiomeyer-io/studiomeyer-marketplace
- **Author Email:** hello@studiomeyer.io

---

### Plugin 4/4: studiomeyer-crew

- **Name:** `studiomeyer-crew`
- **Display Name:** StudioMeyer Crew
- **Marketplace Source:** `studiomeyer-io/studiomeyer-marketplace`
- **Category:** Productivity / Agent Personas
- **Short Description (1 line):**
  > 8 expert agent personas (CEO, CFO, CMO, CTO, PM, Analyst, Creative, Support) + 3 multi-persona workflows. Free.
- **Full Description:**
  > StudioMeyer Crew turns Claude into a specialist on demand. 8 built-in agent personas (CEO, CFO, CMO, CTO, PM, Research Analyst, Creative Director, Support Lead), each with domain frameworks (DORA, AARRR, RICE/ICE, SWOT, Porter's Five Forces), few-shot examples, anti-patterns, and cross-persona handoff instructions. 3 multi-persona workflows: strategy-review (CEO→CFO→CTO), content-pipeline (CMO→Analyst→Creative), product-launch (Analyst→PM→CEO→CMO→CTO). Memory Bridge auto-loads relevant context via `nex_search` when paired with StudioMeyer Memory. Custom personas can be created with `crew_create` and saved to `~/.mcp-crew/personas/`. Zero extra API cost — everything runs inside your Claude subscription. OAuth 2.1. Free forever.
- **Plugin includes:** 5 slash commands (`/crew-activate`, `/crew-list`, `/crew-status`, `/crew-deactivate`, `/crew-workflow`), 1 skill (persona-usage decision tree with anti-patterns and Memory Bridge integration), full MCP server with 10 tools and 8 MCP prompts.
- **Authentication:** OAuth 2.1 (free tier open)
- **License:** MIT
- **Homepage:** https://crew.studiomeyer.io
- **Repository:** https://github.com/studiomeyer-io/studiomeyer-marketplace
- **Author Email:** hello@studiomeyer.io

### Submission-Reihenfolge
1. studiomeyer-crew (lowest risk, free tier)
2. studiomeyer-geo (stable v2.0.3, 299 tests)
3. studiomeyer-crm (stable v2.5.0, 245 tests)
4. studiomeyer-memory (flagship product)

Reviews dauern laut Issue #997 mehrere Wochen. Nicht blockieren.

---

## 4. hesreallyhim/awesome-claude-code (Manuelle GitHub Issue)

**Typ:** Issue via Browser (https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml).
**WICHTIG:** Das Template erlaubt **keine** `gh` CLI Submissions. Zitat aus dem Template:
> Issues must be submitted by human users using the github.com UI. The system does not allow resource submissions via the `gh` CLI or other programmatic means. Doing so violates the Code of Conduct and submissions will be automatically closed.

### Form-Felder (Copy-Paste)

- **Display Name:** `studiomeyer-marketplace`
- **Category:** Agent Skills (oder neu: "Plugin Marketplaces" falls verfuegbar)
- **Primary URL:** https://github.com/studiomeyer-io/studiomeyer-marketplace
- **Author GitHub:** studiomeyer-io
- **Short Description:** StudioMeyer MCP Suite — 4 hosted Claude Code plugins (Memory, CRM, GEO, Crew). 119 MCP tools, 21 slash commands, 5 skills, 3 subagents. Magic Link authentication, EU Frankfurt hosting, free tier.
- **Installation instructions:**
  ```bash
  /plugin marketplace add studiomeyer-io/studiomeyer-marketplace
  /plugin install studiomeyer-memory@studiomeyer
  ```
- **Uninstallation instructions:**
  ```bash
  /plugin uninstall studiomeyer-memory@studiomeyer
  /plugin marketplace remove studiomeyer
  ```
- **Network requests:** Yes — the plugins are thin clients that connect to hosted MCP endpoints at `memory.studiomeyer.io`, `crm.studiomeyer.io`, `geo.studiomeyer.io`, `crew.studiomeyer.io`. All HTTPS, OAuth 2.1 with Magic Link verification.
- **Differentiator:** The only hosted multi-tenant MCP suite with Knowledge Graph memory, CRM, GEO, and agent personas bundled as one installable marketplace. Most existing memory plugins (claude-mem, claude-code-buddy, memory-store-plugin, claude-memory-plugin, nowledge-mem) are local-first SQLite/file-based for solo use. Ours is production-grade hosted SaaS with OAuth, import from 5 platforms, contradiction detection, and cross-client support.
- **Auto-update:** No. Users update with `/plugin marketplace update studiomeyer`.
- **Elevated permissions:** No.
- **Security:** Plugin code is MIT-licensed. Server code is proprietary. No credentials ever in the plugin repo. Every server is tenant-isolated per user, rate-limited per tier, hosted in EU Frankfurt on Supabase Pro (SOC 2 Type II). Auth via Magic Link (no passwords).

---

## 5. Reddit r/ClaudeAI Launch Post (Entwurf)

**Subreddit:** r/ClaudeAI
**Account:** u/studiomeyer_io
**Best Tag:** "Launch" oder "Resources"
**Titel-Optionen:**
1. "Released: StudioMeyer Marketplace — 4 Claude Code plugins (Memory, CRM, GEO, Agent Personas)"
2. "New Claude Code marketplace: hosted memory with 53 tools, CRM, GEO, and 8 agent personas"
3. "StudioMeyer Marketplace is live — 119 MCP tools bundled as 4 Claude Code plugins"

**Body (draft):**

```
Hey r/ClaudeAI,

I just published a Claude Code marketplace with four plugins we've been running internally for months:

- **studiomeyer-memory** — 53 tools, knowledge graph, semantic search, import from ChatGPT/Claude/Gemini/Copilot/Perplexity, Magic Link auth
- **studiomeyer-crm** — 33 tools, headless CRM for Claude Code (companies, deals, pipeline, Stripe sync, health scores)
- **studiomeyer-geo** — 23 tools, Generative Engine Optimization across 8 LLM platforms (ChatGPT, Gemini, Perplexity, Claude, Grok, DeepSeek, Meta AI, Copilot), 19 work without any LLM API keys
- **studiomeyer-crew** — 8 expert personas (CEO, CFO, CMO, CTO, PM, Analyst, Creative, Support) + 3 multi-persona workflows, zero extra API cost

Total: 119 MCP tools, 21 slash commands, 5 skills, 3 subagents (memory-curator, lead-qualifier, geo-auditor).

Install:
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer

Repo: https://github.com/studiomeyer-io/studiomeyer-marketplace

All plugins authenticate with OAuth 2.1 + Magic Link (no passwords). Servers are EU-hosted (Supabase Frankfurt). Free tiers on every plugin. The plugin code itself is MIT — the server implementations stay closed source but the user-facing MCP protocol is fully documented.

Why I'm posting: Memory plugins exist (claude-mem, claude-code-buddy, memory-store-plugin, claude-memory-plugin, nowledge-mem) but they're all local-first SQLite for solo use. If you want hosted, multi-tenant, with knowledge graph and import-from-other-AIs, there wasn't one before. So I built it.

Happy to answer questions about the architecture, why Magic Link instead of API keys, or how the memory-curator subagent proposes learnings without writing them.
```

**Regeln:**
- Keine self-promotion nur mit Link. Erst ueber Problem reden.
- Engage mit Kommentaren die innerhalb 1h kommen.
- Kein Cross-post zu r/mcp ohne Abstand.

---

## 6. awesome-claude-plugins Alternatives

- `ccplugins/awesome-claude-code-plugins` — eigener Marketplace der sich selbst listet
- `Chat2AnyLLM/awesome-claude-plugins` — auto-generiert aus `plugin_repos.json` (siehe Sektion 2)

---

## Monitoring

Checke nach dem Push/Submit diese Punkte regelmaessig:

```bash
# GitHub Stars
gh repo view studiomeyer-io/studiomeyer-marketplace --json stargazerCount

# claudemarketplaces.com
curl -s https://claudemarketplaces.com/ | grep -i studiomeyer

# Chat2AnyLLM auto-index
curl -s "https://raw.githubusercontent.com/Chat2AnyLLM/awesome-claude-plugins/main/README.md" | grep -c "studiomeyer-marketplace"
```

---

## Was ICH (Nex/Claude Code) NICHT kann

- anthropics/claude-plugins-official Submission — in-app Form only
- hesreallyhim/awesome-claude-code Issue — `gh` CLI explizit verboten
- Reddit Posts — kein Reddit-Zugriff
- Product Hunt — separater Flow, braucht Assets (Screenshots, Demo-Video)
- dev.to Blog — braucht Account-Login ueber Browser

Alles wofuer Matthias ins Browser muss ist hier oben als Copy-Paste-Draft.
