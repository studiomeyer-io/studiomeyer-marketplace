#!/usr/bin/env node
// StudioMeyer Marketplace, fact checker.
//
// Every number this repository states in public lives in facts.json. This
// script holds the surfaces against it. It exists because the numbers used to
// live in each surface separately and drifted apart: the Academy stood at 21
// tools in three files and 23 in three others, and only a measurement settled
// which was right (neither, for the default install: it is 12).
//
// Two directions, both needed:
//   1. Positive. Each product's tool count must appear on each of its listed
//      surfaces. A surface that stopped stating the number is a surface that
//      quietly lost the fact.
//   2. Negative. Numbers that were once wrong in public must not come back.
//      A checker that only looks for the right value stays green while the
//      wrong one sits two lines below it.
//
// Run with: node tests/validate-facts.mjs

import { readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const errors = [];
let checks = 0;
const ok = (m) => (checks++, console.log(`  ✓ ${m}`));
const fail = (m) => (checks++, errors.push(m), console.log(`  ✗ ${m}`));

const facts = JSON.parse(readFileSync(join(ROOT, "facts.json"), "utf8"));

console.log("StudioMeyer Marketplace, fact checker");
console.log("=====================================\n");

// ---------------------------------------------------------------------------
// 1. Every stated number appears on every surface that should state it.
// ---------------------------------------------------------------------------
console.log("1. Numbers present on their surfaces");

for (const [product, spec] of Object.entries(facts.products)) {
  // Which counts this product publishes, and how the number may be written.
  const counts = [];
  if (spec.toolCount) counts.push(["toolCount", spec.toolCount]);
  if (spec.toolCountPublic) counts.push(["toolCountPublic", spec.toolCountPublic]);
  if (spec.toolCountWithKey) counts.push(["toolCountWithKey", spec.toolCountWithKey]);
  if (spec.personaCount) counts.push(["personaCount", spec.personaCount]);

  for (const surface of spec.surfaces) {
    const path = join(ROOT, surface);
    if (!existsSync(path)) { fail(`${product}: surface ${surface} does not exist`); continue; }
    const text = readFileSync(path, "utf8");

    // A plugin.json only speaks about its own product; a shared surface
    // (README, ECOSYSTEM, pricing) speaks about all of them.
    const isOwnManifest = surface.includes(`studiomeyer-${product}/`);
    const isSharedSurface = !surface.includes("/studiomeyer-");

    for (const [label, value] of counts) {
      // Written as "56", "56 tools", "13 personas" or inside a table cell.
      const present = new RegExp(`(^|[^\\d.,])${value}([^\\d.,%]|$)`, "m").test(text);
      if (present) {
        ok(`${product}.${label} = ${value} appears in ${surface}`);
      } else if (isOwnManifest || isSharedSurface) {
        fail(`${product}.${label} = ${value} is missing from ${surface}. Either the surface lost the fact or facts.json is stale.`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Numbers that were once wrong in public must not come back.
// ---------------------------------------------------------------------------
console.log("\n2. Numbers that must stay gone");

// SUBMISSIONS.md and the submission script count as public. Their text is
// copy-pasted into third-party listings, which is the worst place for a stale
// number: we cannot edit it afterwards. Both carried "4 hosted plugins" and
// "119 MCP tools" five months after the Academy landed and the counts moved.
const publicSurfaces = [
  ".claude-plugin/marketplace.json",
  "README.md",
  "ECOSYSTEM.md",
  "SUBMISSIONS.md",
  "scripts/submit-chat2anyllm.sh",
  "docs/pricing.md",
  "docs/faq.md",
  ...Object.keys(facts.products).map((p) => `plugins/studiomeyer-${p}/.claude-plugin/plugin.json`),
  ...Object.keys(facts.products).map((p) => `plugins/studiomeyer-${p}/README.md`),
];

for (const entry of facts.forbiddenNumbers.entries) {
  let seen = false;
  for (const surface of publicSurfaces) {
    const path = join(ROOT, surface);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    // Match the wording loosely: "23 tools", "23 Tools", "23  tools".
    const rx = new RegExp(entry.pattern.replace(/\s+/g, "\\s+"), "i");
    if (rx.test(text)) {
      fail(`"${entry.pattern}" is back in ${surface}. ${entry.why}.`);
      seen = true;
    }
  }
  if (!seen) ok(`"${entry.pattern}" stays gone (${entry.why})`);
}

// ---------------------------------------------------------------------------
// 3. The checker must have something to check.
// ---------------------------------------------------------------------------
console.log("\n3. The checker itself");

// A positive list that matches nothing is green and worthless. Hold it to a
// floor so an emptied facts.json or a renamed surface goes red.
const FLOOR = 20;
if (checks < FLOOR) {
  fail(`only ${checks} checks ran, expected at least ${FLOOR}. facts.json or the surface list has been gutted.`);
} else {
  ok(`${checks} checks ran, above the floor of ${FLOOR}`);
}

console.log("\n=====================================");
console.log(`Checks: ${checks}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log("\n❌ FACT CHECK FAILED\n");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log("\n✅ OK");
process.exit(0);
