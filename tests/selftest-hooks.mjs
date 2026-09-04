#!/usr/bin/env node
// Mutation proof for tests/validate-hooks.mjs.
//
// A validator that has never been seen to fail is green and worthless. Every
// case below plants one of the bugs that actually shipped in this repository
// and asserts the validator goes red with the right reason. If someone
// weakens a rule, this test goes red instead of the rule going quiet.
//
// Run with: node tests/selftest-hooks.mjs

import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync, chmodSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

let passed = 0;
const failures = [];

/** Run the validator against a throwaway copy of the repo. */
function runValidator(mutate) {
  const dir = mkdtempSync(join(tmpdir(), "sm-hooks-"));
  try {
    cpSync(join(ROOT, "plugins"), join(dir, "plugins"), { recursive: true });
    cpSync(join(ROOT, "tests"), join(dir, "tests"), { recursive: true });
    if (mutate) mutate(dir);
    try {
      const out = execFileSync(process.execPath, [join(dir, "tests", "validate-hooks.mjs")], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
      return { code: 0, out };
    } catch (e) {
      return { code: e.status ?? 1, out: `${e.stdout ?? ""}${e.stderr ?? ""}` };
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const hooksPath = (dir, plugin) => join(dir, "plugins", plugin, "hooks", "hooks.json");
const readHooks = (dir, plugin) => JSON.parse(readFileSync(hooksPath(dir, plugin), "utf8"));
const writeHooks = (dir, plugin, data) =>
  writeFileSync(hooksPath(dir, plugin), JSON.stringify(data, null, 2));

/** Assert that a mutation is caught, and that the message names the cause. */
function expectCaught(label, expectedFragment, mutate) {
  const { code, out } = runValidator(mutate);
  if (code === 0) {
    failures.push(`${label}: validator stayed GREEN. The rule does not bite.`);
    console.log(`  ✗ ${label}`);
    return;
  }
  if (!out.includes(expectedFragment)) {
    failures.push(`${label}: went red, but for the wrong reason. Expected to see "${expectedFragment}".`);
    console.log(`  ✗ ${label} (red, wrong reason)`);
    return;
  }
  passed++;
  console.log(`  ✓ ${label}`);
}

console.log("Hook validator, mutation proof");
console.log("==============================\n");

console.log("0. The tree as committed");
{
  const { code, out } = runValidator(null);
  if (code === 0) { passed++; console.log("  ✓ clean tree passes"); }
  else { failures.push("clean tree FAILS validation"); console.log(`  ✗ clean tree fails\n${out}`); }
}

console.log("\n1. Bugs that actually shipped");

expectCaught(
  "bare server key instead of the scoped plugin name",
  "never resolves",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.UserPromptSubmit[0].hooks[0].server = "studiomeyer-memory";
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "${user_prompt}, a field UserPromptSubmit does not deliver",
  "is not in the UserPromptSubmit hook input",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.UserPromptSubmit[0].hooks[0].input.query = "${user_prompt}";
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "an if-filter on Stop, which drops the hook",
  "drops the hook entirely",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.Stop = [{ hooks: [{
      type: "mcp_tool",
      server: "plugin:studiomeyer-memory:studiomeyer-memory",
      tool: "nex_search",
      input: { query: "x" },
      timeout: 10,
      if: "Edit(*.md)",
    }] }];
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "an if-filter holding four rules at once",
  "more than one permission rule",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-crm");
    h.hooks.PostToolUse = [{ hooks: [{
      type: "mcp_tool",
      server: "plugin:studiomeyer-crm:studiomeyer-crm",
      tool: "crm_search",
      input: { query: "x" },
      timeout: 10,
      if: "Edit(*email*)|Write(*email*)|Edit(*draft*)|Write(*draft*)",
    }] }];
    writeHooks(dir, "studiomeyer-crm", h);
  },
);

expectCaught(
  "snake_case argument where the server wants camelCase",
  'has no parameter "session_id"',
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.SessionEnd[0].hooks[0].input = { session_id: "${session_id}" };
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "a tool call missing every required argument",
  'requires "companyId"',
  (dir) => {
    const h = readHooks(dir, "studiomeyer-crm");
    h.hooks.PostToolUse = [{ matcher: "Edit|Write", hooks: [{
      type: "mcp_tool",
      server: "plugin:studiomeyer-crm:studiomeyer-crm",
      tool: "crm_log_interaction",
      input: { type: "email-draft", summary: "x" },
      timeout: 10,
    }] }];
    writeHooks(dir, "studiomeyer-crm", h);
  },
);

expectCaught(
  "a matcher without the scoped plugin tool prefix",
  "never fires for a plugin-bundled tool",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-academy");
    h.hooks.PostToolUse[0].matcher = "mcp__studiomeyer-academy__academy_progress_complete";
    writeHooks(dir, "studiomeyer-academy", h);
  },
);

expectCaught(
  "a recipe.json left behind as a second source of hook config",
  "second source of hook config",
  (dir) => {
    writeFileSync(join(dir, "plugins", "studiomeyer-geo", "hooks", "recipe.json"), "{}");
  },
);

console.log("\n2. Bugs the same shape could still produce");

expectCaught(
  "a substituted value aimed at a numeric parameter",
  "substitution always yields a string",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-academy");
    h.hooks.PostToolUse[0].hooks[0].input.level = "${tool_input.level}";
    writeHooks(dir, "studiomeyer-academy", h);
  },
);

expectCaught(
  "a tool that is not in the declared schema list",
  "is not in hooks/tools.json",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.UserPromptSubmit[0].hooks[0].tool = "nex_recall_everything";
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "an mcp_tool hook in a plugin with no declared tool schemas",
  "no hooks/tools.json",
  (dir) => {
    // Crew ships one command hook and no tools.json. Adding an mcp_tool hook
    // must not silently switch the argument rules off.
    const h = readHooks(dir, "studiomeyer-crew");
    h.hooks.UserPromptSubmit = [{ hooks: [{
      type: "mcp_tool",
      server: "plugin:studiomeyer-crew:studiomeyer-crew",
      tool: "crew_status",
      input: {},
      timeout: 10,
    }] }];
    writeHooks(dir, "studiomeyer-crew", h);
  },
);

expectCaught(
  "a matcher on an event that carries no tool name",
  "carries no tool name",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.UserPromptSubmit[0].matcher = "Edit|Write";
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "a plugin script referenced by an absolute home path",
  "machine-specific path",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-crew");
    h.hooks.SessionStart[0].hooks[0].command = "bash /home/me/.claude/hooks/crew-auto-persona.sh";
    writeHooks(dir, "studiomeyer-crew", h);
  },
);

