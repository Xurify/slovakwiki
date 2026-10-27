// @ts-nocheck: Playwright is preinstalled in cloud sessions, not a dependency of this repo,
// and most of this runs inside the page.
// Usage: node scripts/stage-review/record-video.cjs --segment "Záver" --out /tmp/zaver.mp4
//   [--episode imperative] [--from 1] [--ms <length>] [--base http://localhost:4321]
// Records a segment in real time with its voices and foley, for the preview Xurify watches once the gate
// is clean. Frames for critics come from render-frames.cjs instead, which is faster and exact.
const { chromium } = require("playwright");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const args = { episode: "imperative", from: 1, base: "http://localhost:4321" };
for (let i = 2; i < process.argv.length; i += 2)
  args[process.argv[i].replace(/^--/, "")] = process.argv[i + 1];
if (!args.segment || !args.out) throw new Error("--segment and --out are required");

// Taps every sound the page makes into one MediaRecorder: the voices' <audio> and the foley's AudioContext.
const tap = () => {
  const Real = window.AudioContext;
  const realDest = Object.getOwnPropertyDescriptor(
    BaseAudioContext.prototype,
    "destination",
  ).get;
  let shared, mix;
  const get = () => {
    if (!shared) {
      shared = new Real();
      mix = shared.createGain();
      mix.connect(realDest.call(shared));
      window.__recDest = shared.createMediaStreamDestination();
      mix.connect(window.__recDest);
    }
    if (shared.state === "suspended") shared.resume();
    return shared;
  };
  function Shared() {
    return get();
  }
  Shared.prototype = Real.prototype;
  window.AudioContext = window.webkitAudioContext = Shared;
  Object.defineProperty(BaseAudioContext.prototype, "destination", {
    get() {
      return this === shared && mix ? mix : realDest.call(this);
    },
  });
  AudioContext.prototype.close = () => Promise.resolve();
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    if (!this.__tapped) {
      // Web Audio hears a cross-origin clip as silence unless it was fetched with CORS (R2 sends no
      // CORS header; the route below adds one).
      this.crossOrigin = "anonymous";
      get().createMediaElementSource(this).connect(mix);
      this.__tapped = true;
    }
    return play.call(this);
  };
  window.__startRec = () => {
    get();
    const r = new MediaRecorder(window.__recDest.stream, {
      mimeType: "audio/webm;codecs=opus",
    });
    window.__chunks = [];
    r.ondataavailable = (e) => window.__chunks.push(e.data);
    r.start();
    window.__rec = r;
  };
  window.__stopRec = () =>
    new Promise((done) => {
      window.__rec.onstop = async () => {
        const bytes = new Uint8Array(await new Blob(window.__chunks).arrayBuffer());
        let s = "";
        for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
        done(btoa(s));
      };
      window.__rec.stop();
    });
};

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rec-"));
  const browser = await chromium.launch({
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    recordVideo: { dir: tmp, size: { width: 2560, height: 1600 } },
  });
  await ctx.route(/^https:\/\/audio\.slovak\.wiki\//, async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "access-control-allow-origin": "*" },
    });
  });
  await ctx.addInitScript(tap);
  const opened = Date.now();
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.error("page error:", e.message));
  await page.goto(`${args.base}/listening/${args.episode}`, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: new RegExp(args.segment) })
    .first()
    .click();
  await page.waitForTimeout(800);
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
      return { width: r.width, height: r.height };
    });
  await page.evaluate(() => window.__startRec());
  const recAt = Date.now();
  await page
    .getByRole("button", { name: new RegExp(`^Play line ${args.from} of`) })
    .first()
    .click();
  if (args.ms) await page.waitForTimeout(+args.ms);
  else {
    await page.waitForFunction(
      () =>
        ![...document.querySelectorAll("button")].some(
          (b) => b.textContent.trim() === "Pause",
        ),
      null,
      { timeout: 600000, polling: 250 },
    );
    await page.waitForTimeout(1500);
  }
  const audio = await page.evaluate(() => window.__stopRec());
  const length = (Date.now() - recAt) / 1000;
  fs.writeFileSync(path.join(tmp, "audio.webm"), Buffer.from(audio, "base64"));
  const video = await page.video().path();
  await ctx.close();
  await browser.close();
  const crop = `crop=${Math.round(box.width * 2)}:${Math.round(box.height * 2)}:0:0`;
  execFileSync("ffmpeg", [
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String((recAt - opened) / 1000),
    "-i",
    video,
    "-i",
    path.join(tmp, "audio.webm"),
    "-t",
    String(length),
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-vf",
    `${crop},scale=1440:-2:flags=lanczos,fps=30`,
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "22",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    args.out,
  ]);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(JSON.stringify({ out: args.out, seconds: Math.round(length * 10) / 10 }));
})();
