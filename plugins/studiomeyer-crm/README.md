# studiomeyer-crm

MCP-native CRM for Claude Code. 37 tools covering companies, contacts, deals, pipeline, leads, follow-ups, notes, Stripe sync, and health scoring, all through natural language in your terminal.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-crm@studiomeyer
```

First tool call triggers OAuth 2.1 + Magic Link.

## What you get

### MCP server
37 tools from `https://crm.studiomeyer.io/mcp`, including:

- **Companies:** `crm_company`, `crm_list_companies`, `crm_company_delete`
- **Contacts:** `crm_contact`, `crm_list_contacts`, `crm_contact_delete`
- **Deals:** `crm_deal`, `crm_list_deals`, `crm_deal_delete`, `crm_get_pipeline`
- **Leads:** `crm_lead`, `crm_lead_delete` (ingest, list, update, convert)
- **Follow-ups:** `crm_follow_up`, `crm_follow_up_delete`
- **Activity:** `crm_log_interaction`, `crm_get_timeline`, `crm_add_note`, `crm_list_notes`, `crm_note_delete`
- **Intelligence:** `crm_search`, `crm_health_scores`, `crm_dashboard`, `crm_stats`, `crm_revenue_report`
- **Stripe:** `crm_sync_stripe`
- **Import/Export:** `crm_import` (HubSpot, Pipedrive, generic CSV), `crm_export`
- **Handoff:** `crm_handoff` (task queue between Claude Code and Cowork)
- **Audit:** `crm_audit_log`
- **Credentials:** `crm_connect` (Zero-Knowledge, Browser-form, AES-256-GCM)
- **Guide:** `crm_guide` (12 embedded topics)

### Slash commands
- `/crm-dashboard`: pipeline, MRR, health, follow-ups at a glance
- `/crm-contact`: add, update, search contacts
- `/crm-deal`: create or update deals with auto-probability by stage
- `/crm-pipeline`: deals by stage with forecast and MRR/ARR
- `/crm-followups`: what needs attention today
- `/crm-search`: full-text search across all CRM entities

### Hook

One, in [`hooks/hooks.json`](./hooks/hooks.json). Live as long as the plugin is enabled,
nothing to paste into your settings.

| Event | What fires | What it costs you |
|---|---|---|
| `UserPromptSubmit` | `crm_search` on your prompt, three hits | one read against your own tenant |

Read this before you enable it: it sends **every prompt you type** to
`crm.studiomeyer.io`, into your own tenant. That is what "auto-lookup" means. If you do
not want it, disable the plugin or delete that entry from `hooks/hooks.json` in your
installed copy.

`crm_log_interaction` is deliberately not a hook. It needs a `companyId`, a channel and a
direction, and only the conversation knows those. An earlier version of this plugin tried
it anyway and shipped a hook that could never have worked.

### Skill
- **crm-workflow:** when to use which tool, how a Lead becomes a Contact becomes a Deal, how to run a daily CRM routine

### Subagent
- **lead-qualifier:** takes unstructured text (email, note, message) and extracts a structured lead for ingestion

## Pricing

| Tier | Price | Companies | Contacts | Deals | API calls |
|---|---|---|---|---|---|
| Free | 0€ | 50 | 200 | 100 | 5.000/day |
| Pro | 9€/mo | 500 | 5.000 | 1.000 | 50.000/day |
| Team | 19€/mo | Unlimited | Unlimited | Unlimited | 100.000/day |

All 37 tools in every tier. Stripe checkout live.

## Why a CRM as MCP?

Because a CRM is not the destination. The destination is the decision Claude helps you make. Putting CRM data on the other side of a natural-language interface means you stop switching tabs.

```
You: "Who's in late-stage deals and hasn't been touched in 14 days?"
Claude: (calls crm_search + crm_list_deals + crm_get_timeline)
        "Three accounts: Acme, Globex, Initech. Last interactions: 17, 21, 15 days ago.
         Suggested: Acme needs a check-in, Globex is ready for a proposal, Initech is cooling."
```

That is the experience. Not a dashboard. A conversation.

## Support

- Docs: https://studiomeyer.io/en/services/crm/
- MCP Endpoint: https://crm.studiomeyer.io/mcp
- Email: hello@studiomeyer.io
