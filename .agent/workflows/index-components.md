---
description: >
  Reconcile the component index against current .tsx/.jsx files on disk.
  Reads paths from .agent/next-index.json — portable across projects.
  Scripts resolved from ~/.agent/scripts/ (global) with .agent/scripts/ as fallback.
  Usage: /index-components
---

# /index-components — Component Index Reconciliation (V1.5)

---

## Step 0 — Preflight

**Check Python 3:**
```bash
python3 --version 2>&1
```
Output must start with `Python 3`, otherwise STOP:
```
❌ Python 3.8+ is required but was not found on PATH.
```

**Resolve script paths (global first, local fallback):**
```bash
if [ -f "$HOME/.agent/scripts/next_indexer.py" ]; then
  INDEXER="$HOME/.agent/scripts/next_indexer.py"
  MERGER="$HOME/.agent/scripts/merge_dictionary.py"
elif [ -f ".agent/scripts/next_indexer.py" ]; then
  INDEXER=".agent/scripts/next_indexer.py"
  MERGER=".agent/scripts/merge_dictionary.py"
else
  echo "❌ Scripts not found. Install to ~/.agent/scripts/ — see ~/.agent/scripts/README.md"
  exit 1
fi
```

**Read project config:**
```bash
CFG=".agent/next-index.json"
```
If `.agent/next-index.json` does not exist → STOP:
```
❌ .agent/next-index.json not found.
   Create it for this project:
   {
     "components_root": "src/components/",
     "pages_root":      "src/app/",
     "output_index":    ".agent/memories/local-components.md"
   }
```

Parse the three fields:
```bash
COMPONENTS_ROOT=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['components_root'])" "$CFG")
PAGES_ROOT=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['pages_root'])" "$CFG")
OUTPUT_INDEX=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['output_index'])" "$CFG")
```

---

## Step 1 — Run the component indexer

```bash
python3 "$INDEXER" \
  --root "$COMPONENTS_ROOT" \
  --pages "$PAGES_ROOT" \
  --relative-to . \
  2>/tmp/idx_warn.txt \
  > /tmp/idx_components.json
```

- **Exit 1** → show `/tmp/idx_warn.txt` and STOP.
- **Exit 2** → show `/tmp/idx_warn.txt` as warning, continue.
- **Exit 0** → proceed silently.

---

## Step 2 — Run the merger

```bash
SUMMARY=$(python3 "$MERGER" \
  --old-index "$OUTPUT_INDEX" \
  --new-data  /tmp/idx_components.json \
  --output    "$OUTPUT_INDEX" \
  2>/tmp/idx_merge_log.txt)
```

- **Exit 1** → show `/tmp/idx_merge_log.txt` and STOP.
- **Exit 0** → `$SUMMARY` is a JSON string; proceed to Step 3.

---

## Step 3 — Report

Parse `$SUMMARY` JSON and render:

```
✅ Component index reconciled
──────────────────────────────────────
Config     : .agent/next-index.json
Index file : {output_index}
Scanned    : {scanned} .tsx/.jsx files

  Inserted : {inserted} new components
  Updated  : {updated} components (props + used_in refreshed)
  Deleted  : {deleted} stale entries removed

Total rows : {total}
──────────────────────────────────────
```

If `parse_warnings > 0`:
```
⚠️  {parse_warnings} file(s) had unparseable props — check /tmp/idx_warn.txt
```

If `deleted > 0`, list `$SUMMARY.removed`.

---

## Step 4 — Cleanup

```bash
rm -f /tmp/idx_components.json /tmp/idx_warn.txt /tmp/idx_merge_log.txt
```

---

## Invariants

| # | Rule |
|---|------|
| 1 | Index always reflects disk state — no phantom entries |
| 2 | Props always re-read from source — never carried forward |
| 3 | Purpose text preserved unless the file is deleted |
| 4 | Full overwrite on every run — no incremental append |
| 5 | Sort order (by file path) enforced on every write |
