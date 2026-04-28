#!/usr/bin/env bash
# StudioMeyer GEO — Hook Recipe Installer
# Idempotent jq-merge into ~/.claude/settings.json with placeholder substitution
#
# Usage:
#   bash install.sh                              # interactive prompt for url + brand
#   bash install.sh --url=URL --brand=BRAND      # non-interactive
#   bash install.sh --uninstall
#   bash install.sh --dry-run
#
# Requires: jq, bash 4+

set -euo pipefail

PLUGIN_NAME="studiomeyer-geo"
RECIPE_URL="https://raw.githubusercontent.com/studiomeyer-io/studiomeyer-marketplace/main/plugins/${PLUGIN_NAME}/hooks/recipe.json"
SETTINGS_PATH="${HOME}/.claude/settings.json"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_PATH="${SETTINGS_PATH}.bak-${TIMESTAMP}"

MODE="install"
USER_URL=""
USER_BRAND=""

for arg in "$@"; do
  case "$arg" in
    --uninstall) MODE="uninstall" ;;
    --dry-run) MODE="dry-run" ;;
    --url=*) USER_URL="${arg#*=}" ;;
    --brand=*) USER_BRAND="${arg#*=}" ;;
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

if ! jq -e . "$SETTINGS_PATH" >/dev/null 2>&1; then
  echo "ERROR: ${SETTINGS_PATH} is not valid JSON." >&2
  exit 1
fi

# Resolve recipe.json
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

if ! echo "$RECIPE_JSON" | jq -e . >/dev/null 2>&1; then
  echo "ERROR: recipe.json is not valid JSON." >&2
  exit 1
fi

PLUGIN_MARKER="$PLUGIN_NAME"

# Prompt for placeholders if install mode and not provided
if [[ "$MODE" == "install" || "$MODE" == "dry-run" ]]; then
  if [[ -z "$USER_URL" ]]; then
    echo -n "URL to audit (e.g. https://yoursite.com): "
    read USER_URL
  fi
  if [[ -z "$USER_BRAND" ]]; then
    echo -n "Brand name LLMs should associate with the URL: "
    read USER_BRAND
  fi

  if [[ -z "$USER_URL" || -z "$USER_BRAND" ]]; then
    echo "ERROR: --url and --brand are required (or interactive answer)." >&2
    exit 1
  fi

  if ! echo "$USER_URL" | grep -qE '^https?://'; then
    echo "ERROR: URL must start with http:// or https://" >&2
    exit 1
  fi

  # Substitute placeholders in recipe
  RECIPE_JSON="$(echo "$RECIPE_JSON" | jq --arg url "$USER_URL" --arg brand "$USER_BRAND" '
    .hooks.Stop[0].hooks[0].input.url = $url
    | .hooks.Stop[0].hooks[0].input.brand = $brand
  ')"
fi

case "$MODE" in
  install)
    cp "$SETTINGS_PATH" "$BACKUP_PATH"
    echo "Backup: $BACKUP_PATH"

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
    echo "  url:   ${USER_URL}"
    echo "  brand: ${USER_BRAND}"
    echo ""
    echo "Verify: edit any *.md or *.mdx in a Claude Code session, Ctrl-D"
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
