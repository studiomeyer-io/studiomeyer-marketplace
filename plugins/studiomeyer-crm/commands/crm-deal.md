---
description: Create or update a deal in StudioMeyer CRM
argument-hint: <deal description>
---

The user wants to work with a deal: **$ARGUMENTS**

1. Parse the description to extract:
   - Company (required)
   - Amount
   - Stage (lead, qualified, proposal, negotiation, closed-won, closed-lost)
   - Expected close date
2. If the company is not in CRM yet, call `crm_company` with `action: "create"` first. Never create a deal without a company.
3. Call `crm_deal` with `action: "create"` (or `update` if the user said "update"). The server sets probability automatically based on stage.
4. Confirm with one line: company, amount, stage, probability.
5. If the stage is `proposal` or later, suggest calling `/crm-followups` to check if a follow-up should be scheduled.

Match the user's language.
