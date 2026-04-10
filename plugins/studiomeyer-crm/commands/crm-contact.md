---
description: Add, update, or look up a contact in StudioMeyer CRM
argument-hint: <action> <name or email>
---

The user wants to work with a contact: **$ARGUMENTS**

1. Parse the argument. First word should be one of `add`, `update`, `search`, `show`. If missing, default to `search`.
2. Based on the action:
   - **search** — call `crm_search` with `query: "<rest of args>"` and `entityTypes: ["contact"]`. Show top 5 matches.
   - **add** — extract name, email, phone, company from the rest of the args. Call `crm_contact` with `action: "add"`. If company is mentioned but not in CRM, call `crm_company` first with `action: "create"`.
   - **update** — find the contact first with `crm_search`. If multiple matches, ask which one. Then call `crm_contact` with `action: "update"`.
   - **show** — `crm_search` to find the contact, then `crm_get_timeline` for their history.
3. Confirm the action with one or two lines. Never dump the full contact record unless the user asked for it.

Match the user's language.
