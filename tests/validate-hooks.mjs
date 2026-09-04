#!/usr/bin/env node
// StudioMeyer Marketplace, hook validator.
//
// This validator checks whether a hook CAN FIRE, not whether its JSON has the
// right shape. The predecessor only checked shape, stayed green, and shipped
// twelve hooks of which every single one was dead:
//
//   * `server` held the bare server key. A plugin-bundled MCP server registers
//     as `plugin:<plugin>:<server>`, so the lookup never found it.
//   * `${user_prompt}` does not exist. The UserPromptSubmit field is `prompt`,
//     so the query substituted to the empty string.
//   * An `if` field on Stop drops the hook entirely (Claude Code can only
//     evaluate `if` on tool events).
//   * `if` took four alternatives at once. Permission rules take exactly one.
//   * A matcher for the plugin's own MCP tool used the bare `mcp__<server>__`
//     prefix instead of the scoped `mcp__plugin_<plugin>_<server>__`.
//   * Tool arguments used names the servers do not have (`session_id` for
//     `sessionId`, `lesson_slug` for `slug`) and omitted required ones.
//
// Every rule below exists because one of those got through. Run with:
//   node tests/validate-hooks.mjs
// Prove the rules still bite with:
//   node tests/selftest-hooks.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// What Claude Code actually accepts. Measured against 2.1.226, not remembered.
// ---------------------------------------------------------------------------

// Fields present in every hook's JSON input, from the common-input builder.
const COMMON_INPUT_FIELDS = [
  "session_id",
  "transcript_path",
  "cwd",
  "prompt_id",
  "permission_mode",
  "agent_id",
  "agent_type",
  "effort",
  "hook_event_name",
];

// Event-specific input fields, on top of the common ones.
const EVENT_INPUT_FIELDS = {
  PreToolUse: ["tool_name", "tool_input", "tool_use_id"],
  PostToolUse: ["tool_name", "tool_input", "tool_response", "tool_use_id", "duration_ms"],
  PostToolUseFailure: ["tool_name", "tool_input", "tool_use_id", "error", "error_details"],
  PermissionRequest: ["tool_name", "tool_input", "tool_use_id"],
  PermissionDenied: ["tool_name", "tool_input", "tool_use_id"],
  UserPromptSubmit: ["prompt", "session_title"],
  SessionStart: ["source", "model", "session_title"],
  SessionEnd: ["reason"],
  Stop: ["stop_hook_active", "last_assistant_message", "background_tasks", "session_crons"],
  SubagentStop: [
    "stop_hook_active",
    "last_assistant_message",
    "agent_transcript_path",
    "background_tasks",
    "session_crons",
  ],
  PreCompact: ["trigger", "custom_instructions"],
  PostCompact: ["trigger"],
  Notification: ["message", "title", "notification_type"],
};

const VALID_EVENTS = new Set(Object.keys(EVENT_INPUT_FIELDS));

// `if` is only evaluated on tool events. On any other event Claude Code logs
// "cannot be evaluated for non-tool event" and drops the hook.
const IF_CAPABLE_EVENTS = new Set([
  "PreToolUse",
  "PostToolUse",
  "PostToolUseFailure",
  "PermissionRequest",
  "PermissionDenied",
]);

// SessionStart and Setup accept command and mcp_tool only.
const HOOK_TYPES_BY_EVENT = {
  SessionStart: new Set(["command", "mcp_tool"]),
};
const VALID_HOOK_TYPES = new Set(["command", "http", "mcp_tool", "prompt", "agent"]);

// A `matcher` is only consulted on events that carry a tool name.
const MATCHER_EVENTS = IF_CAPABLE_EVENTS;

const errors = [];
const warnings = [];
let checks = 0;

const ok = (m) => (checks++, console.log(`  ✓ ${m}`));
const fail = (m) => (checks++, errors.push(m), console.log(`  ✗ ${m}`));
const warn = (m) => (checks++, warnings.push(m), console.log(`  ! ${m}`));

