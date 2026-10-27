// @ts-nocheck: Playwright is preinstalled in cloud sessions, not a dependency of this repo.
// Needs Playwright with a Chromium (preinstalled in cloud sessions; run with NODE_PATH=$(npm root -g) there).
// Usage: node scripts/critic/snap-frames.cjs <slug> <outdir> [waitMs]
// Clicks each segment, then each "Play line" button, and screenshots the stage after the line's staging settles.
const { chromium } = require("playwright");
const fs = require("fs");
const [slug, out, wait = "2500"] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 1000 } });
  await p.goto(`http://localhost:4321/listening/${slug}`, { waitUntil: "networkidle" });
  const segs = await p.$$eval(
    "button",
    (bs) => bs.filter((b) => /^\d+\s/.test(b.textContent.trim())).length,
  );
  const index = [];
  for (let s = 0; s < segs; s++) {
    const seg = p
      .locator("button")
      .filter({ hasText: new RegExp(`^\\s*${s + 1}\\s`) })
      .first();
    await seg.click({ force: true });
    await p.waitForTimeout(800);
    const lines = await p.locator('button[aria-label^="Play line"]').count();
    for (let l = 0; l < lines; l++) {
      const btn = p.locator('button[aria-label^="Play line"]').nth(l);
      const label = await btn.getAttribute("aria-label");
      await btn.click({ force: true });
      await p.waitForTimeout(Number(wait));
      const file = `${out}/s${s + 1}-l${String(l + 1).padStart(2, "0")}.png`;
      // The stage re-renders per line, so find the biggest svg again each time.
      const box = await p.evaluate(() => {
        const svg = [...document.querySelectorAll("svg")]
          .map((el) => el.getBoundingClientRect())
          .sort((a, b) => b.width * b.height - a.width * a.height)[0];
        window.scrollBy(0, svg.top - 80);
        const r = [...document.querySelectorAll("svg")]
          .map((el) => el.getBoundingClientRect())
          .sort((a, b) => b.width * b.height - a.width * a.height)[0];
        return { x: r.left, y: r.top, width: r.width, height: r.height };
      });
      await p.screenshot({ path: file, clip: box });
      index.push({ segment: s + 1, line: l + 1, label, file });
    }
  }
  fs.writeFileSync(`${out}/index.json`, JSON.stringify(index, null, 2));
  console.log(index.length, "frames");
  await b.close();
})();
