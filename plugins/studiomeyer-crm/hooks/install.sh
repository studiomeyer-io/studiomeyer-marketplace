#!/usr/bin/env bash
# StudioMeyer crm — Hook Recipe Installer
# Idempotent jq-merge into ~/.claude/settings.json
#
# Usage:
#   bash install.sh                # install
#   bash install.sh --uninstall    # uninstall
#   bash install.sh --dry-run      # show diff without writing
#
# Requires: jq, bash 4+
# Tested on: macOS, Linux

set -euo pipefail

PLUGIN_NAME="studiomeyer-crm"
RECIPE_URL="https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/${PLUGIN_NAME}/hooks/recipe.json"
SETTINGS_PATH="${HOME}/.claude/settings.json"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="${SETTINGS_PATH}.bak-${TIMESTAMP}"

MODE="install"
for arg in "$@"; do
  case "$arg" in
    --uninstall) MODE="uninstall" ;;
    --dry-run) MODE="dry-run" ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# Sanity checks
if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq not found. Install from https://jqlang.github.io/jq/" >&2
  exit 1
fi
mkdir -p "$(dirname "$SETTINGS_PATH")"
[[ -f "$SETTINGS_PATH" ]] || echo '{}' > "$SETTINGS_PATH"

# Validate existing settings.json
if ! jq -e . "$SETTINGS_PATH" >/dev/null 2>&1; then
  echo "ERROR: ${SETTINGS_PATH} is not valid JSON." >&2
  exit 1
fi

# Resolve recipe.json — prefer local sibling, fallback to URL
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_RECIPE="${SCRIPT_DIR}/recipe.json"
if [[ -f "$LOCAL_RECIPE" ]]; then
  RECIPE_JSON="$(cat "$LOCAL_RECIPE")"
else
  if ! command -v curl >/dev/null 2>&1; then
    echo "ERROR: local recipe.json not found and curl is not installed." >&2
    exit 1
  fi
  RECIPE_JSON="$(curl -sSL "$RECIPE_URL")"
fi

# Validate recipe JSON
if ! echo "$RECIPE_JSON" | jq -e . >/dev/null 2>&1; then
  echo "ERROR: recipe.json is not valid JSON." >&2
  exit 1
fi

# Marker for hook entries belonging to this plugin (idempotent dedup key)
PLUGIN_MARKER="$PLUGIN_NAME"

case "$MODE" in
  install)
    cp "$SETTINGS_PATH" "$BACKUP_PATH"
    echo "Backup: $BACKUP_PATH"

    # For each event in recipe.hooks, merge entries — drop existing entries with same plugin marker first
    NEW_SETTINGS="$(jq -n \
      --argjson settings "$(cat "$SETTINGS_PATH")" \
      --argjson recipe "$RECIPE_JSON" \
      --arg marker "$PLUGIN_MARKER" \
      '
      def stripPluginEntries(arr; m):
        arr | map(
          .hooks |= (map(select((.server // "") | startswith(m) | not)))
        ) | map(select(.hooks | length > 0));

      $settings as $s
      | $recipe.hooks as $rh
      | reduce ($rh | keys[]) as $event ($s;
          .hooks //= {}
          | .hooks[$event] = (
              ((.hooks[$event] // []) | stripPluginEntries(.; $marker)) + $rh[$event]
            )
        )
      ')"


    echo "$NEW_SETTINGS" | jq . > "$SETTINGS_PATH"
    echo "Installed ${PLUGIN_NAME} hooks into ${SETTINGS_PATH}"
    echo ""
    echo "Verify with: claude --debug"
    echo "(Type a prompt, Ctrl-D, watch for 'studiomeyer-crm: hook fired session...' in the statusline.)"
    ;;

  uninstall)
    cp "$SETTINGS_PATH" "$BACKUP_PATH"
    echo "Backup: $BACKUP_PATH"

    NEW_SETTINGS="$(jq -n \
      --argjson settings "$(cat "$SETTINGS_PATH")" \
      --arg marker "$PLUGIN_MARKER" \
      '
      def stripPluginEntries(arr; m):
        arr | map(
          .hooks |= (map(select((.server // "") | startswith(m) | not)))
        ) | map(select(.hooks | length > 0));

      $settings
      | if .hooks then
          .hooks |= with_entries(
            .value |= stripPluginEntries(.; $marker)
          )
        else . end
      | if (.hooks // {} | length) == 0 then del(.hooks) else . end
      ')"

    echo "$NEW_SETTINGS" | jq . > "$SETTINGS_PATH"
    echo "Uninstalled ${PLUGIN_NAME} hooks from ${SETTINGS_PATH}"
    ;;

  dry-run)
    NEW_SETTINGS="$(jq -n \
      --argjson settings "$(cat "$SETTINGS_PATH")" \
      --argjson recipe "$RECIPE_JSON" \
      --arg marker "$PLUGIN_MARKER" \
      '
      def stripPluginEntries(arr; m):
        arr | map(
          .hooks |= (map(select((.server // "") | startswith(m) | not)))
        ) | map(select(.hooks | length > 0));

      $settings as $s
      | $recipe.hooks as $rh
      | reduce ($rh | keys[]) as $event ($s;
          .hooks //= {}
          | .hooks[$event] = (
              ((.hooks[$event] // []) | stripPluginEntries(.; $marker)) + $rh[$event]
            )
        )
      ')"
    echo "$NEW_SETTINGS" | jq .
    ;;
esac
