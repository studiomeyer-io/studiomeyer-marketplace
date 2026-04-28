#!/usr/bin/env bash
# StudioMeyer Crew — SessionStart persona-suggestion bash hook
#
# Maps the current working directory to a Crew persona slug and injects a
# context hint that nudges the assistant to call crew_activate({persona}) for
# the right domain. NOT a mcp_tool hook because cwd → persona mapping needs
# regex case-statement that mcp_tool cannot do.
#
# Install:
#   mkdir -p ~/.claude/hooks
#   curl -sSL https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/studiomeyer-crew/hooks/crew-auto-persona.sh \
#     -o ~/.claude/hooks/crew-auto-persona.sh
#   chmod +x ~/.claude/hooks/crew-auto-persona.sh
#
# Then add to ~/.claude/settings.json under hooks.SessionStart:
#   { "type": "command", "command": "/home/<you>/.claude/hooks/crew-auto-persona.sh", "timeout": 5 }
#
# Override the path mapping by editing the case statement below.

set -euo pipefail

cwd="${PWD:-$(pwd)}"

case "$cwd" in
  *studiomeyer*|*academy*|*nex-hq*|*mcp-factory*|*mcp-personal-suite*) persona="cto" ;;
  *aklow*|*kunden*|*pet-platform*|*tierfinder*) persona="pm" ;;
  *blog*|*content*|*marketing*) persona="cmo" ;;
  *legal*|*agb*|*datenschutz*|*privacy*) persona="legal-advisor" ;;
  *finance*|*billing*|*stripe*) persona="cfo" ;;
  *support*|*inbox*|*tickets*) persona="support-lead" ;;
  *) persona="cto" ;;
esac

cat <<EOF
{
  "hookSpecificOutput": {
    "additionalContext": "Crew suggestion: cwd matches persona '${persona}'. Call crew_activate({persona: '${persona}'}) to load the focused-expert system prompt for this domain. Override with a different persona via /crew-list."
  }
}
EOF
