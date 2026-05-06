---
name: git-commit
description: Creates git commits following Conventional Commits format with type/scope/subject. Use when user wants to commit changes, create commit, save work, or stage and commit. Handles regular branch commits (development) and merge commits (PR closure). Enforces project-specific conventions from CLAUDE.md.
category: DevOps
human_reviewed: false
depends_on:
  - coding-conventions
---
# Git Commit

Creates git commits following the **sc-markup project convention** with ticket key traceability.

## ⚠️ Default Behavior: Short Commits
**By default, ALWAYS create short, single-line commits** (`git commit -m "..."`, max 100 characters, ideally under 80). 
**ONLY** use the detailed commit format (with a multi-line body) if the user EXPLICITLY requests it (e.g., "detailed commit", "commit chi tiết", etc.).

## 🔒 Project Commit Format (MANDATORY)

**Format**: `type(<package name>): [<ticket key>]: message`

- **Scope** = the package name where the changes live (e.g. `myhome`, `community`, `lounge`, `ui`, `shared`)
- **Ticket key** is extracted from the current branch name (e.g. `feature/COMMUNITY-3179` → `COMMUNITY-3179`)
- If the branch has no ticket key, omit the `[TICKET-KEY]: ` prefix and use `type(<package>): message`

### Determine Scope

Look at the staged files — the scope is the package directory name under `packages/`:
- `packages/myhome/...` → scope is `myhome`
- `packages/community/...` → scope is `community`
- `packages/ui/...` → scope is `ui`
- Changes spanning multiple packages → use the primary/most-changed package

### Extract Ticket Key

```bash
# Extract ticket key from branch name
TICKET=$(git branch --show-current | sed -E 's#^[^/]+/##')
# Result: COMMUNITY-3179
```

## Quick Start

```bash
# 1. Get ticket key from branch
TICKET=$(git branch --show-current | sed -E 's#^[^/]+/##')

# 2. Stage changes
git add <files>  # or: git add -A

# 3. Create commit (short, single-line — DEFAULT)
git commit -m "feat(myhome): [$TICKET]: implement ProfileHeader component"
```

## Commit Types

### Regular Branch Commits (During Development)

**Format**: `type(<package>): [TICKET-KEY]: subject`

| Type | Purpose |
|------|---------|
| `feat` | New feature or functionality |
| `fix` | Bug fix or issue resolution |
| `refactor` | Code refactoring without behavior change (neither fix nor feat) |
| `perf` | A code change that improves performance |
| `test` | Adding missing tests or correcting existing tests |
| `ci` | Changes to CI configuration files and scripts |
| `docs` | Documentation only changes |
| `chore` | Maintenance tasks |
| `lint` | Formatting, missing semi colons, whitespace (non-functional) |
| `build` | Changes that affect the build system or external dependencies |

### Scope (= Package Name)

The scope is the **package directory name** under `packages/`. Available packages:
`myhome`, `community`, `lounge`, `ui`, `ui-legacy`, `shared`, `styles`, `a11y`, `amplitude`, `cp`, `emoticon`, `froala`, `operation`, `playground`, `resources`, `s-class`, `s-pack`

Do NOT use sub-directory names like `widgets-profile` or `shared-lib` as the scope.

### Subject Line Rules

- Include Jira ticket number: `[TICKET-KEY]: message`
- Use imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize first letter
- No dot (.) at the end
- Keep total message under 100 chars (ideally under 80)
- Specific and descriptive — state WHAT, not WHY

## Core Workflow

### 1. Check Project Conventions

**ALWAYS check first** - project may override defaults:

```bash
cat .claude/CLAUDE.md 2>/dev/null | grep -A 30 -i "commit"
cat .kiro/steering/*.md 2>/dev/null | grep -A 20 -i "commit"
```

If project specifies different format, **USE PROJECT FORMAT**.

### 2. Review Changes

```bash
git status
git diff --staged  # if already staged
git diff           # if not staged
```

### 3. Verify Coding Conventions (MANDATORY)

**Before staging**, verify changed files against the coding conventions checklist:

1. Read `.agent/checklists/coding-conventions.md`
2. Scan staged/changed files for violations:
   - File naming (PascalCase `.tsx`, kebab-case `.ts`)
   - Event handlers use `on*` prefix (not `handle*`)
   - Functions have explicit return types
   - No `enum`, no literal strings, no `<style>` blocks, no `@/` imports
