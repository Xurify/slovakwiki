# Usage: python3 scripts/critic/contact-sheets.py <frames dir> <script.md> <out dir>
# One contact sheet per segment: each frame with the line's speaker and Slovak under it.
import json, re, sys, textwrap
from PIL import Image, ImageDraw, ImageFont
frames, script, out = sys.argv[1:4]
segs, cur = [], None
for row in open(script, encoding="utf-8"):
    if row.startswith("## "): cur = {"title": row[3:].strip(), "lines": []}; segs.append(cur)
    m = re.match(r"\| (\d+) \| ([^|]*) \| ([^|]*) \|", row)
    if m and cur: cur["lines"].append(f"{m.group(2).strip()}: {m.group(3).strip()}")
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
index = json.load(open(f"{frames}/index.json"))
import os; os.makedirs(out, exist_ok=True)
for s, seg in enumerate(segs, 1):
    shots = [x for x in index if x["segment"] == s]
    if not shots: continue
    w, h = Image.open(shots[0]["file"]).size; cap = 60; cols = 2
    rows = (len(shots) + cols - 1) // cols
    sheet = Image.new("RGB", (w * cols, 40 + rows * (h + cap)), "white")
    d = ImageDraw.Draw(sheet); d.text((10, 10), f"Segment {s}: {seg['title']}", fill="black", font=font)
    for i, shot in enumerate(shots):
        x, y = (i % cols) * w, 40 + (i // cols) * (h + cap)
        sheet.paste(Image.open(shot["file"]), (x, y))
        text = seg["lines"][shot["line"] - 1] if shot["line"] <= len(seg["lines"]) else shot["label"]
        for j, part in enumerate(textwrap.wrap(f"{shot['line']}. {text}", 80)[:3]):
            d.text((x + 8, y + h + 4 + j * 18), part, fill="black", font=font)
    sheet.save(f"{out}/segment-{s}.png")
    print(f"{out}/segment-{s}.png", sheet.size)
