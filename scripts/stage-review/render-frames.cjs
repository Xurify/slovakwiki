// @ts-nocheck: Playwright is preinstalled in cloud sessions, not a dependency of this repo,
// and most of this runs inside the page.
// Usage: node scripts/stage-review/render-frames.cjs --segment "U Márie" [--episode imperative]
//   [--from 1] [--to <last line>] [--lines 5-7] [--fps 6] [--dpr 2] [--workers 4] [--tail 2000]
//   [--out /tmp/frames/<name>] [--base http://localhost:4321]
// Renders a stage segment frame by frame on Playwright's virtual clock instead of recording it in real time.
// Each worker plays its own range of lines, so a 2-minute segment renders in well under a minute.
// Writes <idx>_<ms>.jpg (ms on one timeline for the whole range) and index.json with the line of each frame.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const args = {
  episode: "imperative",
  from: 1,
  fps: 6,
  dpr: 2,
  workers: 4,
  tail: 2000,
  base: "http://localhost:4321",
};
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i].replace(/^--/, "");
  args[k] = process.argv[++i];
}
// --lines 5-7 (or 5) is shorthand for --from 5 --to 7: after a fix, render only the lines whose cues changed.
if (args.lines) {
  const [a, b = a] = String(args.lines).split("-");
  args.from = a;
  args.to = b;
}
if (!args.segment)
  throw new Error("--segment is required (a regex for the segment's button)");
const step = 1000 / +args.fps;
// Steps of 1/30 s: after each, CSS transitions catch up with the virtual clock (see __syncAnimations).
// runFor, not fastForward: fastForward fires a chain of timers one link per jump, so lines ran long.
const sub = Math.min(step, 1000 / 30);
async function advance(page) {
  for (let done = 0; done < step - 0.01; done += sub) {
    const d = Math.min(sub, step - done);
    await page.clock.runFor(d);
    await page.evaluate(() => window.__syncAnimations());
  }
}
const out = args.out || `/tmp/frames/${args.segment.replace(/\W+/g, "-").toLowerCase()}`;

async function open(browser) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: +args.dpr,
  });
  // Sound off: each line then lasts its clip's length on timers, which the virtual clock controls.
  // With sound on, a line waits for the audio element's real-time events and drifts from run to run.
  await ctx.addInitScript(() => {
    localStorage.setItem("slovak.wiki.sfx-preference", "off");
    // Walks, turns and the camera are CSS transitions, which run on the real clock. Take each one off it
    // when first seen and set its time from the virtual clock, so a walk is as far along as the timers say.
    window.__syncAnimations = () => {
      const now = performance.now();
      for (const a of document.getAnimations()) {
        if (a.__v0 === undefined) {
          a.__v0 = now;
          a.pause();
        }
        a.currentTime = Math.max(0, now - a.__v0);
        const end = a.effect?.getComputedTiming().endTime;
        if (Number.isFinite(end) && a.currentTime >= end) a.finish();
      }
    };
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.clock.install();
  await page.goto(`${args.base}/listening/${args.episode}`, { waitUntil: "networkidle" });
  // An installed clock still flows with real time; pause it, or a busy machine shifts every line.
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
  await page.clock.runFor(1500);
  await page
    .getByRole("button", { name: new RegExp(args.segment) })
    .first()
    .click();
  await page.clock.runFor(800);
  // Pin the stage to the viewport's corner: playing a line scrolls the page and the transcript.
  const box = await page
    .locator(".aspect-\\[2\\/1\\]")
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      Object.assign(el.style, {
        position: "fixed",
        left: "0px",
        top: "0px",
        width: `${r.width}px`,
        height: `${r.height}px`,
        zIndex: "2147483647",
      });
      return { x: 0, y: 0, width: r.width, height: r.height };
    });
  const lines = await page
    .getByRole("button", { name: /^Play line 1 of/ })
    .first()
    .getAttribute("aria-label");
  return {
    ctx,
    page,
    box,
    count: +lines.match(/of (\d+)/)[1],
    cdp: await ctx.newCDPSession(page),
  };
}

