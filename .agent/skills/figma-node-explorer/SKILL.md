---
name: figma-node-explorer
description: Extract child node-ids from Figma design for component breakdown. Use when user provides Figma URL, wants to explore node hierarchy, break design into components, or implement design section by section.
category: Figma
human_reviewed: Ryan
---

# Figma Node Explorer

Extract and analyze child node-ids from a parent Figma node to enable precise component-level implementation.

## Bandwidth Rules

- **ALWAYS fetch on-demand**: Only call `mcp_FigmaAIBridge_get_figma_data` or `mcp_FigmaAIBridge_download_figma_images` for the **single node** you are currently implementing.
- **ALWAYS use `depth` parameter** (e.g., `depth: 2`) when targeting large pages to limit response size.
- **ALWAYS limit to 3 MCP calls per cycle**: If you need more, pause and ask the user which nodes to prioritize.
- **ALWAYS prefer `mcp_FigmaAIBridge_get_figma_data`**: It provides layout, metadata, structure and code reference in a single call.

## Workflow

### Step 1: Get Metadata

Use `mcp_FigmaAIBridge_get_figma_data` MCP tool to get the structure (with a limited `depth` if necessary):

**ALWAYS** call this once per major frame. For large pages (>2000px height), target a specific section node instead of the root frame.

- If the response is too large (saved to file), use offset/limit when reading and only parse the sections you need.

```typescript
// ✅ GOOD: Target a specific section
mcp_FigmaAIBridge_get_figma_data({
  fileKey: "FILE_KEY",
  nodeId: "1075:39334", // Main content area, not the full page
  depth: 2,
});

// ❌ BAD: Fetching entire page without depth limit when you only need one section
mcp_FigmaAIBridge_get_figma_data({
  fileKey: "FILE_KEY",
  nodeId: "1075:37585", // Full page 1920×5313 — Response will be huge
});
```

**Important:** Large responses are saved to a file. Read the output file path from the tool result. Use `Read` tool with offset/limit for huge files — do NOT load the entire file into context.

### Step 2: Parse Hierarchy

The JSON/data returned contains the full node tree. Focus on the structure:

```xml
<frame id="1075:37585" name="MYHOME_01_User_home_LG" width="1920" height="5313">
  <instance id="1075:37586" name="GNB" width="1920" height="64" />
  <frame id="1075:37587" name="KV" width="1620" height="160">
    <rounded-rectangle id="1075:37588" name="image 3830" />
  </frame>
  <frame id="1075:37612" name="Left" width="320" height="5249">
    <!-- children -->
  </frame>
</frame>
```

**Node types:** `frame`, `instance`, `text`, `rounded-rectangle`, `ellipse`, `vector`

### Step 3: Build Node Map

Extract nodes with depth control:

| Depth | When to Use                              |
| ----- | ---------------------------------------- |
| 1     | Page-level sections (GNB, Sidebar, Main) |
| 2     | Component-level (Posts, Cards, Widgets)  |
| 3     | Element-level (Buttons, Icons, Text)     |

**Output format:**

```markdown
## Node Hierarchy (depth=2)

### Level 1: Main Sections

| Node ID    | Name | Type     | Size      | Description       |
| ---------- | ---- | -------- | --------- | ----------------- |
| 1075-37586 | GNB  | instance | 1920×64   | Global Navigation |
| 1075-37612 | Left | frame    | 320×5249  | Left Sidebar      |
| 1075-39334 | Main | frame    | 1020×4713 | Content Area      |

### Level 2: Components (of 1075-39334)

| Node ID    | Name          | Content          |
| ---------- | ------------- | ---------------- |
| 1075-37905 | Feed Column   | Posts list       |
| 1075-37716 | Right Sidebar | Stamps, Comments |
```

### Step 4: Generate Quick URLs

Provide copy-ready URLs for **reference only**. These are for the user to navigate manually — **do NOT auto-fetch or loop through these URLs**:

```
# Main Sections
https://figma.com/design/FILE_KEY/NAME?node-id=1075-37586  # GNB
https://figma.com/design/FILE_KEY/NAME?node-id=1075-37612  # Left Sidebar
https://figma.com/design/FILE_KEY/NAME?node-id=1075-39334  # Main Content

# Components
https://figma.com/design/FILE_KEY/NAME?node-id=1075-37905  # Feed
https://figma.com/design/FILE_KEY/NAME?node-id=1075-37716  # Right Sidebar
```

> ⚠️ Only call `mcp_FigmaAIBridge_get_figma_data` for the **single node you are about to code**. Never batch-fetch from this list.

## Effort Estimation Template

Before implementation, assess **based on the structure you already have** from Step 1. Do NOT make additional MCP calls just for estimation:

| Component     | Current Status | Match % | Complexity | Est. Time |
| ------------- | -------------- | ------- | ---------- | --------- |
| GNB           | Done (CDN)     | 100%    | -          | -         |
| Left Sidebar  | Done           | 85%     | Low        | 30m       |
| Feed Posts    | Partial        | 70%     | Medium     | 1-2h      |
| Right Sidebar | **Wrong**      | 20%     | High       | 2-3h      |

**Complexity levels:**

- 🟢 Low: Polish existing, <1h
- 🟡 Medium: Refine/add features, 1-2h
- 🔴 High: Major rewrite, 2-4h

> Estimate complexity from node type, size, and child count in the returned tree — not from fetching each node's detailed context again.

## Node ID Format

| Context          | Format | Example      |
| ---------------- | ------ | ------------ |
| Returned JSON Id | Colon  | `1075:37585` |
| URL parameter    | Hyphen | `1075-37585` |
| MCP nodeId param | Colon  | `1075:37585` |

Convert: `nodeId.replace(':', '-')` for URLs

## Component Mapping

Map Figma nodes to React components:

| Figma Node        | React Component       | Notes                 |
| ----------------- | ------------------- | --------------------- |
| Left (1075-37612) | LeftSidebar.tsx     | Profile, stats, links |
| Frame 1010111365  | FeedPost.tsx        | Video/image posts     |
| Frame 1010110977  | RightSidebar.tsx    | Stamps, followers     |
| Set (collections) | FeedCollections.tsx | Library, articles     |

## After Extraction

Follow the **on-demand** principle: only fetch data for the specific component you are currently coding.

1. Use `mcp_FigmaAIBridge_get_figma_data` on the **current node** to get visuals, metadata, and reference code in a single request.
2. Proceed to implement components one at a time.

## Troubleshooting

### 403 Forbidden

- File must be viewable (not restricted)
- Check MCP server auth configuration
- Try direct Figma access to verify permissions

### Large Output

- Tool saves to file when response is large
- Read file path from tool result
- Use `Read` tool with offset/limit for huge files

### Hidden Nodes

- `hidden="true"` attribute indicates hidden layers
- May still be useful for understanding structure
- Skip in implementation unless specifically needed

### Instance vs Frame

- `instance`: Reusable component reference
- `frame`: Container/layout element
- Instances may have different internal structure
