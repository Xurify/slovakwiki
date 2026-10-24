import { afterEach, describe, expect, it, vi } from "vitest";

import { classifyPlayFailure } from "./story-audio";

describe("classifyPlayFailure", () => {
  it("treats NotAllowedError as autoplay block", () => {
    expect(classifyPlayFailure(new DOMException("blocked", "NotAllowedError"))).toBe(
      "autoplay",
    );
  });

  it("treats AbortError as in-flight replace", () => {
    expect(classifyPlayFailure(new DOMException("aborted", "AbortError"))).toBe("abort");
  });

  it("treats other failures as hard errors so dwell can advance", () => {
    expect(classifyPlayFailure(new DOMException("bad src", "NotSupportedError"))).toBe(
      "error",
    );
    expect(classifyPlayFailure(new Error("404"))).toBe("error");
    expect(classifyPlayFailure(undefined)).toBe("error");
  });
});

class FakeAudio {
  static instances: FakeAudio[] = [];
  static allowPlay = false;

  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  playbackRate = 1;
  preload = "";
  src = "";
  volume = 1;

  constructor() {
    FakeAudio.instances.push(this);
  }

  pause(): void {
    this.paused = true;
  }

  play(): Promise<void> {
    if (!FakeAudio.allowPlay) {
      return Promise.reject(new DOMException("blocked", "NotAllowedError"));
    }
    this.paused = false;
    return Promise.resolve();
  }
}

async function loadStoryAudio(): Promise<typeof import("./story-audio")> {
  vi.resetModules();
  FakeAudio.instances = [];
  FakeAudio.allowPlay = false;
  vi.stubGlobal("window", { addEventListener: () => {}, clearTimeout, setTimeout });
  vi.stubGlobal("Audio", FakeAudio);
  return import("./story-audio");
}

async function flushPromises(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("story line playback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("goes inactive when an autoplay-blocked line is stopped by its Listen button", async () => {
    const audio = await loadStoryAudio();
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/line.mp3", "Dobrý deň.", { onEnded });
    await flushPromises();

    expect(audio.hasPendingStoryAudio()).toBe(true);
    expect(audio.isStoryLineAudioActive()).toBe(true);

    audio.stopStoryLineAudio();

    expect(audio.isStoryLineAudioActive()).toBe(false);
    expect(onEnded).not.toHaveBeenCalled();
  });

  it("plays the blocked line on the first gesture and reuses one element", async () => {
    const audio = await loadStoryAudio();

    audio.playStoryLineAudio("/one.mp3", "Dobrý deň.");
    await flushPromises();

    FakeAudio.allowPlay = true;
    audio.primeStoryAudio();
    await flushPromises();

    expect(audio.hasPendingStoryAudio()).toBe(false);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0]?.src).toBe("/one.mp3");

    audio.playStoryLineAudio("/two.mp3", "Volám sa Anna.");

    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0]?.src).toBe("/two.mp3");
  });

  it("keeps a slow rate through an autoplay unlock", async () => {
    const audio = await loadStoryAudio();

    audio.playStoryLineAudio("/slow.mp3", "Pomaly.", { playbackRate: 0.8 });
    await flushPromises();
    expect(FakeAudio.instances[0]?.playbackRate).toBe(0.8);

    FakeAudio.allowPlay = true;
    audio.unlockStoryAudio();
    await flushPromises();
    expect(FakeAudio.instances[0]?.playbackRate).toBe(0.8);

    audio.playStoryLineAudio("/normal.mp3", "Normálne.");
    expect(FakeAudio.instances[0]?.playbackRate).toBe(1);
  });

  it("unlocks with silence when no line is waiting", async () => {
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;

    audio.primeStoryAudio();
    await flushPromises();
    expect(FakeAudio.instances[0]?.src).toMatch(/^data:audio\/wav/);

    FakeAudio.instances[0]!.src = "";
    audio.primeStoryAudio();
    expect(FakeAudio.instances[0]?.src).toBe("");
  });
});
