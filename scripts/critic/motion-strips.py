# Usage: python3 scripts/critic/motion-strips.py <video> <out dir> [--fps 6] [--cues cues.json]
# Strips of consecutive frames for the motion critic, one sheet per stretch of movement.
# Stretches where nothing moves get a strip at one frame a second.
# With --cues (a list of {"label", "from", "to"} in seconds of the video) there is one strip per cue instead.
import argparse, json, os, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument("video")
ap.add_argument("out")
ap.add_argument("--fps", type=float, default=6)
ap.add_argument("--cues")
ap.add_argument("--per-sheet", type=int, default=8)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)

tmp = tempfile.mkdtemp()
subprocess.run(
    ["ffmpeg", "-v", "error", "-i", args.video, "-vf", f"fps={args.fps}", f"{tmp}/%05d.png"],
    check=True,
)
files = sorted(os.listdir(tmp))
at = lambda i: i / args.fps

def small(i):
    return np.asarray(Image.open(f"{tmp}/{files[i]}").convert("L").resize((360, 150)), dtype=np.int16)

if args.cues:
    spans = [
        (c["label"], max(0, int((c["from"] - 0.2) * args.fps)), min(len(files) - 1, int((c["to"] + 0.2) * args.fps)))
        for c in json.load(open(args.cues))
    ]
else:
    # A mouth moving changes a few hundred of these 54,000 pixels; a hand, a step or the camera changes more.
    prev, moving = small(0), [False]
    for i in range(1, len(files)):
        cur = small(i)
        moving.append(int((abs(cur - prev) > 18).sum()) > 400)
        prev = cur
    spans, start, gap = [], None, 0
    for i, m in enumerate(moving):
        if m:
            start, gap = (i if start is None else start), 0
        elif start is not None:
            gap += 1
            if gap > args.fps // 2:
                spans.append((None, max(0, start - 1), min(len(files) - 1, i - gap + 1)))
                start, gap = None, 0
    if start is not None:
        spans.append((None, max(0, start - 1), len(files) - 1))
    # Where nothing moves, one frame a second, so a critic still sees where people stand and who has frozen.
    still, last = [], 0
    for _, a, b in spans + [(None, len(files), len(files))]:
        if a - last > args.fps:
            still.append(("still, one frame a second", last, a - 1))
        last = b + 1
    spans = sorted(spans + still, key=lambda span: span[1])

def moved(shots):
    # Zoom on what moved across the strip, up to 2x, keeping the frame's shape, so a spoon's tip or a stream's end is big enough to judge.
    W, H = shots[0].size
    grey = [np.asarray(s.convert("L"), dtype=np.int16) for s in shots]
    mask = np.zeros((H, W), bool)
    for a, b in zip(grey, grey[1:]):
        mask |= abs(a - b) > 24
    ys, xs = np.nonzero(mask)
    if len(xs) < 50:
        return (0, 0, W, H)
    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    bw = max(W / 2, (xs.max() - xs.min()) * 1.3, (ys.max() - ys.min()) * 1.3 * W / H)
    bw = min(W, bw)
    bh = bw * H / W
    x0 = min(max(0, cx - bw / 2), W - bw)
    y0 = min(max(0, cy - bh / 2), H - bh)
    return (round(x0), round(y0), round(x0 + bw), round(y0 + bh))


index, n = [], 0
w, h = 720, None
for label, a, b in spans:
    step = round(args.fps) if label and label.startswith("still") else 1
    for c in range(a, b + 1, args.per_sheet * step):
        frames = list(range(c, min(b + 1, c + args.per_sheet * step), step))
        if len(frames) < 2 and c != a:
            continue
        shots = [Image.open(f"{tmp}/{files[i]}").convert("RGB") for i in frames]
        h = h or round(w * shots[0].size[1] / shots[0].size[0])
        box = moved(shots)
        shots = [shot.crop(box) for shot in shots]
        cap, head, cols = 28, 36, 2
        rows = (len(shots) + cols - 1) // cols
        sheet = Image.new("RGB", (w * cols, head + rows * (h + cap)), "white")
        d = ImageDraw.Draw(sheet)
        n += 1
        title = f"Strip {n}: {at(frames[0]):.1f}s to {at(frames[-1]):.1f}s, left to right, top to bottom"
        d.text((10, 8), f"{title}{f' ({label})' if label else ''}", fill="black", font=font)
        for k, (i, shot) in enumerate(zip(frames, shots)):
            x, y = (k % cols) * w, head + (k // cols) * (h + cap)
            sheet.paste(shot.resize((w, h)), (x, y))
            d.text((x + 8, y + h + 4), f"{at(i):.2f}s", fill="black", font=font)
        path = f"{args.out}/strip-{n:03d}.png"
        sheet.save(path)
        index.append({"strip": n, "from": round(at(frames[0]), 2), "to": round(at(frames[-1]), 2), "label": label, "crop": box, "file": path})

json.dump(index, open(f"{args.out}/index.json", "w"), indent=2)
print(len(index), "strips from", len(spans), "stretches")