const isFile = (p) => { try { return statSync(p).isFile(); } catch { return false; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { fail(`${path}: invalid JSON (${e.message})`); return null; }
}

/**
 * Server keys a plugin bundles, read from its own .mcp.json.
 * Both shapes are accepted by Claude Code: {mcpServers:{...}} and a bare map.
 */
function bundledServerKeys(pluginDir) {
  const p = join(pluginDir, ".mcp.json");
  if (!isFile(p)) return [];
  const raw = readJson(p);
  if (!raw) return [];
  return Object.keys(raw.mcpServers ?? raw);
}

/** The name a plugin-bundled MCP server registers under. */
const scopedServer = (plugin, key) => `plugin:${plugin}:${key}`;

/** The callable tool prefix for a plugin-bundled server. */
const scopedToolPrefix = (plugin, key) =>
  `mcp__plugin_${normalize(plugin)}_${normalize(key)}__`;

/** Claude Code replaces every character outside [a-zA-Z0-9_-] with "_". */
const normalize = (s) => s.replace(/[^a-zA-Z0-9_-]/g, "_");

/** Every ${...} placeholder in a value tree, including nested objects. */
function placeholders(value, out = []) {
  if (typeof value === "string") {
    for (const m of value.matchAll(/\$\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g)) out.push(m[1]);
  } else if (Array.isArray(value)) {
    for (const v of value) placeholders(v, out);
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) placeholders(v, out);
  }
  return out;
}

/**
 * A permission rule is `Tool` or `Tool(content)`. Claude Code parses exactly
 * one. A top-level "|" means a second rule was appended and silently ignored,
 * so the hook matches something other than what it says.
 * A "|" INSIDE the parentheses is part of the content and is fine.
 */
function hasSecondRule(rule) {
  let depth = 0;
  for (const ch of rule) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "|" && depth === 0) return true;
  }
  return false;
}

/**
 * Tools a plugin's own server exposes, declared in hooks/tools.json.
 * Optional: without it, tool names and arguments cannot be checked, which the
 * validator reports rather than passes over in silence.
 */
function declaredTools(pluginDir) {
  const p = join(pluginDir, "hooks", "tools.json");
  if (!isFile(p)) return null;
  return readJson(p);
}

console.log("StudioMeyer Marketplace, hook validator");
console.log("=======================================\n");

const pluginsDir = join(ROOT, "plugins");
if (!isDir(pluginsDir)) { fail("plugins/ directory missing"); process.exit(1); }

