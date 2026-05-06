#!/usr/bin/env bash
set -e

# Robust environment auditor for Nuxt 4 + Tailwind 4 and Agent OS

echo "🔍 Starting Environment Audit..."
echo "----------------------------------------"

# 1. Check Node version
if command -v node >/dev/null 2>&1; then
  node_ver=$(node -v)
  echo "✅ Node version: $node_ver"
else
  echo "❌ Error: Node.js is not installed or not in PATH."
  exit 1
fi

# 2. Check for Nuxt 4
if [ -f "package.json" ]; then
  if grep -q '"nuxt"' package.json; then
    nuxt_ver=$(npm list nuxt --depth=0 2>/dev/null | grep nuxt || echo "Version unknown (uninstalled?)")
    echo "✅ Nuxt found: $nuxt_ver"
  else
    echo "❌ Nuxt 4 not found in package.json dependencies."
  fi
else
  echo "⚠️ No package.json found in the current directory."
fi

# 3. Check for Tailwind 4
if [ -f "package.json" ] && grep -q '"@tailwindcss/vite"' package.json; then
  echo "✅ Tailwind CSS v4 detected via @tailwindcss/vite"
else
  echo "⚠️ Tailwind v4 might not be installed (could not find @tailwindcss/vite)"
fi

# 4. Check for .agent Architecture Modular Integrity
echo "----------------------------------------"
echo "🤖 Checking Agent OS Architecture (.agent/)"
directories=("skills" "workflows" "prompts" "rules" "checklists" "scripts")
missing_dirs=0

for dir in "${directories[@]}"; do
  if [ ! -d ".agent/$dir" ]; then
    echo "❌ Missing directory: .agent/$dir"
    missing_dirs=$((missing_dirs + 1))
  else
    echo "✅ Found: .agent/$dir"
  fi
done

echo "----------------------------------------"
if [ "$missing_dirs" -eq 0 ]; then
  echo "✅ Agent OS directory structure is complete and fully intact."
else
  echo "⚠️ Agent OS directory structure is incomplete. $missing_dirs directories missing."
fi

echo "🚀 Audit Finished."
