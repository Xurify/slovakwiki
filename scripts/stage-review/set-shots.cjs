// @ts-nocheck: Uses the review environment's Playwright, like check-playback.cjs.
// Stills of a set at desktop, tablet and phone width, and one sheet of the three, for the set critic (docs/critics/set-critic.md).
// Usage (dev server running): BASE=http://localhost:4321 node scripts/stage-review/set-shots.cjs <outdir> [scene,scene] [deviceScaleFactor]
const { chromium } = require("playwright");
const fs = require("fs");
const sharp = require(require("path").join(process.cwd(), "node_modules/sharp"));
const SCENES = {
  "studio-demo-intro": ["demonstratives", 0, 8000],
  "studio-demo-quiz": ["demonstratives", 3, 8000],
  "studio-demo-outro": ["demonstratives", 4, 8000],
  "studio-poss-intro": ["possessives", 0, 8000],
  "studio-poss-who": ["possessives", 3, 8000],
  "studio-poss-quiz": ["possessives", 4, 8000],
  "studio-poss-outro": ["possessives", 5, 8000],
  "studio-time-clock": ["telling-time", 3, 8000],
  "studio-time-quiz": ["telling-time", 4, 8000],
  "studio-time-outro": ["telling-time", 5, 8000],
  "studio-past-plate": ["past-tense", 0, 8000],
  "studio-past-who": ["past-tense", 4, 8000],
  "studio-past-closed": ["past-tense", 5, 8000],
  "studio-imp-intro": ["imperative", 0, 8000],
  "studio-imp-quiz": ["imperative", 3, 8000],
  "studio-imp-outro": ["imperative", 4, 8000],
  "studio-imp-water": ["imperative", 4, 26000],
  "studio-imp-watered": ["imperative", 4, 34000],
  "bobik-woof": ["what-bobik-says", 1, 8000],
  "bobik-quiet": ["what-bobik-says", 3, 8000],
  "bobik-101": ["what-bobik-says", 4, 8000],
  "future-know": ["future-tense", 1, 8000],
  "future-six": ["future-tense", 3, 8000],
  "future-wait": ["future-tense", 4, 8000],
  "future-home": ["future-tense", 5, 8000],
  "home-bobik": ["what-bobik-says", 0, 6000],
  "home-future": ["future-tense", 0, 6000],
  "home-demo": ["demonstratives", 2, 21000],
  kitchen: ["imperative", 1, 122000],
  "kitchen-table": ["imperative", 2, 8000],
  registration: ["possessives", 1, 12000],
  "registration-past": ["past-tense", 1, 10000],
  plaza: ["what-bobik-says", 2, 4000],
  "plaza-umbrella": ["possessives", 2, 20000],
  street: ["telling-time", 1, 37400],
  cafe: ["telling-time", 2, 12000],
  "cafe-past": ["past-tense", 2, 28500],
  park: ["future-tense", 2, 26000],
  studio: ["telling-time", 0, 30000],
  market: ["demonstratives", 1, 20000],
  "market-past": ["past-tense", 3, 15000],
};
const WIDTHS = { desktop: [1280, 800], tablet: [820, 1180], phone: [390, 844] };
const [out, which, dsfArg] = process.argv.slice(2);
const dsf = +(dsfArg ?? 1);
const STEP = 1000 / 30;
const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const names = which ? which.split(",") : Object.keys(SCENES);
  await Promise.all(
    names.map(async (name) => {
      const [slug, seg, at] = SCENES[name];
      const shots = [];
      for (const [w, [vw, vh]] of Object.entries(WIDTHS)) {
        const ctx = await browser.newContext({
          viewport: { width: vw, height: vh },
          deviceScaleFactor: dsf,
          colorScheme: "light",
        });
        await ctx.addInitScript(() => {
          localStorage.setItem("slovak.wiki.sfx-preference", "off");
          window.__sync = () => {
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
        page.on("pageerror", (e) => console.error(name, w, "page error:", e.message));
        await page.clock.install();
        await page.goto(
          `${process.env.BASE || "http://localhost:4321"}/listening/${slug}`,
          { waitUntil: "networkidle", timeout: 120000 },
        );
        await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
        await page.clock.runFor(1500);
        for (let i = 0; i < seg; i++) {
          await page.getByRole("button", { name: "Next segment" }).first().click();
          await page.clock.runFor(300);
        }
        await page.clock.runFor(800);
        await page.addStyleTag({
          content: "rect.stroke-blue-500 { opacity: 0 !important; }",
        });
        const stage = page.locator(".aspect-\\[2\\/1\\]").first();
        await stage.evaluate((el) => {
          const r = el.getBoundingClientRect();
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
        for (let t = 0; t < at; t += STEP) {
          await page.clock.runFor(Math.min(STEP, at - t));
          await page.evaluate(() => window.__sync());
        }
        const box = await stage.boundingBox();
        const file = `${out}/${name}-${w}.png`;
        await page.screenshot({ path: file, clip: box });
        shots.push(file);
        await ctx.close();
      }
      // one sheet: desktop on top, tablet and phone below
      const imgs = await Promise.all(
        shots.map(async (f) => ({ f, m: await sharp(f).metadata() })),
      );
      const W = 1280 * dsf;
      const scaled = await Promise.all(
        imgs.map(async ({ f, m }, i) => {
          const width = i === 0 ? W : Math.round(W / 2) - 10;
          const b = await sharp(f).resize({ width }).png().toBuffer();
          const mm = await sharp(b).metadata();
          return { b, h: mm.height, width };
        }),
      );
      const H = scaled[0].h + 20 + Math.max(scaled[1].h, scaled[2].h);
      await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
        .composite([
          { input: scaled[0].b, left: 0, top: 0 },
          { input: scaled[1].b, left: 0, top: scaled[0].h + 20 },
          { input: scaled[2].b, left: Math.round(W / 2) + 10, top: scaled[0].h + 20 },
        ])
        .png()
        .toFile(`${out}/${name}-sheet.png`);
      console.log(name, "done");
    }),
  );
  await browser.close();
})();
