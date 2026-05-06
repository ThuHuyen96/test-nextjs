import { fs, path, $, argv, chalk } from 'zx'
import { fileURLToPath } from 'url'
import _ from 'lodash'
import markdownit from 'markdown-it'
import * as cheerio from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, '../..')
const AGENT_DIR = path.resolve(__dirname, '..')
const md = markdownit()

// ─── CLI Args ───────────────────────────────────────────────────────────────
const target = argv.target || 'all'
const dryRun = argv['dry-run'] || false

if (dryRun) {
  console.log(chalk.yellow.bold('\nDRY RUN MODE - no files will be written\n'))
}

// ─── Platform Definitions ───────────────────────────────────────────────────
const PLATFORMS = {
  gemini: {
    dir: path.join(ROOT, '.gemini'),
    sync: syncGemini,
    description: 'Gemini / Antigravity',
  },
  cursor: {
    dir: path.join(ROOT, '.cursor'),
    sync: syncCursor,
    description: 'Cursor IDE',
  },
  claude: {
    dir: path.join(ROOT, '.claude'),
    sync: syncClaude,
    description: 'Claude Code / Claude CLI',
  },
  codex: {
    dir: path.join(ROOT, '.codex'),
    sync: syncCodex,
    description: 'OpenAI Codex CLI',
  },
  github: {
    dir: path.join(ROOT, '.github'),
    sync: syncGitHub,
    description: 'GitHub Copilot',
  },
  windsurf: {
    dir: path.join(ROOT, '.windsurf'),
    sync: syncWindsurf,
    description: 'Windsurf (Codeium)',
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Check if a skill path is git-ignored */
async function isIgnored(skillPath) {
  const result = await $({ nothrow: true, quiet: true })`git check-ignore -q ${skillPath}`
  return result.exitCode === 0
}

/** Strip YAML frontmatter from markdown */
function stripFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  return match ? content.slice(match[0].length).trim() : content.trim()
}

/** Extract frontmatter fields with support for arrays */
function extractFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!match) return {}
  const fields = {}
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      if (value.startsWith('[') && value.endsWith(']')) {
        fields[key] = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      } else {
        fields[key] = value
      }
    }
  }
  return fields
}

/** Get all tracked (non-ignored) skills */
async function getTrackedSkills() {
  const skillsDir = path.join(AGENT_DIR, 'skills')
  const skills = await fs.readdir(skillsDir)
  const tracked = []

  for (const skill of skills) {
    const skillPath = path.join(skillsDir, skill)
    if (!(await fs.stat(skillPath)).isDirectory()) continue
    if (skill.startsWith('_')) continue
    if (await isIgnored(skillPath)) continue

    const skillMdPath = path.join(skillPath, 'SKILL.md')
    if (await fs.pathExists(skillMdPath)) {
      tracked.push({ id: skill, dir: skillPath, skillMd: skillMdPath })
    }
  }
  return tracked
}

/** Get all tracked rules (alwaysApply or not) */
async function getTrackedRules() {
  const rulesDir = path.join(AGENT_DIR, 'rules')
  const files = await fs.readdir(rulesDir)
  const rules = []

  for (const file of files) {
    if (!file.endsWith('.mdc')) continue
    const filePath = path.join(rulesDir, file)
    const content = await fs.readFile(filePath, 'utf-8')
    const fm = extractFrontmatter(content)
    rules.push({
      file,
      path: filePath,
      content,
      description: fm.description || '',
      alwaysApply: fm.alwaysApply === 'true',
    })
  }
  return rules
}

/** Safe write — respects dry-run */
async function safeWrite(filePath, content) {
  if (dryRun) {
    console.log(chalk.gray(`  >> Would write: ${path.relative(ROOT, filePath)}`))
    return
  }
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeFile(filePath, content)
  console.log(chalk.green(`  ✅ ${path.relative(ROOT, filePath)}`))
}

/** Safe copy (file or directory) — respects dry-run */
async function safeCopy(src, dest) {
  if (dryRun) {
    console.log(chalk.gray(`  >> Would copy: ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dest)}`))
    return
  }
  const isDir = (await fs.stat(src)).isDirectory()
  if (isDir) {
    await fs.ensureDir(dest)
  } else {
    await fs.ensureDir(path.dirname(dest))
  }
  await fs.copy(src, dest, { overwrite: true })
  console.log(chalk.green(`  ✅ ${path.relative(ROOT, dest)}${isDir ? '/' : ''}`))
}

