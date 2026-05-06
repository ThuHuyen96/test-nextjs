#!/usr/bin/env zx
import { fs, path, chalk, $, argv } from 'zx'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

$.verbose = false

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── CONFIG ────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const SKILLS_DIR = argv['skills-dir']
  ? path.resolve(argv['skills-dir'])
  : path.join(ROOT, 'skills')
const BENCHMARKS_DIR = path.join(ROOT, 'benchmarks')
const ALLOWED_MODELS = [
  'claude-opus-4-6',
  'claude-sonnet-4-6',
  'claude-haiku-4-6',
]
const MODEL_INPUT = argv.model || 'claude-opus-4-6'
if (!ALLOWED_MODELS.includes(MODEL_INPUT)) {
  console.error(chalk.red(`Invalid model: "${MODEL_INPUT}". Allowed: ${ALLOWED_MODELS.join(', ')}`))
  process.exit(1)
}
const MODEL = MODEL_INPUT
const SINGLE_SKILL = argv.skill || null
const SKIP_CONFLICTS = argv['skip-conflicts'] || false
const CONFLICTS_ONLY = argv['conflicts-only'] || false
const FORCE_ALL = argv.force || false
const CHANGED_ONLY = argv['changed-only'] ?? !SINGLE_SKILL // default: true when reviewing all

if (argv.help || argv.h) {
  console.log(`
🔬 Agent Skill Review (LLM-as-Judge)

Usage: npm run agent:review -- [options]

Options:
  --skill=<id>        Review a single skill by ID
  --changed-only      Only review skills changed since last review (DEFAULT)
  --force             Force review all skills, ignoring cache
  --conflicts-only    Run cross-skill conflict detection only (skip reviews)
  --skip-conflicts    Skip conflict detection (review only)
  --skills-dir=<path> Custom skills directory (default: .agent/skills)
  --model=<name>      LLM model (default: claude-opus-4-6)
  --help, -h          Show this help

Examples:
  npm run agent:review                              # Review changed skills only (token-efficient)
  npm run agent:review -- --force                   # Force review ALL skills
  npm run agent:review -- --skill=tailwind-v4       # Review one skill
  npm run agent:review -- --conflicts-only          # Conflict detection only
  npm run agent:review -- --skills-dir=../../other  # Custom skills directory
`)
  process.exit(0)
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function getSkillDirs() {
  const entries = await fs.readdir(SKILLS_DIR, { withFileTypes: true })
  return entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name)
    .sort()
}

/**
 * Detect which skills have file changes since their last review.
 * Uses git diff --name-only with the review timestamp from review-data.json.
 * Returns the list of skill IDs that need re-review.
 */
async function getChangedSkills(allSkillIds, cachedReviews) {
  const changed = []
  const skipped = []

  for (const skillId of allSkillIds) {
    const cached = cachedReviews[skillId]
    if (!cached?.reviewedAt) {
      // Never reviewed — must review
      changed.push(skillId)
      continue
    }

    try {
      // Check if any file under this skill dir changed since last review
      const skillRelPath = path.relative(path.resolve(ROOT, '..'), path.join(SKILLS_DIR, skillId))
      const since = cached.reviewedAt
      const result = await $`git -C ${path.resolve(ROOT, '..')} diff --name-only --diff-filter=ACMR HEAD -- ${skillRelPath}`
      const stagedResult = await $`git -C ${path.resolve(ROOT, '..')} diff --name-only --cached --diff-filter=ACMR HEAD -- ${skillRelPath}`

      // Also check for untracked new files
      const untrackedResult = await $`git -C ${path.resolve(ROOT, '..')} ls-files --others --exclude-standard -- ${skillRelPath}`

      const allChangedFiles = [
        ...result.stdout.trim().split('\n'),
        ...stagedResult.stdout.trim().split('\n'),
        ...untrackedResult.stdout.trim().split('\n'),
      ].filter(Boolean)

      if (allChangedFiles.length > 0) {
        changed.push(skillId)
      } else {
        // Also check git log since last review time for committed changes
        const logResult = await $`git -C ${path.resolve(ROOT, '..')} log --since=${since} --oneline -- ${skillRelPath}`
        if (logResult.stdout.trim()) {
          changed.push(skillId)
        } else {
          skipped.push(skillId)
        }
      }
    } catch {
      // If git fails, be safe and include the skill
      changed.push(skillId)
    }
  }

  return { changed, skipped }
}

