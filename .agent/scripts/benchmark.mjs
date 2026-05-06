#!/usr/bin/env zx
import { fs, path, chalk, $, argv } from 'zx'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── CONFIG ────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..')
const SKILLS_DIR = argv['skills-dir']
  ? path.resolve(argv['skills-dir'])
  : path.join(ROOT, 'skills')
const BENCHMARKS_DIR = path.join(ROOT, 'benchmarks')

const SAVE_BASELINE = argv['save-baseline'] || false

// ─── THRESHOLDS ────────────────────────────────────────────────────────────
const THRESHOLDS = {
  d1: { maxChars: 4000 },
  d3: { minPct: 95 },
  d4: { minPct: 75 },
  d6: { minPct: 95 },
  d7: { minPct: 90 },
  d8: { minBodyChars: 200, minPct: 90 },
  d9: { minPct: 90 },
  d10: { maxLines: 500, maxWords: 3500, minLines: 10, minPct: 90 },
  d11: { minPct: 80 },
  d12: { minPct: 100 },
  d13: { minPct: 100 },
}

// ─── HELPERS ───────────────────────────────────────────────────────────────
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result = {}
  let currentKey = null
  for (const line of match[1].split('\n')) {
    // Handle YAML list items
    if (/^\s+-\s+/.test(line) && currentKey) {
      const item = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '')
      if (!Array.isArray(result[currentKey])) result[currentKey] = []
      result[currentKey].push(item)
      continue
    }
    const [key, ...rest] = line.split(':')
    if (key && rest.length) {
      const val = rest.join(':').trim()
      currentKey = key.trim()
      if (val === '') {
        result[currentKey] = []
      } else {
        result[currentKey] = val === 'true' ? true : val === 'false' ? false : val
      }
    }
  }
  return result
}

function getSkillBody(content) {
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trim()
}

function extractMdLinks(content) {
  const links = []
  const pattern = /\[([^\]]*)\]\(([^)]+\.md)\)/g
  let m
  while ((m = pattern.exec(content)) !== null) {
    const ref = m[2]
    if (!ref.startsWith('http') && !ref.startsWith('#') && !ref.startsWith('/')) {
      links.push(ref)
    }
  }
  return links
}

async function getSkillDirs() {
  const skillsDir = SKILLS_DIR
  if (!(await fs.pathExists(skillsDir))) return []
  const entries = await fs.readdir(skillsDir)
  const dirs = []
  for (const e of entries) {
    if (e.startsWith('_')) continue
    const p = path.join(skillsDir, e)
    if ((await fs.stat(p)).isDirectory()) dirs.push(e)
  }
  return dirs
}

// ─── D1: alwaysApply Character Count ───────────────────────────────────────
async function runD1() {
  const rulesDir = path.join(ROOT, 'rules')
  if (!(await fs.pathExists(rulesDir))) return { files: [], total: 0 }
  const files = (await fs.readdir(rulesDir)).filter(f => f.endsWith('.md'))
  const fileData = []
  for (const file of files) {
    const content = await fs.readFile(path.join(rulesDir, file), 'utf-8')
    const fm = parseFrontmatter(content)
    const chars = content.length
    fileData.push({ file, alwaysApply: fm.alwaysApply === true, chars })
  }
  const alwaysFiles = fileData.filter(f => f.alwaysApply)
  const total = alwaysFiles.reduce((sum, f) => sum + f.chars, 0)
  return { files: fileData, total }
}

// ─── D2: Hardcoded Values ──────────────────────────────────────────────────
const HARDCODED_PATTERNS = [
  { pattern: /my-project/gi, label: 'project-name:my-project' },
  { pattern: /anhtuong\.dev/gi, label: 'domain:anhtuong.dev' },
  { pattern: /GOOGLE_AI_STUDIO_API_KEY/g, label: 'env-var:GOOGLE_AI_STUDIO_API_KEY' },
  { pattern: /JWT_SECRET/g, label: 'env-var:JWT_SECRET' },
  { pattern: /gemini-[\d.]+-flash[\w-]*/gi, label: 'model-id:gemini-flash' },
  { pattern: /gemini-[\d.]+-pro[\w-]*/gi, label: 'model-id:gemini-pro' },
  { pattern: /gemma-3-\d+b-it/gi, label: 'model-id:gemma' },
]

async function runD2() {
  const scanDirs = [
    { subdir: 'rules', ext: '.md' },
    { subdir: 'memories', ext: '.md' },
  ]
  const hits = []
  let total = 0
  for (const { subdir, ext } of scanDirs) {
    const d = path.join(ROOT, subdir)
    if (!(await fs.pathExists(d))) continue
    const files = (await fs.readdir(d)).filter(f => f.endsWith(ext))
    for (const file of files) {
      const content = await fs.readFile(path.join(d, file), 'utf-8')
      for (const { pattern, label } of HARDCODED_PATTERNS) {
        const matches = content.match(pattern) || []
        if (matches.length) {
          hits.push({ file: `${subdir}/${file}`, label, count: matches.length })
          total += matches.length
        }
      }
    }
  }
  return { hits, total }
}

