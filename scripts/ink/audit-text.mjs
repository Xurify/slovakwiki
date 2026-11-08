// @ts-nocheck
// Needs puppeteer-core and a Chrome: bun add -d puppeteer-core, or run it from a project that has it.
// Usage: node scripts/ink/audit-text.mjs <dir with sheet-light.html> [path to chrome.exe]
import puppeteer from "puppeteer-core";
const dir = process.argv[2];
const chrome = process.argv[3] ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, headless: "new" });
  const page = await browser.newPage();
  await page.setViewport({ width: 1340, height: 900 });
  await page.goto("file:///" + dir + "/sheet-light.html");
  const issues = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll(".c").forEach((card) => {
      const slug = card.firstChild.textContent.trim();
      const svg = card.querySelector("svg");
      const texts = [...svg.querySelectorAll("text")];
      const paths = [...svg.querySelectorAll("path")].filter(
        (p) => p.getAttribute("fill") === "none",
      );
      const boxes = texts.map((t) => ({ t, b: t.getBBox(), label: t.textContent }));
      for (const { t, b, label } of boxes) {
        if (b.x < 6 || b.x + b.width > 334 || b.y < 0 || b.y + b.height > 131)
          out.push(
            `${slug}: "${label}" outside the sheet (x ${b.x.toFixed(0)}..${(b.x + b.width).toFixed(0)}, y ${b.y.toFixed(0)}..${(b.y + b.height).toFixed(0)})`,
          );
        const pad = 4;
        const pts = [];
        for (let i = 0; i <= 24; i += 1) {
          const f = i / 24;
          pts.push([b.x - pad + f * (b.width + 2 * pad), b.y + 2 - pad]);
          pts.push([b.x - pad + f * (b.width + 2 * pad), b.y + b.height - 3 + pad]);
        }
        for (let i = 0; i <= 8; i += 1) {
          const f = i / 8;
          pts.push([b.x - pad, b.y + 2 + f * (b.height - 5)]);
          pts.push([b.x + b.width + pad, b.y + 2 + f * (b.height - 5)]);
        }
        const hit = new Set();
        for (const p of paths) {
          const w = parseFloat(p.getAttribute("stroke-width") || "1.4");
          for (const [x, y] of pts) {
            if (p.isPointInStroke(new DOMPoint(x, y))) hit.add(p.getAttribute("class"));
          }
        }
        if (hit.size)
          out.push(`${slug}: "${label}" touches a stroke (${[...hit].join(",")})`);
      }
      for (let i = 0; i < boxes.length; i += 1)
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i].b,
            c = boxes[j].b;
          const gapX = Math.max(c.x - (a.x + a.width), a.x - (c.x + c.width));
          const gapY = Math.max(c.y - (a.y + a.height), a.y - (c.y + c.height));
          if (gapX < 4 && gapY < 2)
            out.push(
              `${slug}: "${boxes[i].label}" and "${boxes[j].label}" are ${Math.max(gapX, gapY).toFixed(1)} apart`,
            );
        }
    });
    return out;
  });
  console.log(issues.join("\n") || "no issues");
  await browser.close();
})();
