#!/usr/bin/env node
// StudioMeyer Marketplace — Hook-Recipe Bundle Validator
// Zero-dependency Node script. Verifies every plugins/{name}/hooks/ directory
// has a valid recipe.json + README.md + install.sh, plus checks the recipe
// schema against the Claude Code v2.1.118 mcp_tool hook contract.
//
// Run with: node tests/validate-hooks.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const errors = [];
const warnings = [];
let checks = 0;

function ok(msg) { checks++; console.log(`  ✓ ${msg}`); }
function fail(msg) { checks++; errors.push(msg); console.log(`  ✗ ${msg}`); }
function warn(msg) { checks++; warnings.push(msg); console.log(`  ! ${msg}`); }

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { fail(`${path}: invalid JSON (${e.message})`); return null; }
}

function fileExists(path) { try { return statSync(path).isFile(); } catch { return false; } }
function dirExists(path) { try { return statSync(path).isDirectory(); } catch { return false; } }

const VALID_EVENTS = new Set([
  "PreToolUse", "PostToolUse", "SessionStart", "SessionEnd",
  "UserPromptSubmit", "Stop", "SubagentStop", "PreCompact",
  "Notification", "PostToolUseFailure", "PermissionRequest",
]);
const VALID_HOOK_TYPES = new Set(["mcp_tool", "command", "http", "prompt"]);

console.log("StudioMeyer Marketplace — Hook-Recipe Validator");
console.log("================================================\n");

const pluginsDir = join(ROOT, "plugins");
if (!dirExists(pluginsDir)) {
  fail("plugins/ directory missing");
  process.exit(1);
}

const pluginNames = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (pluginNames.length === 0) {
  fail("plugins/ is empty");
  process.exit(1);
}

ok(`found ${pluginNames.length} plugin(s)`);

