#!/usr/bin/env node
// StudioMeyer Marketplace Validator
// Zero-dependency Node script. Checks every file the marketplace loader needs
// before Claude Code ever sees it. Run with: node tests/validate.mjs

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, "..");

const errors = [];
const warnings = [];
let checks = 0;

function ok(msg) {
  checks++;
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  checks++;
  errors.push(msg);
  console.log(`  ✗ ${msg}`);
}
function warn(msg) {
  checks++;
  warnings.push(msg);
  console.log(`  ! ${msg}`);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(`${path}: invalid JSON (${e.message})`);
    return null;
  }
}

function fileExists(path) {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function dirExists(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function parseFrontmatter(mdPath) {
  const raw = readFileSync(mdPath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-zA-Z_-]+):\s*(.*)$/);
    if (m) fm[m[1]] = m[2].trim();
  }
  return fm;
}

console.log("StudioMeyer Marketplace Validator");
console.log("=================================\n");

// ---------------- 1. Top-level structure ----------------
console.log("1. Top-level structure");
const marketplaceJsonPath = join(ROOT, ".claude-plugin", "marketplace.json");
if (!fileExists(marketplaceJsonPath)) {
  fail(".claude-plugin/marketplace.json missing");
  process.exit(1);
}
ok(".claude-plugin/marketplace.json exists");

const marketplace = readJson(marketplaceJsonPath);
if (!marketplace) process.exit(1);

for (const field of ["name", "version", "description", "owner", "plugins"]) {
  if (marketplace[field] === undefined) fail(`marketplace.json missing "${field}"`);
  else ok(`marketplace.json has "${field}"`);
}

if (typeof marketplace.owner === "object" && marketplace.owner?.name) {
  ok(`marketplace owner.name = "${marketplace.owner.name}"`);
} else {
  fail("marketplace.json owner.name missing");
}

if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
  fail("marketplace.json plugins must be a non-empty array");
  process.exit(1);
}
ok(`marketplace lists ${marketplace.plugins.length} plugins`);

for (const file of ["README.md", "LICENSE", ".gitignore"]) {
  if (fileExists(join(ROOT, file))) ok(`${file} exists`);
  else warn(`${file} missing (recommended)`);
}

for (const doc of ["docs/pricing.md", "docs/magic-link-setup.md", "docs/faq.md"]) {
  if (fileExists(join(ROOT, doc))) ok(`${doc} exists`);
  else warn(`${doc} missing`);
}

// ---------------- 2. Per-plugin structure ----------------
console.log("\n2. Per-plugin structure");
const seenNames = new Set();

