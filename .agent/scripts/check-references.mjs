#!/usr/bin/env node
import { fs, path, chalk } from 'zx'
import { fileURLToPath } from 'url'
import { globby } from 'globby'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const agentRoot = path.resolve(__dirname, '..')

// ─── Patterns that capture .md references ───────────────────────────
// 1. Markdown links: [text](some-file.md) or [text](../path/file.md)
// 2. Backtick inline code refs: `some/path/file.md` — only if it looks like a path (contains / or starts with .)
// Intentionally NOT matching bare text mentions in paragraphs/tables (too many false positives)
const LINK_PATTERN     = /\[([^\]]*)\]\(([^)]+\.md)\)/g
const BACKTICK_PATTERN = /`((?:\.\.?\/)(?:[a-zA-Z0-9_/.-]+)\.md)`/g

// ─── Files / patterns to ignore ─────────────────────────────────────
const IGNORED_FILENAMES = new Set([
  'SKILL.md',  'README.md', 'AGENTS.md', 'CLAUDE.md', 'CHANGELOG.md',
])

// Known generic references (documentation-style mentions, not actual links)
function isGenericMention(ref) {
  return IGNORED_FILENAMES.has(ref) || ref === 'package.json'
}

// ─── Main ────────────────────────────────────────────────────────────
console.log(chalk.cyan.bold('\n🔍 Agent Resource Cross-Reference Integrity Check'))
console.log(chalk.gray(`   Root: ${agentRoot}\n`))

// 1. Collect all .md files under .agent/
const allMdFiles = await globby('**/*.md', {
  cwd: agentRoot,
  ignore: ['**/node_modules/**', '**/scripts/node_modules/**', 'skills/_*/**'],
  absolute: false,
})

// Build a lookup set of existing files (relative to agentRoot)
const existingFiles = new Set(allMdFiles)

// Also add non-.md files for completeness
const allFiles = await globby('**/*', {
  cwd: agentRoot,
  ignore: ['**/node_modules/**'],
  absolute: false,
  onlyFiles: true,
})
for (const f of allFiles) existingFiles.add(f)

// 2. Scan each .md file for references
let totalRefs = 0
let brokenRefs = []
let validRefs = []

for (const relFile of allMdFiles) {
  const absFile = path.join(agentRoot, relFile)
  const content = await fs.readFile(absFile, 'utf-8')
  const lines = content.split('\n')
  const fileDir = path.dirname(relFile)

  const refs = new Map() // ref → Set<lineNumbers>

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    for (const pattern of [LINK_PATTERN, BACKTICK_PATTERN]) {
      pattern.lastIndex = 0
      let match
      while ((match = pattern.exec(line)) !== null) {
        // For markdown links [text](ref), ref is group 2; for others, group 1
        const ref = pattern === LINK_PATTERN ? match[2] : match[1]

        // Skip URLs, anchors, absolute paths, template variables
        if (ref.startsWith('http') || ref.startsWith('#') || ref.startsWith('/')) continue
        if (ref.includes('{{') || ref.includes('}}')) continue
        // Skip generic mentions
        if (isGenericMention(ref)) continue

        if (!refs.has(ref)) refs.set(ref, new Set())
        refs.get(ref).add(lineNum)
      }
    }
  }

  for (const [ref, lineNums] of refs) {
    totalRefs++
    // Resolve relative to the file's directory
    const resolvedPath = path.normalize(path.join(fileDir, ref))

    if (existingFiles.has(resolvedPath)) {
      validRefs.push({ source: relFile, ref, resolvedPath, lines: [...lineNums] })
    } else {
      brokenRefs.push({ source: relFile, ref, resolvedPath, lines: [...lineNums] })
    }
  }
}

// 3. Report
console.log(chalk.white.bold(`📊 Summary`))
console.log(chalk.gray(`   Total cross-references found: ${totalRefs}`))
console.log(chalk.green(`   ✅ Valid: ${validRefs.length}`))
console.log(chalk.red(`   ❌ Broken: ${brokenRefs.length}`))
console.log()

if (brokenRefs.length > 0) {
  console.log(chalk.red.bold(`🚨 Broken References:\n`))
  for (const { source, ref, resolvedPath, lines } of brokenRefs) {
    console.log(chalk.red(`  ✗ ${source}:${lines.join(',')} → ${ref}`))
    console.log(chalk.gray(`    Resolved to: ${resolvedPath} (NOT FOUND)`))
  }
  console.log()
  process.exitCode = 1
} else {
  console.log(chalk.green.bold(`✅ All cross-references are valid!\n`))
}

// 4. Optional: Generate dependency graph
if (process.argv.includes('--graph')) {
  // 4a. Existing resource-level graph (from file links)
  const resourceGraph = {}
  for (const { source, ref, resolvedPath } of [...validRefs, ...brokenRefs]) {
    if (!resourceGraph[source]) resourceGraph[source] = { dependsOn: [], dependedBy: [] }
    if (!resourceGraph[resolvedPath]) resourceGraph[resolvedPath] = { dependsOn: [], dependedBy: [] }

    resourceGraph[source].dependsOn.push(resolvedPath)
    resourceGraph[resolvedPath].dependedBy.push(source)
  }

  const jsonGraphPath = path.join(agentRoot, 'resource-graph.json')
  await fs.writeJson(jsonGraphPath, resourceGraph, { spaces: 2 })
  console.log(chalk.cyan(`📈 Resource JSON graph written to: ${jsonGraphPath}`))

  // 4b. Logical skill-level graph (from manifest dependencies)
  const manifestPath = path.join(agentRoot, 'manifest.json')
  if (await fs.pathExists(manifestPath)) {
    const manifest = await fs.readJson(manifestPath)
    let mermaid = '```mermaid\ngraph TD\n'
    
    // Add nodes with titles
    for (const skill of manifest.skills) {
      mermaid += `  ${skill.id}["${skill.title}"]\n`
    }

    // Add edges from dependencies
    let edgeCount = 0
    for (const skill of manifest.skills) {
      if (skill.dependencies && skill.dependencies.length > 0) {
        for (const dep of skill.dependencies) {
          mermaid += `  ${skill.id} --> ${dep}\n`
          edgeCount++
        }
      }
    }
    mermaid += '```\n'

    const mermaidPath = path.join(agentRoot, 'resource-graph.md')
    await fs.writeFile(mermaidPath, `# 📈 Agent Skill Dependency Graph\n\n${mermaid}`)
    console.log(chalk.green(`🎨 Mermaid graph written to: ${mermaidPath} (${edgeCount} edges)`))
  }
}