/** Safe remove — respects dry-run */
async function safeRemove(target) {
  if (dryRun) {
    console.log(chalk.gray(`  >> Would remove: ${path.relative(ROOT, target)}`))
    return
  }
  if (await fs.pathExists(target)) {
    await fs.remove(target)
    console.log(chalk.yellow(`  >> Removed: ${path.relative(ROOT, target)}`))
  }
}

/** Build a combined rules markdown from all alwaysApply rules */
async function buildCombinedRules() {
  const rules = await getTrackedRules()
  const alwaysOn = rules.filter((r) => r.alwaysApply)

  let combined = '# Agent Rules (Auto-Generated)\n\n'
  combined += '> Synced from `.agent/rules/`. Do not edit manually.\n\n'

  for (const rule of alwaysOn) {
    combined += stripFrontmatter(rule.content) + '\n\n---\n\n'
  }

  return combined.trim() + '\n'
}

/** Build combined skills summary */
async function buildSkillsSummary(skills) {
  let summary = '# Available Skills (Auto-Generated)\n\n'
  summary += '> Synced from `.agent/skills/`. See each SKILL.md for detailed instructions.\n\n'
  summary += '| Skill | Path |\n'
  summary += '| :--- | :--- |\n'

  for (const skill of _.sortBy(skills, 'id')) {
    summary += `| ${skill.id} | \`${path.relative(ROOT, skill.skillMd)}\` |\n`
  }

  return summary + '\n'
}

// ─── Platform Sync Functions ────────────────────────────────────────────────

/**
 * GEMINI (.gemini/)
 * Syncs full .agent/ directory (Source of Truth) to .gemini/
 */
async function syncGemini(skills) {
  const geminiDir = PLATFORMS.gemini.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → Gemini (.gemini/)'))

  // Clean first to avoid stale artifacts
  await safeRemove(geminiDir)
  
  // Mirror the .agent/ structure - Gemini (Antigravity) uses .gemini/ as its home
  await safeCopy(AGENT_DIR, geminiDir)
}

/**
 * CURSOR (.cursor/)
 * Syncs: rules, skills, manifest, README, checklists, workflows, prompts, memories
 */
async function syncCursor(skills) {
  const cursorDir = PLATFORMS.cursor.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → Cursor (.cursor/)'))

  // 1. Clean old skills and stale directories
  const oldDirs = ['boilerplate', 'specs', 'tests', 'tools', 'assets']
  for (const dir of oldDirs) {
    await safeRemove(path.join(cursorDir, dir))
  }

  // 2. Sync rules (1:1 copy)
  const rulesDir = path.join(AGENT_DIR, 'rules')
  const cursorRulesDir = path.join(cursorDir, 'rules')
  if (!dryRun) await fs.ensureDir(cursorRulesDir)

  const ruleFiles = await fs.readdir(rulesDir)
  for (const file of ruleFiles) {
    if (!file.endsWith('.mdc')) continue
    await safeCopy(path.join(rulesDir, file), path.join(cursorRulesDir, file))
  }

  // 3. Clean all existing skills, then copy tracked ones
  const cursorSkillsDir = path.join(cursorDir, 'skills')
  await safeRemove(cursorSkillsDir)
  if (!dryRun) await fs.ensureDir(cursorSkillsDir)

  for (const skill of skills) {
    await safeCopy(skill.dir, path.join(cursorSkillsDir, skill.id))
  }

  // 4. Copy manifest and README
  await safeCopy(path.join(AGENT_DIR, 'manifest.json'), path.join(cursorDir, 'manifest.json'))
  await safeCopy(path.join(AGENT_DIR, 'README.md'), path.join(cursorDir, 'README.md'))

  // 5. Copy shared dirs
  for (const dir of ['checklists', 'workflows', 'prompts', 'memories']) {
    const src = path.join(AGENT_DIR, dir)
    if (await fs.pathExists(src)) {
      await safeCopy(src, path.join(cursorDir, dir))
    }
  }
}