for (const pluginName of pluginNames) {
  console.log(`\n  → ${pluginName}`);
  const hooksDir = join(pluginsDir, pluginName, "hooks");

  if (!dirExists(hooksDir)) {
    warn(`${pluginName}: no hooks/ directory (skipping — plugin has no hook bundle)`);
    continue;
  }

  // Required files
  const recipePath = join(hooksDir, "recipe.json");
  const readmePath = join(hooksDir, "README.md");
  const installPath = join(hooksDir, "install.sh");

  if (!fileExists(recipePath)) {
    fail(`${pluginName}: hooks/recipe.json missing`);
    continue;
  }
  ok(`${pluginName}: hooks/recipe.json exists`);

  if (!fileExists(readmePath)) fail(`${pluginName}: hooks/README.md missing`);
  else ok(`${pluginName}: hooks/README.md exists`);

  if (!fileExists(installPath)) warn(`${pluginName}: hooks/install.sh missing (recommended)`);
  else {
    try {
      const stat = statSync(installPath);
      if (stat.mode & 0o100) ok(`${pluginName}: hooks/install.sh is executable`);
      else warn(`${pluginName}: hooks/install.sh not executable (chmod +x)`);
    } catch {
      warn(`${pluginName}: hooks/install.sh stat failed`);
    }
  }

  // Recipe schema
  const recipe = readJson(recipePath);
  if (!recipe) continue;

  for (const f of ["name", "version", "description", "compatibility", "hooks", "compliance"]) {
    if (recipe[f] === undefined) fail(`${pluginName}: recipe.json missing "${f}"`);
  }

  if (recipe.name && recipe.name !== `${pluginName}-hooks`) {
    warn(`${pluginName}: recipe.json name "${recipe.name}" should be "${pluginName}-hooks" by convention`);
  }

  if (recipe.compatibility) {
    if (!recipe.compatibility.claudeCodeMinVersion) {
      fail(`${pluginName}: recipe.json compatibility.claudeCodeMinVersion missing`);
    } else if (!/^\d+\.\d+\.\d+/.test(recipe.compatibility.claudeCodeMinVersion)) {
      fail(`${pluginName}: claudeCodeMinVersion "${recipe.compatibility.claudeCodeMinVersion}" not semver`);
    } else {
      ok(`${pluginName}: requires Claude Code ≥ ${recipe.compatibility.claudeCodeMinVersion}`);
    }
    if (!recipe.compatibility.mcpServerName) {
      fail(`${pluginName}: recipe.json compatibility.mcpServerName missing`);
    }
  }

  // Hooks structure
  if (recipe.hooks && typeof recipe.hooks === "object") {
    let hookEntryCount = 0;
    for (const event of Object.keys(recipe.hooks)) {
      if (!VALID_EVENTS.has(event)) {
        fail(`${pluginName}: unknown hook event "${event}"`);
        continue;
      }
      if (!Array.isArray(recipe.hooks[event])) {
        fail(`${pluginName}: hooks.${event} must be an array`);
        continue;
      }
      for (const entry of recipe.hooks[event]) {
        if (!Array.isArray(entry.hooks)) {
          fail(`${pluginName}: hooks.${event}[].hooks must be an array`);
          continue;
        }
        for (const h of entry.hooks) {
          hookEntryCount++;
          if (!VALID_HOOK_TYPES.has(h.type)) {
            fail(`${pluginName}: hooks.${event}.hooks[].type "${h.type}" invalid`);
          }
          if (h.type === "mcp_tool") {
            if (!h.server) fail(`${pluginName}: mcp_tool hook missing "server"`);
            else if (h.server !== recipe.compatibility?.mcpServerName) {
              fail(`${pluginName}: mcp_tool server "${h.server}" does not match compatibility.mcpServerName "${recipe.compatibility?.mcpServerName}"`);
            }
            if (!h.tool) fail(`${pluginName}: mcp_tool hook missing "tool"`);
            if (h.input === undefined) warn(`${pluginName}: mcp_tool hook missing "input" (allowed but unusual)`);
            if (typeof h.timeout !== "number") fail(`${pluginName}: mcp_tool hook missing numeric "timeout"`);
            else if (h.timeout > 60) warn(`${pluginName}: timeout ${h.timeout}s exceeds recommended ceiling of 60s`);
            else if (h.timeout < 5) warn(`${pluginName}: timeout ${h.timeout}s is very short — may cause silent failures`);
          }
          if (h.type === "command" && !h.command) {
            fail(`${pluginName}: command hook missing "command"`);
          }
        }
      }
    }
    if (hookEntryCount > 0) ok(`${pluginName}: ${hookEntryCount} hook entry/entries across ${Object.keys(recipe.hooks).length} event(s)`);
    else warn(`${pluginName}: recipe.json has no hook entries`);
  }

  // Compliance fields
  if (recipe.compliance && typeof recipe.compliance === "object") {
    for (const f of ["idempotent", "maxLatencyMs", "deterministic", "sideEffectFreeWithoutTrigger", "gdpr"]) {
      if (recipe.compliance[f] === undefined) fail(`${pluginName}: compliance.${f} missing`);
    }
    if (typeof recipe.compliance.maxLatencyMs === "number" && recipe.compliance.maxLatencyMs > 60000) {
      fail(`${pluginName}: compliance.maxLatencyMs ${recipe.compliance.maxLatencyMs}ms > 60000ms ceiling`);
    }
    if (typeof recipe.compliance.gdpr !== "string" || recipe.compliance.gdpr.length < 30) {
      fail(`${pluginName}: compliance.gdpr must be a descriptive string (>= 30 chars)`);
    } else {
      ok(`${pluginName}: GDPR documented (${recipe.compliance.gdpr.length} chars)`);
    }
  }
}

// ---------------- Result ----------------
console.log("\n================================================");
console.log(`Checks: ${checks}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log("\n❌ HOOK-RECIPE VALIDATION FAILED\n");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} warning(s) — non-blocking`);
}
console.log("\n✅ OK");
process.exit(0);
