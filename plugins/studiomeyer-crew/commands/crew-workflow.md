---
description: Run a multi-persona workflow (strategy-review, content-pipeline, product-launch)
argument-hint: <workflow-name> <input>
---

Run a Crew workflow: **$ARGUMENTS**

1. Parse the arguments. First token is the workflow name, rest is the input.
2. Valid workflows:
   - **strategy-review** — CEO → CFO → CTO evaluation of a strategy
   - **content-pipeline** — CMO → Analyst → Creative content production
   - **product-launch** — Analyst → PM → CEO → CMO → CTO full launch analysis
3. If the workflow name is missing or invalid, call `crew_workflow_list` to show options and stop.
4. Call `crew_workflow_run` from the `studiomeyer-crew` MCP server with:
   - `name`: the workflow name
   - `input`: the rest of the argument
5. The server returns the chained prompts in order. Execute each persona's analysis sequentially, passing the previous persona's output as input to the next.
6. At the end, produce a unified summary covering all perspectives.

This can take 2-4 turns depending on the workflow length. Keep the user informed of which persona is currently analyzing.
