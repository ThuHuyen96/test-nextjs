# Tailwind CSS v4 Skill

> Inspired by [Vercel's agent-skills](https://github.com/vercel-labs/agent-skills)

AI-agent skill for Tailwind CSS v4 patterns, migration, and best practices.

## What is this?

A skill file that teaches AI coding agents (Claude, Copilot, Cursor, etc.) the correct patterns for Tailwind CSS v4. Agents read `AGENTS.md` and apply the knowledge when helping with Tailwind code.

## Quick Start

1. Copy `AGENTS.md` to your project root (or `.claude/` for Claude Code)
2. Your AI agent will automatically pick up the v4 patterns

## Structure

```
tailwindcss-v4/
├── AGENTS.md           # Compiled skill (agents read this)
├── rules/              # Modular rule files
│   ├── setup-*.md      # Configuration patterns
│   ├── migration-*.md  # v3 → v4 migration
│   └── customization-*.md  # Custom utilities/variants
├── test-cases.json     # Bad/good code pairs for nuxt-vitest-testing
└── src/
    ├── build.ts        # Compiles rules → AGENTS.md
    └── validate.ts     # CLI validation tests
```

## Key v4 Patterns

### Entry Point
```css
/* v4 - single import */
@import "tailwindcss";

/* NOT the v3 way */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Theme Configuration
```css
@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}
```

### Custom Utilities
```css
@utility content-auto {
  content-visibility: auto;
}
```

### Custom Variants
```css
@variant hocus (&:hover, &:focus);
```

### Safelisting
```css
@source inline("bg-red-500 text-white");
```

## Development

```bash
# Build AGENTS.md from rules
bun run build

# Run validation
bun run validate
```

## Contributing

1. Add/edit rules in `rules/*.md`
2. Add test cases to `test-cases.json`
3. Run `bun run build`
4. Submit PR

## License

MIT