3. If violations found: **fix them before committing**, or flag to user.

### 4. Stage Files

```bash
git add <specific-files>  # preferred
# or
git add -A  # all changes
```

**ALWAYS verify staged files** before committing:
- Secrets (`.env`, `credentials.json`) must be in `.gitignore`
- Build artifacts (`node_modules/`, `__pycache__/`, `.venv/`) must be excluded
- Large binary files require explicit user approval

### 5. Create Commit

**Simple change**:
```bash
git commit -m "feat(myhome): [COMMUNITY-3179]: implement ProfileHeader component"
```

**Complex change (with body)**:
```bash
git commit -m "$(cat <<'EOF'
feat(myhome): [COMMUNITY-3179]: implement ProfileHeader with dropdown

Implement ProfileHeader widget:
- Responsive cover + avatar layout (XS/MD breakpoints)
- CTA button system with dropdown menu
- Introduction text truncation with binary search
EOF
)"
```

**Cross-package example**:
```bash
git commit -m "fix(community): [COMMUNITY-1234]: fix post rendering issue"
```

### 6. Verify Commit

```bash
git log -1 --format="%h %s"
git show --stat HEAD
```

## Body Format (Recommended for Complex Changes)

```
<blank line>
Explain HOW and WHY the change was made.
- Use bullet points for multiple items
- Wrap at 72 characters

Reference: Task X.Y
Addresses: Req N
```

## Git Trailers

| Trailer | Purpose |
|---------|---------|
| `Fixes #N` | Links and closes issue on merge |
| `Closes #N` | Same as Fixes |
| `Co-authored-by: Name <email>` | Credit co-contributors |

Place trailers at end of body after blank line. See `references/commit_examples.md` for examples.

## Breaking Changes

For incompatible API/behavior changes, use `!` after scope OR `BREAKING CHANGE:` footer:

```
feat(myhome)!: [COMMUNITY-1234]: change API response format

BREAKING CHANGE: Response envelope changed from `{ data }` to `{ data: { type, id, attributes } }`.
```

Triggers major version bump in semantic-release.

## Merge Commits (PR Closure)


When a detailed PR commit is explicitly requested, use extended description with sections:

```bash
gh pr create --title "feat(myhome): [COMMUNITY-3179]: implement ProfileHeader widget" --body "$(cat <<'EOF'
## Summary
- ProfileHeader widget with responsive layout
- CTA button system with dropdown menu
- Badge and truncation utilities

## Changes
- src/components/profile/ProfileHeader.tsx
- shared/lib/badge.ts, truncateToLines.ts
- ProfileHeader.stories.ts
EOF
)"
```

## Review Comment Commits

When fixing review comments, default to a short commit:

```bash
git commit -m "fix(myhome): [COMMUNITY-3179]: address review comment #ID"
```

If explicitly asked for a detailed commit, use this format:

```bash
git commit -m "fix(myhome): [COMMUNITY-3179]: address review comment #ID

Brief explanation of what was wrong and how it's fixed.
Addresses review comment #123456789."
```

### Before PR Creation

Ensure all commits follow the format above. PR tooling will:
1. Analyze commits for proper format
2. Extract types for PR labels
3. Build PR description from commit bodies


## Examples

**Good**:
```
feat(myhome): [COMMUNITY-3179]: implement ProfileHeader component
fix(community): [COMMUNITY-1234]: fix post rendering issue
refactor(ui): [COMMUNITY-3180]: consolidate badge utility
lint(myhome): [COMMUNITY-3179]: refine responsive rounding
build(shared): update vite configuration
chore(shared): update dependencies
```

**Bad**:
```
feat(widgets-profile): implement ProfileHeader  # wrong scope — use package name, not sub-dir
feat(myhome): implement ProfileHeader            # missing ticket key
feat: [COMMUNITY-3179]: add stuff                # missing scope
fix(myhome): [COMMUNITY-3179]: fix bug           # circular, not specific
feat(myhome): [COMMUNITY-3179]: Improve things.  # capitalized + has period
style(myhome): [COMMUNITY-3179]: fix formatting  # wrong type — use `lint` not `style`
```

## References

- `references/commit_examples.md` - Extended examples by type
