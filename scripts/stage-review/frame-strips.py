# Usage: python3 scripts/stage-review/frame-strips.py <frames dir> <out dir> [--lines 3,5-7] [--per-sheet 8]
# Strips for the motion critic straight from render-frames.cjs output: no video, no ffmpeg.
# One run of strips per line, so a critic can be given only the lines whose cues changed.
# Inside a line, moving stretches get every frame; still stretches get one frame a second.
import argparse, json, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument("frames")
ap.add_argument("out")
ap.add_argument("--lines", help="lines to include, e.g. 3,5-7 (default: all)")
ap.add_argument("--per-sheet", type=int, default=8)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)
meta = json.load(open(os.path.join(args.frames, "index.json")))
fps = meta["fps"]
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)

wanted = None
if args.lines:
    wanted = set()
    for part in args.lines.split(","):
        a, _, b = part.partition("-")
        wanted.update(range(int(a), int(b or a) + 1))

def grey(f):
    return np.asarray(Image.open(os.path.join(args.frames, f["file"])).convert("L").resize((360, 150)), dtype=np.int16)

def zoom(shots):
    # Zoom on what moved across the strip, up to 2x, keeping the frame's shape, so a spoon's tip is big enough to judge.
    W, H = shots[0].size
    g = [np.asarray(s.convert("L"), dtype=np.int16) for s in shots]
    mask = np.zeros((H, W), bool)
    for a, b in zip(g, g[1:]):
        mask |= abs(a - b) > 24
    ys, xs = np.nonzero(mask)
    if len(xs) < 50:
        return (0, 0, W, H)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    bw = min(W, max(W / 2, (xs.max() - xs.min()) * 1.3, (ys.max() - ys.min()) * 1.3 * W / H))
    bh = bw * H / W
    x0 = min(max(0, cx - bw / 2), W - bw)
    y0 = min(max(0, cy - bh / 2), H - bh)
    return (round(x0), round(y0), round(x0 + bw), round(y0 + bh))

by_line = {}
for f in meta["frames"]:
    if wanted is None or f["line"] in wanted:
        by_line.setdefault(f["line"], []).append(f)

index, n, w = [], 0, 720
for line, frames in sorted(by_line.items()):
    # A mouth moving changes a few hundred of these 54,000 pixels; a hand, a step or the camera changes more.
    small = [grey(f) for f in frames]
    moving = [False] + [int((abs(b - a) > 18).sum()) > 400 for a, b in zip(small, small[1:])]
    # A pause shorter than a second inside a movement stays part of it, so a reach and its grab share a strip.
    for i in range(len(moving)):
        if not moving[i]:
            j = i
            while j < len(moving) and not moving[j]:
                j += 1
            if 0 < i and j < len(moving) and j - i < fps:
                for k in range(i, j):
                    moving[k] = True
    runs, k = [], 0
    while k < len(frames):
        m = moving[k]
        j = k
        while j + 1 < len(frames) and moving[j + 1] == m:
            j += 1
        runs.append((m, k, j))
        k = j + 1
    picks = []
    for m, a, b in runs:
        picks.append((m, list(range(max(0, a - 1), b + 1)) if m else list(range(a, b + 1, round(fps)))))
    for m, idx in picks:
        chunks = [idx[c : c + args.per_sheet] for c in range(0, len(idx), args.per_sheet)]
        # A short tail joins the strip before it rather than making a strip of two frames.
        if len(chunks) > 1 and len(chunks[-1]) < args.per_sheet // 2:
            tail = chunks.pop()
            chunks[-1] += tail
        for chunk in chunks:
            shots = [Image.open(os.path.join(args.frames, frames[i]["file"])).convert("RGB") for i in chunk]
            box = zoom(shots) if m else (0, 0, *shots[0].size)
            h = round(w * shots[0].size[1] / shots[0].size[0])
            cap, head, cols = 28, 36, 2
            rows = (len(chunk) + cols - 1) // cols
            sheet = Image.new("RGB", (w * cols, head + rows * (h + cap)), "white")
            d = ImageDraw.Draw(sheet)
            n += 1
            t0, t1 = frames[chunk[0]]["ms"] / 1000, frames[chunk[-1]]["ms"] / 1000
            kind = "moving, every frame" if m else "still, one frame a second"
            d.text((10, 8), f"Strip {n}: line {line}, {t0:.2f}s to {t1:.2f}s ({kind}), left to right, top to bottom", fill="black", font=font)
            for k, (i, shot) in enumerate(zip(chunk, shots)):
                x, y = (k % cols) * w, head + (k // cols) * (h + cap)
                sheet.paste(shot.crop(box).resize((w, h)), (x, y))
                d.text((x + 8, y + h + 4), f'{frames[i]["ms"] / 1000:.2f}s', fill="black", font=font)
            path = os.path.join(args.out, f"strip-{n:03d}.png")
            sheet.save(path)
            index.append({"strip": n, "line": line, "from": t0, "to": t1, "moving": m, "crop": box, "file": path})

json.dump(index, open(os.path.join(args.out, "index.json"), "w"), indent=1)
print(json.dumps({"strips": n, "lines": len(by_line)}))
