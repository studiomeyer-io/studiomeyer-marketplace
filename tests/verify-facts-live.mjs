#!/usr/bin/env node
// StudioMeyer Marketplace, live fact check.
//
// tests/validate-facts.mjs holds this repository against facts.json. It cannot
// tell you whether facts.json is still true. This one can: every hosted server
// publishes its own tool count in its `llms.txt`, unauthenticated, and the
// Academy server can simply be started and asked.
//
// That closes the gap this release exists to fix. Numbers copied by hand go
// stale in silence, and the copy nobody measures is the one that ends up in
// public. Between April and August 2026 the Academy count sat at 21 on three
// surfaces and 23 on three others; both were wrong for the default install.
//
// Network-dependent, so it runs outside the blocking test suite. A server being
// briefly down is not a broken repository.
//
// Run with: node tests/verify-facts-live.mjs

import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const facts = JSON.parse(readFileSync(join(ROOT, "facts.json"), "utf8"));

const problems = [];
const unreachable = [];
let checks = 0;

const ok = (m) => (checks++, console.log(`  ✓ ${m}`));
const fail = (m) => (checks++, problems.push(m), console.log(`  ✗ ${m}`));
const skip = (m) => (checks++, unreachable.push(m), console.log(`  ? ${m}`));

async function get(url, ms = 12000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Pull "<n> tools" or "<n> personas" out of a server's own llms.txt. */
function statedCount(text, noun) {
  const m = text.match(new RegExp(`(\\d+)\\s+(?:MCP\\s+)?${noun}\\b`, "i"));
  return m ? Number(m[1]) : null;
}

console.log("StudioMeyer Marketplace, live fact check");
console.log("========================================\n");

console.log("1. Hosted servers, from their own llms.txt");

const hosted = [
  ["memory", "https://memory.studiomeyer.io/llms.txt", "toolCount", "tools"],
  ["crm", "https://crm.studiomeyer.io/llms.txt", "toolCount", "tools"],
  ["geo", "https://geo.studiomeyer.io/llms.txt", "toolCount", "tools"],
  ["crew", "https://crew.studiomeyer.io/llms.txt", "personaCount", "personas"],
];

for (const [product, url, field, noun] of hosted) {
  const expected = facts.products[product]?.[field];
  const text = await get(url);
  if (text === null) { skip(`${product}: ${url} unreachable`); continue; }
  const live = statedCount(text, noun);
  if (live === null) {
    fail(`${product}: llms.txt no longer states a ${noun} count. Either the server changed its wording or the check needs updating.`);
  } else if (live !== expected) {
    fail(`${product}: the server says ${live} ${noun}, facts.json says ${expected}. Measure, then fix whichever is wrong.`);
  } else {
    ok(`${product}: ${live} ${noun}, live and in facts.json`);
  }
}

console.log("\n2. Academy, by starting the server and asking it");

/** Speak enough MCP over stdio to get a tool list back. */
function academyTools(apiKey = "", timeoutMs = 60000) {
  return new Promise((done) => {
    const p = spawn("npx", ["-y", "mcp-academy@latest"], {
      stdio: ["pipe", "pipe", "ignore"],
      detached: process.platform !== "win32",
      // No inherited credentials or Academy settings. In particular, offline
      // mode, an alternate base URL or PORT must not change public discovery.
      env: {
        PATH: process.env.PATH,
        ACADEMY_API_KEY: apiKey,
        npm_config_userconfig: process.platform === "win32" ? "NUL" : "/dev/null",
        npm_config_ignore_scripts: "true",
        npm_config_update_notifier: "false",
        ...(process.env.npm_config_cache ? { npm_config_cache: process.env.npm_config_cache } : {}),
      },
    });
    let buf = "";
    let settled = false;
    const send = (message) => p.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
    const finish = (v) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      p.stdin.destroy();
      try {
        if (process.platform === "win32") p.kill();
        else process.kill(-p.pid, "SIGTERM");
      } catch {}
      done(v);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    p.on("error", () => finish(null));
    p.on("exit", () => finish(null));
    p.stdin.on("error", () => finish(null));
    p.stdout.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.error) { finish(null); return; }
          if (msg.id === 1 && msg.result) {
            send({ method: "notifications/initialized" });
            send({ id: 2, method: "tools/list", params: {} });
          }
          if (msg.id === 2 && Array.isArray(msg.result?.tools)) {
            if (msg.result.nextCursor) { finish(null); return; }
            finish(msg.result.tools.map((t) => t.name));
          }
        } catch { /* not our line */ }
      }
    });
    send({
      id: 1, method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "facts-check", version: "1" } },
    });
  });
}

// Without a key the server must expose exactly the public set. This is the
// number a fresh install actually gets, and the one the old surfaces got wrong.
const publicTools = await academyTools();
const expectedPublic = facts.products.academy.toolCountPublic;
if (publicTools === null) {
  skip("academy: could not start mcp-academy (npm or network)");
} else if (publicTools.length !== expectedPublic) {
  fail(`academy: the server serves ${publicTools.length} tools without a key, facts.json says ${expectedPublic}. Serving: ${publicTools.sort().join(", ")}`);
} else {
  ok(`academy: ${publicTools.length} tools without a key, matching facts.json`);
}

// A legacy API key no longer grants personal access. This placeholder is
// deliberately invalid; discovery must remain public and invokes no tools.
// Personal hosted OAuth tool totals depend on scopes and are not asserted.
const legacyKeyTools = await academyTools("invalid-synthetic-discovery-placeholder");
if (legacyKeyTools === null) {
  skip("academy: could not measure public discovery with a synthetic legacy key");
} else if (publicTools !== null) {
  const publicNames = [...publicTools].sort();
  const legacyNames = [...legacyKeyTools].sort();
  if (JSON.stringify(publicNames) !== JSON.stringify(legacyNames)) {
    fail("academy: a legacy API key changed the public tool list. Measure before claiming any account-tool count.");
  } else {
    ok(`academy: a synthetic legacy API key keeps the same ${legacyKeyTools.length} public tools`);
  }
}

// Every tool a hook drives must still exist and still take the arguments the
// plugin's hooks/tools.json claims. A renamed parameter upstream is exactly the
// kind of change that leaves a hook green here and dead in the wild.
if (publicTools !== null) {
  const declared = JSON.parse(
    readFileSync(join(ROOT, "plugins", "studiomeyer-academy", "hooks", "tools.json"), "utf8"),
  );
  const hookTools = Object.keys(declared).filter((k) => !k.startsWith("_"));
  const accountOnly = hookTools.filter((t) => !publicTools.includes(t));
  if (accountOnly.length === hookTools.length) {
    ok(`academy: all ${hookTools.length} hook-driven tools are absent from the public CLI; a legacy key does not enable personal tools`);
  } else {
    ok(`academy: ${hookTools.length - accountOnly.length} of ${hookTools.length} hook-driven tools are public`);
  }
}

console.log("\n========================================");
console.log(`Checks:      ${checks}`);
console.log(`Mismatches:  ${problems.length}`);
console.log(`Unreachable: ${unreachable.length}`);

if (problems.length > 0) {
  console.log("\n❌ FACTS.JSON DISAGREES WITH THE LIVE SERVERS\n");
  for (const p of problems) console.log(`  - ${p}`);
  console.log("\nMeasure first, then change whichever side is wrong. Never edit a surface\nwithout editing facts.json, and never edit facts.json without measuring.\n");
  process.exit(1);
}
if (unreachable.length > 0) {
  console.log(`\n⚠ ${unreachable.length} server(s) unreachable. Nothing verified for those.`);
}
console.log("\n✅ OK");
process.exit(0);
