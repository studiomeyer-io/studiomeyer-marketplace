# studiomeyer-crew

Turn Claude into a specialist on demand. 13 expert personas with domain-specific knowledge, decision frameworks, and output formats. Zero extra API cost: everything runs inside your Claude subscription.

## Install

```bash
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-crew@studiomeyer
```

Free forever. No auth needed for core functionality: the SaaS endpoint is open for the free tier.

## What you get

### Personas (8)

| Persona | Category | When to activate |
|---|---|---|
| **CEO** | business | Strategy, vision, delegation, revenue decisions |
| **CFO** | business | Pricing, ROI, budgets, financial modeling |
| **CMO** | business | Marketing, growth, content strategy, SEO/GEO |
| **CTO** | tech | Architecture, code review, tech decisions |
| **PM** | business | Product strategy, RICE/ICE, PRDs, user stories, JTBD |
| **Research Analyst** | ops | Market research, competitive intelligence, data analysis |
| **Creative Director** | creative | Brand voice, design, copy, storytelling |
| **Support Lead** | ops | Customer communication, docs, FAQ, onboarding |

Each persona defines role, focus areas, decision framework, output format, constraints, and recommended memory queries. v2 personas include domain frameworks (DORA, AARRR, RICE/ICE, SWOT, Porter's Five Forces), few-shot examples, anti-patterns, and cross-persona handoff instructions.

### Workflows (3)

| Workflow | Chain | What it does |
|---|---|---|
| **strategy-review** | CEO → CFO → CTO | Analyze a strategy, evaluate finances, check feasibility |
| **content-pipeline** | CMO → Analyst → Creative | Create content, fact-check, polish |
| **product-launch** | Analyst → PM → CEO → CMO → CTO | Market research → PRD/user stories → go/no-go → marketing plan → tech checklist |

### Slash commands
- `/crew-activate <role>`: switch into a persona
- `/crew-list`: see available personas with categories
- `/crew-status`: show active persona + duration
- `/crew-deactivate`: back to default Claude
- `/crew-workflow <name> <input>`: run a multi-persona workflow

### Tools
`crew_guide`, `crew_list`, `crew_activate`, `crew_deactivate`, `crew_status`,
`crew_feedback`, `crew_create`, `crew_delete`, `crew_workflow_list`, `crew_workflow_run`
and more. The count moves between releases, so it is not pinned here or anywhere else in
this repository. Run `crew_guide` for the list your server is actually serving.

### Hook

One, in [`hooks/hooks.json`](./hooks/hooks.json). It reads the directory you opened and
suggests a fitting persona.

| Event | What fires | What it costs you |
|---|---|---|
| `SessionStart` | [`crew-auto-persona.sh`](./hooks/crew-auto-persona.sh), a local shell script | nothing: it writes nothing and calls no server |

Edit the case statement in that script to change the mapping.

`crew_feedback` is deliberately not a hook. Firing it on `Stop` wrote one feedback row per
session with a rating nobody chose. That was telemetry for us, not a feature for you.

### Skill
- **persona-usage:** when to activate which persona, how to combine them, how to build custom ones

## Memory Bridge

If you have `studiomeyer-memory` installed too, activating a persona auto-loads relevant context via `nex_search`. The CFO queries revenue, costs, and pricing decisions. The CTO queries architecture and tech debt. You get a specialist with your history already in hand.

## Why Crew matters

Most "AI agent" frameworks charge per API call or require separate LLM keys. Crew is different. It runs entirely inside your Claude Code session using your existing subscription. A persona is a behavioral guide plus a structured prompt, not a new model. You pay nothing extra to activate a CFO for 20 minutes of financial analysis.

## Custom personas

Create your own with `crew_create`. Markdown + YAML frontmatter, saved to `~/.mcp-crew/personas/`. Gets loaded automatically on next activation. Great for role-specific variants: "CTO for a SaaS company", "CFO for early-stage", "Support Lead for German market".

## Pricing

Free. All 13 personas, every tool, all 3 workflows, unlimited activations. No paid tier. The SaaS endpoint is fully open for this plugin.

## Support

- Docs: https://studiomeyer.io/en/services/crew/
- MCP Endpoint: https://crew.studiomeyer.io/mcp
- Email: hello@studiomeyer.io
