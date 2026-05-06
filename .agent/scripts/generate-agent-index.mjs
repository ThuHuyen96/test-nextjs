import { fs, path, $, chalk, argv } from 'zx'
import { fileURLToPath } from 'url'
import _ from 'lodash'
import markdownit from 'markdown-it'
import * as cheerio from 'cheerio'
import { z } from 'zod'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper to parse YAML frontmatter from markdown
function parseFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (!match) return { data: {}, content: text.trim() }
  
  const yaml = match[1]
  const data = {}
  let currentKey = null
  yaml.split('\n').forEach(line => {
    // Handle YAML list items (e.g., "  - vue-best-practices")
    if (/^\s+-\s+/.test(line) && currentKey) {
      const item = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '')
      if (!Array.isArray(data[currentKey])) data[currentKey] = []
      data[currentKey].push(item)
      return
    }
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim()
      currentKey = key
      if (value === '') {
        // Multi-line list follows (e.g., depends_on:)
        data[key] = []
      } else if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean)
      } else {
        data[key] = value
      }
    }
  })
  
  return { 
    data, 
    content: text.slice(match[0].length).trim() 
  }
}

// 1. Define the Schema for Machine-readable metadata
const SkillSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  category: z.string(),
  path: z.string(),
  dependsOn: z.array(z.string()).optional(),
  humanCheck: z.string().optional(),
  benchmarkStatus: z.string().optional(),
  reviewStatus: z.string().optional(),
  finalStatus: z.string().optional(),
})

const md = markdownit()
const skillsDir = argv['skills-dir']
  ? path.resolve(argv['skills-dir'])
  : path.resolve(__dirname, '../skills')
const outputMd = path.resolve(__dirname, '../README.md')
const outputJson = path.resolve(__dirname, '../manifest.json')

console.log(chalk.cyan.bold('\n⚒️  Generating Agent Intelligence Manifest & Index...'))

const skills = await fs.readdir(skillsDir)

// Helper to check if a path is ignored by git (Issue #4: use nothrow)
async function isIgnored(skillPath) {
  const result = await $({ nothrow: true })`git check-ignore -q ${skillPath}`
  return result.exitCode === 0
}

// Helper to strip YAML frontmatter from markdown (Issue #2)
function stripFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/)
  if (match) {
    return content.slice(match[0].length).trim()
  }
  return content.trim()
}

// Helper to categorize skills (Legacy fallback)
function categorize(skillId, frontmatterCategory) {
  if (frontmatterCategory) return frontmatterCategory
  
  if (skillId.startsWith('frontend-')) return 'Design'
  if (skillId.startsWith('methodology-')) return 'Architecture'
  if (skillId.startsWith('git-') || skillId === 'mjml-email-template') return 'DevOps'
  if (skillId.startsWith('ai-') || skillId === 'find-skills') return 'Meta'
  if (skillId.startsWith('figma-')) return 'Figma'
  if (skillId === 'nuxt' || skillId === 'vite' || skillId === 'pinia' || skillId === 'vitest' || skillId === 'vueuse-functions') return 'Framework'
  
  return 'Standards'
}



// Parse benchmark report (Static)
const benchmarkPath = path.resolve(__dirname, '../benchmarks/latest-report.md')
let benchmarkData = {}
if (await fs.pathExists(benchmarkPath)) {
  const lines = (await fs.readFile(benchmarkPath, 'utf8')).split('\n')
  for (const line of lines) {
    if (line.startsWith('|')) {
      const parts = line.split('|').map(s => s.trim())
      if (parts[1] && parts.length > 3) {
        benchmarkData[parts[1]] = parts[parts.length - 2] // Grade or last score column
      }
    }
  }
}

// Parse review data from cache (Semantic LLM review results)
const reviewCachePath = path.resolve(__dirname, '../benchmarks/review-data.json')
let reviewData = {}
if (await fs.pathExists(reviewCachePath)) {
  const cache = await fs.readJson(reviewCachePath)
  for (const [id, entry] of Object.entries(cache)) {
    const grade = entry.grade || '?'
    let icon = '⚪'
    if (grade === 'A') icon = '🟢'
    if (grade === 'B') icon = '🟡'
    if (grade === 'C') icon = '🟠'
    if (grade === 'F') icon = '🔴'
    reviewData[id] = `${icon} ${grade}`
  }
}

// Load existing manifest to preserve lastUpdated if no functional changes (for CI stability)
const existingManifest = (await fs.pathExists(outputJson)) ? await fs.readJson(outputJson) : null

let categoryGroups = {}
let manifest = {
  lastUpdated: new Date().toISOString(),
  skills: []
}


