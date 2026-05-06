---
name: preflight
description: Use when validating Figma URLs, fetching design data, and surfacing errors before code generation. Hard-stop conditions and Figma MCP validation rules.
category: Development
---

# Preflight — Figma MCP Validation

## Purpose

- Act as the gate before any `.tsx` file is written.
- Validate Figma URLs, fetch all design data, and surface errors immediately.
- Use whenever a Figma link is provided as the design source.

## Required Context

- At least one valid Figma URL (see URL pattern below).
- Figma Desktop must be open and the MCP plugin must be active.
- If any fetch fails, stop immediately — do not continue with partial data.

## Hard Rules

- Call `get_design_context` and `get_screenshot` for **every** breakpoint that has a link — before touching any `.tsx` file.
- Call `get_metadata` for any frame that requires an aspect ratio.
- Never create placeholder UI.
- Never guess from prose description when Figma data is missing.
- Never use prior-demo or cached fallback responses.
- Never continue after a fetch error — stop and report.
- Stop and ask the user when Figma intent is ambiguous (padding, breakpoint, layer intent).

## Workflow

### 1. Parse URL

See: `.agent/skills/preflight/figma-url-parsing.md` — single authoritative spec for URL format, extraction, normalization, branch URLs, FigJam URLs, and multi-breakpoint rules.

Summary: extract `fileKey` + `nodeId`; convert `nodeId` `-` → `:`; stop on invalid format.

### 2. Fetch design data (per breakpoint with a valid link)

Run in parallel where possible:
```
get_design_context(nodeId, fileKey)   →  layout, component data
get_screenshot(nodeId, fileKey)       →  visual reference
```

### 3. Fetch metadata for aspect-ratio frames

```
get_metadata(nodeId, fileKey)  →  width × height  →  aspect-[[width]/[height]]
```
Never take aspect ratios from codegen output — incorrect ratios are a severe defect.

### 4. Timeout handling

If a call does not return within a reasonable time:
- Stop immediately — do not retry automatically.
- Report using the Error Format below.
- Do not continue with partial data.

Signs of a hung call: still pending while other calls returned; MCP returns empty/null without an error.

## Output Contract

On success, return to the orchestrator:
```json
{
  "status": "pass",
  "figma_links_count": 2,
  "figma_file_key": "[fileKey]",
  "design_data": {
    "figma_links":    { "xs": "url", "sm": null, "md": "url", "lg": null },
    "figma_node_ids": { "xs": "12301:177764", "sm": null, "md": "22500:888", "lg": null },
    "aspect_ratios":  { "xs": "aspect-[w/h]", "sm": null, "md": "aspect-[w/h]", "lg": null },
    "design_context": { "xs": "...", "sm": null, "md": "...", "lg": null },
    "screenshots":    { "xs": "...", "sm": null, "md": "...", "lg": null }
  }
}
```
> **Note:** Example above shows a 2-breakpoint task (xs + md only).
> All 4 keys are always present — absent breakpoints use JSON `null`, not omitted.
> When all 4 URLs are provided, all 4 values are non-null (e.g. `"figma_links_count": 4`).
Do not spawn the next agent — the orchestrator handles sequencing.

## Error Format

```
❌ Figma fetch failed
   node-id : [nodeId]
   fileKey : [fileKey]
   error   : {exact error message from MCP}
   Unblock:
     1. Open Figma Desktop
     2. Confirm the correct file is open
     3. Confirm the node is not deleted or hidden
     4. Re-run /markup-task
```

## Responsive Completeness

A component is considered **responsive-complete** ONLY IF all meaningful differences between breakpoints in the design are reflected in the generated code.

### Categories of responsive differences

| # | Category | Examples |
|---|----------|---------|
| 1 | Typography | `font-size` / `line-height` / `role` change across breakpoints |
| 2 | Layout | `grid-cols-*` / `flex-direction` change (`flex-col` → `flex-row`) |
| 3 | Spacing | `gap-*` / `p-*` / `m-*` different per breakpoint |
| 4 | Visibility | `hidden` / `block` / conditional render at a breakpoint |
| 5 | Component structure | Element added, removed, or reordered at a breakpoint |

### Critical Rule

Handling ONLY layout (e.g., `sm:grid-cols-3`) is **NOT** sufficient.
When a design provides multiple breakpoints, code must reflect responsive changes across **more than one category**, unless the design is provably identical across all other categories.

### Constraint

This is a conceptual definition used by downstream agents (`code-generator`, `sign-off-checker`).
It does NOT alter extraction or fetch logic.

---

## Detecting Responsive Differences from Figma

When analyzing `design_context` returned from `get_design_context`, use these signals to identify meaningful breakpoint differences before generating code:

### Signal priority

| Priority | Signal type | How to read |
|----------|-------------|-------------|
| 1 — Strong | Structural differences | Different element count, different grid columns, element shown/hidden |
| 2 — Medium | Style differences | Different `font-size`, `gap`, `padding`, `color` per breakpoint |
| 3 — Optional | Code hints in design_context | CSS comments like `/* Title/Title5-B */` → improve role mapping |

### How to use

- Compare `design_context` values **across breakpoints** for structural and style deltas before writing code
- Code hints (Figma layer name comments) can improve `role` mapping accuracy but must not override structural signals
- When signals conflict: structural differences (priority 1) always win

### Constraint

- Must NOT require full deep parsing of Figma node trees
- Must NOT introduce ambiguity — when signals are unclear, stop and ask the user

---

## Hard Stop Conditions

| Situation | Action |
|-----------|--------|
| URL format invalid | Stop — report invalid URL |
| Any fetch fails or times out | Stop — use Error Format above |
| Aspect-ratio frame present but `get_metadata` not called | Stop — fetch first |
| Figma unclear (padding / breakpoint / layer intent) | Stop — ask the user |
| All links are null | Stop — require at least one valid link |
