// @ts-nocheck: Playwright is preinstalled in cloud sessions, not a dependency of this repo,
// and most of this runs inside the page.
// Usage: node scripts/critic/game-walk.cjs --segment "Pomôžte Marekovi" [--episode demonstratives]
//   [--picks 1,2,skip] [--width 1280] [--base http://localhost:4321] [--out /tmp/game-walk]
// Plays a listener's game on the virtual clock, answers each ask as --picks says (a choice's number,
// or "skip" for the "Let … answer" control; the last entry repeats), and samples the ask card every 100 ms.
// Prints blockers as JSON lines, like the critics:
// - a card that leaves and comes back, or an earlier ask's card shown again (Xurify saw the last question
//   flash for 0.9 s after a pick);
// - a control in the card that does not line up with the card's text, or a row of choices of uneven height.
// Run it on every path the episode has (all right, all wrong, all skipped, a mix) at 1280 and 390 wide.
const { chromium } = require("playwright");
const fs = require("fs");

const args = {
  episode: "demonstratives",
  picks: "1",
  width: 1280,
  base: "http://localhost:4321",
  out: "/tmp/game-walk",
};
for (let i = 2; i < process.argv.length; i++) {
  args[process.argv[i].replace(/^--/, "")] = process.argv[++i];
}
if (!args.segment)
  throw new Error("--segment is required (a regex for the segment's button)");
const picks = args.picks.split(",").map((p) => p.trim());
const STEP = 100;
// A card that comes back within this long after it went away is a flicker, not a new question.
const FLICKER_MS = 1500;
fs.mkdirSync(args.out, { recursive: true });

