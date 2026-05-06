#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPTS_DIR="$(dirname "$0")"

REPORT="$ROOT/benchmarks/latest-report.md"
PROMPT="$SCRIPTS_DIR/audit-prompt.md"
OUTPUT="$ROOT/benchmarks/ai-audit-latest.md"
MODEL="claude-opus-4-6"

# Check prerequisites
if ! command -v claude &>/dev/null; then
  echo "❌ Claude Code CLI not found. Install: npm install -g @anthropic-ai/claude-code"
  exit 1
fi

if [ ! -f "$REPORT" ]; then
  echo "❌ No benchmark report found. Run 'npm run agent:benchmark' first."
  exit 1
fi

echo "🤖 Running Claude Code AI Audit..."

# Build the prompt: system prompt + benchmark report as context
FULL_PROMPT="$(cat "$PROMPT")

---
## Benchmark Report

$(cat "$REPORT")"

RESULT=$(claude --print --model "$MODEL" "$FULL_PROMPT" < /dev/null)

# Save audit
{
  echo "# AI Audit"
  echo ""
  echo "**Audited at**: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "**Tool**: Claude Code CLI (local)"
  echo "**Model**: $MODEL"
  echo ""
  echo "---"
  echo ""
  echo "$RESULT"
} > "$OUTPUT"

echo "$RESULT"
echo ""
echo "✅ Audit saved: $OUTPUT"

# Check for FAIL verdict
if echo "$RESULT" | grep -q '\bFAIL\b' && ! echo "$RESULT" | grep -q '\bPASS\b'; then
  echo "⚠️  Claude recommended FAIL. Review before publishing."
  exit 1
fi