/**
 * CLAUDE (.claude/)
 * 
 * Claude Code reads:
 *   CLAUDE.md       - at repo root (already created separately)
 *   .claude/agents/ - agent persona .md files
 * 
 * We sync personas from .agent/prompts/ → .claude/agents/
 */
async function syncClaude(skills) {
  const claudeDir = PLATFORMS.claude.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → Claude Code (.claude/)'))

  // 1. Sync prompts → agents
  const promptsDir = path.join(AGENT_DIR, 'prompts')
  const agentsDir = path.join(claudeDir, 'agents')
  if (!dryRun) await fs.ensureDir(agentsDir)

  if (await fs.pathExists(promptsDir)) {
    const prompts = await fs.readdir(promptsDir)
    for (const file of prompts) {
      if (!file.endsWith('.md')) continue
      await safeCopy(path.join(promptsDir, file), path.join(agentsDir, file))
    }
  }

  // 2. Generate a combined settings file with rules + skill references
  const combinedRules = await buildCombinedRules()
  const skillList = skills.map((s) => `- ${s.id}: .agent/skills/${s.id}/SKILL.md`).join('\n')

  const settings = `# Claude Code Settings (Auto-Generated)

> Synced from \`.agent/\`. Do not edit manually.

${combinedRules}

## Available Skills

Reference these skills by reading the SKILL.md file when relevant:

${skillList}
`
  await safeWrite(path.join(claudeDir, 'settings.md'), settings)
}

/**
 * CODEX (.codex/)
 * 
 * OpenAI Codex CLI reads:
 *   .codex/AGENTS.md   - operating guide
 *   .codex/RULES.md     - engineering constraints
 *   .codex/COMMANDS.md  - project commands
 *   .codex/CONTEXT.md   - project context
 *   .codex/DECISIONS.md - architecture decisions
 */
async function syncCodex(skills) {
  const codexDir = PLATFORMS.codex.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → Codex (.codex/)'))

  // 1. Delete typo file
  await safeRemove(path.join(codexDir, 'DECESIONS.md'))

  // 2. Regenerate RULES.md from .agent/rules/
  const rules = await getTrackedRules()
  let rulesContent = '# Engineering Rules (Auto-Generated)\n\n'
  rulesContent += '> Synced from `.agent/rules/`. Do not edit manually.\n\n'

  for (const rule of rules.filter((r) => r.alwaysApply)) {
    rulesContent += stripFrontmatter(rule.content) + '\n\n---\n\n'
  }
  await safeWrite(path.join(codexDir, 'RULES.md'), rulesContent.trim() + '\n')

  // 3. Regenerate DECISIONS.md from memories
  const memoriesDir = path.join(AGENT_DIR, 'memories')
  if (await fs.pathExists(memoriesDir)) {
    const memoryFiles = await fs.readdir(memoriesDir)
    let decisions = '# Architecture Decisions (Auto-Generated)\n\n'
    decisions += '> Synced from `.agent/memories/`. Do not edit manually.\n\n'

    for (const file of memoryFiles.filter((f) => f.endsWith('.md'))) {
      const content = await fs.readFile(path.join(memoriesDir, file), 'utf-8')
      decisions += content + '\n\n---\n\n'
    }
    await safeWrite(path.join(codexDir, 'DECISIONS.md'), decisions.trim() + '\n')
  }

  // 4. Sync skills directory
  const codexSkillsDir = path.join(codexDir, 'skills')
  await safeRemove(codexSkillsDir)
  if (!dryRun) await fs.ensureDir(codexSkillsDir)

  for (const skill of skills) {
    await safeCopy(skill.dir, path.join(codexSkillsDir, skill.id))
  }

  // 5. Sync workflows
  const workflowsSrc = path.join(AGENT_DIR, 'workflows')
  if (await fs.pathExists(workflowsSrc)) {
    await safeCopy(workflowsSrc, path.join(codexDir, 'workflows'))
  }
}

/**
 * GITHUB (.github/)
 * 
 * GitHub Copilot reads:
 *   .github/copilot-instructions.md - global instructions
 *   .github/SKILL.md               - skills (custom extension)
 */