async function readSkillContent(skillId) {
  const skillDir = path.join(SKILLS_DIR, skillId)
  const skillMd = path.join(skillDir, 'SKILL.md')
  if (!(await fs.pathExists(skillMd))) return null
  const content = await fs.readFile(skillMd, 'utf-8')

  // Parse depends_on from frontmatter
  const dependsOn = []
  const fmBlock = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (fmBlock) {
    let inDeps = false
    for (const line of fmBlock[1].split('\n')) {
      if (/^depends_on:/.test(line)) { inDeps = true; continue }
      if (inDeps && /^\s+-\s+/.test(line)) {
        dependsOn.push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''))
      } else if (inDeps && /^[a-zA-Z_]/.test(line)) {
        break
      }
    }
  }

  // Also read first 3 reference files (if any) for context
  const refsDir = path.join(skillDir, 'references')
  let refSample = ''
  if (await fs.pathExists(refsDir)) {
    const refs = (await fs.readdir(refsDir)).filter(f => f.endsWith('.md')).slice(0, 3)
    for (const ref of refs) {
      const refContent = await fs.readFile(path.join(refsDir, ref), 'utf-8')
      // Truncate each ref to 500 chars to control token usage
      refSample += `\n--- ${ref} (first 500 chars) ---\n${refContent.slice(0, 500)}\n`
    }
  }

  return { content, refSample, skillDir, dependsOn }
}

async function callClaude(prompt, retries = 5) {
  const { execSync } = await import('child_process')
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    const tmpPrompt = path.join('/tmp', `agent-review-${randomUUID()}.txt`)
    try {
      await fs.writeFile(tmpPrompt, prompt)
      // MODEL is validated against ALLOWED_MODELS — safe for shell interpolation
      // Escalate to --max-turns 2 on final attempt as fallback for large skills
      const maxTurns = attempt === retries ? 2 : 1
      const stdout = execSync(`claude -p --model "${MODEL}" --max-turns ${maxTurns} < "${tmpPrompt}"`, {
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env },
        timeout: 120_000
      })
      return stdout.trim()
    } catch (e) {
      let errStr = '';
      if (e.stderr && e.stderr.length > 0) errStr += e.stderr.toString().trim();
      if (e.stdout && e.stdout.length > 0) errStr += (errStr ? ' | ' : '') + e.stdout.toString().trim();
      if (!errStr) errStr = e.message;
      if (attempt === retries) {
        return `ERROR: exit ${e.status}: ${errStr} (after ${retries} attempts)`
      }
      process.stdout.write(chalk.gray(` [retry ${attempt} error: ${errStr.substring(0, 50)}] `))
      // Rate limit backoff (exponential-ish: 10s, 20s, 30s...)
      await new Promise(r => setTimeout(r, 10000 * attempt))
    } finally {
      await fs.remove(tmpPrompt).catch(() => {})
    }
  }
  return 'ERROR: callClaude exhausted retries with no response'
}

function parseJsonResponse(text) {
  // Scan backwards to find the last valid JSON object in the response.
  // This avoids the greedy-regex problem where preamble text or echoed
  // prompts cause the match to span unrelated braces.
  let depth = 0
  let end = -1
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '}') {
      if (end === -1) end = i
      depth++
    }
    if (text[i] === '{') {
      depth--
      if (depth === 0 && end !== -1) {
        try {
          return JSON.parse(text.slice(i, end + 1))
        } catch {
          // Reset and keep scanning for another candidate
          end = -1
        }
      }
    }
  }
  return null
}