const findings = [];
function report(t, what, evidence) {
  const f = { class: "J", segment: args.segment, t_ms: t, who: "player", what, evidence };
  findings.push(f);
  console.log(JSON.stringify(f));
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: +args.width, height: 900 },
    deviceScaleFactor: 1,
  });
  // Sound off: each line lasts its clip's length on timers, which the virtual clock controls.
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
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.clock.install();
  await page.goto(`${args.base}/listening/${args.episode}`, { waitUntil: "networkidle" });
  await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 100);
  await page.clock.runFor(1500);
  const segment = page.getByRole("button", { name: new RegExp(args.segment) }).first();
  if (await segment.isVisible()) await segment.click();
  else {
    // On a phone the segment list is folded away; step through the segments instead.
    for (
      let i = 0;
      i < 12 && !(await page.getByText(new RegExp(args.segment)).first().isVisible());
      i++
    ) {
      await page.getByRole("button", { name: "Next segment" }).click();
      await page.clock.runFor(300);
    }
  }
  await page.clock.runFor(800);
  const playing = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("button")].some(
        (b) => b.textContent.trim() === "Pause",
      ),
    );
  if (!(await playing()))
    await page
      .getByRole("button", { name: /^Listen$/ })
      .first()
      .click();

  const card = () =>
    page.evaluate(() => {
      const el = document.querySelector(
        '[role="group"][aria-labelledby="listener-ask-prompt"]',
      );
      if (!el) return null;
      const buttons = [...el.querySelectorAll("button")];
      const choices = buttons.filter((b) => b.hasAttribute("aria-pressed"));
      return {
        id: choices.map((b) => b.textContent.trim().replace(/\s+/g, " ")).join(" | "),
        held: choices.some((b) => !b.hasAttribute("aria-disabled")),
      };
    });

  // Every control's box starts where the card's text starts, and choices in a row are one height.
  const geometry = () =>
    page.evaluate(() => {
      const el = document.querySelector(
        '[role="group"][aria-labelledby="listener-ask-prompt"]',
      );
      const text = el.querySelector("p").getBoundingClientRect();
      const boxes = [...el.querySelectorAll("button")].map((b) => {
        const r = b.getBoundingClientRect();
        return {
          label: b.textContent.trim().replace(/\s+/g, " "),
          left: r.left,
          top: r.top,
          height: r.height,
          right: r.right,
        };
      });
      const rows = [];
      for (const b of boxes) {
        const row = rows.find((r) => Math.abs(r[0].top - b.top) < 4);
        if (row) row.push(b);
        else rows.push([b]);
      }
      const card = el.getBoundingClientRect();
      return { text: text.left, cardRight: card.right, rows };
    });

  // The card rises in from transparent, so finish that animation for the picture; the dev toolbar would cover it.
  const shoot = async (name) => {
    await page.evaluate(() => document.querySelector("astro-dev-toolbar")?.remove());
    await page
      .locator('[role="group"][aria-labelledby="listener-ask-prompt"]')
      .screenshot({ path: `${args.out}/${name}`, animations: "disabled" })
      .catch(() => page.screenshot({ path: `${args.out}/${name}` }));
  };

  let t = 0;
  let last = null;
  let lastSeen = null;
  let stale = null;
  let back = null;
  const order = [];
  const gone = new Map();
  const handled = new Set();
  let asks = 0;
  let idle = 0;
  while (t < 20 * 60 * 1000) {
    const now = await card();
    const id = now?.id ?? null;
    if (id !== last) {
      // The earlier card has gone again: report how long it showed.
      if (stale && last === stale.id) {
        stale.finding.what += ` for ${t - stale.at} ms`;
        console.log(JSON.stringify(stale.finding));
        back = stale.current;
        stale = null;
      }
      if (last !== null) gone.set(last, t);
      if (id !== null && id === back) back = null;
      else if (id !== null) {
        back = null;
        if (lastSeen !== null && id !== lastSeen && order.includes(id)) {
          await shoot(`stale-${t}.png`);
          const finding = {
            class: "J",
            segment: args.segment,
            t_ms: t,
            who: "player",
            what: `after a pick on "${lastSeen}", the card of an earlier question (${id}) shows`,
            evidence: `stale-${t}.png`,
          };
          findings.push(finding);
          stale = { id, current: lastSeen, at: t, finding };
        } else if (id === lastSeen && gone.has(id) && t - gone.get(id) < FLICKER_MS) {
          report(
            t,
            `the card "${id}" went away for ${t - gone.get(id)} ms and came back`,
            "card sampled every 100 ms",
          );
        }
        if (!order.includes(id)) order.push(id);
        if (!stale) lastSeen = id;
      }
      last = id;
    }
    if (now?.held && !handled.has(id)) {
      handled.add(id);
      const g = await geometry();
      await page.mouse.move(0, 0);
      await shoot(`ask-${asks + 1}.png`);
      // A quiet control's box only shows on hover, and that is when a misaligned one shows (Xurify's screenshot).
      const skip = page.getByRole("button", { name: /^Let .* answer$/ });
      if (await skip.isVisible()) {
        await skip.hover();
        await shoot(`ask-${asks + 1}-hover.png`);
        await page.mouse.move(0, 0);
      }
      for (const row of g.rows) {
        const off = Math.round(row[0].left - g.text);
        if (Math.abs(off) > 2) {
          report(
            t,
            `"${row[0].label}" starts ${Math.abs(off)} px ${off < 0 ? "left" : "right"} of the card's text`,
            `ask-${asks + 1}.png`,
          );
        }
        const heights = new Set(row.map((b) => Math.round(b.height)));
        if (heights.size > 1)
          report(
            t,
            `buttons in one row have different heights: ${[...heights].join(", ")} px`,
            `ask-${asks + 1}.png`,
          );
        for (const b of row) {
          if (b.right > g.cardRight)
            report(t, `"${b.label}" runs past the card's edge`, `ask-${asks + 1}.png`);
        }
      }
      const plan = picks[Math.min(asks, picks.length - 1)];
      asks += 1;
      await page.clock.runFor(400);
      if (plan === "skip") {
        await page.getByRole("button", { name: /^Let .* answer$/ }).click();
      } else {
        await page
          .locator(
            '[role="group"][aria-labelledby="listener-ask-prompt"] button[aria-pressed]',
          )
          .nth(+plan - 1)
          .click();
      }
      console.error(`ask ${asks}: ${id} -> ${plan}`);
    }
    await page.clock.runFor(STEP);
    await page.evaluate(() => window.__syncAnimations());
    t += STEP;
    idle = (await playing()) || now?.held ? 0 : idle + STEP;
    if (idle > 3000) break;
  }
  if (stale) console.log(JSON.stringify(stale.finding));
  console.error(
    `${asks} asks, ${findings.length} findings, ${Math.round(t / 1000)} s played`,
  );
  fs.writeFileSync(`${args.out}/findings.json`, JSON.stringify(findings, null, 2));
  await browser.close();
})();