// ─── D3: Skill Registration Coverage ───────────────────────────────────────
async function runD3() {
  const manifestPath = path.join(ROOT, 'manifest.json')
  let registered = []
  if (await fs.pathExists(manifestPath)) {
    const manifest = await fs.readJson(manifestPath)
    registered = manifest.skills.map(s => s.id)
  }
  const filesystem = await getSkillDirs()
  const unregistered = filesystem.filter(s => !registered.includes(s))
  const pct = filesystem.length ? (registered.length / filesystem.length) * 100 : 0
  return { registered: registered.length, filesystem: filesystem.length, unregistered, pct }
}

// ─── D4: Cross-Reference Integrity ────────────────────────────────────────
async function runD4() {
  const skillDirs = await getSkillDirs()
  const workflowDir = path.join(ROOT, 'workflows')
  const workflowFiles = (await fs.pathExists(workflowDir))
    ? (await fs.readdir(workflowDir)).filter(f => f.endsWith('.md'))
    : []

  const broken = []
  let totalRefs = 0

  for (const skillId of skillDirs) {
    const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) continue
    const content = await fs.readFile(skillMd, 'utf-8')

    // Extract @skill:name and @workflow:file.md references
    for (const [, ref] of content.matchAll(/@skill:([a-z0-9-]+)/gi)) {
      totalRefs++
      if (!skillDirs.includes(ref)) broken.push({ from: skillId, ref, type: 'skill' })
    }
    for (const [, ref] of content.matchAll(/@workflow:([\w-]+\.md)/gi)) {
      totalRefs++
      if (!workflowFiles.includes(ref)) broken.push({ from: skillId, ref, type: 'workflow' })
    }
  }

  const valid = totalRefs - broken.length
  const pct = totalRefs ? (valid / totalRefs) * 100 : 100
  return { total: totalRefs, broken, valid, pct }
}

// ─── D5: AI Provider Neutrality ───────────────────────────────────────────
// Scans all skills and rules for hardcoded AI provider references
async function runD5() {
  const checks = [
    { pattern: /Primary Provider/i, deduct: 15, label: '"Primary Provider" label' },
    { pattern: /spring:\s*\n?\s*ai:\s*\n?\s*google/i, deduct: 20, label: 'Provider-specific YAML config' },
    { pattern: /Fallback Chain[:\s].*gemini|gemini.*Fallback Chain/im, deduct: 10, label: 'Hardcoded provider in fallback chain' },
    { pattern: /Gemini Flash.*Tier|Tier.*Gemini Flash/i, deduct: 10, label: 'Hardcoded model as tier default' },
    { pattern: /GPT-4o-mini.*Tier|Tier.*GPT-4o-mini/i, deduct: 10, label: 'Hardcoded model as tier default' },
    { pattern: /Claude Haiku.*Tier|Tier.*Claude Haiku/i, deduct: 10, label: 'Hardcoded model as tier default' },
  ]

  // Scan all existing skill SKILL.md files + all rule files
  const scanFiles = []
  const skillDirs = await getSkillDirs()
  for (const id of skillDirs) {
    const p = `skills/${id}/SKILL.md`
    if (await fs.pathExists(path.join(SKILLS_DIR, id, 'SKILL.md'))) scanFiles.push(p)
  }
  const rulesDir = path.join(ROOT, 'rules')
  if (await fs.pathExists(rulesDir)) {
    for (const f of (await fs.readdir(rulesDir)).filter(f => f.endsWith('.md'))) {
      scanFiles.push(`rules/${f}`)
    }
  }

  let score = 100
  const deductions = []

  for (const relPath of scanFiles) {
    const content = await fs.readFile(path.join(SKILLS_DIR, '..', relPath), 'utf-8')
    for (const check of checks) {
      if (check.pattern.test(content)) {
        score -= check.deduct
        deductions.push({ file: relPath, label: check.label, deduct: check.deduct })
      }
    }
  }

  return { score: Math.max(0, score), deductions }
}

// ─── D6: Template Compliance ──────────────────────────────────────────────
async function runD6() {
  const skillDirs = await getSkillDirs()
  const failing = []
  const missing = []

  for (const skillId of skillDirs) {
    const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) {
      failing.push(skillId)
      missing.push(skillId)
      continue
    }
    const content = await fs.readFile(skillMd, 'utf-8')
    const fm = parseFrontmatter(content)
    if (!fm.name || !fm.description || !/^# .+/m.test(content)) {
      failing.push(skillId)
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, missing, pct }
}