// ─── REVIEW DIMENSIONS ────────────────────────────────────────────────────
const REVIEW_PROMPT_TEMPLATE = `You are a senior AI skill auditor. Review this agent skill for SEMANTIC quality.

IMPORTANT: ALWAYS respond directly with the JSON object below. Skip all tool calls — everything you need is already provided in this prompt.

Evaluate these 5 dimensions (score each 1-5):

R1 (Example Validity): Are code examples syntactically correct? Check for syntax errors, missing imports, wrong API usage. If no code examples exist, score based on whether non-code examples (tables, checklists) are accurate. Score 5 if all examples are valid.

R2 (Description-Content Alignment): Does the frontmatter description accurately represent what the skill body teaches? A mismatch means agents may select the wrong skill. Score 5 if description perfectly matches content scope.

R3 (Technical Accuracy): Is the technical advice correct and current? Check for deprecated APIs, wrong patterns, or misleading guidance. Score 5 if all advice is technically sound.

R4 (Completeness): Does the skill cover what its description claims? Are there obvious gaps? Score 5 if scope is fully covered.

R5 (Trigger Quality): Given the description field, would an AI agent correctly identify when to use this skill? Is the "Use when/for..." hint accurate and specific enough? Score 5 if trigger hint is precise and unambiguous.

ALWAYS respond with ONLY this JSON (no markdown, no explanation, no tool calls):
{
  "scores": { "R1": <1-5>, "R2": <1-5>, "R3": <1-5>, "R4": <1-5>, "R5": <1-5> },
  "issues": ["<critical issue 1>", "<critical issue 2>"],
  "suggestions": ["<improvement 1>"],
  "summary": "<one-line verdict>"
}

--- SKILL CONTENT ---
SKILL_CONTENT_HERE
REF_SAMPLE_HERE`

const CONFLICT_PROMPT_TEMPLATE = `You are a senior AI skill auditor. Below are the frontmatter descriptions of ALL skills in a repository. Your job is to find CONFLICTS — cases where two skills give contradictory advice for the same topic, or where their trigger hints overlap so ambiguously that an agent cannot tell which to use.

IMPORTANT: ALWAYS respond directly with the JSON object below. Skip all tool calls — everything you need is already provided in this prompt.

Only report REAL conflicts. Skills covering different topics are NOT conflicts. Skills with complementary scopes (e.g. one for Vue, one for Nuxt) are NOT conflicts if their boundaries are clear.

ALWAYS respond with ONLY this JSON (no markdown, no explanation, no tool calls):
{
  "conflicts": [
    { "skillA": "<id>", "skillB": "<id>", "reason": "<why they conflict>", "severity": "high|medium|low" }
  ],
  "ambiguities": [
    { "skillA": "<id>", "skillB": "<id>", "reason": "<why trigger is ambiguous>", "suggestion": "<how to disambiguate>" }
  ]
}

If no conflicts or ambiguities found, return empty arrays.

--- ALL SKILL DESCRIPTIONS ---
DESCRIPTIONS_HERE`

// ─── MAIN ──────────────────────────────────────────────────────────────────
console.log(chalk.bold.magenta(`\n🔬 Agent Skill Review (LLM-as-Judge)\n`))
console.log(chalk.dim(`Model: ${MODEL}`))

const allSkills = await getSkillDirs()

// Validate single skill exists
if (SINGLE_SKILL && !allSkills.includes(SINGLE_SKILL)) {
  console.error(chalk.red(`Skill "${SINGLE_SKILL}" not found. Available: ${allSkills.join(', ')}`))
  process.exit(1)
}

// ─── Smart Skip: detect changed skills ─────────────────────────────────────
let preloadedReviews = {}
const CACHE_FILE = path.join(BENCHMARKS_DIR, 'review-data.json')
if (await fs.pathExists(CACHE_FILE)) {
  preloadedReviews = await fs.readJson(CACHE_FILE)
}

let skillsToReview
if (SINGLE_SKILL) {
  skillsToReview = [SINGLE_SKILL]
} else if (FORCE_ALL) {
  skillsToReview = allSkills
  console.log(chalk.dim(`Force mode: reviewing all ${allSkills.length} skills\n`))
} else if (CHANGED_ONLY) {
  const { changed, skipped } = await getChangedSkills(allSkills, preloadedReviews)
  skillsToReview = changed
  if (skipped.length > 0) {
    console.log(chalk.green(`⚡ Skipping ${skipped.length} unchanged skills (cached review still valid)`))
    console.log(chalk.dim(`   Skipped: ${skipped.join(', ')}`))
  }
  if (changed.length === 0 && !CONFLICTS_ONLY) {
    console.log(chalk.green(`\n✅ No skills changed since last review. Nothing to do.`))
    console.log(chalk.dim(`   Use --force to review all skills anyway.\n`))
    process.exit(0)
  }
  console.log(chalk.cyan(`\n📝 ${changed.length} skill(s) need review: ${changed.join(', ')}\n`))
} else {
  skillsToReview = allSkills
}

