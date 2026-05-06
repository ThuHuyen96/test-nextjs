---
description: Export Figma design nodes and generate a highlighted HTML diff report. Use when user says "figma diff", "highlight changes", "khoanh vùng thay đổi", "export figma", or provides Figma node IDs for review.
---

# Figma Diff Highlight Workflow

Generate an interactive HTML report that exports Figma design frames as HQ images and overlays **color-coded** highlight boxes on detected change areas.

- 🟢 **Green**: Newly Added elements
- 🔵 **Blue**: Modified elements
- 🔴 **Red**: Base/Existing elements

## Prerequisites

- `FIGMA_TOKEN` available (check `.env` or ask user)
- `proxy-ca.pem` at project root (for corporate proxy environments)
- Node.js ≥ 18 (native `fetch`)

## Phase 1: Collect

1. **Get inputs from user:**
   - Figma file key (from URL: `figma.com/design/<fileKey>/...`)
   - Node IDs to highlight (format: `1234:5678`)
   - Search keywords for auto-detection (e.g., currency codes, country names)
   - Output folder name (e.g., `INDIA-28285`)

2. **Validate Figma access:**
   ```bash
   curl --cacert ./proxy-ca.pem -H "X-Figma-Token: $FIGMA_TOKEN" "https://api.figma.com/v1/files/<fileKey>?depth=1" -s | jq .name
   ```

## Phase 1.5: Resolve Node IDs

> **IMPORTANT**: The user-provided node ID may be an annotation layer (e.g., a green rectangle marking the change area), NOT the actual UI frame to implement. Always verify by checking the node's `type`:

3. **Check if node is a UI frame or annotation:**
   ```bash
   curl --cacert ./proxy-ca.pem -H "X-Figma-Token: $FIGMA_TOKEN" \
     "https://api.figma.com/v1/files/<fileKey>/nodes?ids=<nodeId>" -s \
     | jq '.nodes["<nodeId>"].document | {type, name}'
   ```
   - If the node type is `RECTANGLE` or `GROUP` with a generic name (e.g., "Rectangle 6297"), it is likely an **annotation layer**, not the target UI.
   - Navigate up to its parent SECTION and list sibling FRAME nodes to find the actual UI frames.

4. **Find Old vs New frame pairs** (for Add/Remove/Modify detection):
   - The Figma file typically has a section for the **original** design and a separate section for the **updated** design (e.g., "글로벌통화대응").
   - List both sections' children and match frames by name pattern (e.g., `20-3-2` appears in both old and new sections).
   - Pass both old and new node IDs to the script in alternating order for easy side-by-side comparison.

## Phase 2: Export

// turbo
5. **Run the highlight script:**
   ```bash
   NODE_EXTRA_CA_CERTS=./proxy-ca.pem FIGMA_TOKEN=$FIGMA_TOKEN \
     node .agent/scripts/figma-diff-highlight.mjs \
     --fileKey <fileKey> \
     --nodes "<oldNodeId>,<newNodeId>,..." \
     --keywords "KRW,USD,VND,EUR,JPY,TWD,PHP,THB" \
     --outputDir <TICKET-ID> \
     --scale 2
   ```

6. **Verify output exists:**
   ```bash
   ls -la <TICKET-ID>/figma-highlight.html <TICKET-ID>/hq_*.png
   ```

## Phase 3: Review

7. **Open in browser** for visual inspection:
   - If Live Server is running: `http://127.0.0.1:5500/<TICKET-ID>/figma-highlight.html`
   - Otherwise open file directly in browser

8. **Check highlight accuracy:**
   - 🟢 Green boxes should mark newly added elements (new currencies, new guidance text)
   - 🔵 Blue boxes should mark modified elements
   - 🔴 Red boxes should mark base/existing elements
   - No hidden/overflow elements should appear
   - Icon flags should be included within the highlight bounds
   - Hover tooltips should show the matched text

## Phase 4: Iterate (if needed)

9. If highlights are misaligned or missing:
   - Adjust `--keywords` to add/remove search terms
   - Adjust `--iconPadLeft` (default: 24px) for icon inclusion width
   - Re-run the script (Step 5)

## Notes

- The script filters out `visible: false` nodes automatically
- Elements with coordinates outside the frame bounds are excluded (hidden dropdowns, collapsed menus)
- Image padding from Figma's shadow/stroke rendering is auto-compensated via `sips` dimension check
- Add the output folder to `.gitignore` (e.g., `INDIA-*`)
- The script auto-detects `proxy-ca.pem` at project root for `curl` image downloads
- Semantic color classification is built-in: USD/VND/EUR/JPY/TWD/PHP/THB → green (added), KRW → red (base)
