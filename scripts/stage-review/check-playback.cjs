// @ts-nocheck: Like render-frames.cjs, this uses the review environment's Playwright.
// node scripts/stage-review/check-playback.cjs [--base http://localhost:4321] [--path /listening/future-tense]
// Optional CHROME_PATH selects an installed Chromium executable.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const base = arg("--base", "http://localhost:4321");
const episodePath = arg("--path", "/listening/future-tense");

async function instrument(page) {
  await page.addInitScript(() => {
    window.__playback = { audio: [], contexts: [], errors: [] };
    window.addEventListener("error", (event) =>
      window.__playback.errors.push(event.error?.stack || event.message),
    );
    window.addEventListener("unhandledrejection", (event) =>
      window.__playback.errors.push(String(event.reason)),
    );
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
      if (!window.__playback.audio.includes(this)) window.__playback.audio.push(this);
      return play.apply(this, args);
    };
    const Context = window.AudioContext;
    window.AudioContext = class extends Context {
      constructor(...args) {
        super(...args);
        window.__playback.contexts.push(this);
      }
      suspend() {
        this.__stageHeld = true;
        return super.suspend();
      }
    };
  });
}

async function sample(page) {
  return page.evaluate(() => {
    const root = document.querySelector("[data-listen-stage]");
    const audio = window.__playback.audio.find((a) => a.src.includes(".mp3"));
    return {
      players: document.querySelectorAll("[data-listen-stage]").length,
      stages: document.querySelectorAll('[data-listen-stage] [class~="aspect-[2/1]"]')
        .length,
      controls: document.querySelectorAll('ol[aria-label="Lines"]').length,
      line: root?.querySelector('[aria-label="Lines"] [aria-current="true"]')?.ariaLabel,
      caption: root?.querySelector('p[lang="sk"]')?.innerHTML,
      highlight: [...(root?.querySelectorAll('p[lang="sk"] .bg-blue-100') || [])]
        .map((word) => word.textContent)
        .join(" "),
      drawing: root?.querySelector('[class~="aspect-[2/1]"]')?.innerHTML,
      time: audio?.currentTime,
      src: audio?.src,
      paused: audio?.paused,
      contexts: window.__playback.contexts
        .filter((ctx) => ctx.__stageHeld)
        .map((ctx) => ctx.state),
      errors: [...window.__playback.errors],
    };
  });
}

async function onePlayer(page) {
  const state = await sample(page);
  assert.equal(state.players, 1, "A segment switch must leave exactly one player");
  assert.equal(state.stages, 1, "A segment switch must leave exactly one stage");
  assert.equal(
    state.controls,
    1,
    "A segment switch must leave exactly one control strip",
  );
  assert.deepEqual(state.errors, [], "No runtime errors");
}

