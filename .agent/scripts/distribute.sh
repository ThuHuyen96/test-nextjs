#!/usr/bin/env bash
#
# distribute.sh — Build distribution branches for all channels
#
# Usage (from .agent/scripts/):
#   npm run agent:distribute          # build all channels
#   npm run agent:distribute:dry      # preview only
#   npm run agent:distribute -- --channel=global  # build single channel
#
# Multi-channel distribution:
#   Each channel in dist-config.json gets its own orphan branch.
#   Channels with "requires" must have their parent channel installed first.
#
# Transparency: Each skill is tracked across 3 review gates:
#   📊 Benchmark  — Automated structural checks (npm run agent:benchmark)
#   🤖 AI Review  — LLM-as-judge semantic quality (npm run agent:review)
#   👤 Human Review — Manual verification by a named reviewer
#
# Compatible with macOS bash 3.2+
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
CONFIG_FILE="$ROOT_DIR/.agent/dist-config.json"
BENCHMARK_FILE="$ROOT_DIR/.agent/benchmarks/latest-review.md"
SKILLS_SOURCE="$ROOT_DIR/.agent/skills"
RULES_SOURCE="$ROOT_DIR/.agent/rules"

DRY_RUN=false
DO_PUSH=false
SINGLE_CHANNEL=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --push)    DO_PUSH=true ;;
    --channel=*) SINGLE_CHANNEL="${arg#--channel=}" ;;
  esac
done

# ─── Helpers ──────────────────────────────────────────────────
log()  { echo "▸ $*"; }
ok()   { echo "✔ $*"; }
warn() { echo "⚠ $*"; }
err()  { echo "✖ $*" >&2; exit 1; }

# ─── Pre-checks ──────────────────────────────────────────────
command -v jq >/dev/null 2>&1 || err "jq is required. Install: brew install jq"
[[ -f "$CONFIG_FILE" ]] || err "Config not found: $CONFIG_FILE"

cd "$ROOT_DIR"

# ─── Ensure distribute files are tracked ──────────────────────
if ! git ls-files --error-unmatch .agent/scripts/distribute.sh .agent/dist-config.json >/dev/null 2>&1; then
  err "distribute.sh and dist-config.json must be committed (tracked) before running distribute."
fi

SOURCE_BRANCH=$(git branch --show-current)
SOURCE_SHA=$(git rev-parse --short HEAD)
BUILD_DATE=$(date '+%Y-%m-%d %H:%M')

# ─── Read channel list ────────────────────────────────────────
ALL_CHANNELS=$(jq -r '.channels | keys[]' "$CONFIG_FILE")
EXCLUDE_LIST=$(jq -r '.exclude[]' "$CONFIG_FILE" 2>/dev/null || echo "")

if [[ -n "$SINGLE_CHANNEL" ]]; then
  if ! echo "$ALL_CHANNELS" | grep -q "^${SINGLE_CHANNEL}$"; then
    err "Channel '$SINGLE_CHANNEL' not found. Available: $(echo $ALL_CHANNELS | tr '\n' ' ')"
  fi
  CHANNELS_TO_BUILD="$SINGLE_CHANNEL"
else
  CHANNELS_TO_BUILD="$ALL_CHANNELS"
fi

log "Source: $SOURCE_BRANCH @ $SOURCE_SHA"
log "Channels to build: $(echo $CHANNELS_TO_BUILD | tr '\n' ' ')"

# ─── Helper: get review status for a skill ────────────────────
get_human_review() {
  local skill="$1"
  local skill_file="$SKILLS_SOURCE/$skill/SKILL.md"
  if [[ -f "$skill_file" ]]; then
    local val
    val=$(grep -m1 '^human_reviewed:' "$skill_file" | sed 's/^human_reviewed:[[:space:]]*//' || echo "false")
    echo "$val"
  else
    echo "false"
  fi
}

