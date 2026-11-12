// @ts-nocheck: Playwright is not a dependency of this repo (see scripts/stage-review/README.md),
// and most of this runs inside the page.
// Usage (dev server running, Playwright on NODE_PATH; docs/listening-authoring.md §5):
//   node scripts/listening/covers.cjs [--only <slug>]           every cover, to static/listening/covers/
//   … --only <slug> --every 1500 --out <dir> [--segment <titleSk>] [--x 0.6]
//                                     a labelled contact sheet of the segment, one frame every 1.5 s
//   … --only <slug> --at <ms> --out <dir> [--x 0.6]             one trial still, at full size
// Plays the segment on Playwright's virtual clock, as scripts/stage-review/render-frames.cjs does.
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "../..");
const args = { base: "http://localhost:4321" };
for (let i = 2; i < process.argv.length; i++) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[++i];
}
if ((args.at || args.every) && !(args.only && args.out)) {
  throw new Error("--at and --every try moments out: give --only <slug> and --out <dir>");
}
const OUT = args.out
  ? path.resolve(args.out)
  : path.join(ROOT, "static/listening/covers");

const episodes = JSON.parse(
  execFileSync(
    "bun",
    [
      "-e",
      'import { listeningEpisodes } from "./src/lib/catalog/listening"; console.log(JSON.stringify(listeningEpisodes.map(({ slug, cover }) => ({ slug, cover }))))',
    ],
    { cwd: ROOT, encoding: "utf8" },
  ),
).filter(({ slug }) => !args.only || slug === args.only);

const STEP_MS = 1000 / 30;
const SHEET_COLUMNS = 4;
const THUMB = { width: 480, height: 240 };
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The episode page with the segment open, its stage pinned to the corner and line 1 just started. */
async function openSegment(browser, slug, segment) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  // Sound off so lines run on timers; CSS transitions (walks, turns) follow the virtual clock.
  await ctx.addInitScript(() => {
    localStorage.setItem("slovak.wiki.sfx-preference", "off");
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
  page.on("pageerror", (e) => console.error(`${slug}: page error:`, e.message));
  await page.clock.install();
  await page.goto(`${args.base}/listening/${slug}`, { waitUntil: "networkidle" });
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
  await page.clock.runFor(1500);
  await page
    .getByRole("button", { name: new RegExp(escape(segment)) })
    .first()
    .click();
  await page.clock.runFor(800);
  // The ring that lights a thing as it is named is for the learner tapping along, not for a still.
  await page.addStyleTag({ content: "rect.stroke-blue-500 { opacity: 0 !important; }" });
  const stage = page.locator(".aspect-\\[2\\/1\\]").first();
  await stage.evaluate((el) => {
    const r = el.getBoundingClientRect();
    // The stage's ground lets the page under it show through, and pinned to the corner that is
    // the episode's own text, so the stage takes the page's colour as its own background.
    Object.assign(el.style, {
      position: "fixed",
      left: "0px",
      top: "0px",
      width: `${r.width}px`,
      height: `${r.height}px`,
      zIndex: "2147483647",
      background: getComputedStyle(document.body).backgroundColor,
    });
  });
  await page
    .getByRole("button", { name: /^Play line 1 of/ })
    .first()
    .click();
  return { ctx, page, stage };
}

async function advance(page, ms) {
  for (let t = 0; t < ms; t += STEP_MS) {
    await page.clock.runFor(Math.min(STEP_MS, ms - t));
    await page.evaluate(() => window.__syncAnimations());
  }
}

/** A 2:1 crop of the stage at `x`; the middle is all a phone shows and where each place keeps its things. */
async function shot(page, stage, x) {
  const box = await stage.boundingBox();
  const width = Math.min(box.width, box.height * 2);
  const left = Math.min(box.width - width, Math.max(0, box.width * x - width / 2));
  return page.screenshot({
    clip: { x: box.x + left, y: box.y, width, height: box.height },
  });
}

/** The line playing now, and whether the player is still going. */
const playback = (page) =>
  page.evaluate(() => {
    const current = document.querySelector(
      'button[aria-label^="Play line"][aria-current="true"]',
    );
    return {
      line: current ? +current.getAttribute("aria-label").match(/Play line (\d+)/)[1] : 0,
      playing: [...document.querySelectorAll("button")].some(
        (button) => button.textContent.trim() === "Pause",
      ),
    };
  });

async function still(browser, { slug, cover }) {
  const atMs = +(args.at ?? cover.atMs);
  const x = +(args.x ?? cover.x ?? 0.5);
  const { ctx, page, stage } = await openSegment(browser, slug, cover.segment);
  await advance(page, atMs);
  const png = await shot(page, stage, x);
  await ctx.close();
  const file = path.join(OUT, args.out ? `${slug}-${atMs}-${x}.webp` : `${slug}.webp`);
  await sharp(png).resize(960, 480).webp({ quality: 82 }).toFile(file);
  console.log(`${slug}: ${cover.segment} at ${atMs} ms → ${path.relative(ROOT, file)}`);
}

/** Frames every `--every` ms until the segment ends, on one sheet labelled with the ms and line to put in `cover`. */
async function sheet(browser, { slug, cover }) {
  const segment = args.segment ?? cover.segment;
  const every = +args.every;
  const x = +(args.x ?? cover.x ?? 0.5);
  const { ctx, page, stage } = await openSegment(browser, slug, segment);
  const tiles = [];
  let seen = 1;
  for (let at = 0; ; at += every) {
    if (at > 0) await advance(page, every);
    const { line, playing } = await playback(page);
    // The player goes on into the next segment, which starts again at line 1.
    if ((!playing && at > 0) || (line > 0 && line < seen)) break;
    seen = Math.max(seen, line);
    const thumb = await sharp(await shot(page, stage, x))
      .resize(THUMB.width, THUMB.height)
      .png()
      .toBuffer();
    const label = Buffer.from(
      `<svg width="${THUMB.width}" height="${THUMB.height}"><rect x="6" y="6" width="210" height="28" rx="4" fill="#0f172a" fill-opacity="0.75"/><text x="14" y="25" font-family="sans-serif" font-size="16" fill="#fff">${at} ms · line ${line}</text></svg>`,
    );
    tiles.push(
      await sharp(thumb)
        .composite([{ input: label }])
        .png()
        .toBuffer(),
    );
  }
  await ctx.close();
  const rows = Math.ceil(tiles.length / SHEET_COLUMNS);
  const file = path.join(OUT, `${slug}-sheet.jpg`);
  await sharp({
    create: {
      width: THUMB.width * SHEET_COLUMNS,
      height: THUMB.height * rows,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite(
      tiles.map((input, index) => ({
        input,
        left: (index % SHEET_COLUMNS) * THUMB.width,
        top: Math.floor(index / SHEET_COLUMNS) * THUMB.height,
      })),
    )
    .jpeg({ quality: 80 })
    .toFile(file);
  console.log(`${slug}: ${tiles.length} frames of ${segment} → ${file}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const episode of episodes) {
    await (args.every ? sheet : still)(browser, episode);
  }
  await browser.close();
})();
