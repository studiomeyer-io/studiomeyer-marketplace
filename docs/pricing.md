# Pricing

All StudioMeyer plugins use one account. Upgrade once, unlock everywhere applicable.

## Memory: memory.studiomeyer.io

| Tier | Price | Limits |
|---|---|---|
| Free | EUR 0 | 5.000 calls/day, 1.000 learnings, 100 entities, 1 API key |
| Pro | EUR 9/mo | 50.000 calls/day, 25.000 learnings, 1.000 entities, 3 API keys |
| Team | EUR 19/mo | Unlimited calls, unlimited learnings and entities, 20 API keys, team-shared |

All 56 tools are available in every tier. Free tier limits are daily quotas, not feature gates.

## CRM: crm.studiomeyer.io

| Tier | Price | Companies | Contacts | Deals | API calls |
|---|---|---|---|---|---|
| Free | EUR 0 | 50 | 200 | 100 | 5.000/day |
| Pro | EUR 9/mo | 500 | 5.000 | 1.000 | 50.000/day |
| Team | EUR 19/mo | Unlimited | Unlimited | Unlimited | 100.000/day |

All 37 tools are available in every tier. Stripe checkout live for Pro and Team.

## GEO: geo.studiomeyer.io

| Tier | Price | What you get |
|---|---|---|
| Free | EUR 0 | All 30 tools. No paid tier today: GEO is free in full. |

Paid GEO tiers are planned but not bookable, so we do not list a price or a date for them. Managed monitoring and a full GEO service are available as a project, quoted individually.

## Crew: crew.studiomeyer.io

Free. All 13 personas (8 standard roles plus 5 specialists) and all 3 workflows. The tool count still moves between releases, so we do not pin it here. Zero extra API cost because personas run inside your own Claude subscription.

## Academy (studiomeyer.academy)

Free, and there is nothing to buy. All 6 levels and the whole lesson tree are open without an account, served by 12 tools. An Academy API key adds nine more, 21 in total, and those nine are the account side: progress, quizzes, certificates, XP, the personal tutor. Of the 88 recipes, 58 are written and free to read. The other 30 are not on sale either: 25 are placeholders for phases 11 to 15 that still have to be written, and 5 stay internal on purpose. Nothing here sits behind a payment. An account only buys you saved progress, quizzes and certificates.

The MCP server behind it is open source (npm `mcp-academy`, MIT), so this one you can also run yourself.

## What a hook costs you

Nothing here bills per call. The hooks that ship inside the plugins are reads against your
own tenant and count towards your daily quota like any other call. Memory adds one search
per prompt and one write at the end of a session. CRM adds one search per prompt. On the
free tier's 5,000 calls a day that is not the limit you will hit.

GEO ships no hooks, because `geo_check` in search mode costs 0.30 to 0.50 US dollars a run
at the provider. A tool that spends money should not fire without you asking for it.

## How to upgrade

1. Use any plugin until you hit a limit or want Pro features.
2. Visit [studiomeyer.io/services](https://studiomeyer.io) and open the checkout for the plugin you want to upgrade.
3. Stripe checkout, same email you used for the Magic Link. Your tier updates automatically.

No per-API-call billing. No credits. No feature gates inside a tier, only usage quotas.