for (const entry of marketplace.plugins) {
  console.log(`\n  → ${entry.name}`);

  if (!entry.name) {
    fail(`plugin entry missing "name"`);
    continue;
  }
  if (seenNames.has(entry.name)) fail(`duplicate plugin name: ${entry.name}`);
  seenNames.add(entry.name);

  if (!entry.source) {
    fail(`${entry.name}: missing "source"`);
    continue;
  }
  if (!entry.description) fail(`${entry.name}: missing "description"`);
  if (!entry.category) warn(`${entry.name}: missing "category" (recommended)`);

  const pluginDir = resolve(ROOT, entry.source);
  if (!dirExists(pluginDir)) {
    fail(`${entry.name}: source directory ${entry.source} does not exist`);
    continue;
  }
  ok(`${entry.name}: source directory exists`);

  // plugin.json
  const pluginJsonPath = join(pluginDir, ".claude-plugin", "plugin.json");
  if (!fileExists(pluginJsonPath)) {
    fail(`${entry.name}: .claude-plugin/plugin.json missing`);
    continue;
  }
  const plugin = readJson(pluginJsonPath);
  if (!plugin) continue;

  for (const f of ["name", "version", "description", "author"]) {
    if (plugin[f] === undefined) fail(`${entry.name}: plugin.json missing "${f}"`);
  }
  if (plugin.name && plugin.name !== entry.name) {
    fail(`${entry.name}: plugin.json name "${plugin.name}" does not match marketplace entry name`);
  } else if (plugin.name) {
    ok(`${entry.name}: plugin.json name matches`);
  }

  if (plugin.version && !/^\d+\.\d+\.\d+/.test(plugin.version)) {
    warn(`${entry.name}: plugin.json version "${plugin.version}" is not semver`);
  } else if (plugin.version) {
    ok(`${entry.name}: version ${plugin.version}`);
  }

  // .mcp.json
  const mcpJsonPath = join(pluginDir, ".mcp.json");
  if (fileExists(mcpJsonPath)) {
    const mcp = readJson(mcpJsonPath);
    if (mcp && typeof mcp.mcpServers === "object") {
      const servers = Object.keys(mcp.mcpServers);
      if (servers.length === 0) fail(`${entry.name}: .mcp.json has empty mcpServers`);
      else {
        ok(`${entry.name}: .mcp.json has ${servers.length} MCP server(s)`);
        for (const s of servers) {
          const cfg = mcp.mcpServers[s];
          if (!cfg.url && !cfg.command) {
            fail(`${entry.name}: mcpServer "${s}" has neither url nor command`);
          } else if (cfg.url && !/^https?:\/\//.test(cfg.url)) {
            fail(`${entry.name}: mcpServer "${s}" url is not http(s)`);
          } else if (cfg.url) {
            ok(`${entry.name}: mcpServer "${s}" → ${cfg.url}`);
          }
        }
      }
    } else {
      fail(`${entry.name}: .mcp.json missing mcpServers object`);
    }
  } else {
    warn(`${entry.name}: .mcp.json missing (plugin has no MCP servers)`);
  }

  // README
  if (fileExists(join(pluginDir, "README.md"))) ok(`${entry.name}: README.md exists`);
  else warn(`${entry.name}: README.md missing`);

  // commands
  const commandsDir = join(pluginDir, "commands");
  if (dirExists(commandsDir)) {
    const cmds = readdirSync(commandsDir).filter((f) => f.endsWith(".md"));
    if (cmds.length === 0) warn(`${entry.name}: commands/ is empty`);
    else ok(`${entry.name}: ${cmds.length} commands`);
    for (const cmd of cmds) {
      const fm = parseFrontmatter(join(commandsDir, cmd));
      if (!fm) fail(`${entry.name}: command ${cmd} has no YAML frontmatter`);
      else if (!fm.description) fail(`${entry.name}: command ${cmd} missing description in frontmatter`);
    }
  }

  // skills
  const skillsDir = join(pluginDir, "skills");
  if (dirExists(skillsDir)) {
    const skillDirs = readdirSync(skillsDir).filter((d) =>
      dirExists(join(skillsDir, d))
    );
    if (skillDirs.length > 0) ok(`${entry.name}: ${skillDirs.length} skill(s)`);
    for (const s of skillDirs) {
      const skillPath = join(skillsDir, s, "SKILL.md");
      if (!fileExists(skillPath)) {
        fail(`${entry.name}: skill ${s}/SKILL.md missing`);
      } else {
        const fm = parseFrontmatter(skillPath);
        if (!fm) fail(`${entry.name}: skill ${s}/SKILL.md has no YAML frontmatter`);
        else if (!fm.name) fail(`${entry.name}: skill ${s}/SKILL.md missing "name"`);
        else if (!fm.description)
          fail(`${entry.name}: skill ${s}/SKILL.md missing "description"`);
      }
    }
  }

  // agents
  const agentsDir = join(pluginDir, "agents");
  if (dirExists(agentsDir)) {
    const agents = readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    if (agents.length > 0) ok(`${entry.name}: ${agents.length} agent(s)`);
    for (const a of agents) {
      const fm = parseFrontmatter(join(agentsDir, a));
      if (!fm) fail(`${entry.name}: agent ${a} has no YAML frontmatter`);
      else {
        if (!fm.name) fail(`${entry.name}: agent ${a} missing "name"`);
        if (!fm.description) fail(`${entry.name}: agent ${a} missing "description"`);
      }
    }
  }
}

// ---------------- 3. Cross-checks ----------------
console.log("\n3. Cross-checks");
const pluginDirs = readdirSync(join(ROOT, "plugins"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const listed = new Set(marketplace.plugins.map((p) => p.name));
for (const dir of pluginDirs) {
  if (!listed.has(dir)) fail(`plugin directory "${dir}" not listed in marketplace.json`);
}
if (pluginDirs.length === marketplace.plugins.length) {
  ok(`plugin directory count (${pluginDirs.length}) matches marketplace.json`);
}

// ---------------- Result ----------------
console.log("\n=================================");
console.log(`Checks: ${checks}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

if (errors.length > 0) {
  console.log("\n❌ VALIDATION FAILED\n");
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log("\n✅ OK");
process.exit(0);
