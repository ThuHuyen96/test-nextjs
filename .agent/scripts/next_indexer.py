#!/usr/bin/env python3
"""
next_indexer.py — Scan src/components/**/*.tsx and emit a JSON component index.
Tailored for Next.js (React + TypeScript).

Contract
--------
  stdin   : (none)
  stdout  : JSON (schema_version=1); always emitted, even on partial failure
  stderr  : human-readable warnings, one line per file
  exit 0  : success, no parse warnings
  exit 1  : fatal error (--root missing)
  exit 2  : partial success — some files had parse warnings
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def extract_brace_body(text: str, open_pos: int) -> str | None:
    """
    Depth-counting brace extractor.
    open_pos must be the index of '{'.
    Returns text between that brace and its matching '}', or None if unbalanced.
    """
    if open_pos < 0 or open_pos >= len(text) or text[open_pos] != '{':
        return None
    depth = 0
    for i, ch in enumerate(text[open_pos:], open_pos):
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                return text[open_pos + 1:i]
    return None


def flatten_braces(s: str) -> str:
    """Iteratively collapse { ... } -> {...} for Markdown table-cell safety."""
    prev = None
    result = s
    while prev != result:
        prev = result
        result = re.sub(r'\{[^{}]*\}', '{...}', result)
    return result.strip()


def parse_props_from_body(body: str) -> list:
    """Parse a TS interface/type body into ['propName?: Type', ...] strings."""
    props: list = []
    # Split by semicolon or newline at root depth
    lines = re.split(r'[;\n]', body)
    for line in lines:
        line = line.strip()
        if not line or line.startswith('//') or line.startswith('*') or line.startswith('/*'):
            continue
        m = re.match(r'^(\w+\??)\s*:\s*(.+)$', line, re.DOTALL)
        if m:
            prop_type = flatten_braces(m.group(2).strip()).strip()
            props.append(f'{m.group(1)}: {prop_type}')
    return props


# ---------------------------------------------------------------------------
# Props extraction
# ---------------------------------------------------------------------------

def extract_props(content: str) -> tuple:
    """
    Returns (props_string, strategy_name).
    """
    # Strategy 1 — interface Props { ... } or type Props = { ... }
    m = re.search(r'\b(?:interface|type)\s+Props\s*(?:=\s*)?\{', content)
    if m:
        open_pos = content.find('{', m.start())
        body = extract_brace_body(content, open_pos)
        if body:
            props = parse_props_from_body(body)
            if props:
                return ', '.join(props), 'Props_interface'

    # Strategy 2 — inline destructuring in default export
    # e.g. export default function MyComp({ foo, bar }: Props)
    # This is hard to parse reliably with regex, but we can try to find the Props reference
    m = re.search(r'export\s+default\s+function\s+\w+\s*\(\s*\{([^}]*)\}\s*:\s*(\w+)', content)
    if m:
        props_name = m.group(2)
        # Look for the definition of props_name
        pat = re.compile(r'\b(?:interface|type)\s+' + re.escape(props_name) + r'\s*(?:=\s*)?\{')
        m2 = pat.search(content)
        if m2:
            open_pos = content.find('{', m2.start())
            body = extract_brace_body(content, open_pos)
            if body:
                props = parse_props_from_body(body)
                if props:
                    return ', '.join(props), f'named_{props_name}'

    return '—', 'none'


# ---------------------------------------------------------------------------
# Used-In detection
# ---------------------------------------------------------------------------

def find_used_in(stem: str, pages_root: Path) -> list:
    """
    Return list of page paths whose import statements reference <stem>.
    """
    if not pages_root.exists():
        return []
    # Match: import { Stem } from ... or import Stem from ...
    pat = re.compile(r"""import\s+.*\b""" + re.escape(stem) + r"""\b.*\s+from\s+['"].*['"]""")
    results: list = []
    # Scan both .tsx and .jsx
    for page in sorted(list(pages_root.rglob('*.tsx')) + list(pages_root.rglob('*.jsx'))):
        try:
            text = page.read_text(encoding='utf-8')
        except Exception:
            continue
        if pat.search(text):
            try:
                rel = str(page.relative_to(pages_root))
            except ValueError:
                rel = str(page)
            results.append(rel)
    return sorted(list(set(results)))


# ---------------------------------------------------------------------------
# Purpose inference
# ---------------------------------------------------------------------------

def guess_purpose(name: str, content: str) -> str:
    """Best-effort one-sentence purpose hint."""
    m = re.search(r'aria-label=["\']([^"\']{5,80})["\']', content)
    if m:
        return m.group(1).strip().capitalize()
    words = re.sub(r'([A-Z0-9]+)', r' \1', name).strip()
    words = re.sub(r'\s+', ' ', words).strip().lower()
    return f'{words.capitalize()} component'


# ---------------------------------------------------------------------------
# Per-file indexing
# ---------------------------------------------------------------------------

def index_file(file_path: Path, pages_root: Path, relative_to: Path) -> tuple:
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        return None, f'Cannot read: {e}'

    stem = file_path.stem
    props_str, strategy = extract_props(content)
    warning = None

    if strategy == 'none' and ('Props' in content or 'interface' in content):
        warning = "Props detected but pattern not recognized; emitting '—'"

    try:
        rel_path = str(file_path.relative_to(relative_to))
    except ValueError:
        rel_path = str(file_path)

    return {
        'name': stem,
        'file_path': rel_path,
        'props': props_str,
        'props_strategy': strategy,
        'purpose_hint': guess_purpose(stem, content),
        'used_in': find_used_in(stem, pages_root),
    }, warning


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description='Scan Next.js components and emit a JSON index.',
    )
    parser.add_argument('--root', required=True,
                        help='Directory to scan (e.g. src/components/)')
    parser.add_argument('--pages', required=True,
                        help='Pages root for Used-In detection (e.g. src/app/)')
    parser.add_argument('--relative-to', default='.', dest='relative_to',
                        help='Anchor for relative paths in JSON output (default: cwd)')
    args = parser.parse_args()

    relative_to = Path(args.relative_to).resolve()
    root = Path(args.root)
    pages_root = Path(args.pages)

    if not root.exists():
        print(f'ERROR: --root not found: {root}', file=sys.stderr)
        sys.exit(1)

    components: list = []
    parse_warnings: list = []

    # Scan .tsx and .jsx
    files = sorted(list(root.rglob('*.tsx')) + list(root.rglob('*.jsx')))
    for f in files:
        comp, warn = index_file(f, pages_root, relative_to)
        if comp is None:
            parse_warnings.append({'file_path': str(f), 'warning': warn})
            print(f'  SKIP  {f}: {warn}', file=sys.stderr)
            continue
        components.append(comp)
        if warn:
            parse_warnings.append({'file_path': comp['file_path'], 'warning': warn})
            print(f'  WARN  {comp["file_path"]}: {warn}', file=sys.stderr)

    output = {
        'schema_version': 1,
        'generated': str(date.today()),
        'scanned': len(components),
        'root': str(root),
        'pages_root': str(pages_root),
        'components': components,
        'parse_warnings': parse_warnings,
    }

    print(json.dumps(output, ensure_ascii=False, indent=2))

    if parse_warnings:
        sys.exit(2)


if __name__ == '__main__':
    main()
