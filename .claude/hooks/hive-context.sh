#!/usr/bin/env bash
# Auto-loads this project's Obsidian "hive" context at session start.
# Prints Status + Next steps + the Kanban board so Claude starts each session in sync.
VAULT="/Users/itaypeter/Documents Itay/Obsidian Itay/10 Projects/Coding"
HIVE="project-hub"
NOTE="$VAULT/$HIVE/$HIVE.md"
BOARD="$VAULT/$HIVE/Tasks.md"

[ -f "$NOTE" ] || exit 0

echo "🐝 Hive context for $HIVE (Obsidian vault) — read before starting work:"
echo
# Status + Next steps: everything between '## Status' and '## Session Workflow'
awk '/^## Status/{p=1} /^## Session Workflow/{p=0} p' "$NOTE"
echo
if [ -f "$BOARD" ]; then
  echo "### Kanban board (Tasks.md)"
  awk '/^%% kanban:settings/{exit} {print}' "$BOARD"
fi
