---
description: Show pending and overdue follow-ups from StudioMeyer CRM
---

Show the user what follow-ups need attention.

1. Call `crm_follow_up` with `action: "list"` to get all pending follow-ups.
2. Sort by priority and due date. Group into:
   - **Overdue** — dueDate in the past
   - **Today** — dueDate is today
   - **Upcoming** — next 7 days
3. For each item show: title, related company or contact, due date, priority.
4. End with a one-line suggestion on which item to tackle first.
5. If nothing is pending, say "Alles erledigt" (DE) or "Nothing pending" (EN).

Match the user's language.