get_ai_score() {
  local skill="$1"
  if [[ -f "$BENCHMARK_FILE" ]]; then
    local line
    line=$(grep "^| *${skill} *|" "$BENCHMARK_FILE" 2>/dev/null || echo "")
    if [[ -n "$line" ]]; then
      local avg grade
      avg=$(echo "$line" | awk -F'|' '{print $9}' | xargs)
      # Recalculate grade from avg (same thresholds as review.mjs)
      # A ≥ 4.5 · B ≥ 4.0 · C ≥ 3.0 · F < 3.0
      grade=$(awk "BEGIN { if ($avg >= 4.5) print \"A\"; else if ($avg >= 4.0) print \"B\"; else if ($avg >= 3.0) print \"C\"; else print \"F\" }")
      echo "$avg|$grade"
      return
    fi
  fi
  echo ""
}

# Grade → emoji mapping (matches review.mjs)
# 🟢 A ≥ 4.5 · 🟡 B ≥ 4.0 · 🟠 C ≥ 3.0 · 🔴 F < 3.0
grade_emoji() {
  case "$1" in
    A) echo "🟢 **A**" ;;
    B) echo "🟡 **B**" ;;
    C) echo "🟠 **C**" ;;
    F) echo "🔴 **F**" ;;
    *) echo "$1" ;;
  esac
}

get_depends_on() {
  local skill="$1"
  local skill_file="$SKILLS_SOURCE/$skill/SKILL.md"
  if [[ -f "$skill_file" ]]; then
    local in_deps=false
    local deps=""
    while IFS= read -r line; do
      if [[ "$in_deps" == true ]] && echo "$line" | grep -qE '^[a-zA-Z_]'; then
        break
      fi
      if echo "$line" | grep -q '^depends_on:'; then
        in_deps=true
        continue
      fi
      if [[ "$in_deps" == true ]] && echo "$line" | grep -qE '^\s+-\s+'; then
        local dep
        dep=$(echo "$line" | sed 's/^[[:space:]]*-[[:space:]]*//' | sed "s/^[\"']//" | sed "s/[\"']*$//")
        if [[ -n "$deps" ]]; then
          deps="$deps, $dep"
        else
          deps="$dep"
        fi
      fi
    done < "$skill_file"
    echo "$deps"
  else
    echo ""
  fi
}

# ─── Resolve skills for a channel (own skills only) ──────────
resolve_channel_skills() {
  local channel="$1"
  # Each channel contains only its own skills. Extra channels require global to be installed first.
  jq -r ".channels.\"$channel\".skills[].items[]" "$CONFIG_FILE"
}