expectCaught(
  "a plugin script that lost its executable bit",
  "is not executable",
  (dir) => {
    chmodSync(join(dir, "plugins", "studiomeyer-crew", "hooks", "crew-auto-persona.sh"), 0o644);
  },
);

expectCaught(
  "a prompt hook on SessionStart, which accepts only command and mcp_tool",
  "accepts only command and mcp_tool",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-crew");
    h.hooks.SessionStart[0].hooks.push({ type: "prompt", prompt: "hi", timeout: 10 });
    writeHooks(dir, "studiomeyer-crew", h);
  },
);

expectCaught(
  "an mcp_tool hook with no timeout",
  'needs a numeric "timeout"',
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    delete h.hooks.UserPromptSubmit[0].hooks[0].timeout;
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

expectCaught(
  "an event name that does not exist",
  "unknown hook event",
  (dir) => {
    const h = readHooks(dir, "studiomeyer-memory");
    h.hooks.OnEveryTuesday = h.hooks.UserPromptSubmit;
    delete h.hooks.UserPromptSubmit;
    writeHooks(dir, "studiomeyer-memory", h);
  },
);

console.log("\n==============================");
console.log(`Cases passed: ${passed}`);
console.log(`Failures:     ${failures.length}`);

if (failures.length > 0) {
  console.log("\n❌ MUTATION PROOF FAILED\n");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("\n✅ OK, every rule bites");
process.exit(0);