async function syncGitHub(skills) {
  const githubDir = PLATFORMS.github.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → GitHub Copilot (.github/)'))

  // 1. Regenerate copilot-instructions.md from rules
  const rules = await getTrackedRules()
  const alwaysOn = rules.filter((r) => r.alwaysApply)

  let instructions = '# GitHub Copilot Instructions (Auto-Generated)\n\n'
  instructions += '> Synced from `.agent/rules/`. Do not edit manually.\n\n'
  instructions += 'This repository is an agent infrastructure hub supporting Nuxt 4, Vue 3, Tailwind CSS, Java/Spring Boot, and cloud-native stacks.\n\n'

  for (const rule of alwaysOn) {
    const body = stripFrontmatter(rule.content)
    // Condense rules to key bullet points for Copilot (it prefers concise)
    const lines = body.split('\n').filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*'))
    if (lines.length > 0) {
      const sectionTitle = rule.file.replace('.mdc', '').replace(/-/g, ' ')
      instructions += `## ${_.startCase(sectionTitle)}\n\n`
      instructions += lines.join('\n') + '\n\n'
    }
  }

  await safeWrite(path.join(githubDir, 'copilot-instructions.md'), instructions)

  // 2. Build a combined SKILL.md with all skills referenced
  const skillsSummary = await buildSkillsSummary(skills)
  await safeWrite(path.join(githubDir, 'SKILL.md'), skillsSummary)
}

/**
 * WINDSURF (.windsurf/)
 * 
 * Windsurf (Codeium) reads:
 *   .windsurf/rules/*.md   - project rules
 *   .windsurfrules          - legacy single-file rules (root)
 */
async function syncWindsurf(skills) {
  const windsurfDir = PLATFORMS.windsurf.dir
  console.log(chalk.cyan.bold('\n📦 Syncing → Windsurf (.windsurf/)'))

  // 1. Create .windsurf/rules/ from .agent/rules/
  const rulesDir = path.join(windsurfDir, 'rules')
  if (!dryRun) await fs.ensureDir(rulesDir)

  const rules = await getTrackedRules()
  for (const rule of rules) {
    // Windsurf uses .md not .mdc
    const destFile = rule.file.replace('.mdc', '.md')
    const content = stripFrontmatter(rule.content)
    await safeWrite(path.join(rulesDir, destFile), content + '\n')
  }

  // 2. Generate legacy .windsurfrules at repo root (combined rules)
  const combinedRules = await buildCombinedRules()
  await safeWrite(path.join(ROOT, '.windsurfrules'), combinedRules)

  // 3. Sync skills
  const windsurfSkillsDir = path.join(windsurfDir, 'skills')
  await safeRemove(windsurfSkillsDir)
  if (!dryRun) await fs.ensureDir(windsurfSkillsDir)

  for (const skill of skills) {
    await safeCopy(skill.dir, path.join(windsurfSkillsDir, skill.id))
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

console.log(chalk.magenta.bold('\n🔄 Agent Infrastructure Cross-Platform Sync'))
console.log(chalk.gray(`   Source: .agent/`))
console.log(chalk.gray(`   Target: ${target}`))

// 1. Get all tracked skills
const skills = await getTrackedSkills()
console.log(chalk.gray(`   Tracked skills: ${skills.length}`))

// 2. Execute sync
if (target === 'all') {
  for (const [name, platform] of Object.entries(PLATFORMS)) {
    await platform.sync(skills)
  }
} else if (PLATFORMS[target]) {
  await PLATFORMS[target].sync(skills)
} else {
  console.log(chalk.red(`\n❌ Unknown target: "${target}"`))
  console.log(chalk.gray(`   Available: ${Object.keys(PLATFORMS).join(', ')}, all`))
  process.exit(1)
}

// 3. Summary
console.log(chalk.magenta.bold('\n────────────────────────────────────────'))
if (dryRun) {
  console.log(chalk.yellow.bold('🔍 Dry run complete. No files were modified.'))
} else {
  console.log(chalk.green.bold('✅ Sync complete!'))
}
console.log(chalk.gray(`   ${skills.length} skills synced to: ${target === 'all' ? Object.keys(PLATFORMS).join(', ') : target}\n`))