# ─── Generate CLAUDE.md for a channel ─────────────────────────
generate_claude_md() {
  local channel="$1"
  local DESCRIPTION
  DESCRIPTION=$(jq -r ".channels.\"$channel\".description" "$CONFIG_FILE")
  local REQUIRES
  REQUIRES=$(jq -r ".channels.\"$channel\".requires // empty" "$CONFIG_FILE")

  local ALL_SKILLS
  ALL_SKILLS=$(resolve_channel_skills "$channel" | sort -u)

  if [[ "$channel" == "global" ]]; then
    cat <<CLAUDE_EOF
# AI Agent Skills — Global Channel

> $DESCRIPTION

## Structure

\`\`\`
.agent/
├── skills/    # Skill definitions (SKILL.md + references/)
└── rules/     # Always-apply behavioral constraints
\`\`\`

## Key Skills

CLAUDE_EOF
  else
    cat <<CLAUDE_EOF
# AI Agent Skills — ${channel}

> $DESCRIPTION

> ⚠️ **Requires**: Install the \`global\` channel first.

## Key Skills

CLAUDE_EOF
  fi

  # List skills grouped by category
  local channel_groups
  channel_groups=$(jq -r ".channels.\"$channel\".skills | keys[]" "$CONFIG_FILE")

  for group_key in $channel_groups; do
    local group_label group_skills
    group_label=$(jq -r ".channels.\"$channel\".skills.\"$group_key\".label" "$CONFIG_FILE")
    group_skills=$(jq -r ".channels.\"$channel\".skills.\"$group_key\".items[]" "$CONFIG_FILE")

    echo "### $group_label"
    echo ""

    for skill in $group_skills; do
      local skill_desc=""
      local skill_file="$SKILLS_SOURCE/$skill/SKILL.md"
      if [[ -f "$skill_file" ]]; then
        skill_desc=$(grep -m1 '^description:' "$skill_file" | sed 's/^description:[[:space:]]*//' | sed "s/^[\"']//;s/[\"']*$//" || echo "")
      fi
      if [[ -n "$skill_desc" ]]; then
        echo "- **$skill** — $skill_desc"
      else
        echo "- **$skill**"
      fi
    done
    echo ""
  done

  # Add rules note for global
  if [[ "$channel" == "global" ]]; then
    cat <<CLAUDE_EOF
## Rules (Always Apply)

The \`.agent/rules/\` directory contains always-apply constraints:

- **workspace-context.md** — Version routing: reads \`package.json\` before loading versioned skills
- **agent-guardrails.md** — Git workflow, branch naming, output rules
- **agent-security.md** — 3-layer security defense (hard → soft → process)
CLAUDE_EOF
  fi
}

# ─── Build one channel ───────────────────────────────────────
build_channel() {
  local channel="$1"
  local DIST_BRANCH
  DIST_BRANCH=$(jq -r ".channels.\"$channel\".branch" "$CONFIG_FILE")
  local DESCRIPTION
  DESCRIPTION=$(jq -r ".channels.\"$channel\".description" "$CONFIG_FILE")
  local REQUIRES
  REQUIRES=$(jq -r ".channels.\"$channel\".requires // empty" "$CONFIG_FILE")

  log ""
  log "═══════════════════════════════════════════════════"
  log "Channel: $channel → $DIST_BRANCH"
  [[ -n "$REQUIRES" ]] && log "Requires: $REQUIRES"
  log "═══════════════════════════════════════════════════"

  # Resolve own skills only (extra channels do NOT merge global)
  local ALL_SKILLS
  ALL_SKILLS=$(resolve_channel_skills "$channel" | sort -u)
  local SKILL_COUNT
  SKILL_COUNT=$(echo "$ALL_SKILLS" | wc -l | tr -d ' ')

  log "Skills: $SKILL_COUNT"

  # Validate skills exist
  local MISSING=""
  for skill in $ALL_SKILLS; do
    if [[ ! -d "$SKILLS_SOURCE/$skill" ]]; then
      MISSING="$MISSING $skill"
    fi
  done
  if [[ -n "$MISSING" ]]; then
    err "Missing skills in channel '$channel':$MISSING"
  fi
  ok "All $SKILL_COUNT skills found"

  # Count readiness
  local READY_COUNT=0
  local NOT_READY_COUNT=0
  for skill in $ALL_SKILLS; do
    local ai_data hr_val ai_ok hr_ok
    ai_data=$(get_ai_score "$skill")
    hr_val=$(get_human_review "$skill")
    ai_ok="false"; [[ -n "$ai_data" ]] && ai_ok="true"
    hr_ok="false"; [[ "$hr_val" != "false" ]] && hr_ok="true"
    if [[ "$ai_ok" == "true" && "$hr_ok" == "true" ]]; then
      READY_COUNT=$((READY_COUNT + 1))
    else
      NOT_READY_COUNT=$((NOT_READY_COUNT + 1))
    fi
  done
  log "Readiness: $READY_COUNT/$SKILL_COUNT ready, $NOT_READY_COUNT pending"

  # ─── Build README ─────────────────────────────────────────
  local README=""
  readme_line() { README="${README}${1}
"; }

  local CHANNEL_TITLE
  if [[ "$channel" == "global" ]]; then
    CHANNEL_TITLE="🌐 Global AI Agent Skills"
  else
    CHANNEL_TITLE="📦 ${channel} — AI Agent Skills"
  fi

  readme_line "# $CHANNEL_TITLE"
  readme_line ""
  readme_line "> $DESCRIPTION"
  readme_line ""
  readme_line "| | |"
  readme_line "|---|---|"
  readme_line "| **Source** | \`$SOURCE_BRANCH\` @ \`$SOURCE_SHA\` |"
  readme_line "| **Updated** | $BUILD_DATE |"
  readme_line "| **Channel** | \`$channel\` |"
  [[ -n "$REQUIRES" ]] && readme_line "| **Requires** | Install \`$REQUIRES\` channel first |"
  readme_line "| **Total skills** | $SKILL_COUNT |"
  readme_line "| **✅ Ready for Enterprise** | $READY_COUNT |"
  readme_line "| **⏳ In Review** | $NOT_READY_COUNT |"
  readme_line ""

  # Version routing rules warning
  local HAS_VERSIONED_SKILLS=false
  for skill in $ALL_SKILLS; do
    if grep -q 'Version Guard' "$SKILLS_SOURCE/$skill/SKILL.md" 2>/dev/null; then
      HAS_VERSIONED_SKILLS=true
      break
    fi
  done

  if [[ "$HAS_VERSIONED_SKILLS" == true ]]; then
    readme_line "## ⚠️ Required: Version Routing Rules"
    readme_line ""
    readme_line "> **This channel contains versioned skills** (e.g., \`vue-best-practices\` + \`vue-v2-7\`, \`storybook-v8\` + \`storybook-v7\`)."
    readme_line "> Without routing rules, AI agents may select the **wrong version** and generate incompatible code."
    readme_line ""
    readme_line "The \`rules/\` directory is included in this distribution (see Installation below)."
    readme_line "The key file is \`rules/workspace-context.md\` (\`alwaysApply: true\`). It instructs the agent to:"
    readme_line ""
    readme_line "1. Read the target package's \`package.json\` **before** loading any skill"
    readme_line "2. Route to the correct versioned skill based on dependency versions"
    readme_line "3. Never load both versions simultaneously"
    readme_line ""
  fi

  # Enterprise-ready section
  readme_line "## ✅ Enterprise-Ready Skills"
  readme_line ""
  if [[ "$READY_COUNT" -eq 0 ]]; then
    readme_line "> No skills have passed all 3 review gates yet."
  else
    readme_line "| Skill | Grade | Avg | Deps | Reviewer |"
    readme_line "|-------|:-----:|:---:|:-----|----------|"
    for skill in $ALL_SKILLS; do
      local ai_data hr_val ai_ok hr_ok
      ai_data=$(get_ai_score "$skill")
      hr_val=$(get_human_review "$skill")
      ai_ok="false"; [[ -n "$ai_data" ]] && ai_ok="true"
      hr_ok="false"; [[ "$hr_val" != "false" ]] && hr_ok="true"
      if [[ "$ai_ok" == "true" && "$hr_ok" == "true" ]]; then
        local score grade reviewer deps_raw deps_display
        score=$(echo "$ai_data" | cut -d'|' -f1)
        grade=$(echo "$ai_data" | cut -d'|' -f2)
        deps_raw=$(get_depends_on "$skill")
        deps_display="${deps_raw:-—}"
        if [[ "$hr_val" == "true" ]]; then reviewer="(unnamed)"; else reviewer="$hr_val"; fi
        readme_line "| \`$skill\` | $(grade_emoji "$grade") | $score | $deps_display | $reviewer |"
      fi
    done
  fi
  readme_line ""

  # Installation
  readme_line "## 📦 Installation"
  readme_line ""
  readme_line "\`\`\`bash"
  readme_line "git clone -b $DIST_BRANCH --single-branch <repo-url> /tmp/${channel}-skills"
  readme_line ""
  if [[ "$channel" == "global" ]]; then
    readme_line "# Copy .agent/ into your project root"
    readme_line "cp -r /tmp/${channel}-skills/.agent/ your-project/.agent/"
  else
    readme_line "# Copy .agent/ and CLAUDE.md into your project root"
    readme_line "cp -r /tmp/${channel}-skills/.agent/ your-project/.agent/"
    readme_line "cp /tmp/${channel}-skills/CLAUDE.md your-project/CLAUDE.md"
  fi
  readme_line "\`\`\`"
  readme_line ""
  readme_line "> **Note:** Most modern AI IDEs (Claude Code, Gemini, Cursor, Codex) auto-detect \`CLAUDE.md\` and \`.agent/\` directories."
  readme_line ""

  # Review status tables per group
  readme_line "## 🔍 Review Status & Transparency"
  readme_line ""
  readme_line "> ✅ Enterprise = 📊 Benchmark + 🤖 AI Review + 👤 Human Review all passed."
  readme_line ""

  # Build group tables — own channel skills only (global installed separately)
  local channel_groups
  channel_groups=$(jq -r ".channels.\"$channel\".skills | keys[]" "$CONFIG_FILE")

  for group_key in $channel_groups; do
    local group_label group_skills
    group_label=$(jq -r ".channels.\"$channel\".skills.\"$group_key\".label" "$CONFIG_FILE")
    group_skills=$(jq -r ".channels.\"$channel\".skills.\"$group_key\".items[]" "$CONFIG_FILE")

    readme_line "### $group_label"
    readme_line ""
    readme_line "| Skill | Grade | Avg | Deps | 📊 Benchmark | 🤖 AI Review | 👤 Human Review | Status |"
    readme_line "|-------|:-----:|:---:|:-----|:---:|:---:|:-----------|:------:|"

    for skill in $group_skills; do
      render_skill_row "$skill"
    done
    readme_line ""
  done

  readme_line "---"
  readme_line ""
  readme_line "> Grade: **A** ≥ 4.5 · **B** ≥ 4.0 · **C** ≥ 3.0 · **F** < 3.0"
  readme_line ""
  readme_line "> ⚠️ **Do not edit this branch.** Auto-generated from \`$SOURCE_BRANCH\` via \`npm run agent:distribute\`."

  # ─── Dry run ──────────────────────────────────────────────
  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "═══ [$channel] Readiness Summary ═══"
    echo "  ✅ Ready: $READY_COUNT / $SKILL_COUNT"
    echo "  ⏳ Pending: $NOT_READY_COUNT / $SKILL_COUNT"
    echo ""
    for skill in $ALL_SKILLS; do
      local ai_data hr_val ai_ok hr_ok
      ai_data=$(get_ai_score "$skill")
      hr_val=$(get_human_review "$skill")
      ai_ok="false"; [[ -n "$ai_data" ]] && ai_ok="true"
      hr_ok="false"; [[ "$hr_val" != "false" ]] && hr_ok="true"
      if [[ "$ai_ok" == "true" && "$hr_ok" == "true" ]]; then
        echo "  ✅ $skill"
      else
        local missing="" deps_raw deps_info
        [[ "$ai_ok" != "true" ]] && missing="$missing AI-review"
        [[ "$hr_ok" != "true" ]] && missing="$missing human-review"
        deps_raw=$(get_depends_on "$skill")
        deps_info=""
        [[ -n "$deps_raw" ]] && deps_info=" [deps: $deps_raw]"
        echo "  ⏳ $skill (missing:$missing)$deps_info"
      fi
    done
    echo ""
    echo "═══ [$channel] README preview (first 30 lines) ═══"
    echo "$README" | head -30
    return 0
  fi

  # ─── Build the dist bundle ──────────────────────────────
  local WORK_DIR
  WORK_DIR=$(mktemp -d)

  log "Building [$channel] dist in $WORK_DIR..."
  mkdir -p "$WORK_DIR/.agent/skills"
  for skill in $ALL_SKILLS; do
    cp -r "$SKILLS_SOURCE/$skill" "$WORK_DIR/.agent/skills/$skill"
    find "$WORK_DIR/.agent/skills/$skill" -name '.DS_Store' -delete 2>/dev/null || true
  done

  # Copy rules (version routing, guardrails, security)
  if [[ -d "$RULES_SOURCE" ]]; then
    mkdir -p "$WORK_DIR/.agent/rules"
    cp -r "$RULES_SOURCE/"* "$WORK_DIR/.agent/rules/"
    find "$WORK_DIR/.agent/rules" -name '.DS_Store' -delete 2>/dev/null || true
    ok "Rules copied: $(ls -1 "$WORK_DIR/.agent/rules/" | wc -l | tr -d ' ') files"
  fi

  echo "$README" > "$WORK_DIR/README.md"

  # Generate CLAUDE.md (only for extra channels)
  if [[ "$channel" != "global" ]]; then
    generate_claude_md "$channel" > "$WORK_DIR/CLAUDE.md"
    ok "CLAUDE.md generated"
  fi

  ok "Dist bundle ready: $(du -sh "$WORK_DIR" | cut -f1)"

  # ─── Create/update orphan branch ─────────────────────────
  if git show-ref --verify --quiet "refs/heads/$DIST_BRANCH" 2>/dev/null; then
    log "Updating existing branch: $DIST_BRANCH"
    git checkout "$DIST_BRANCH"
  else
    log "Creating new orphan branch: $DIST_BRANCH"
    git checkout --orphan "$DIST_BRANCH"
    git rm -rf . > /dev/null 2>&1 || true
  fi

  # Clean working tree
  git rm -rf . > /dev/null 2>&1 || true
  find . -not -path './.git/*' -not -path './.git' -not -path '.' -delete 2>/dev/null || true

  # Copy dist bundle
  cp "$WORK_DIR/README.md" .
  [[ -f "$WORK_DIR/CLAUDE.md" ]] && cp "$WORK_DIR/CLAUDE.md" .
  cp -r "$WORK_DIR/.agent" .

  # Commit
  git add -A
  local COMMIT_MSG="dist($channel): update skills ($SKILL_COUNT skills, $READY_COUNT ready) from $SOURCE_BRANCH@$SOURCE_SHA"

  if git diff --cached --quiet 2>/dev/null; then
    warn "[$channel] No changes detected, skipping commit"
  else
    git commit --no-verify -m "$COMMIT_MSG"
    ok "Committed: $COMMIT_MSG"
  fi

  # Switch back
  git checkout "$SOURCE_BRANCH"

  # Cleanup
  rm -rf "$WORK_DIR"

  # Push if requested
  if [[ "$DO_PUSH" == true ]]; then
    log "Pushing $DIST_BRANCH to upstream..."
    git push upstream "$DIST_BRANCH" 2>&1
    ok "Pushed to upstream/$DIST_BRANCH"
  fi

  ok "Channel '$channel' → $DIST_BRANCH done!"
}

# ─── Render a single skill row ────────────────────────────────
render_skill_row() {
  local skill="$1"
  local ai_data hr_val ai_ok hr_ok score grade ai_status hr_display bm_status deps_raw deps_display status

  ai_data=$(get_ai_score "$skill")
  if [[ -n "$ai_data" ]]; then
    score=$(echo "$ai_data" | cut -d'|' -f1)
    grade=$(echo "$ai_data" | cut -d'|' -f2)
    ai_status="✅"
    ai_ok="true"
  else
    score="—"
    grade="—"
    ai_status="⏳"
    ai_ok="false"
  fi

  hr_val=$(get_human_review "$skill")
  hr_ok="false"
  if [[ "$hr_val" == "false" ]]; then
    hr_display="⏳ pending"
  elif [[ "$hr_val" == "true" ]]; then
    hr_display="✅ (unnamed)"
    hr_ok="true"
  else
    hr_display="✅ $hr_val"
    hr_ok="true"
  fi

  bm_status="✅"

  deps_raw=$(get_depends_on "$skill")
  deps_display="${deps_raw:-—}"

  if [[ "$ai_ok" == "true" && "$hr_ok" == "true" ]]; then
    status="✅ Enterprise"
  else
    status="⏳ In Review"
  fi

  readme_line "| \`$skill\` | $(grade_emoji "$grade") | $score | $deps_display | $bm_status | $ai_status | $hr_display | $status |"
}

# ─── MAIN: Stash, build all channels, restore ─────────────────
STASHED=false
if [[ "$DRY_RUN" != true ]]; then
  if ! git diff --quiet 2>/dev/null || ! git diff --cached --quiet 2>/dev/null; then
    log "Stashing uncommitted changes..."
    git stash push -m "distribute.sh: auto-stash before dist build" --quiet
    STASHED=true
    ok "Changes stashed"
  fi
fi

# Build each channel
CHANNEL_COUNT=0
for channel in $CHANNELS_TO_BUILD; do
  build_channel "$channel"
  CHANNEL_COUNT=$((CHANNEL_COUNT + 1))
done

# Restore stash
if [[ "$STASHED" == true ]]; then
  log "Restoring stashed changes..."
  git stash pop --quiet
  ok "Changes restored"
fi

echo ""
ok "Done! Built $CHANNEL_COUNT channel(s)."
for channel in $CHANNELS_TO_BUILD; do
  local_branch=$(jq -r ".channels.\"$channel\".branch" "$CONFIG_FILE")
  log "  $channel → $local_branch"
done
