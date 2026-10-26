# Usage: python3 scripts/stage-review/merge-findings.py <critic reply files...> [--out triage.md] [--window 1500]
# Merges the critics' blocker lines into one list. Each critic replies with JSON lines:
#   {"class": "I", "segment": "U Márie", "t_ms": 26500, "who": "Anna", "what": "...", "evidence": "strip 27"}
# The script and picture critics work per line, so they give "line" (its number or id) instead of "t_ms".
# Anything else in a reply is ignored. Findings on the same segment, class and person within the window,
# or on the same line, are one problem; the count says how many critics saw it, which is a rough confidence.
import argparse, json, re, sys

ap = argparse.ArgumentParser()
ap.add_argument("files", nargs="+")
ap.add_argument("--out")
ap.add_argument("--window", type=int, default=1500)
args = ap.parse_args()

found = []
for i, path in enumerate(args.files):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    for line in text.splitlines():
        m = re.search(r"\{.*\}", line)
        if not m:
            continue
        try:
            f = json.loads(m.group(0))
        except json.JSONDecodeError:
            continue
        if {"class", "segment", "what"} <= f.keys() and ("t_ms" in f or "line" in f):
            f["critic"] = i
            found.append(f)


def place(f):
    """Timed findings first, by time; then per-line ones, numbered lines in order before ids."""
    if "t_ms" in f:
        return (0, f["t_ms"], "")
    line = f["line"]
    return (1, line, "") if isinstance(line, (int, float)) else (2, 0, str(line))


found.sort(key=lambda f: (f["segment"], str(f["class"]), str(f.get("who", "")), place(f)))
groups = []
for f in found:
    g = groups[-1] if groups else None
    same = (
        g
        and g["segment"] == f["segment"]
        and g["class"] == f["class"]
        and g.get("who") == f.get("who")
        and ("t_ms" in g) == ("t_ms" in f)
    )
    if same and ("t_ms" in f and f["t_ms"] - g["to_ms"] <= args.window or "t_ms" not in f and f["line"] == g["line"]):
        if "t_ms" in f:
            g["to_ms"] = max(g["to_ms"], f["t_ms"])
        g["critics"].add(f["critic"])
        g["notes"].append(f)
    else:
        timed = {"from_ms": f["t_ms"], "to_ms": f["t_ms"]} if "t_ms" in f else {}
        groups.append({**f, **timed, "critics": {f["critic"]}, "notes": [f]})

groups.sort(key=lambda g: (g["segment"], place({**g, "t_ms": g["from_ms"]} if "t_ms" in g else g)))
rows = ["| # | Segment | Time or line | Class | Who | Problem | Critics | Evidence |", "|---|---|---|---|---|---|---|---|"]
for n, g in enumerate(groups, 1):
    if "t_ms" in g:
        span = f'{g["from_ms"] / 1000:.1f}s' + (f'–{g["to_ms"] / 1000:.1f}s' if g["to_ms"] > g["from_ms"] else "")
    else:
        span = f'line {g["line"]}'
    what = " / ".join(dict.fromkeys(x["what"] for x in g["notes"]))
    ev = "; ".join(dict.fromkeys(str(x.get("evidence", "")) for x in g["notes"] if x.get("evidence")))
    rows.append(f'| {n} | {g["segment"]} | {span} | {g["class"]} | {g.get("who", "")} | {what} | {len(g["critics"])} | {ev} |')
md = f"{len(found)} findings from {len(args.files)} critics, {len(groups)} after merging.\n\n" + "\n".join(rows) + "\n"
if args.out:
    open(args.out, "w", encoding="utf-8").write(md)
    json.dump([{**g, "critics": sorted(g["critics"])} for g in groups], open(args.out.rsplit(".", 1)[0] + ".json", "w"), indent=1, ensure_ascii=False)
print(md)