console.log(chalk.dim(`Skills to review: ${skillsToReview.length}\n`))

const now = new Date()

// ─── Phase 1: Per-Skill Semantic Review ────────────────────────────────────
let allReviews = { ...preloadedReviews }

if (CONFLICTS_ONLY) {
  console.log(chalk.dim('Skipping per-skill review (--conflicts-only)\n'))
}
// Clean up cache: sync with actual skills on disk
let syncRemoved = 0
let syncKept = 0
let syncNew = 0
for (const id of Object.keys(allReviews)) {
  if (!allSkills.includes(id)) {
    console.log(chalk.dim(`  ↳ Removed from cache: ${id} (skill no longer exists)`))
    delete allReviews[id]
    syncRemoved++
  } else {
    // Update dependsOn from current SKILL.md (metadata may have changed)
    const data = await readSkillContent(id)
    if (data) {
      allReviews[id].dependsOn = data.dependsOn || []
    }
    syncKept++
  }
}
for (const id of allSkills) {
  if (!allReviews[id]) syncNew++
}
if (syncRemoved > 0 || syncNew > 0) {
  console.log(chalk.dim(`  Cache sync: ${syncKept} kept, ${syncRemoved} removed, ${syncNew} unreviewed`))
}

const reviews = {}
let completed = 0

if (!CONFLICTS_ONLY) {
  for (const skillId of skillsToReview) {
    completed++
    process.stdout.write(chalk.cyan(`[${completed}/${skillsToReview.length}] Reviewing ${skillId}... `))

    const data = await readSkillContent(skillId)
    if (!data) {
      console.log(chalk.yellow('SKIP (no SKILL.md)'))
      continue
    }

    const prompt = REVIEW_PROMPT_TEMPLATE
      .replace('SKILL_CONTENT_HERE', data.content)
      .replace('REF_SAMPLE_HERE', data.refSample || '')

    const response = await callClaude(prompt)
    const parsed = parseJsonResponse(response)

    if (parsed && parsed.scores) {
      const avg = Object.values(parsed.scores).reduce((a, b) => a + b, 0) / 5
      const grade = avg >= 4.5 ? 'A' : avg >= 4.0 ? 'B' : avg >= 3.0 ? 'C' : 'F'
      reviews[skillId] = { ...parsed, average: Math.round(avg * 10) / 10, grade, dependsOn: data.dependsOn || [], reviewedAt: now.toISOString(), model: MODEL }
      const gradeColor = grade === 'A' ? chalk.green : grade === 'B' ? chalk.yellow : chalk.red
      console.log(gradeColor(`${grade} (${avg.toFixed(1)}/5.0)`))
    } else {
      reviews[skillId] = {
        scores: { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 },
        issues: ['Failed to parse LLM response'],
        suggestions: [],
        summary: 'Review failed — manual check required',
        average: 0,
        grade: '?',
        rawResponse: typeof response === 'string' ? response.slice(0, 300) : 'N/A',
        reviewedAt: now.toISOString(),
        model: MODEL
      }
      console.log(chalk.red(`PARSE ERROR`))
      console.log(chalk.dim(`  raw: ${typeof response === 'string' ? response.slice(0, 150) : 'N/A'}`))
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500))
  }
}

// ─── Phase 2: Cross-Skill Conflict Detection ──────────────────────────────
let conflicts = { conflicts: [], ambiguities: [] }

if ((!SKIP_CONFLICTS && !SINGLE_SKILL) || CONFLICTS_ONLY) {
  console.log(chalk.cyan(`\n[*] Running cross-skill conflict detection...`))

  const descriptions = []
  for (const skillId of allSkills) {
    const data = await readSkillContent(skillId)
    if (!data) continue
    const fmMatch = data.content.match(/^---\s*\n([\s\S]*?)\n---/)
    const descMatch = fmMatch ? fmMatch[1].match(/description:\s*(.+)/i) : null
    const desc = descMatch ? descMatch[1].trim() : 'No description'
    descriptions.push(`- ${skillId}: ${desc}`)
  }

  const conflictPrompt = CONFLICT_PROMPT_TEMPLATE
    .replace('DESCRIPTIONS_HERE', descriptions.join('\n'))

  const response = await callClaude(conflictPrompt)
  const parsed = parseJsonResponse(response)

  if (parsed) {
    conflicts = parsed
    const total = (conflicts.conflicts?.length || 0) + (conflicts.ambiguities?.length || 0)
    if (total === 0) {
      console.log(chalk.green('No conflicts detected ✅'))
    } else {
      console.log(chalk.yellow(`Found ${conflicts.conflicts?.length || 0} conflicts, ${conflicts.ambiguities?.length || 0} ambiguities`))
    }
  } else {
    console.log(chalk.red('Failed to parse conflict detection response'))
  }
}

