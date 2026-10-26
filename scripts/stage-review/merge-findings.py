# Usage: python3 scripts/stage-review/merge-findings.py <critic reply files...> [--out triage.md] [--window 1500]
# Merges the critics' blocker lines into one list. Each critic replies with JSON lines:
#   {"class": "I", "segment": "U Márie", "t_ms": 26500, "who": "Anna", "what": "...", "evidence": "strip 27"}
# Anything else in a reply is ignored. Findings on the same segment, class and person within the window
# are one problem; the count says how many critics saw it, which is a rough confidence.
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
        if {"class", "segment", "t_ms", "what"} <= f.keys():
            f["critic"] = i
            found.append(f)

found.sort(key=lambda f: (f["segment"], str(f["class"]), str(f.get("who", "")), f["t_ms"]))
groups = []
for f in found:
    g = groups[-1] if groups else None
    if (
        g
        and g["segment"] == f["segment"]
        and g["class"] == f["class"]
        and g.get("who") == f.get("who")
        and f["t_ms"] - g["to_ms"] <= args.window
    ):
        g["to_ms"] = max(g["to_ms"], f["t_ms"])
        g["critics"].add(f["critic"])
        g["notes"].append(f)
    else:
        groups.append({**f, "from_ms": f["t_ms"], "to_ms": f["t_ms"], "critics": {f["critic"]}, "notes": [f]})

groups.sort(key=lambda g: (g["segment"], g["from_ms"]))
rows = ["| # | Segment | Time | Class | Who | Problem | Critics | Evidence |", "|---|---|---|---|---|---|---|---|"]
for n, g in enumerate(groups, 1):
    span = f'{g["from_ms"] / 1000:.1f}s' + (f'–{g["to_ms"] / 1000:.1f}s' if g["to_ms"] > g["from_ms"] else "")
    what = " / ".join(dict.fromkeys(x["what"] for x in g["notes"]))
    ev = "; ".join(dict.fromkeys(str(x.get("evidence", "")) for x in g["notes"] if x.get("evidence")))
    rows.append(f'| {n} | {g["segment"]} | {span} | {g["class"]} | {g.get("who", "")} | {what} | {len(g["critics"])} | {ev} |')
md = f"{len(found)} findings from {len(args.files)} critics, {len(groups)} after merging.\n\n" + "\n".join(rows) + "\n"
if args.out:
    open(args.out, "w", encoding="utf-8").write(md)
    json.dump([{**g, "critics": sorted(g["critics"])} for g in groups], open(args.out.rsplit(".", 1)[0] + ".json", "w"), indent=1, ensure_ascii=False)
print(md)
