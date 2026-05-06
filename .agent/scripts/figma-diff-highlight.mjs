#!/usr/bin/env node
/**
 * figma-diff-highlight.mjs
 *
 * Exports Figma nodes as HQ PNG images and generates an interactive HTML report
 * with status-aware color coding for Added, Modified, and Base UI elements.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { parseArgs } from 'node:util';

// ─── CLI Args ────────────────────────────────────────────────────────────────
const { values: args } = parseArgs({
  options: {
    fileKey:     { type: 'string' },
    nodes:       { type: 'string' },
    keywords:    { type: 'string' },
    outputDir:   { type: 'string' },
    scale:       { type: 'string', default: '2' },
    iconPadLeft: { type: 'string', default: '24' },
  },
});

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_TOKEN environment variable is required.');
  process.exit(1);
}
if (!args.fileKey || !args.nodes) {
  console.error('Error: --fileKey and --nodes are required.');
  process.exit(1);
}

const FILE_KEY = args.fileKey;
const NODE_IDS = args.nodes.split(',').map(s => s.trim());
const KEYWORDS = (args.keywords || '').split(',').map(s => s.trim()).filter(Boolean);
const SCALE = parseInt(args.scale, 10);
const ICON_PAD_LEFT = parseInt(args.iconPadLeft, 10);

function getDefaultOutputDir() {
  const existing = fs.readdirSync('.').filter(d => /^INDIA-\d+$/.test(d) && fs.statSync(d).isDirectory());
  const maxNum = existing.reduce((max, d) => Math.max(max, parseInt(d.split('-')[1], 10)), 0);
  return `INDIA-${maxNum + 1}`;
}
const OUTPUT_DIR = args.outputDir || getDefaultOutputDir();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const figmaFetch = (endpoint) =>
  fetch(`https://api.figma.com/v1${endpoint}`, {
    headers: { 'X-Figma-Token': FIGMA_TOKEN },
  }).then(r => r.json());

function getMatchStatus(node) {
  if (node.type !== 'TEXT' || !node.characters) return null;
  const text = node.characters.toUpperCase();
  
  // Semantic status detection
  const ADDED = ["USD","VND","EUR","JPY","TWD","PHP","THB","환율","가이드","안내","EXCHANGE RATE","GUIDE"];
  const MOD   = ["수정","변경","업데이트","UPDATE","MODIFIED"];
  
  const isAdded = ADDED.some(k => text.includes(k));
  const isMod   = MOD.some(k => text.includes(k));
  const isMatched = (KEYWORDS.length === 0) ? true : KEYWORDS.some(k => text.includes(k.toUpperCase()));

  if (!isMatched) return null;
  if (isAdded) return 'added';
  if (isMod) return 'mod';
  return 'base';
}

function getImageDimensions(filePath) {
  const out = execSync(`sips -g pixelWidth -g pixelHeight "${filePath}"`).toString();
  const w = parseInt(out.match(/pixelWidth: (\d+)/)[1], 10);
  const h = parseInt(out.match(/pixelHeight: (\d+)/)[1], 10);
  return { w, h };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`[1/4] Fetching node data for ${NODE_IDS.length} nodes...`);
  const nodeRes = await figmaFetch(`/files/${FILE_KEY}/nodes?ids=${NODE_IDS.join(',')}`);

  console.log(`[2/4] Fetching HQ images (scale=${SCALE})...`);
  const imgRes = await figmaFetch(`/images/${FILE_KEY}?ids=${NODE_IDS.join(',')}&format=png&scale=${SCALE}`);

  let htmlBody = '';

  for (const [index, nodeId] of NODE_IDS.entries()) {
    const nodeData = nodeRes.nodes?.[nodeId];
    if (!nodeData?.document) {
      console.warn(`  ⚠ Node ${nodeId} not found, skipping.`);
      continue;
    }

    const rootNode = nodeData.document;
    const absBox = rootNode.absoluteBoundingBox;
    const boxes = [];

    function traverse(node) {
      if (!node || node.visible === false) return;
      const status = getMatchStatus(node);
      if (status && node.absoluteBoundingBox) {
        const nb = node.absoluteBoundingBox;
        const box = {
          x: nb.x - ICON_PAD_LEFT,
          y: nb.y - 2,
          width: nb.width + ICON_PAD_LEFT + 6,
          height: nb.height + 4,
          status
        };
        const isOffscreen =
          box.y > absBox.y + absBox.height + 8 ||
          box.x > absBox.x + absBox.width + 8;
        if (!isOffscreen && box.width > 0 && box.height > 0) {
          boxes.push({ box, text: node.characters });
        }
      }
      if (node.children) node.children.forEach(traverse);
    }
    traverse(rootNode);

    const imgUrl = imgRes.images?.[nodeId];
    if (!imgUrl) {
      console.warn(`  ⚠ No image URL for ${nodeId}, skipping.`);
      continue;
    }
    const imgPath = path.join(OUTPUT_DIR, `hq_${index}.png`);
    const curlCmd = fs.existsSync('./proxy-ca.pem') 
      ? `curl -s --cacert ./proxy-ca.pem -o "${imgPath}" "${imgUrl}"`
      : `curl -s -o "${imgPath}" "${imgUrl}"`;
    execSync(curlCmd);

    const { w: actualW, h: actualH } = getImageDimensions(imgPath);
    const padX = (actualW - absBox.width * SCALE) / 2;
    const padY = (actualH - absBox.height * SCALE) / 2;

    let divs = '';
    for (const b of boxes) {
      const rx = (b.box.x - absBox.x) * SCALE + padX;
      const ry = (b.box.y - absBox.y) * SCALE + padY;
      const w = b.box.width * SCALE;
      const h = b.box.height * SCALE;
      const pct = (v, total) => (v * 100 / total).toFixed(4);
      const safeTitle = b.text.replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
      divs += `    <div class="hl hl-${b.box.status}" style="left:${pct(rx, actualW)}%;top:${pct(ry, actualH)}%;width:${pct(w, actualW)}%;height:${pct(h, actualH)}%" title="${safeTitle}"></div>\n`;
    }

    const nodeName = rootNode.name || nodeId;
    htmlBody += `
  <div class="label">${nodeName} <span>(${nodeId})</span></div>
  <div class="frame" style="width:${actualW / 2}px;max-width:100%">
    <img src="hq_${index}.png" alt="${nodeName}">
${divs}  </div>`;
    console.log(`  ✓ Node ${nodeId}: ${boxes.length} highlights`);
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Figma UI Highlights — ${OUTPUT_DIR}</title>
<style>
body{background:#1e1e1e;margin:0;padding:0 40px 60px;text-align:center;font-family:system-ui,sans-serif}
.header{margin:40px auto;max-width:974px;text-align:left;color:#fff}
.legend{display:flex;gap:20px;margin-top:10px;font-size:12px}
.legend span{display:flex;align-items:center;gap:6px}
.dot{width:10px;height:10px;border-radius:2px;border:1px solid rgba(255,255,255,0.2)}
.label{margin:40px auto 10px;max-width:974px;text-align:left;font:600 14px/1.4 monospace;color:#ccc}
.label span{color:#666;font-weight:400}
.frame{position:relative;display:block;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.6);background:#fff;border-radius:8px;overflow:hidden}
.frame img{display:block;width:100%;height:auto}
.hl{position:absolute;border:2px solid #ff3333;background:rgba(255,255,0,.2);border-radius:4px;box-sizing:border-box;pointer-events:auto;transition:.2s}
.hl:hover{background:rgba(255,255,0,.5);border-color:#fa0;transform:scale(1.15);z-index:10;box-shadow:0 0 15px rgba(255,170,0,.9)}
.hl-added { border-color: #00ff00; background: rgba(0,255,0,0.1); }
.hl-base  { border-color: #ff3333; background: rgba(255,0,0,0.1); }
.hl-mod   { border-color: #00ccff; background: rgba(0,200,255,0.1); }
</style>
</head>
<body>
  <div class="header">
    <h1>Figma UI Audit: ${OUTPUT_DIR}</h1>
    <div class="legend">
      <span><div class="dot" style="background:#00ff00"></div> Added Nodes</span>
      <span><div class="dot" style="background:#00ccff"></div> Modified/Modified Context</span>
      <span><div class="dot" style="background:#ff3333"></div> Base/Existing Elements</span>
    </div>
  </div>
${htmlBody}
</body>
</html>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'figma-highlight.html'), html);
  console.log(`\n✅ Report generated: ${path.join(OUTPUT_DIR, 'figma-highlight.html')}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