for (const skill of skills) {
  const skillPath = path.join(skillsDir, skill)
  if (!(await fs.stat(skillPath)).isDirectory()) continue
  if (skill.startsWith('_')) continue // Skip template directories

  // Skip if ignored by git
  if (await isIgnored(skillPath)) {
    console.log(chalk.gray(`  ⏭️  Skipping ignored: ${skill}`))
    continue
  }

  const skillMdPath = path.join(skillPath, 'SKILL.md')
  if (await fs.pathExists(skillMdPath)) {
    const rawContent = await fs.readFile(skillMdPath, 'utf-8')

    const { data: frontmatter, content } = parseFrontmatter(rawContent)
    const html = md.render(content)
    const $ = cheerio.load(html)
    
    const title = frontmatter.title || frontmatter.name || $('h1').first().text() || skill
    const category = categorize(skill, frontmatter.category)

    // Issue #2: Prioritize YAML frontmatter description for AI trigger instructions
    let description = frontmatter.description
    if (!description) {
      description = 'No description available.'
      $('p').each((_, el) => {
        const text = $(el).text().trim()
        // Skip lines that look like frontmatter/metadata
        if (text.startsWith('name:') || text.startsWith('description:') || 
            text.startsWith('proactive:') || text.startsWith('match:') ||
            text.startsWith('Layer:') || text.startsWith('Usage:') ||
            text.startsWith('Manifesto Link:') || text.startsWith('Methodology:') ||
            text.startsWith('Dependencies:')) {
          return // skip this <p>
        }
        if (description === 'No description available.') {
          description = text
        }
      })
    }


    // Issue #10: sanitize description for markdown table (no newlines)
    const safeDescription = description
      .replace(/\n/g, ' ')
      .replace(/\|/g, '\\|')
      .substring(0, 200)

    // Integrate Enterprise Readiness metrics
    // human_reviewed supports: true, false, or reviewer names (e.g., "ryan" or "ryan, serena")
    const hrValue = frontmatter.human_reviewed
    let humanCheck = '⚠️'
    let reviewers = ''
    if (hrValue && hrValue !== 'false') {
      humanCheck = '✅'
      if (hrValue !== 'true' && hrValue !== true) {
        // Contains reviewer names
        reviewers = String(hrValue).split(',').map(s => s.trim()).join(', ')
        humanCheck = `✅ ${reviewers}`
      }
    }
    
    let benchmarkStatus = '⚪ N/A'
    const bGradeStr = benchmarkData[skill]
    if (bGradeStr) {
      if (bGradeStr.includes('F') || bGradeStr.includes('❌')) benchmarkStatus = '🔴 FAIL'
      else benchmarkStatus = '🟢 PASS'
    }
    
    const reviewStatus = reviewData[skill] || '⚪ N/A'
    
    // Final Status Formula
    let finalStatus = '🚧 Draft'
    if (benchmarkStatus === '🟢 PASS' && reviewStatus.includes('A') && humanCheck.startsWith('✅')) {
      finalStatus = '✅ Enterprise'
    }

    // Extract depends_on from frontmatter
    const dependsOn = Array.isArray(frontmatter.depends_on) 
      ? frontmatter.depends_on 
      : []

    const skillEntry = {
      id: skill,
      title,
      description: safeDescription,
      category,
      path: `./skills/${skill}/SKILL.md`,
      ...(dependsOn.length > 0 ? { dependsOn } : {}),
      humanCheck,
      benchmarkStatus,
      reviewStatus,
      finalStatus
    }

    // Validate with Zod
    try {
      SkillSchema.parse(skillEntry)
      
      if (!categoryGroups[category]) categoryGroups[category] = []
      categoryGroups[category].push(skillEntry)
      manifest.skills.push(skillEntry)
    } catch (e) {
      console.log(chalk.red(`  ⚠️ Validation failed for ${skill}:`), e.errors)
    }
  }
}

// Generate README.md (Human-readable)
const categoryEmojis = {
  Framework: '📦',
  Standards: '🛡️',
  Design: '🎨',
  Figma: '📐',
  Architecture: '🏛️',
  DevOps: '🔧',
  Meta: '🧠',
}

let markdown = `# 🛡️ Agent Skill Capabilities\n\n`
markdown += `This file is **auto-generated**. Do not edit manually.\n\n`

for (const [category, items] of Object.entries(categoryGroups)) {
  const emoji = categoryEmojis[category] || '📦'
  markdown += `## ${emoji} ${category}\n\n`
  markdown += `| Skill | Description | Deps | Status | Benchmark | AI Check | Reviewed |\n`
  markdown += `| :--- | :--- | :--- | :---: | :---: | :---: | :---: |\n`
  for (const item of _.sortBy(items, 'title')) {
    const depsDisplay = item.dependsOn && item.dependsOn.length > 0 
      ? item.dependsOn.map(d => `\`${d}\``).join(', ') 
      : '—'
    markdown += `| **[${item.title}](${item.path})** | ${item.description} | ${depsDisplay} | ${item.finalStatus} | ${item.benchmarkStatus} | ${item.reviewStatus} | ${item.humanCheck} |\n`
  }
  markdown += `\n`
}

markdown += `\n---\n*Dashboard maintained by Agent Engine*\n`

// Optimization: Preserve lastUpdated if no functional changes (version or skills list)
if (existingManifest && 
    _.isEqual(_.sortBy(existingManifest.skills, 'id'), _.sortBy(manifest.skills, 'id'))) {
  manifest.lastUpdated = existingManifest.lastUpdated
}

// Write Files
await fs.writeFile(outputMd, markdown)
await fs.writeJson(outputJson, manifest, { spaces: 2 })

console.log(chalk.green.bold(`\n✅ Generated Human Index: ${outputMd}`))
console.log(chalk.green.bold(`✅ Generated Machine Manifest: ${outputJson}`))
console.log(chalk.gray(`Found ${manifest.skills.length} tracked skills across ${Object.keys(categoryGroups).length} categories.\n`))