// ─── D7: Metadata Completeness ────────────────────────────────────────────
// Every skill must have metadata.json with at least "version" and "references"
async function runD7() {
  const skillDirs = await getSkillDirs()
  const failing = []

  for (const skillId of skillDirs) {
    const metaPath = path.join(SKILLS_DIR, skillId, 'metadata.json')
    if (!(await fs.pathExists(metaPath))) {
      failing.push({ skill: skillId, reason: 'missing metadata.json' })
      continue
    }
    try {
      const meta = await fs.readJson(metaPath)
      if (!meta.version) {
        failing.push({ skill: skillId, reason: 'missing "version" field' })
      } else if (!Array.isArray(meta.references) && meta.references !== undefined) {
        failing.push({ skill: skillId, reason: '"references" is not an array' })
      }
    } catch {
      failing.push({ skill: skillId, reason: 'invalid JSON' })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, pct }
}

// ─── D8: Skill Documentation Depth ───────────────────────────────────────
// SKILL.md body (after frontmatter) should have meaningful content
async function runD8() {
  const skillDirs = await getSkillDirs()
  const failing = []

  for (const skillId of skillDirs) {
    const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) {
      failing.push({ skill: skillId, reason: 'missing SKILL.md' })
      continue
    }
    const content = await fs.readFile(skillMd, 'utf-8')
    // Strip frontmatter to measure body only
    const body = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '').trim()
    if (body.length < THRESHOLDS.d8.minBodyChars) {
      failing.push({ skill: skillId, reason: `body ${body.length} chars < ${THRESHOLDS.d8.minBodyChars}` })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, pct }
}

// ─── D9: Frontmatter Quality (Anthropic Spec) ─────────────────────────────
// Validates name format, description quality, and category field presence
async function runD9() {
  const skillDirs = await getSkillDirs()
  const RESERVED = /(?:anthropic|claude|openai|gpt)/i
  const failing = []

  for (const skillId of skillDirs) {
    const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) continue
    const content = await fs.readFile(skillMd, 'utf-8')
    const fm = parseFrontmatter(content)
    const issues = []

    // name: lowercase+hyphens, ≤64 chars, no reserved words
    if (!fm.name) {
      issues.push('missing name')
    } else {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(fm.name)) issues.push(`name format invalid: "${fm.name}"`)
      if (fm.name.length > 64) issues.push(`name too long: ${fm.name.length} > 64`)
      if (RESERVED.test(fm.name)) issues.push(`name uses reserved word: "${fm.name}"`)
    }

    // description: present, ≤1024 chars, has trigger hint
    if (!fm.description) {
      issues.push('missing description')
    } else {
      // Handle multi-line description (collected by parseFrontmatter as first line)
      // Read full description from raw frontmatter
      const fmBlock = content.match(/^---\s*\n([\s\S]*?)\n---/)
      let fullDesc = fm.description || ''
      if (fmBlock) {
        const descMatch = fmBlock[1].match(/description:\s*>-?\s*\n([\s\S]*?)(?=\n[a-z]|$)/i)
          || fmBlock[1].match(/description:\s*(.+)/i)
        if (descMatch) fullDesc = descMatch[1].replace(/\n\s+/g, ' ').trim()
      }
      if (fullDesc.length > 1024) issues.push(`description too long: ${fullDesc.length} > 1024`)
      if (/^(I |You |We )/i.test(fullDesc)) issues.push('description uses first/second person')
      if (!/use\s+(when|for|if|this)/i.test(fullDesc) && !/Use\s+(when|for|if|this)/i.test(fullDesc)) {
        issues.push('description missing trigger hint ("Use when/for...")')
      }
    }

    // category: recommended field
    if (!fm.category) {
      issues.push('missing category field')
    }

    if (issues.length > 0) {
      failing.push({ skill: skillId, issues })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, pct }
}

// ─── D10: Token Budget (Anthropic 500-line limit) ─────────────────────────
async function runD10() {
  const skillDirs = await getSkillDirs()
  const failing = []
  const details = []

  for (const skillId of skillDirs) {
    const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) continue
    const content = await fs.readFile(skillMd, 'utf-8')
    const body = getSkillBody(content)
    const lines = body.split('\n').length
    const words = body.split(/\s+/).filter(Boolean).length
    const issues = []

    if (lines > THRESHOLDS.d10.maxLines) {
      issues.push(`body ${lines} lines > ${THRESHOLDS.d10.maxLines} limit`)
    }
    if (words > THRESHOLDS.d10.maxWords) {
      issues.push(`body ${words} words > ${THRESHOLDS.d10.maxWords} soft limit`)
    }
    if (lines < THRESHOLDS.d10.minLines) {
      issues.push(`body ${lines} lines < ${THRESHOLDS.d10.minLines} minimum`)
    }

    details.push({ skill: skillId, lines, words })
    if (issues.length > 0) {
      failing.push({ skill: skillId, lines, words, issues })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, details, pct }
}

