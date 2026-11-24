#!/usr/bin/env python3
"""Rebuilds the design index in README.md from designs/*/design.json. No dependencies.  Run: python3 scripts/update-index.py"""
import json, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
START, END = '<!-- DESIGNS:START -->', '<!-- DESIGNS:END -->'

rows = []
for f in sorted((root / 'designs').glob('*/design.json')):
    d = json.loads(f.read_text())
    slug = f.parent.name
    thumb = f"designs/{slug}/{d['hero']}" if d.get('hero') and (f.parent / d['hero']).exists() else ''
    img = f'<img src="{thumb}" width="220" alt="{d["name"]}">' if thumb else ''
    tags = ', '.join(d.get('tags', []))
    stack = ', '.join(d.get('stack', []))
    rows.append((d.get('added', ''), f"| {img} | **[{d['name']}](designs/{slug})**<br>{d.get('summary', '')} | {tags} | {stack} | {d.get('status', '')} |"))

rows.sort(key=lambda r: r[0], reverse=True)   # newest first
table = '| | Design | Tags | Stack | Status |\n|---|---|---|---|---|\n' + '\n'.join(r[1] for r in rows) if rows else '_No designs yet._'

readme = root / 'README.md'
text = readme.read_text()
a, b = text.index(START) + len(START), text.index(END)
readme.write_text(text[:a] + '\n' + table + '\n' + text[b:])
print(f'{len(rows)} design(s) in the index')