const pluginNames = readdirSync(pluginsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

if (pluginNames.length === 0) { fail("plugins/ is empty"); process.exit(1); }
ok(`found ${pluginNames.length} plugin(s)`);

let totalHookEntries = 0;

for (const plugin of pluginNames) {
  console.log(`\n  → ${plugin}`);
  const pluginDir = join(pluginsDir, plugin);
  const hooksPath = join(pluginDir, "hooks", "hooks.json");

  // A leftover recipe.json or install.sh means a second, unvalidated source of
  // hook config. That is how the dead recipes survived: they were never the
  // file Claude Code loads, so nothing checked them against reality.
  for (const stale of ["recipe.json", "install.sh"]) {
    if (isFile(join(pluginDir, "hooks", stale))) {
      fail(`${plugin}: hooks/${stale} is a second source of hook config. Claude Code loads hooks/hooks.json only.`);
    }
  }

  if (!isFile(hooksPath)) {
    console.log(`  . ${plugin}: no hooks/hooks.json (plugin ships no hooks)`);
    continue;
  }

  const bundle = readJson(hooksPath);
  if (!bundle) continue;
  ok(`${plugin}: hooks/hooks.json parses`);

  if (typeof bundle.description !== "string" || bundle.description.length < 20) {
    fail(`${plugin}: hooks.json needs a description saying what fires and when`);
  }

  if (!bundle.hooks || typeof bundle.hooks !== "object") {
    fail(`${plugin}: hooks.json has no "hooks" object`);
    continue;
  }

  const serverKeys = bundledServerKeys(pluginDir);
  const validServers = new Set(serverKeys.map((k) => scopedServer(plugin, k)));
  const toolSpec = declaredTools(pluginDir);

  // Without tools.json the argument rules below cannot run. A checker that
  // quietly skips what it cannot evaluate is green and worthless, so a plugin
  // that drives any mcp_tool hook must declare the schemas.
  const usesMcpTool = Object.values(bundle.hooks)
    .flat()
    .flatMap((e) => (Array.isArray(e?.hooks) ? e.hooks : []))
    .some((h) => h?.type === "mcp_tool");
  if (!toolSpec && usesMcpTool) {
    fail(`${plugin}: has mcp_tool hooks but no hooks/tools.json, so tool names and arguments go unchecked. Add the measured input schemas.`);
  } else if (!toolSpec) {
    ok(`${plugin}: no mcp_tool hooks, so no tool schemas needed`);
  }

  for (const [event, entries] of Object.entries(bundle.hooks)) {
    if (!VALID_EVENTS.has(event)) { fail(`${plugin}: unknown hook event "${event}"`); continue; }
    if (!Array.isArray(entries)) { fail(`${plugin}: hooks.${event} must be an array`); continue; }

    const allowedFields = new Set([...COMMON_INPUT_FIELDS, ...(EVENT_INPUT_FIELDS[event] ?? [])]);

    for (const entry of entries) {
      // A matcher on an event without a tool name is silently ignored, so the
      // hook fires far more often than its author intended.
      if (entry.matcher !== undefined && !MATCHER_EVENTS.has(event)) {
        fail(`${plugin}: hooks.${event} has a matcher, but ${event} carries no tool name. It is ignored and the hook fires every time.`);
      }

      if (entry.if !== undefined) {
        fail(`${plugin}: hooks.${event} carries "if" at entry level. Put it on the individual hook.`);
      }

      if (!Array.isArray(entry.hooks)) { fail(`${plugin}: hooks.${event}[].hooks must be an array`); continue; }

      for (const h of entry.hooks) {
        totalHookEntries++;
        const where = `${plugin}: ${event}/${h.tool ?? h.type}`;

        if (!VALID_HOOK_TYPES.has(h.type)) { fail(`${where}: hook type "${h.type}" is not one of ${[...VALID_HOOK_TYPES].join(", ")}`); continue; }

        const allowedTypes = HOOK_TYPES_BY_EVENT[event];
        if (allowedTypes && !allowedTypes.has(h.type)) {
          fail(`${where}: ${event} accepts only ${[...allowedTypes].join(" and ")} hooks, not "${h.type}"`);
        }

        // Rule: `if` only bites on tool events. Anywhere else it kills the hook.
        if (h.if !== undefined) {
          if (!IF_CAPABLE_EVENTS.has(event)) {
            fail(`${where}: "if" on ${event} drops the hook entirely. Claude Code can only evaluate "if" on ${[...IF_CAPABLE_EVENTS].join(", ")}.`);
          } else if (typeof h.if !== "string" || h.if.trim() === "") {
            fail(`${where}: "if" must be a non-empty permission rule`);
          } else if (hasSecondRule(h.if)) {
            fail(`${where}: "if" holds more than one permission rule ("${h.if}"). Only the first is used. Split into separate hook entries.`);
          } else {
            ok(`${where}: "if" is a single rule on a tool event`);
          }
        }

        // Rule: every placeholder must be a field this event actually delivers.
        for (const ph of placeholders(h.input ?? h.command ?? h.prompt ?? h.url ?? "")) {
          const rootField = ph.split(".")[0];
          if (rootField.startsWith("CLAUDE_") || rootField === "user_config") continue;
          if (!allowedFields.has(rootField)) {
            fail(`${where}: \${${ph}} is not in the ${event} hook input. It substitutes to the empty string. Available: ${[...allowedFields].sort().join(", ")}`);
          }
        }

        if (h.type === "mcp_tool") {
          if (!h.server) {
            fail(`${where}: mcp_tool hook has no "server"`);
          } else if (serverKeys.length === 0) {
            warn(`${where}: plugin bundles no MCP server, so "${h.server}" must come from the user's own config`);
          } else if (!validServers.has(h.server)) {
            fail(`${where}: server "${h.server}" never resolves. A plugin-bundled server registers as ${[...validServers].join(" or ")}.`);
          } else {
            ok(`${where}: server resolves to ${h.server}`);
          }

          if (!h.tool) fail(`${where}: mcp_tool hook has no "tool"`);
          if (h.input === undefined) fail(`${where}: mcp_tool hook has no "input" (pass {} if the tool takes none)`);
          if (typeof h.timeout !== "number") fail(`${where}: mcp_tool hook needs a numeric "timeout" in seconds`);
          else if (h.timeout > 60) warn(`${where}: timeout ${h.timeout}s is above the 60s ceiling we hold ourselves to`);
          else if (h.timeout < 5) warn(`${where}: timeout ${h.timeout}s is short enough to fail silently under load`);

          // Rule: the tool must exist, its arguments must be real, its required
          // arguments must be present, and no substituted value may target a
          // non-string parameter. Substitution always yields a string.
          if (toolSpec && h.tool) {
            const spec = toolSpec[h.tool];
            if (!spec) {
              fail(`${where}: tool "${h.tool}" is not in hooks/tools.json. Either the tool does not exist or the list is stale.`);
            } else {
              const known = new Set(Object.keys(spec.properties ?? {}));
              for (const arg of Object.keys(h.input ?? {})) {
                if (!known.has(arg)) {
                  fail(`${where}: "${h.tool}" has no parameter "${arg}". It accepts: ${[...known].sort().join(", ") || "nothing"}`);
                }
                const declaredType = spec.properties?.[arg]?.type;
                const value = h.input[arg];
                if (declaredType && declaredType !== "string" && typeof value === "string" && /\$\{/.test(value)) {
                  fail(`${where}: "${arg}" is declared ${declaredType}, but substitution always yields a string.`);
                }
              }
              for (const req of spec.required ?? []) {
                if (!(req in (h.input ?? {}))) {
                  fail(`${where}: "${h.tool}" requires "${req}" and the hook does not pass it.`);
                }
              }
              ok(`${where}: arguments match the tool schema`);
            }
          }
        }

        if (h.type === "command" && !h.command) fail(`${where}: command hook has no "command"`);
        if (h.type === "http" && !h.url) fail(`${where}: http hook has no "url"`);

        // A plugin script referenced by an absolute or home path breaks on any
        // machine but the author's. ${CLAUDE_PLUGIN_ROOT} is the portable form.
        if (h.type === "command" && typeof h.command === "string") {
          if (/(^|\s)(~|\/home\/|\/Users\/)/.test(h.command)) {
            fail(`${where}: command points at a machine-specific path. Use \${CLAUDE_PLUGIN_ROOT}.`);
          }
          const scriptRef = h.command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([\w./-]+)/);
          if (scriptRef) {
            const scriptPath = join(pluginDir, scriptRef[1]);
            if (!isFile(scriptPath)) fail(`${where}: command references ${scriptRef[1]}, which is not in the plugin`);
            else if (!(statSync(scriptPath).mode & 0o100)) fail(`${where}: ${scriptRef[1]} is not executable`);
            else ok(`${where}: runs ${scriptRef[1]} from the plugin root`);
          }
        }

        // Rule: a matcher aimed at the plugin's own MCP tools must carry the
        // scoped prefix. The bare mcp__<server>__ form never matches.
        if (entry.matcher && /^mcp__/.test(entry.matcher)) {
          const wanted = serverKeys.map((k) => scopedToolPrefix(plugin, k));
          if (wanted.length && !wanted.some((p) => entry.matcher.startsWith(p))) {
            fail(`${plugin}: matcher "${entry.matcher}" never fires for a plugin-bundled tool. Use ${wanted.join(" or ")}<tool>.`);
          } else if (wanted.length) {
            ok(`${plugin}: matcher uses the scoped plugin tool prefix`);
          }
        }
      }
    }
  }
}

console.log("\n=======================================");
console.log(`Hook entries: ${totalHookEntries}`);
console.log(`Checks:       ${checks}`);
console.log(`Errors:       ${errors.length}`);
console.log(`Warnings:     ${warnings.length}`);

if (errors.length > 0) {
  console.log("\n❌ HOOK VALIDATION FAILED\n");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
if (warnings.length > 0) {
  console.log(`\n⚠ ${warnings.length} warning(s), non-blocking`);
}
console.log("\n✅ OK");
process.exit(0);