// ─── D11: Content Quality Signals ─────────────────────────────────────────
// Checks for concrete examples (code blocks, rule tables) and positive framing
async function runD11() {
  const skillDirs = await getSkillDirs()
  const failing = []

  for (const skillId of skillDirs) {
    const skillDir = path.join(SKILLS_DIR, skillId)
    const skillMd = path.join(skillDir, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) continue
    const content = await fs.readFile(skillMd, 'utf-8')
    const body = getSkillBody(content)
    const issues = []

    // Detect Type B (reference-index) skills — exempt from exemplar requirement
    const hasRefsDir = await fs.pathExists(path.join(skillDir, 'references'))
    const isTypeB = hasRefsDir

    if (!isTypeB) {
      // Check for ANY form of concrete examples
      const hasCodeBlocks = /```[\s\S]*?```/.test(body)
      const hasRuleTables = /\|\s*✅/.test(body) || /\|\s*❌/.test(body)
      const hasExampleSection = /^#+\s*(example|quick\s*start|usage)/im.test(body)
      const hasExemplars = hasCodeBlocks || hasRuleTables || hasExampleSection

      if (!hasExemplars) {
        issues.push('no concrete examples (code blocks, ✅/❌ tables, or Example section)')
      }
    }

    // Positive framing: ALWAYS count should >= NEVER count
    const alwaysCount = (body.match(/\bALWAYS\b/g) || []).length
    const neverCount = (body.match(/\bNEVER\b/g) || []).length
    if (neverCount > 0 && alwaysCount < neverCount) {
      issues.push(`negative framing: ${neverCount} NEVER vs ${alwaysCount} ALWAYS`)
    }

    if (issues.length > 0) {
      failing.push({ skill: skillId, issues, isTypeB })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, pct }
}

// ─── D12: Progressive Disclosure ──────────────────────────────────────────
// Reference files linked from SKILL.md must not chain to further .md files
async function runD12() {
  const skillDirs = await getSkillDirs()
  const failing = []

  for (const skillId of skillDirs) {
    const skillDir = path.join(SKILLS_DIR, skillId)
    const skillMd = path.join(skillDir, 'SKILL.md')
    if (!(await fs.pathExists(skillMd))) continue
    const content = await fs.readFile(skillMd, 'utf-8')

    // Find .md links in SKILL.md (level 1)
    const level1Refs = extractMdLinks(content)
    const nestedChains = []

    for (const ref of level1Refs) {
      const refPath = path.join(skillDir, ref)
      if (!(await fs.pathExists(refPath))) continue
      const refContent = await fs.readFile(refPath, 'utf-8')

      // Check if level-1 file links to MORE .md files (level 2 = too deep)
      const level2Refs = extractMdLinks(refContent)
      if (level2Refs.length > 0) {
        nestedChains.push({ from: ref, nested: level2Refs })
      }
    }

    if (nestedChains.length > 0) {
      failing.push({ skill: skillId, chains: nestedChains })
    }
  }

  const total = skillDirs.length
  const passing = total - failing.length
  const pct = total ? (passing / total) * 100 : 0
  return { total, passing, failing, pct }
}

// ─── D13: Distribution Contract ───────────────────────────────────────────
// Every filesystem skill must be in a dist channel OR in exclude list.
// Every skill in dist-config must exist on filesystem.
// Every dependsOn target must be reachable within the same channel or its required parent.
async function runD13() {
  const configPath = path.join(ROOT, '..', 'dist-config.json')
  // Fallback: config may be at ROOT level (inside .agent/)
  const altConfigPath = path.join(ROOT, 'dist-config.json')
  const cfgPath = (await fs.pathExists(configPath)) ? configPath : altConfigPath
  if (!(await fs.pathExists(cfgPath))) {
    return { orphans: [], phantoms: [], unreachableDeps: [], total: 0, failing: 0, pct: 100 }
  }

  const config = await fs.readJson(cfgPath)
  const channels = config.channels || {}
  const excludeList = config.exclude || []
  const filesystem = await getSkillDirs()

  // Collect all skills per channel
  const channelSkills = {}
  const allDistSkills = new Set()
  for (const [channelId, channelDef] of Object.entries(channels)) {
    const skills = []
    if (channelDef.skills) {
      for (const group of Object.values(channelDef.skills)) {
        if (Array.isArray(group.items)) {
          for (const s of group.items) {
            skills.push(s)
            allDistSkills.add(s)
          }
        }
      }
    }
    channelSkills[channelId] = { skills, requires: channelDef.requires || null }
  }

  // Check 1: Orphans — filesystem skills not in any channel and not excluded
  const orphans = filesystem.filter(s => !allDistSkills.has(s) && !excludeList.includes(s))

  // Check 2: Phantoms — dist-config skills that don't exist on filesystem
  const phantoms = [...allDistSkills].filter(s => !filesystem.includes(s))

  // Check 3: Unreachable deps — dependsOn targets not in same channel or required parent
  const unreachableDeps = []
  for (const [channelId, { skills, requires }] of Object.entries(channelSkills)) {
    // Build reachable set: own skills + parent channel skills (if requires)
    const reachable = new Set(skills)
    if (requires && channelSkills[requires]) {
      for (const s of channelSkills[requires].skills) reachable.add(s)
    }

    for (const skillId of skills) {
      const skillMd = path.join(SKILLS_DIR, skillId, 'SKILL.md')
      if (!(await fs.pathExists(skillMd))) continue
      const content = await fs.readFile(skillMd, 'utf-8')
      const fm = parseFrontmatter(content)
      if (Array.isArray(fm.depends_on)) {
        for (const dep of fm.depends_on) {
          if (!reachable.has(dep)) {
            unreachableDeps.push({ channel: channelId, skill: skillId, dep })
          }
        }
      }
    }
  }

  const total = orphans.length + phantoms.length + unreachableDeps.length
  const pct = total === 0 ? 100 : 0
  return { orphans, phantoms, unreachableDeps, total, failing: total, pct }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
console.log(chalk.bold.cyan(`\n📊 Agent Benchmark (D1–D13)\n`))

const [d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13] = await Promise.all([
  runD1(), runD2(), runD3(), runD4(), runD5(), runD6(), runD7(), runD8(),
  runD9(), runD10(), runD11(), runD12(), runD13(),
])

// ─── Evaluate ──────────────────────────────────────────────────────────────
const results = [
  { label: 'D1: Always-Apply Size', value: `${d1.total} chars`, pass: d1.total <= THRESHOLDS.d1.maxChars },
  { label: 'D2: Hardcoded Values', value: `${d2.total} hits`, pass: d2.total === 0 },
  { label: 'D3: Skill Coverage', value: `${d3.pct.toFixed(1)}%`, pass: d3.pct >= THRESHOLDS.d3.minPct },
  { label: 'D4: Ref Integrity', value: `${d4.pct.toFixed(1)}%`, pass: d4.pct >= THRESHOLDS.d4.minPct },
  { label: 'D5: AI Neutrality', value: `${d5.score}/100`, pass: d5.score >= 70 },
  { label: 'D6: Template Compliance', value: `${d6.pct.toFixed(1)}%`, pass: d6.pct >= THRESHOLDS.d6.minPct && d6.missing.length === 0 },
  { label: 'D7: Metadata Completeness', value: `${d7.pct.toFixed(1)}%`, pass: d7.pct >= THRESHOLDS.d7.minPct },
  { label: 'D8: Documentation Depth', value: `${d8.pct.toFixed(1)}%`, pass: d8.pct >= THRESHOLDS.d8.minPct },
  { label: 'D9: Frontmatter Quality', value: `${d9.pct.toFixed(1)}%`, pass: d9.pct >= THRESHOLDS.d9.minPct },
  { label: 'D10: Token Budget', value: `${d10.pct.toFixed(1)}%`, pass: d10.pct >= THRESHOLDS.d10.minPct },
  { label: 'D11: Content Quality', value: `${d11.pct.toFixed(1)}%`, pass: d11.pct >= THRESHOLDS.d11.minPct },
  { label: 'D12: Progressive Disclosure', value: `${d12.pct.toFixed(1)}%`, pass: d12.pct >= THRESHOLDS.d12.minPct },
  { label: 'D13: Distribution Contract', value: `${d13.total} issues`, pass: d13.pct >= THRESHOLDS.d13.minPct },
]

const allPass = results.every(r => r.pass)

// ─── Console Output ────────────────────────────────────────────────────────
console.log(`${'Dimension'.padEnd(32)} ${'Value'.padEnd(15)} Result`)
console.log('─'.repeat(60))
for (const r of results) {
  const status = r.pass ? chalk.green('PASS') : chalk.red('FAIL')
  console.log(`${r.label.padEnd(32)} ${r.value.padEnd(15)} ${status}`)
}
console.log('─'.repeat(60))

// Print details for failures
if (d1.total > THRESHOLDS.d1.maxChars) {
  console.log(chalk.red.bold(`\nD1 ceiling exceeded: ${d1.total} > ${THRESHOLDS.d1.maxChars} chars`))
}
if (d2.total > 0) {
  console.log(chalk.yellow(`\nD2 hits:`))
  for (const h of d2.hits) console.log(`  ${h.file}: ${h.label} (${h.count})`)
}
if (d3.unregistered.length > 0) {
  console.log(chalk.yellow(`\nD3 unregistered: ${d3.unregistered.join(', ')}`))
}
if (d4.broken.length > 0) {
  console.log(chalk.yellow(`\nD4 broken refs:`))
  for (const b of d4.broken) console.log(`  ${b.from} -> @${b.type}:${b.ref}`)
}
if (d6.failing.length > 0) {
  console.log(chalk.yellow(`\nD6 non-compliant: ${d6.failing.join(', ')}`))
}
if (d6.missing.length > 0) {
  console.log(chalk.red.bold(`\nD6 fatal: missing SKILL.md in: ${d6.missing.join(', ')}`))
}
if (d7.failing.length > 0) {
  console.log(chalk.yellow(`\nD7 metadata issues:`))
  for (const f of d7.failing) console.log(`  ${f.skill}: ${f.reason}`)
}
if (d8.failing.length > 0) {
  console.log(chalk.yellow(`\nD8 shallow docs:`))
  for (const f of d8.failing) console.log(`  ${f.skill}: ${f.reason}`)
}
if (d9.failing.length > 0) {
  console.log(chalk.yellow(`\nD9 frontmatter issues:`))
  for (const f of d9.failing) {
    console.log(`  ${f.skill}:`)
    for (const issue of f.issues) console.log(`    ⚠ ${issue}`)
  }
}
if (d10.failing.length > 0) {
  console.log(chalk.yellow(`\nD10 token budget exceeded:`))
  for (const f of d10.failing) {
    console.log(`  ${f.skill}: ${f.lines} lines / ${f.words} words`)
    for (const issue of f.issues) console.log(`    ⚠ ${issue}`)
  }
}
if (d11.failing.length > 0) {
  console.log(chalk.yellow(`\nD11 content quality issues:`))
  for (const f of d11.failing) {
    const tag = f.isTypeB ? ' [Type-B]' : ''
    console.log(`  ${f.skill}${tag}:`)
    for (const issue of f.issues) console.log(`    ⚠ ${issue}`)
  }
}
if (d12.failing.length > 0) {
  console.log(chalk.yellow(`\nD12 nested references (depth > 1):`))
  for (const f of d12.failing) {
    console.log(`  ${f.skill}:`)
    for (const c of f.chains) {
      console.log(`    ${c.from} → ${c.nested.join(', ')}`)
    }
  }
}
if (d13.orphans.length > 0) {
  console.log(chalk.yellow(`\nD13 orphan skills (not in any channel or exclude):`))
  for (const s of d13.orphans) console.log(`  ${s}`)
}
if (d13.phantoms.length > 0) {
  console.log(chalk.red(`\nD13 phantom skills (in dist-config but not on filesystem):`))
  for (const s of d13.phantoms) console.log(`  ${s}`)
}
if (d13.unreachableDeps.length > 0) {
  console.log(chalk.yellow(`\nD13 unreachable deps (dependsOn target not in channel or parent):`))
  for (const u of d13.unreachableDeps) console.log(`  ${u.channel}: ${u.skill} → ${u.dep}`)
}

const totalDims = results.length
if (allPass) {
  console.log(chalk.green.bold(`\n✅ BENCHMARK PASSED (${totalDims}/${totalDims})\n`))
} else {
  const passCount = results.filter(r => r.pass).length
  console.log(chalk.red.bold(`\n❌ BENCHMARK FAILED (${passCount}/${totalDims})\n`))
}

// ─── Save report ───────────────────────────────────────────────────────────
await fs.ensureDir(BENCHMARKS_DIR)

// Build per-skill scorecard
const skillDirs = await getSkillDirs()
const perSkill = {}

for (const id of skillDirs) {
  perSkill[id] = { D6: '✅', D7: '✅', D8: '✅', D9: '✅', D10: '✅', D11: '✅', D12: '✅', deps: [], issues: [] }
  // Extract depends_on
  const skillMdPath = path.join(SKILLS_DIR, id, 'SKILL.md')
  if (await fs.pathExists(skillMdPath)) {
    const content = await fs.readFile(skillMdPath, 'utf-8')
    const fm = parseFrontmatter(content)
    if (Array.isArray(fm.depends_on)) {
      perSkill[id].deps = fm.depends_on
    }
  }
}

// Map dimension failures to per-skill results
for (const id of d6.failing) {
  if (perSkill[id]) { perSkill[id].D6 = '❌'; perSkill[id].issues.push('D6: template non-compliant') }
}
for (const { skill, reason } of d7.failing) {
  if (perSkill[skill]) { perSkill[skill].D7 = '❌'; perSkill[skill].issues.push(`D7: ${reason}`) }
}
for (const { skill, reason } of d8.failing) {
  if (perSkill[skill]) { perSkill[skill].D8 = '❌'; perSkill[skill].issues.push(`D8: ${reason}`) }
}
for (const { skill, issues } of d9.failing) {
  if (perSkill[skill]) { perSkill[skill].D9 = '❌'; for (const i of issues) perSkill[skill].issues.push(`D9: ${i}`) }
}
for (const { skill, issues } of d10.failing) {
  if (perSkill[skill]) {
    // D10 soft limit → warning, hard limit → fail
    const isHard = issues.some(i => /lines >/.test(i))
    perSkill[skill].D10 = isHard ? '❌' : '⚠️'
    for (const i of issues) perSkill[skill].issues.push(`D10: ${i}`)
  }
}
for (const { skill, issues } of d11.failing) {
  if (perSkill[skill]) { perSkill[skill].D11 = '❌'; for (const i of issues) perSkill[skill].issues.push(`D11: ${i}`) }
}
for (const { skill } of d12.failing) {
  if (perSkill[skill]) { perSkill[skill].D12 = '❌'; perSkill[skill].issues.push('D12: nested references (depth > 1)') }
}

// Calculate per-skill score
for (const id of skillDirs) {
  const s = perSkill[id]
  const dims = [s.D6, s.D7, s.D8, s.D9, s.D10, s.D11, s.D12]
  const passCount = dims.filter(v => v === '✅').length
  const warnCount = dims.filter(v => v === '⚠️').length
  s.score = `${passCount + warnCount}/${dims.length}`
  s.grade = passCount === dims.length ? 'A'
    : (passCount + warnCount) === dims.length ? 'A-'
    : passCount >= 5 ? 'B'
    : passCount >= 3 ? 'C'
    : 'F'
}

// Build markdown report
const now = new Date()
const dateStr = now.toISOString().split('T')[0]
const passCount = results.filter(r => r.pass).length

let report = `# 📊 Agent Benchmark Report\n\n`
report += `**Date**: ${dateStr}  \n`
report += `**Verdict**: ${allPass ? '✅ PASS' : '❌ FAIL'} (${passCount}/${results.length} dimensions)  \n`
report += `**Skills**: ${skillDirs.length} total  \n`
report += `**Distribution**: ${d13.total === 0 ? '✅ All skills covered' : `❌ ${d13.total} issues`}\n\n`

// Section 1: Overall dimensions
report += `## Overall Dimensions (D1–D13)\n\n`
report += `| Dimension | Value | Result |\n|---|---|---|\n`
for (const r of results) {
  report += `| ${r.label} | ${r.value} | ${r.pass ? '✅' : '❌'} |\n`
}
report += `\n`

// Legend
report += `> **D1–D5**: System-level (apply to entire infrastructure)  \n`
report += `> **D6–D12**: Per-skill (see scorecard below)  \n`
report += `> **D13**: Distribution contract (cross-cutting)\n\n`

// Section 2: Per-skill scorecard
report += `## Per-Skill Scorecard\n\n`
report += `| Skill | Deps | D6 | D7 | D8 | D9 | D10 | D11 | D12 | Grade |\n`
report += `|-------|:-----|:--:|:--:|:--:|:--:|:---:|:---:|:---:|:-----:|\n`

const sortedSkills = [...skillDirs].sort((a, b) => {
  const ga = perSkill[a].grade, gb = perSkill[b].grade
  if (ga !== gb) return ga.localeCompare(gb)
  return a.localeCompare(b)
})

for (const id of sortedSkills) {
  const s = perSkill[id]
  const depsStr = s.deps.length > 0 ? s.deps.join(', ') : '—'
  report += `| ${id} | ${depsStr} | ${s.D6} | ${s.D7} | ${s.D8} | ${s.D9} | ${s.D10} | ${s.D11} | ${s.D12} | **${s.grade}** |\n`
}
report += `\n`

// Grade distribution
const grades = {}
for (const id of skillDirs) {
  const g = perSkill[id].grade
  grades[g] = (grades[g] || 0) + 1
}
report += `### Grade Distribution\n\n`
report += `| Grade | Count | Meaning |\n|:-----:|:-----:|:--------|\n`
if (grades['A']) report += `| A | ${grades['A']} | All dimensions pass |\n`
if (grades['A-']) report += `| A- | ${grades['A-']} | All pass with soft warnings |\n`
if (grades['B']) report += `| B | ${grades['B']} | 5-6 dimensions pass |\n`
if (grades['C']) report += `| C | ${grades['C']} | 3-4 dimensions pass |\n`
if (grades['F']) report += `| F | ${grades['F']} | <3 dimensions pass |\n`
report += `\n`

// Section 3: Issues detail (only if any)
const skillsWithIssues = skillDirs.filter(id => perSkill[id].issues.length > 0)
if (skillsWithIssues.length > 0) {
  report += `## Issues Detail\n\n`
  for (const id of skillsWithIssues) {
    report += `### ${id} (Grade: ${perSkill[id].grade})\n\n`
    for (const issue of perSkill[id].issues) {
      report += `- ⚠ ${issue}\n`
    }
    report += `\n`
  }
}

// Section 4: Dimension legend
report += `## Dimension Reference\n\n`
report += `| ID | Name | What It Checks |\n|:--:|------|---------------|\n`
report += `| D1 | Always-Apply Size | Total chars in always-apply rules ≤ ${THRESHOLDS.d1.maxChars} |\n`
report += `| D2 | Hardcoded Values | No hardcoded env vars, model IDs, domains |\n`
report += `| D3 | Skill Coverage | All filesystem skills registered in manifest |\n`
report += `| D4 | Ref Integrity | @skill and @workflow references resolve |\n`
report += `| D5 | AI Neutrality | No provider-specific bias in rules/skills |\n`
report += `| D6 | Template Compliance | Has name, description, and # heading |\n`
report += `| D7 | Metadata Completeness | Has metadata.json with version field |\n`
report += `| D8 | Documentation Depth | SKILL.md body ≥ ${THRESHOLDS.d8.minBodyChars} chars |\n`
report += `| D9 | Frontmatter Quality | Name format, description quality, trigger hint, category |\n`
report += `| D10 | Token Budget | Body ≤ ${THRESHOLDS.d10.maxLines} lines, ≤ ${THRESHOLDS.d10.maxWords} words |\n`
report += `| D11 | Content Quality | Has concrete examples + positive framing |\n`
report += `| D12 | Progressive Disclosure | Reference depth ≤ 1 level |\n`
report += `| D13 | Distribution Contract | Every skill in a dist channel or excluded; no phantoms; deps reachable |\n`
report += `\n`

// D13 detail section
if (d13.total > 0) {
  report += `## D13 Distribution Issues\n\n`
  if (d13.orphans.length > 0) {
    report += `### Orphan Skills (not in any channel or exclude)\n\n`
    for (const s of d13.orphans) report += `- \`${s}\`\n`
    report += `\n`
  }
  if (d13.phantoms.length > 0) {
    report += `### Phantom Skills (in dist-config but not on filesystem)\n\n`
    for (const s of d13.phantoms) report += `- \`${s}\`\n`
    report += `\n`
  }
  if (d13.unreachableDeps.length > 0) {
    report += `### Unreachable Dependencies\n\n`
    report += `| Channel | Skill | Missing Dep |\n|---------|-------|-------------|\n`
    for (const u of d13.unreachableDeps) report += `| ${u.channel} | ${u.skill} | ${u.dep} |\n`
    report += `\n`
  }
}
report += `---\n*Generated by npm run agent:benchmark at ${now.toISOString()}*\n`

await fs.writeFile(path.join(BENCHMARKS_DIR, 'latest-report.md'), report)
console.log(chalk.dim(`Report saved: ${path.join(BENCHMARKS_DIR, 'latest-report.md')}`))

// ─── Save history ────────────────────────────────────────────────────────────
const historyPath = path.join(BENCHMARKS_DIR, 'benchmark-history.json')
let history = []
if (await fs.pathExists(historyPath)) {
  history = await fs.readJson(historyPath)
}
history.push({
  timestamp: new Date().toISOString(),
  verdict: allPass ? 'PASS' : 'FAIL',
  results: results.map(r => ({ label: r.label, value: r.value, pass: r.pass }))
})
// Keep last 100 entries
if (history.length > 100) history = history.slice(-100)
await fs.writeJson(historyPath, history, { spaces: 2 })
console.log(chalk.dim(`History updated: ${historyPath}`))

// ─── Save baseline if requested ────────────────────────────────────────────
if (SAVE_BASELINE) {
  const baseline = {
    generatedAt: new Date().toISOString(),
    dimensions: { d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, d13 },
  }
  const baselinePath = path.join(BENCHMARKS_DIR, `baseline-latest.json`)
  await fs.writeJson(baselinePath, baseline, { spaces: 2 })
  console.log(chalk.green(`Baseline saved: ${baselinePath}\n`))
}

process.exit(allPass ? 0 : 1)
