# Tailwind CSS Tokens (ui_lib = none)

Use for styling components. Standard Tailwind v3 scale.

## Rem base

> ⚠️ Before using any rem value, determine the rem base of the project:
> ```bash
> grep "font-size" index.html tailwind.config.js src/assets/css/*.css 2>/dev/null | head -5
> ```
>
> If the project has `font-size: 62.5%` / `font-size: 10px` → use **1rem = 10px**.
> If no override → use **1rem = 16px** (browser default).

## Spacing
Tailwind default scale (rem-based, 1 unit = 0.25rem):
`p-1`(0.25) `p-2`(0.5) `p-3`(0.75) `p-4`(1) `p-5`(1.25) `p-6`(1.5)
`p-8`(2) `p-10`(2.5) `p-12`(3) `p-16`(4) `p-20`(5) `p-24`(6)
`p-32`(8) `p-40`(10) `p-48`(12) `p-64`(16) `p-80`(20)

## Typography
Font size:
`text-xs`(0.75) `text-sm`(0.875) `text-base`(1) `text-lg`(1.125)
`text-xl`(1.25) `text-2xl`(1.5) `text-3xl`(1.875) `text-4xl`(2.25)
`text-5xl`(3) `text-6xl`(3.75) `text-7xl`(4.5)

Font weight:
`font-normal`(400) `font-medium`(500) `font-semibold`(600) `font-bold`(700)

Line height:
`leading-none`(1) `leading-tight`(1.25) `leading-snug`(1.375)
`leading-normal`(1.5) `leading-relaxed`(1.625) `leading-loose`(2)

## Colors
Use semantic Tailwind colors:
`text-gray-900` `text-gray-600` `text-gray-400`
`bg-white` `bg-gray-50` `bg-gray-100`
`border-gray-200` `border-gray-300`
`text-blue-600` `bg-blue-600` `hover:bg-blue-700`

## Border Radius
`rounded-none` `rounded-sm`(0.125) `rounded`(0.25) `rounded-md`(0.375)
`rounded-lg`(0.5) `rounded-xl`(0.75) `rounded-2xl`(1) `rounded-full`

## Z-index
`z-0` `z-10` `z-20` `z-30` `z-40` `z-50`
Use arbitrary when needed: `z-[100]` `z-[500]` `z-[1000]`

## Breakpoints

> **⛔ HARD STOP — Run this command FIRST before writing any responsive class:**
> ```bash
> grep -A 15 "screens" tailwind.config.js 2>/dev/null || grep -A 15 "screens" tailwind.config.ts 2>/dev/null
> ```
> Do NOT use the values below as-is. They are defaults only — using them without verification will produce wrong responsive behaviour.

**Tailwind default** (if config command above returns nothing):
`sm:` 640px · `md:` 768px · `lg:` 1024px · `xl:` 1280px · `2xl:` 1536px

**This project** (event-hub — custom breakpoints confirmed in `project-context.md`):
`xs:` 360px (base) · `sm:` 768px · `md:` 1024px · `lg:` 1440px

> If the project uses custom breakpoints, verify them before proceeding.

## Anti-patterns
- Do not use arbitrary values when a token equivalent exists
- Do not hardcode hex colors in classes — use the Tailwind palette
- Do not use `style=""` for spacing/color/typography