async function run(browser, width) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    colorScheme: width === 390 ? "dark" : "light",
  });
  const button = (name) => page.getByRole("button", { name, exact: true });
  const segment = (index) => page.locator('ol[aria-label="Segments"] button').nth(index);
  const line = (index) => page.locator('ol[aria-label="Lines"] button').nth(index);
  const lineCount = () => page.locator('ol[aria-label="Lines"] button').count();
  const report = (name) => console.log(`PASS ${width}px ${name}`);
  const setting = async (name) => {
    await button("Listening settings").click();
    await page
      .locator("#scene-settings")
      .getByRole("button", { name: new RegExp(`^${name} `) })
      .click();
    await page.keyboard.press("Escape");
  };
  try {
    await instrument(page);
    await page.goto(`${base}${episodePath}`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page
      .locator('astro-island[component-url*="EpisodePlayer"]:not([ssr])')
      .waitFor();
    await page.locator("[data-listen-stage]").waitFor();
    await page.evaluate(() => {
      // Keep the segment list available at both viewport sizes.
      document.querySelector('ol[aria-label="Segments"]').closest("details").open = true;
    });
    await segment(0).click();
    await button("Listen").click();
    await page.waitForFunction(() => {
      const audio = window.__playback.audio.find((a) => a.src.includes(".mp3"));
      return (
        audio &&
        !audio.paused &&
        audio.currentTime > 0.8 &&
        document.querySelector('p[lang="sk"] .bg-blue-100')
      );
    });
    await button("Pause").click();
    await page.waitForTimeout(80);
    const paused = await sample(page);
    assert(
      paused.drawing?.length > 1000,
      "The freeze check must sample the actual stage",
    );
    await page.waitForTimeout(650);
    const held = await sample(page);
    assert.equal(held.time, paused.time, "Audio stays at the pause point");
    assert.equal(held.caption, paused.caption, "Subtitle stays at the pause point");
    assert.equal(held.drawing, paused.drawing, "Figures stay at the pause point");
    assert(
      held.contexts.every((s) => s !== "running"),
      "Stage sound stays suspended",
    );
    assert(held.highlight, "The caption test starts on a highlighted word");
    await setting("Subtitles");
    await setting("Subtitles");
    assert.equal(
      (await sample(page)).highlight,
      held.highlight,
      "Restoring subtitles while paused restores the held word",
    );
    await button("Resume").click();
    await page.waitForTimeout(250);
    assert((await sample(page)).time > held.time, "Resume advances the held clip");
    report("audio, caption, figures and background sound hold and resume");

    for (const playing of [false, true]) {
      for (const delay of [0, 40, 500]) {
        await segment(0).click();
        await line((await lineCount()) - 1).click();
        await page.waitForTimeout(delay);
        if (!playing) await button("Pause").click();
        await button("Next segment").click();
        await onePlayer(page);
        if (!playing) await button("Listen").click();
        await page.waitForFunction(() => {
          const audio = window.__playback.audio.find((a) => a.src.includes(".mp3"));
          return audio && !audio.paused && audio.currentTime > 0.1;
        });
        await onePlayer(page);
        await button("Pause").click();
        await button("Next segment").click();
        await onePlayer(page);
        await button("Previous segment").click();
        await onePlayer(page);
      }
    }
    report("next/previous from playing and paused, including rapid switches");

    // Complete the first segment, return, then pause its last line during replay.
    const nextTitle = await segment(1).locator('span[lang="sk"]').first().textContent();
    await segment(0).click();
    const lastLine = (await lineCount()) - 1;
    await line(lastLine).click();
    await page.waitForTimeout(1800);
    await page.evaluate(() => {
      const audio = window.__playback.audio.find((a) => a.src.includes(".mp3"));
      audio?.dispatchEvent(new Event("ended"));
    });
    await page.waitForFunction(
      (title) => document.querySelector("#stage-title")?.textContent.includes(title),
      nextTitle,
    );
    await segment(0).click();
    await line(lastLine).click();
    await page.waitForTimeout(350);
    await button("Pause").click();
    const replay = await sample(page);
    await button("Resume").click();
    await page.waitForTimeout(200);
    const resumed = await sample(page);
    assert.equal(
      resumed.line,
      replay.line,
      "Resume must not jump to line one on a completed segment",
    );
    assert.equal(resumed.src, replay.src);
    report("paused final line of a previously heard segment resumes in place");
    await button("Pause").click();
    await page.getByRole("button", { name: /^Next:/ }).click();
    await page.waitForTimeout(250);
    await onePlayer(page);
    report("bottom Next after paused replay leaves one player");

    const count = await page.locator('ol[aria-label="Segments"] button').count();
    for (let index = 0; index < count; index++) {
      await segment(index).click();
      await line(1).click();
      await page.waitForTimeout(300);
      // A line that holds for the listener's answer hides the pause control.
      if (await button("Pause").count()) await button("Pause").click();
      if (index + 1 < count) await button("Next segment").click();
      else await button("Previous segment").click();
      await onePlayer(page);
    }
    // Boundary buttons cannot activate even through a synthetic click.
    for (const [index, name] of [
      [0, "Previous segment"],
      [count - 1, "Next segment"],
    ]) {
      await segment(index).click();
      const nav = page.locator(`button[aria-label="${name}"]`);
      assert(await nav.isDisabled());
      const title = await page.locator("#stage-title").textContent();
      await nav.evaluate((element) => element.click());
      assert.equal(await page.locator("#stage-title").textContent(), title);
      await onePlayer(page);
    }
    report("all segments replace cleanly and navigation boundaries stay disabled");
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  try {
    for (const width of [1280, 390]) await run(browser, width);
    console.log(`OK ${episodePath}`);
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
