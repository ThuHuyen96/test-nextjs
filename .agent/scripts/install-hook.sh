#!/bin/bash
set -e

# Get the root directory of the repo
REPO_ROOT=$(git rev-parse --show-toplevel)

echo "🛡️ Installing Agent Pre-commit Hook..."

mkdir -p "$REPO_ROOT/.git/hooks"
HOOK_FILE="$REPO_ROOT/.git/hooks/pre-commit"

# Issue #7: Warn if existing hook found
if [ -f "$HOOK_FILE" ]; then
  echo "⚠️  Existing pre-commit hook found. Backing up to pre-commit.bak"
  cp "$HOOK_FILE" "$HOOK_FILE.bak"
fi

cat <<'EOF' > "$HOOK_FILE"
#!/bin/bash
set -e

echo "🤖 Agent: Syncing skills and manifest..."
cd .agent/scripts

if ! ./node_modules/.bin/zx generate-agent-index.mjs; then
  echo "❌ Agent index generation failed. Commit aborted."
  exit 1
fi

git add ../README.md ../manifest.json
echo "✅ Agent index synced."
EOF

chmod +x "$HOOK_FILE"

echo "✅ Hook installed! Skill Index and Manifest will auto-update on every commit."
