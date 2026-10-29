// @ts-nocheck: Uses the review environment's Playwright, like check-playback.cjs.
// node scripts/stage-review/check-settings.cjs [--base http://localhost:4321]
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { mkdirSync } = require("node:fs");
const { resolve } = require("node:path");

const arg = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1];
};
const base = arg("--base", "http://localhost:4321");
const out = resolve(arg("--out", "tmp/player-settings"));
mkdirSync(out, { recursive: true });

const surfaces = [
  {
    path: "/listening/future-tense",
    label: "Listening settings",
    bar: ["Subtitles", "Show English", "Slower", "Transcript"],
    groups: [],
    switches: ["Background sound", "Speaker faces", "Pause at questions"],
  },
  {
    path: "/dev/scenes",
    label: "Scene settings",
    groups: ["On screen", "Playback", "Sound"],
    switches: ["Show English", "Slower", "Listen first", "Background sound"],
  },
  {
    path: "/lessons/everyday/meet-someone",
    label: "Lesson settings",
    // Volume sits first with no heading, so the panel has no Sound group.
    groups: ["Story", "Display"],
    switches: ["Auto-advance", "Show English", "Dark mode"],
  },
];

async function run(browser, width, theme, surface) {
  const page = await browser.newPage({
    viewport: { width, height: 844 },
    colorScheme: theme,
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const trigger = page.getByRole("button", { name: surface.label, exact: true });
  const dialog = page.getByRole("dialog", { name: surface.label, exact: true });
  const close = dialog.getByRole("button", { name: "Close settings", exact: true });
  const firstControl = dialog.locator("button:visible, input:visible").first();
  const setting = (name) => dialog.getByRole("switch", { name, exact: true });
  const barButton = (name) => page.getByRole("button", { name, exact: true });
  const hydrated = () =>
    page
      .locator("astro-island[ssr]")
      .first()
      .waitFor({ state: "detached", timeout: 30_000 });
  const open = async () => {
    await trigger.click();
    await dialog.waitFor();
  };
  const dismiss = async () => {
    if (await close.isVisible()) await close.click();
    else await page.keyboard.press("Escape");
  };
  // Escape and the close button return focus to the gear; a click or Tab elsewhere does not.
  const closed = async (restoresFocus = true) => {
    await dialog.waitFor({ state: "hidden" });
    if (restoresFocus) {
      assert(
        await trigger.evaluate((el) => el === document.activeElement),
        "Closing restores gear focus",
      );
    }
    assert.equal(await trigger.getAttribute("aria-expanded"), "false");
    assert.notEqual(
      await page.evaluate(() => document.documentElement.style.overflow),
      "hidden",
    );
  };

  try {
    await page.goto(`${base}${surface.path}`, {
      waitUntil: "networkidle",
      timeout: 90_000,
    });
    await hydrated();
    await open();
    assert.equal(await trigger.getAttribute("aria-expanded"), "true");
    assert.equal(await close.isVisible(), width < 640, "Close shows on phones only");
    assert(
      await firstControl.evaluate((el) => el === document.activeElement),
      "The first control gets initial focus",
    );
    assert.deepEqual(
      await dialog
        .locator("h3")
        .allTextContents()
        .then((items) => items.map((s) => s.trim())),
      surface.groups,
    );
    assert.equal(await dialog.getByRole("switch").count(), surface.switches.length);
    for (const name of surface.switches) {
      const row = setting(name);
      assert.equal(await row.count(), 1, `Keep ${name}`);
      const box = await row.boundingBox();
      assert(box.height >= 44, `${name} has a comfortable target`);
      assert.equal(
        await row.locator("svg[aria-hidden=true]").count(),
        1,
        `${name} has a decorative icon`,
      );
    }
    for (const control of [
      ...(width < 640 ? [close] : []),
      ...((await dialog.getByRole("slider").count())
        ? [
            dialog.getByRole("slider"),
            dialog.getByRole("button", { name: /^(Mute|Unmute)$/ }),
          ]
        : []),
    ]) {
      assert(
        (await control.boundingBox()).height >= 44,
        "Close, mute and slider have 44px targets",
      );
    }
    const box = await dialog.boundingBox();
    assert(
      box.x >= 0 &&
        box.y >= 0 &&
        box.x + box.width <= width + 1 &&
        box.y + box.height <= 845,
      "Panel fits viewport",
    );
    if (width === 390) {
      assert.equal(Math.round(box.width), 366, "Phone uses a full-width inset sheet");
      assert(Math.abs(box.y + box.height - 832) <= 1, "Sheet sits above the bottom edge");
    }
    if (surface.bar) {
      assert(box.height <= 300, `Panel stays short: ${Math.round(box.height)}px`);
      for (const name of surface.bar) {
        assert.equal(await barButton(name).count(), 1, `${name} sits in the bar`);
        assert(
          ["true", "false"].includes(await barButton(name).getAttribute("aria-pressed")),
          `${name} shows its state`,
        );
      }
    }

    // Not modal: Tab moves on to the page, and leaving the panel closes it.
    await firstControl.focus();
    await page.keyboard.press("Shift+Tab");
    assert(
      await trigger.evaluate((el) => el === document.activeElement),
      "Reverse tab from the panel reaches the gear, not a trap",
    );
    await dialog.waitFor();
    await page.keyboard.press("Tab");
    assert(
      await firstControl.evaluate((el) => el === document.activeElement),
      "Tab from the gear enters the panel",
    );
    await dialog.locator("button, input").last().focus();
    await page.keyboard.press("Tab");
    await closed(false);
    await open();

    // Show English keeps its name while its state flips, and the state survives a reload.
    const english = surface.bar ? barButton("Show English") : setting("Show English");
    const state = surface.bar ? "aria-pressed" : "aria-checked";
    const before = await english.getAttribute(state);
    if (surface.bar) {
      await page.keyboard.press("Escape");
      await closed();
      await english.click();
      assert.notEqual(await english.getAttribute(state), before);
    } else {
      // Read the state while the panel is open: role queries cannot find its switches once it closes.
      await english.focus();
      await page.keyboard.press("Space");
      assert.notEqual(await english.getAttribute(state), before);
      await page.keyboard.press("Escape");
      await closed();
    }
    await page.reload({ waitUntil: "networkidle" });
    await hydrated();
    // Bar buttons are read with the panel shut, since a phone's sheet covers the bar.
    if (!surface.bar) await open();
    assert.notEqual(await english.getAttribute(state), before);
    await english.click();
    if (surface.bar) await open();

    if (await dialog.getByRole("slider").count()) {
      const slider = dialog.getByRole("slider");
      await slider.evaluate((el) => {
        el.value = "37";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await slider.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await slider.inputValue(),
        "38",
        "Native slider supports keyboard adjustment",
      );
      await dialog.getByRole("button", { name: "Mute", exact: true }).click();
      assert.equal(await slider.inputValue(), "0");
      await dismiss();
      await closed();
      await open();
      await dialog.getByRole("button", { name: "Unmute", exact: true }).click();
      assert.equal(
        await slider.inputValue(),
        "38",
        "Unmute restores the level, including after reopening",
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("slovak.wiki.audio-volume")),
        "0.38",
      );
    }

    if (surface.label === "Lesson settings") {
      await setting("Dark mode").click();
      assert.equal(
        await page.locator("html").getAttribute("data-theme"),
        theme === "dark" ? "light" : "dark",
      );
      await setting("Dark mode").click();
    }

    await dialog
      .locator('[class~="overflow-y-auto"]')
      .evaluate((el) => (el.scrollTop = 0));
    await dialog.screenshot({
      path: resolve(
        out,
        `${surface.label.split(" ")[0].toLowerCase()}-${width}-${theme}.png`,
      ),
    });
    await page.mouse.click(2, 2);
    await closed(false);

    if (surface.bar && width >= 640) {
      // The bar's Listen button works with the panel open: one click plays and closes it.
      await open();
      await barButton("Listen").click();
      await dialog.waitFor({ state: "hidden" });
      await barButton("Pause").waitFor();
      await barButton("Pause").click();
    }

    // The last setting must stay reachable on a short landscape screen, and resizing with the panel open must be safe.
    await page.setViewportSize({ width: 740, height: 360 });
    await open();
    const last = setting(surface.switches.at(-1));
    await last.scrollIntoViewIfNeeded();
    const lastBox = await last.boundingBox();
    assert(
      lastBox.y >= 0 && lastBox.y + lastBox.height <= 361,
      `Last setting is reachable on short screens: ${JSON.stringify(lastBox)}`,
    );
    await page.setViewportSize({ width: 390, height: 667 });
    const mobileBox = await dialog.boundingBox();
    assert(
      mobileBox.x >= 0 &&
        mobileBox.x + mobileBox.width <= 391 &&
        mobileBox.y + mobileBox.height <= 668,
      "Open panel adapts to mobile",
    );
    await close.click();
    await closed();
    assert.deepEqual(errors, [], "No browser runtime errors");
    console.log(
      `PASS ${surface.label}, ${width}px ${theme}: settings, icons, keyboard, persistence, dismissal, resize, playback while open`,
    );
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });
  try {
    for (const surface of surfaces) {
      for (const width of [1280, 390]) {
        for (const theme of ["light", "dark"]) await run(browser, width, theme, surface);
      }
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
