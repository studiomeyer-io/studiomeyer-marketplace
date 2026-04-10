---
name: crm-workflow
description: Use when the user is working with StudioMeyer CRM and you need to pick the right tool. Covers the Lead → Contact → Deal → Pipeline flow, daily CRM routine, and how to run import/export safely.
---

# StudioMeyer CRM Workflow

The CRM has 33 tools. This skill is the map.

## The core flow

```
Lead (raw, unverified)
  ↓ (qualify, dedup, enrich)
Contact (real person) + Company (organization)
  ↓ (opportunity detected)
Deal (stage = lead, qualified, proposal, negotiation, closed-won, closed-lost)
  ↓ (stage progression over time, auto-probability)
Pipeline (aggregated view)
  ↓ (closed-won deals contribute to)
MRR / ARR (revenue)
```

Every entity in the CRM fits somewhere on this flow. When a tool call fails or feels wrong, check whether you are trying to skip a step.

## Decision tree

### Unstructured input (email, message, form submission) arrives
→ Use the `lead-qualifier` subagent to extract a structured lead, then `crm_lead` with `action: "ingest"`. The server dedupes automatically.

### User asks "who is this person?"
→ `crm_search` with the name. If found, `crm_get_timeline` for the full history.

### User mentions a new company
→ `crm_company` with `action: "create"`. Check `crm_list_companies` first if the name is ambiguous.

### User says "log that call I had with X"
→ `crm_log_interaction` with `channel: "call"`, `direction: "outbound"`, and a summary. This auto-updates `lastInteractionAt` on the contact.

### User wants to see the pipeline
→ `crm_get_pipeline` for stages + forecast, `crm_dashboard` for everything at once.

### User asks "what do I need to do today?"
→ `crm_follow_up` with `action: "list"` + `crm_dashboard` for alerts.

### User wants to import from HubSpot or Pipedrive
→ `crm_import` with the CSV path. The server has 22 header mappings built in including First + Last Name combination.

### User wants to convert a lead to a customer
→ `crm_lead` with `action: "convert"`. This creates the Contact, Company, and optionally a Deal in one call.

## Daily CRM routine (recommended)

Morning, 5 minutes:
1. `crm_dashboard` — what happened overnight
2. `crm_follow_up` with `action: "list"` — what needs attention
3. `crm_health_scores` — any accounts dropping below 50?

End of day, 5 minutes:
1. `crm_log_interaction` for every real conversation
2. Update any deal stages that moved
3. `crm_follow_up` with `action: "create"` for anything that needs a nudge next week

## Anti-patterns

- **Creating a deal without a company.** The server will reject it. Always `crm_company` first if needed.
- **Logging interactions on leads.** Leads do not have interactions. Convert to a Contact first.
- **Using `crm_search` with a single letter.** Too broad. Use at least 3 characters.
- **Updating a deal's probability manually.** The server auto-sets probability from stage. Changing both is a conflict.
- **Ignoring the Zero-Knowledge credential flow.** If the user wants to connect Stripe or HubSpot, use `crm_connect` — credentials go through a browser form and are AES-256-GCM encrypted per-tenant. Do not take raw credentials in chat.

## Health scores

Health is 0-100 with factor breakdown:
- Recent interaction count
- Days since last interaction
- Deal velocity
- Payment timeliness (if Stripe is connected)
- Support ticket volume (if supported)

Scores below 50 are churn risks. Surface them in the dashboard command or when the user asks "who needs attention?".

## Audit log

Every write is recorded in the `CrmAuditLog` with who, what, when. Use `crm_audit_log` to investigate "why did this record change?" questions.

## Event system

Deal stage changes, won/lost events, and hot leads fire webhooks + Telegram notifications automatically. The user does not need to poll — the CRM pushes when something matters. Do not try to rebuild this with polling.