// The current line, and whether the player is still going (its control reads "Pause" until the last line ends).
const state = (page) =>
  page.evaluate(() => {
    const b = document.querySelector(
      'button[aria-label^="Play line"][aria-current="true"]',
    );
    const playing = [...document.querySelectorAll("button")].some(
      (e) => e.textContent.trim() === "Pause",
    );
    // The pinned stage sits at the viewport's corner; a screenshot clip is in page coordinates.
    return {
      line: b ? +b.getAttribute("aria-label").match(/Play line (\d+)/)[1] : 0,
      playing,
      x: scrollX,
      y: scrollY,
    };
  });

// Plays lines first..last, warming up on the line before so a walk that started there is still in flight,
// and returns frames timed from the moment `first` became current.
async function render(browser, first, last, count, dir) {
  const { ctx, page, box, cdp } = await open(browser);
  const start = Math.max(1, first - 1);
  await page
    .getByRole("button", { name: new RegExp(`^Play line ${start} of`) })
    .first()
    .click();
  const frames = [];
  let t = 0,
    t0 = first === start ? 0 : null,
    seen = start,
    boundary = null,
    endAt = null;
  for (;;) {
    if (t > 0) await advance(page);
    const now = await state(page);
    const line = now.line || seen;
    if (line < seen) break;
    if (t0 === null && line >= first) t0 = t;
    if (line > last && boundary === null) boundary = t;
    if (boundary !== null && last < count) break;
    // The last line of the segment: keep going a little after the player stops, for the closing action.
    if (t0 !== null && endAt === null && (!now.playing || boundary !== null))
      endAt = t + +args.tail;
    if (endAt !== null && t > endAt) break;
    if (t0 !== null) {
      const shot = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 88,
        clip: { ...box, x: now.x, y: now.y, scale: +args.dpr },
        optimizeForSpeed: true,
      });
      const file = path.join(dir, `w${first}_${frames.length}.jpg`);
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      frames.push({ file, line: Math.min(line, last), t: Math.round(t - t0) });
    }
    seen = line;
    t += step;
    if (t > 600000) break;
  }
  await ctx.close();
  return { frames, length: (boundary ?? t) - (t0 ?? 0), box };
}

(async () => {
  const started = Date.now();
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const probe = await open(browser);
  const count = probe.count;
  await probe.ctx.close();
  const from = +args.from,
    to = Math.min(+(args.to || count), count);
  const n = Math.max(1, Math.min(+args.workers, to - from + 1));
  const size = Math.ceil((to - from + 1) / n);
  const ranges = [];
  for (let a = from; a <= to; a += size) ranges.push([a, Math.min(to, a + size - 1)]);
  const parts = await Promise.all(
    ranges.map(([a, b]) => render(browser, a, b, count, out)),
  );
  await browser.close();

  // One timeline: each range starts where the previous one's lines ended.
  const index = [];
  let offset = 0;
  for (const part of parts) {
    for (const f of part.frames) {
      const ms = Math.round(offset + f.t);
      const name = `${String(index.length).padStart(5, "0")}_${String(ms).padStart(6, "0")}.jpg`;
      fs.renameSync(f.file, path.join(out, name));
      index.push({ file: name, ms, line: f.line });
    }
    offset += part.length;
  }
  for (const f of fs.readdirSync(out))
    if (f.startsWith("w")) fs.rmSync(path.join(out, f));
  const lines = [];
  for (const f of index)
    if (!lines.length || lines.at(-1).line !== f.line)
      lines.push({ line: f.line, ms: f.ms });
  const meta = {
    segment: args.segment,
    episode: args.episode,
    from,
    to,
    fps: +args.fps,
    dpr: +args.dpr,
    workers: n,
    box: parts[0].box,
    lines,
    frames: index,
  };
  fs.writeFileSync(path.join(out, "index.json"), JSON.stringify(meta, null, 1));
  console.log(
    JSON.stringify({
      out,
      frames: index.length,
      lines: lines.length,
      stageSeconds: Math.round((index.at(-1)?.ms || 0) / 100) / 10,
      wallSeconds: Math.round((Date.now() - started) / 100) / 10,
    }),
  );
})();
