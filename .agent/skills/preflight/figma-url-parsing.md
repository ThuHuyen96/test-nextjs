---
name: figma-url-parsing
description: >
  Single authoritative spec for parsing Figma design URLs and extracting fileKey + nodeId.
  Referenced by both preflight/SKILL.md and agents/preflight-validator.md — edit here, not in both.
---

# Figma URL Parsing — Shared Spec

## Valid URL pattern

```
https://www.figma.com/design/[fileKey]/[slug]?node-id=[nodeId]
```

| Part | Location | Notes |
|------|----------|-------|
| `fileKey` | path segment after `/design/` | Used in all MCP calls: `get_design_context`, `get_screenshot`, `get_metadata` |
| `nodeId` | query param `node-id=` | **Must convert `-` → `:`** before use (e.g. `12301-177764` → `12301:177764`) |

## Extraction steps

1. Match the URL against the pattern above.
2. Extract `fileKey` (Group 1) and raw `nodeId` (Group 2).
3. Normalize `nodeId`: replace every `-` with `:`.
4. If the URL does not match the pattern → **stop immediately**:
   ```
   ❌ URL format invalid: [url]
      Expected: figma.com/design/[fileKey]/[slug]?node-id=[nodeId]
   ```

## Branch URLs

Pattern: `figma.com/design/[fileKey]/branch/[branchKey]/[slug]`
→ Use `branchKey` as `fileKey` for all MCP calls.

## Multi-breakpoint tasks

When multiple URLs are provided (xs, sm, md, lg):
- Each URL may have a **different `nodeId`** but will share the **same `fileKey`**.
- Extract and normalize `nodeId` independently for each breakpoint.
- Run MCP calls in parallel across breakpoints (one `get_design_context` per nodeId).

## Null / missing links

- A breakpoint with `null` or empty URL → skip (do not call MCP for that breakpoint).
- At least one non-null URL is required — if all are null, stop before any MCP call.
