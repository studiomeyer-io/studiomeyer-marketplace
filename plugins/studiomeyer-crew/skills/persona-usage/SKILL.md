---
name: persona-usage
description: Use when the user wants to pick the right Crew persona for a task, combine multiple personas, or understand how personas differ. Covers when to activate which role, how workflows chain them, and how to avoid persona misuse.
---

# Persona Usage Guide

Crew turns Claude into a specialist with a focused prompt, decision framework, and output format. This skill is the decision tree for picking the right one.

## When to use a persona at all

A persona is worth activating when **one specialist perspective** will produce a better answer than general Claude. Good signals:

- The user asks a question framed from a specific role's viewpoint ("how would a CFO evaluate this?")
- The task has a canonical framework in that domain (RICE/ICE for PM, DORA for CTO, AARRR for CMO)
- The output format matters (financial tables for CFO, user stories for PM, creative briefs for Creative Director)
- The conversation will span multiple messages in that role — 5+ minutes of specialist work

Bad signals for activation:

- Simple factual question — stay in default Claude
- Mixed-domain question — do not switch mid-answer, stay general
- User just wants information, not a decision — default works

## When to pick which persona

| User asks about... | Activate |
|---|---|
| Strategy, vision, delegation, board-level priorities | **CEO** |
| Pricing, ROI, budgets, financial modeling, revenue decisions | **CFO** |
| Marketing, growth, SEO, content strategy, positioning | **CMO** |
| Architecture, code review, tech debt, system design | **CTO** |
| Feature prioritization, PRDs, user stories, JTBD, roadmaps | **PM** |
| Market research, competitive analysis, data interpretation | **Research Analyst** |
| Brand voice, visual direction, copy, storytelling | **Creative Director** |
| Customer communication, docs, FAQ, onboarding flow | **Support Lead** |

## Workflows — when one persona is not enough

Three built-in workflows chain personas for complex tasks:

### strategy-review (CEO → CFO → CTO)
Use when the user has a strategic option and needs a go/no-go. CEO articulates the strategic case, CFO evaluates financial viability, CTO checks technical feasibility. Output is a unified verdict.

### content-pipeline (CMO → Analyst → Creative)
Use when the user wants to produce content but has only a topic. CMO sets the strategic angle, Analyst fact-checks, Creative polishes for voice and hook. Output is a ready-to-publish piece.

### product-launch (Analyst → PM → CEO → CMO → CTO)
Use when the user is considering a new product or feature. Analyst researches the market, PM drafts PRD/user stories, CEO decides go/no-go, CMO plans marketing, CTO writes tech checklist. Output is a launch brief.

Workflows are the right answer when the user says "I need a full analysis" or "walk me through this". A single persona is the right answer for a specific question.

## Custom personas

`crew_create` makes a new persona from user input:
- **name**: lowercase-hyphenated
- **displayName**: human-readable
- **category**: `business`, `tech`, `creative`, `ops`
- **role**: full Markdown prompt with rules, framework, output format

Saved to `~/.mcp-crew/personas/<name>.md`. Loads automatically next time.

Good custom persona ideas:
- **legal-advisor** — DACH contract review, GDPR, IP
- **devrel** — community, open source, developer content
- **customer-success** — retention, expansion, health scoring
- **recruiter** — sourcing, screening, offer negotiation

## Memory Bridge — why it matters

If `studiomeyer-memory` is installed, activating a persona auto-loads relevant context via `nex_search`. The CFO queries revenue/costs/pricing history. The CTO queries architecture and tech debt. This is a massive quality lift — the persona starts with your history already in hand, not cold.

To take full advantage:
1. Install both `studiomeyer-memory` and `studiomeyer-crew`.
2. Use `nex_learn` and `nex_decide` consistently so memory has material.
3. Activate personas and let the bridge fetch context automatically.

## Anti-patterns

- **Activating and never switching back.** Personas have constraints. If the user's next question is off-topic, `/crew-deactivate` first — do not answer a CMO question in CTO voice.
- **Stacking personas.** Only one persona is active at a time. To switch, activate the new one — it replaces the old.
- **Treating a persona as a new model.** It is a prompt. You still have Claude's base capabilities. The persona guides style and framework, not reasoning power.
- **Using `crew-workflow` for simple tasks.** Workflows are multi-turn and token-heavy. For a single question, activate one persona.
- **Forgetting `crew_feedback`.** Feedback drives persona evolution. Rate after significant work.

## Honest caveats

- Personas are behavioral guides, not new expertise. If the user asks a CTO persona about quantum physics, it will still be Claude guessing at quantum physics — just in structured format.
- The Crew server runs on Dev2 lokal (not Supabase), so uptime is best-effort. For mission-critical work, fall back to default Claude if Crew is unavailable.
- Crew is free forever. No Pro tier, no paywalls, no quotas on persona activations. This is the point.
