#!/usr/bin/env node
// Live E2E Smoke Test: hits every hosted MCP endpoint and verifies reachability
// and baseline MCP protocol compliance. Run with: node tests/smoke.mjs

import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const results = [];
let hardFail = false;

function ok(name, msg) {
  results.push({ name, status: "ok", msg });
  console.log(`  ✓ ${name}: ${msg}`);
}
function fail(name, msg) {
  hardFail = true;
  results.push({ name, status: "fail", msg });
  console.log(`  ✗ ${name}: ${msg}`);
}
function warn(name, msg) {
  results.push({ name, status: "warn", msg });
  console.log(`  ! ${name}: ${msg}`);
}

async function fetchWithTimeout(url, opts = {}, ms = 10000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctl.signal });
  } finally {
    clearTimeout(t);
  }
}

export function healthUrlFor(mcpUrl) {
  const url = new URL(mcpUrl);
  if (!/\/(?:mcp|mcp-directory)\/?$/.test(url.pathname)) {
    throw new Error(`No known health route for ${url.pathname}`);
  }
  url.pathname = url.pathname.replace(/\/(?:mcp|mcp-directory)\/?$/, "/health");
  url.search = "";
  url.hash = "";
  return url.href;
}

export function isMcpAliveStatus(status) {
  // Explicit protocol/auth responses only. Missing routes must never pass.
  return [200, 202, 400, 401, 403, 406, 415].includes(status);
}

export function rawManifestTarget(env, event, localHead) {
  const ref = event?.pull_request?.head?.sha || env.GITHUB_SHA || localHead;
  if (!/^[a-f0-9]{40}$/i.test(ref)) throw new Error("Expected an immutable Git commit SHA");
  return `https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/${ref}/.claude-plugin/marketplace.json`;
}

async function checkHealth(pluginName, url) {
  const healthUrl = healthUrlFor(url);
  try {
    const r = await fetchWithTimeout(healthUrl, {}, 8000);
    if (r.status === 200) ok(`${pluginName} health`, `${healthUrl} → 200`);
    else fail(`${pluginName} health`, `${healthUrl} → ${r.status}`);
  } catch (e) {
    fail(`${pluginName} health`, `${healthUrl}: ${e.message}`);
  }
}

async function checkMcpEndpoint(pluginName, url) {
  // Probe a request without credentials. Auth or protocol rejection is expected;
  // this reachability test does not replace an authenticated tool scan.
  try {
    const r = await fetchWithTimeout(
      url,
      { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
      8000
    );
    if (!isMcpAliveStatus(r.status)) {
      fail(`${pluginName} mcp`, `${url} → ${r.status} (not a supported MCP response)`);
    } else {
      ok(`${pluginName} mcp`, `${url} → ${r.status} (endpoint alive)`);
    }
  } catch (e) {
    fail(`${pluginName} mcp`, `${url}: ${e.message}`);
  }
}

async function checkGitHubRaw() {
  const event = process.env.GITHUB_EVENT_PATH
    ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"))
    : null;
  const localHead = execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
  const url = rawManifestTarget(process.env, event, localHead);
  try {
    const r = await fetchWithTimeout(url, {}, 8000);
    if (r.status !== 200) {
      fail("github raw", `${url} → ${r.status}`);
      return;
    }
    const data = await r.json();
    // Compare the exact tested branch/PR revision, never main against a PR.
    // Compare the full manifest so changed names or endpoints also fail.
    const local = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "marketplace.json"), "utf8"));
    if (!Array.isArray(data.plugins)) {
      fail("github raw", "manifest has no plugins array");
    } else if (isDeepStrictEqual(data, local)) {
      ok("github raw", `${url} matches the checkout (${data.plugins.length} plugins)`);
    } else {
      fail("github raw", `${url} differs from the checked-out marketplace manifest`);
    }
  } catch (e) {
    fail("github raw", e.message);
  }
}

async function main() {
  console.log("StudioMeyer Marketplace Smoke Test");
  console.log("==================================\n");

  console.log("1. GitHub raw marketplace.json");
  await checkGitHubRaw();

  console.log("\n2. Hosted MCP endpoints (from local .mcp.json files)");
  const mfPath = join(ROOT, ".claude-plugin", "marketplace.json");
  const mf = JSON.parse(readFileSync(mfPath, "utf8"));

  for (const entry of mf.plugins) {
    const mcpPath = join(ROOT, entry.source.replace(/^\.\//, ""), ".mcp.json");
    const mcp = JSON.parse(readFileSync(mcpPath, "utf8"));
    for (const [serverName, cfg] of Object.entries(mcp.mcpServers)) {
      if (!cfg.url) continue;
      console.log(`  → ${entry.name} (${cfg.url})`);
      await checkHealth(entry.name, cfg.url);
      await checkMcpEndpoint(entry.name, cfg.url);
    }
  }

  console.log("\n3. MCPize mirrors (optional: expected to also be live)");
  const mcpizeUrls = {
    "studiomeyer-memory": "https://studiomeyer-memory.mcpize.run/health",
    "studiomeyer-crm": "https://studiomeyer-crm.mcpize.run/health",
    "studiomeyer-geo": "https://studiomeyer-geo.mcpize.run/health",
    "studiomeyer-crew": "https://studiomeyer-crew.mcpize.run/health",
  };
  for (const [name, url] of Object.entries(mcpizeUrls)) {
    try {
      const r = await fetchWithTimeout(url, {}, 6000);
      if (r.status === 200) ok(`mcpize ${name}`, `${url} → 200`);
      else warn(`mcpize ${name}`, `${url} → ${r.status}`);
    } catch (e) {
      warn(`mcpize ${name}`, `${e.message}`);
    }
  }

  const okCount = results.filter((r) => r.status === "ok").length;
  const failCount = results.filter((r) => r.status === "fail").length;
  const warnCount = results.filter((r) => r.status === "warn").length;

  console.log("\n==================================");
  console.log(`Checks: ${results.length}`);
  console.log(`OK:     ${okCount}`);
  console.log(`Warn:   ${warnCount}`);
  console.log(`Fail:   ${failCount}`);

  if (hardFail) {
    console.log("\n❌ SMOKE TEST FAILED");
    process.exit(1);
  }
  console.log("\n✅ OK");
  process.exit(0);
}

if (process.argv[1] && resolve(process.argv[1]) === __filename) {
  main().catch((e) => {
    console.error("Smoke test crashed:", e);
    process.exit(2);
  });
}
