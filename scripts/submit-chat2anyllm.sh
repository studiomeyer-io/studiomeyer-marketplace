#!/usr/bin/env bash
# Submit our marketplace to Chat2AnyLLM/awesome-claude-plugins via PR on
# Chat2AnyLLM/code-assistant-manager (plugin_repos.json is the data source).
#
# Requires: gh CLI authenticated.
# Idempotent: checks for existing entries / PRs before creating a new one.
set -euo pipefail

UPSTREAM="Chat2AnyLLM/code-assistant-manager"
FILE="code_assistant_manager/plugin_repos.json"
BRANCH="add-studiomeyer-marketplace"
WORKDIR="/tmp/chat2anyllm-fork"

if curl -sSf "https://raw.githubusercontent.com/${UPSTREAM}/main/${FILE}" \
  | grep -q '"studiomeyer-marketplace"'; then
  echo "Already listed upstream. Nothing to do."
  exit 0
fi

if gh pr list --repo "${UPSTREAM}" --state open --search "add studiomeyer" --json title \
  | grep -qi studiomeyer; then
  echo "Open PR already exists upstream. Review manually."
  exit 0
fi

rm -rf "${WORKDIR}"
mkdir -p "${WORKDIR}"
cd "${WORKDIR}"

gh repo fork "${UPSTREAM}" --clone=false || true
MY_LOGIN=$(gh api user --jq .login)

git clone "git@github.com:${MY_LOGIN}/code-assistant-manager.git" .
git remote add upstream "git@github.com:${UPSTREAM}.git"
git fetch upstream main
git checkout -b "${BRANCH}" upstream/main

python3 - <<'PY'
import json, pathlib
p = pathlib.Path("code_assistant_manager/plugin_repos.json")
data = json.loads(p.read_text())
if "studiomeyer-marketplace" in data:
    print("already present")
    raise SystemExit(0)
data["studiomeyer-marketplace"] = {
    "name": "studiomeyer-marketplace",
    "description": "StudioMeyer MCP Suite for Claude Code — 4 hosted plugins (Memory, CRM, GEO, Crew). 119 MCP tools, 21 slash commands, 5 skills, 3 subagents. Magic Link auth, EU Frankfurt. Free tier.",
    "enabled": True,
    "type": "marketplace",
    "repoOwner": "studiomeyer-io",
    "repoName": "studiomeyer-marketplace",
    "repoBranch": "main",
}
p.write_text(json.dumps(data, indent=2) + "\n")
print("added")
PY

git add "${FILE}"
git -c user.name="StudioMeyer" -c user.email="hello@studiomeyer.io" commit -q -m "Add studiomeyer-marketplace (4 hosted plugins: Memory, CRM, GEO, Crew)"
git push -u origin "${BRANCH}"

gh pr create --repo "${UPSTREAM}" --base main --head "${MY_LOGIN}:${BRANCH}" \
  --title "Add studiomeyer-marketplace (Memory, CRM, GEO, Crew)" \
  --body-file - <<'EOF'
Adds the StudioMeyer marketplace to `plugin_repos.json`.

**Repo:** https://github.com/studiomeyer-io/studiomeyer-marketplace

**Contents:**
- `studiomeyer-memory` — 53 tools, hosted AI memory with knowledge graph, semantic search, import from ChatGPT/Claude/Gemini/Copilot/Perplexity
- `studiomeyer-crm` — 33 tools, MCP-native CRM with companies, deals, pipeline, Stripe sync
- `studiomeyer-geo` — 23 tools, Generative Engine Optimization across 8 LLM platforms
- `studiomeyer-crew` — 10 tools + 8 agent personas + 3 multi-persona workflows

**Total:** 119 MCP tools, 21 slash commands, 5 skills, 3 subagents across 4 plugins.

**Auth:** OAuth 2.1 + Magic Link (no passwords)
**Hosting:** Supabase EU Frankfurt
**License:** MIT
**Free tier:** Every plugin has a free tier

Install:
```
/plugin marketplace add studiomeyer-io/studiomeyer-marketplace
/plugin install studiomeyer-memory@studiomeyer
```
EOF

echo ""
echo "PR submitted."
