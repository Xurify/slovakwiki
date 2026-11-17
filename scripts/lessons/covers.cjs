// @ts-nocheck: Playwright is not a dependency of this repo (see scripts/stage-review/README.md),
// and most of this runs inside the page.
// Usage (dev server running, Playwright on NODE_PATH):
//   node scripts/lessons/covers.cjs [--only <lesson id>] [--base <url>]   every cover, to static/lesson-covers/
//   … --only <lesson id> --at <ms> --out <dir> [--x 0.5]                  one trial still
// Each cover is the lesson's first chapter, `AT_MS` into its lines (or the lesson's entry in `MOMENTS`),
// played on Playwright's virtual clock as scripts/listening/covers.cjs does.
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
if (args.at && !(args.only && args.out)) {
  throw new Error("--at tries a moment out: give --only <lesson id> and --out <dir>");
}
const OUT = args.out ? path.resolve(args.out) : path.join(ROOT, "static/lesson-covers");

/** A moment where the cast faces each other mid-line reads better than the walk-on at the start. */
const AT_MS = 2600;
const MOMENTS = { "everyday/meet-someone": 4500, "grammar/demonstratives": 6500 };

const lessons = JSON.parse(
  execFileSync(
    "bun",
    [
      "-e",
      'import { lessons, lessonPath } from "./src/lib/catalog/lessons"; console.log(JSON.stringify(lessons.map((lesson) => ({ id: lesson.id, path: lessonPath(lesson) }))))',
    ],
    { cwd: ROOT, encoding: "utf8" },
  ),
).filter(({ id }) => !args.only || id === args.only);

const STEP_MS = 1000 / 30;

async function advance(page, ms) {
  for (let t = 0; t < ms; t += STEP_MS) {
    await page.clock.runFor(Math.min(STEP_MS, ms - t));
    await page.evaluate(() => window.__syncAnimations());
  }
}

async function still(browser, { id, path: route }) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
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
  page.on("pageerror", (e) => console.error(`${id}: page error:`, e.message));
  await page.clock.install();
  await page.goto(`${args.base}${route}`, { waitUntil: "networkidle" });
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
  await page.clock.runFor(1500);
  await page.locator("[data-lesson-play]").first().click();
  await page.mouse.move(0, 0);
  // The player's bar and the lit ring on a named thing are for the learner, not for a still.
  await page.addStyleTag({
    content:
      ".group\\/stage > .absolute { display: none !important; } rect.stroke-blue-500 { opacity: 0 !important; }",
  });
  await advance(page, +(args.at ?? MOMENTS[id] ?? AT_MS));

  const box = await page.locator(".group\\/stage").first().boundingBox();
  const x = +(args.x ?? 0.5);
  const height = Math.min(box.height, box.width / 2);
  const width = height * 2;
  const left = Math.min(box.width - width, Math.max(0, box.width * x - width / 2));
  const png = await page.screenshot({
    clip: { x: box.x + left, y: box.y + (box.height - height), width, height },
  });
  await ctx.close();
  // Next to /lessons, not under it, where the path would read as a track.
  const name = id.replace("/", "-");
  const file = path.join(OUT, args.out ? `${name}-${args.at}-${x}.webp` : `${name}.webp`);
  await sharp(png).resize(960, 480).webp({ quality: 82 }).toFile(file);
  console.log(`${id} → ${path.relative(ROOT, file)}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const lesson of lessons) await still(browser, lesson);
  await browser.close();
})();