// ─── Generate Report ───────────────────────────────────────────────────────
await fs.ensureDir(BENCHMARKS_DIR)
const dateStr = now.toISOString().split('T')[0]

// Merge just-reviewed skills into the master cache (atomic write)
Object.assign(allReviews, reviews)
const CACHE_TMP = CACHE_FILE + '.tmp'
await fs.writeJson(CACHE_TMP, allReviews, { spaces: 2 })
await fs.rename(CACHE_TMP, CACHE_FILE)

// Collect unique models used across all reviews
// Keep full model name (e.g. claude-opus-4-6, claude-sonnet-4) — only strip date suffix
const uniqueModels = [...new Set(Object.values(allReviews).map(r => r.model || 'unknown').filter(Boolean))]
const modelShort = (m) => m.replace(/-\d{8}$/, '')

let report = `# 🔬 Agent Skill Review Report\n\n`
report += `**Date**: ${dateStr}  \n`
report += `**Models**: ${uniqueModels.map(m => `\`${modelShort(m)}\``).join(', ')}  \n`
report += `**Skills reviewed**: ${Object.keys(reviews).length} this session (Total tracked: ${Object.keys(allReviews).length})  \n`

// Overall stats
const gradeCount = { A: 0, B: 0, C: 0, F: 0, '?': 0 }
for (const r of Object.values(allReviews)) gradeCount[r.grade] = (gradeCount[r.grade] || 0) + 1
const reviewCount = Object.keys(allReviews).length
const avgAll = reviewCount > 0
  ? Object.values(allReviews).reduce((a, r) => a + r.average, 0) / reviewCount
  : 0
report += `**Average score**: ${avgAll.toFixed(1)}/5.0  \n`
const gradeParts = ['A', 'B', 'C', 'F'].map(g => `${gradeCount[g]}×${g}`).join(', ')
const failPart = gradeCount['?'] ? `, ${gradeCount['?']}×?` : ''
report += `**Grade distribution**: ${gradeParts}${failPart}\n\n`

// Dimension legend
report += `> **R1** Example Validity · **R2** Description Alignment · **R3** Technical Accuracy · **R4** Completeness · **R5** Trigger Quality\n\n`

// Scorecard table
report += `## Per-Skill Scorecard\n\n`
report += `| Skill | Deps | R1 | R2 | R3 | R4 | R5 | Avg | Grade | Model |\n`
report += `|-------|:-----|:--:|:--:|:--:|:--:|:--:|:---:|:-----:|:------|\n`

const sortedIds = Object.keys(allReviews).sort((a, b) => {
  if (allReviews[a].grade !== allReviews[b].grade) return allReviews[a].grade.localeCompare(allReviews[b].grade)
  return a.localeCompare(b)
})

for (const id of sortedIds) {
  const r = allReviews[id]
  const s = r.scores
  const depsStr = r.dependsOn && r.dependsOn.length > 0 ? r.dependsOn.join(', ') : '—'
  const scoreEmoji = (v) => v >= 4 ? `${v} ✅` : v >= 3 ? `${v} 🟡` : `${v} ❌`
  const gradeEmoji = r.grade === 'A' ? '🟢' : r.grade === 'B' ? '🟡' : '🔴'
  const mName = modelShort(r.model || 'unknown')
  report += `| ${id} | ${depsStr} | ${scoreEmoji(s.R1)} | ${scoreEmoji(s.R2)} | ${scoreEmoji(s.R3)} | ${scoreEmoji(s.R4)} | ${scoreEmoji(s.R5)} | ${r.average} | ${gradeEmoji} **${r.grade}** | ${mName} |\n`
}
report += `\n`

