#!/usr/bin/env node
// StudioMeyer Marketplace, prose checker.
//
// One rule, mechanically held: no em-dash in anything we ship. It is the
// clearest tell that a text came out of a language model, and a reader who
// spots it discounts everything around it. Replace it by function: a colon for
// a definition, a full stop between two clauses (never a comma in English,
// that is a splice), brackets for an aside, a comma for an apposition.
//
// The en-dash stays legal in numeric ranges (5-15s, 2026-09-04).
//
// Run with: node tests/validate-prose.mjs

import { readdirSync, readFileSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Every form is built from its codepoint on purpose. Writing any of them
// literally would make this file its own first offender, and a checker that
// trips over itself gets deleted rather than fixed. It also gets the file past
// the same guard that protects every other write in this repository.
const CODEPOINT = 0x2014;
const EM_DASH = String.fromCharCode(CODEPOINT);
// The HTML entities render as the identical character. A reader sees no
// difference; only a naive checker does, which is how they used to slip past.
const HTML_FORMS = [
  "&" + "mdash;",
  "&#" + CODEPOINT.toString(10) + ";",
  "&#x" + CODEPOINT.toString(16) + ";",
];
const ALL_FORMS = [EM_DASH, ...HTML_FORMS];

const SKIP_DIRS = new Set([".git", "node_modules"]);
const CHECKED_EXT = new Set([".md", ".json", ".mjs", ".js", ".sh", ".yml", ".yaml", ".txt"]);

// This file spells out what it forbids, so it cannot check itself.
const SELF = relative(ROOT, fileURLToPath(import.meta.url));

const findings = [];
let filesChecked = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const dot = entry.name.lastIndexOf(".");
    if (dot < 0) continue;
    if (!CHECKED_EXT.has(entry.name.slice(dot))) continue;
    const rel = relative(ROOT, full);
    if (rel === SELF) continue;
    filesChecked++;
    readFileSync(full, "utf8").split("\n").forEach((line, i) => {
      if (ALL_FORMS.some((f) => line.includes(f))) {
        findings.push({ file: rel, line: i + 1, text: line.trim().slice(0, 110) });
      }
    });
  }
}

console.log("StudioMeyer Marketplace, prose checker");
console.log("======================================\n");

walk(ROOT);

console.log(`Files checked: ${filesChecked}`);
console.log(`Findings:      ${findings.length}`);

// A checker that walks nothing is green and worthless.
const FLOOR = 40;
if (filesChecked < FLOOR) {
  console.log(`\n❌ only ${filesChecked} files walked, expected at least ${FLOOR}. The walk is broken.`);
  process.exit(1);
}

if (findings.length > 0) {
  console.log("\n❌ EM-DASH FOUND IN SHIPPED TEXT\n");
  for (const f of findings) console.log(`  ${f.file}:${f.line}\n    ${f.text}`);
  console.log(`
Replace by function, do not just delete:
  definition in a list   ->  colon        \`tool_name\`: what it does
  two full clauses       ->  full stop    It is free. Forever.
  aside inside a clause  ->  brackets     the result (not the intent) counts
  apposition at the end  ->  comma        the API, settings included

To edit these files, build the character from its codepoint: chr(8212) in
Python. A guard blocks any write whose payload contains it literally, and that
includes your search pattern.
`);
  process.exit(1);
}

console.log("\n✅ OK");
process.exit(0);