// Issues detail (only skills with issues or grade < A)
const needsAttention = sortedIds.filter(id => {
  const r = allReviews[id]
  return r.grade !== 'A' || (r.issues && r.issues.length > 0)
})

if (needsAttention.length > 0) {
  report += `## Issues & Suggestions\n\n`
  for (const id of needsAttention) {
    const r = allReviews[id]
    report += `### ${id} (Grade: ${r.grade}, Avg: ${r.average})\n\n`
    if (r.summary) report += `> ${r.summary}\n\n`
    if (r.issues && r.issues.length > 0) {
      report += `**Issues:**\n`
      for (const issue of r.issues) report += `- ⚠ ${issue}\n`
      report += `\n`
    }
    if (r.suggestions && r.suggestions.length > 0) {
      report += `**Suggestions:**\n`
      for (const s of r.suggestions) report += `- 💡 ${s}\n`
      report += `\n`
    }
  }
}

// Cross-skill conflicts
if (conflicts.conflicts?.length > 0 || conflicts.ambiguities?.length > 0) {
  report += `## Cross-Skill Analysis\n\n`

  if (conflicts.conflicts?.length > 0) {
    report += `### Conflicts\n\n`
    report += `| Skill A | Skill B | Severity | Reason |\n|---------|---------|:--------:|--------|\n`
    for (const c of conflicts.conflicts) {
      const sev = c.severity === 'high' ? '🔴' : c.severity === 'medium' ? '🟡' : '🟢'
      report += `| ${c.skillA} | ${c.skillB} | ${sev} ${c.severity} | ${c.reason} |\n`
    }
    report += `\n`
  }

  if (conflicts.ambiguities?.length > 0) {
    report += `### Trigger Ambiguities\n\n`
    report += `| Skill A | Skill B | Issue | Suggestion |\n|---------|---------|-------|------------|\n`
    for (const a of conflicts.ambiguities) {
      report += `| ${a.skillA} | ${a.skillB} | ${a.reason} | ${a.suggestion} |\n`
    }
    report += `\n`
  }
} else if (!SINGLE_SKILL && !SKIP_CONFLICTS) {
  report += `## Cross-Skill Analysis\n\n✅ No conflicts or ambiguities detected.\n\n`
}

// Coverage note
report += `## Coverage Note\n\n`
report += `This review covers **semantic quality** that static analysis (npm run agent:benchmark) cannot detect:\n\n`
report += `| Dimension | Static Benchmark | This Review |\n|-----------|:----------------:|:-----------:|\n`
report += `| Structure & Format | ✅ Covered (D1-D12) | — |\n`
report += `| Example Correctness | ❌ Not covered | ✅ R1 |\n`
report += `| Description Alignment | ❌ Not covered | ✅ R2 |\n`
report += `| Technical Accuracy | ❌ Not covered | ✅ R3 |\n`
report += `| Completeness | ❌ Not covered | ✅ R4 |\n`
report += `| Trigger Quality | ❌ Not covered | ✅ R5 |\n`
report += `| Cross-Skill Conflicts | ❌ Not covered | ✅ Phase 2 |\n`
report += `| Runtime Behavior | ❌ Not covered | ❌ Not covered |\n`
report += `\n`
report += `> **Combined coverage**: benchmark (D1-D12) + review (R1-R5) ≈ **85%** of enterprise quality criteria.\n`
report += `> **Remaining gap**: Runtime behavior testing (canary tests with live agent invocation).\n`
report += `\n---\n*Generated by npm run agent:review at ${now.toISOString()}*\n`

const reportPath = path.join(BENCHMARKS_DIR, 'latest-review.md')
await fs.writeFile(reportPath, report)
console.log(chalk.dim(`\nReport saved: ${reportPath}`))

// Final summary
console.log(chalk.bold.magenta(`\n📊 Review Summary`))
console.log(`   Skills: ${Object.keys(reviews).length} reviewed`)
console.log(`   Average: ${avgAll.toFixed(1)}/5.0`)
console.log(`   Grades: ${gradeCount.A}×A, ${gradeCount.B}×B, ${gradeCount.C}×C, ${gradeCount.F}×F`)
if (conflicts.conflicts?.length > 0) {
  console.log(chalk.yellow(`   Conflicts: ${conflicts.conflicts.length} found`))
}
console.log()

process.exit(0)
