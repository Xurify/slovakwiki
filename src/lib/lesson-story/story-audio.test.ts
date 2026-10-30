import { afterEach, describe, expect, it, vi } from "vitest";

import { SFX_CHANGE_EVENT, SFX_STORAGE_KEY } from "$lib/audio/sfx";

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
  /** When set, every play is refused with a DOMException of this name. */
  static refuse: string | undefined = undefined;

  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  playbackRate = 1;
  preload = "";
  #src = "";
  get src(): string {
    return this.#src;
  }
  set src(value: string) {
    this.#src = value;
    this.currentTime = 0;
  }
  volume = 1;
  currentTime = 0;
  duration = Number.NaN;

  constructor() {
    FakeAudio.instances.push(this);
  }

  pause(): void {
    this.paused = true;
  }

  play(): Promise<void> {
    if (FakeAudio.refuse) {
      return Promise.reject(new DOMException("refused", FakeAudio.refuse));
    }
    if (!FakeAudio.allowPlay) {
      return Promise.reject(new DOMException("blocked", "NotAllowedError"));
    }
    this.paused = false;
    return Promise.resolve();
  }
}

/** Window listeners the story audio adds, so a test can send the events it listens for. */
let windowListeners: Array<{ type: string; listener: () => void }> = [];
let storedSfx: string | null = null;

async function loadStoryAudio(): Promise<typeof import("./story-audio")> {
  vi.resetModules();
  FakeAudio.instances = [];
  FakeAudio.allowPlay = false;
  FakeAudio.refuse = undefined;
  windowListeners = [];
  storedSfx = null;
  vi.stubGlobal("window", {
    addEventListener: (type: string, listener: () => void) => {
      windowListeners.push({ type, listener });
    },
    clearTimeout,
    setTimeout,
  });
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => (key === SFX_STORAGE_KEY ? storedSfx : null),
  });
  return import("./story-audio");
}

function sendWindowEvent(type: string): void {
  for (const entry of windowListeners) {
    if (entry.type === type) entry.listener();
  }
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

describe("pausing a story line", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("does not let an old play promise clear a newer autoplay block", async () => {
    const audio = await loadStoryAudio();
    let finishOld!: () => void;
    vi.spyOn(FakeAudio.prototype, "play").mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finishOld = resolve;
        }),
    );
    audio.playStoryLineAudio("/old.mp3", "");
    audio.playStoryLineAudio("/new.mp3", "");
    await flushPromises();
    expect(audio.hasPendingStoryAudio()).toBe(true);
    finishOld();
    await flushPromises();
    expect(audio.hasPendingStoryAudio()).toBe(true);
    FakeAudio.allowPlay = true;
    audio.unlockStoryAudio();
    await flushPromises();
    expect(FakeAudio.instances[0]?.src).toBe("/new.mp3");
    expect(FakeAudio.instances[0]?.paused).toBe(false);
  });

  it("keeps its media position if a resumed clip is blocked and retried", async () => {
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    audio.playStoryLineAudio("/clip.mp3", "");
    await flushPromises();
    const clip = FakeAudio.instances[0]!;
    clip.currentTime = 1.2;
    audio.pauseStoryLineAudio();
    FakeAudio.refuse = "NotAllowedError";
    audio.resumeStoryLineAudio();
    await flushPromises();
    expect(audio.hasPendingStoryAudio()).toBe(true);
    FakeAudio.refuse = undefined;
    audio.resumeStoryLineAudio();
    await flushPromises();
    expect(clip.currentTime).toBe(1.2);
    expect(clip.paused).toBe(false);
  });

  it("holds the clip where it is and plays on from there, without starting it again", async () => {
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    const play = vi.spyOn(FakeAudio.prototype, "play");

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.");
    await flushPromises();
    expect(FakeAudio.instances[0]?.paused).toBe(false);

    audio.pauseStoryLineAudio();
    expect(FakeAudio.instances[0]?.paused).toBe(true);

    audio.resumeStoryLineAudio();
    expect(play).toHaveBeenCalledTimes(2);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(FakeAudio.instances[0]?.src).toBe("/clip.mp3");
    expect(FakeAudio.instances[0]?.paused).toBe(false);
  });

  it("does nothing to resume when no clip was held", async () => {
    const audio = await loadStoryAudio();
    const play = vi.spyOn(FakeAudio.prototype, "play");

    audio.pauseStoryLineAudio();
    audio.resumeStoryLineAudio();
    expect(play).not.toHaveBeenCalled();
  });

  it("forgets a held clip once it is stopped", async () => {
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    const play = vi.spyOn(FakeAudio.prototype, "play");

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.");
    await flushPromises();
    audio.pauseStoryLineAudio();
    audio.stopStoryLineAudio();

    audio.resumeStoryLineAudio();
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("holds the wait after a clip on the play clock, so it ends only once the time is played", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    const clock = await import("$lib/audio/play-clock");
    FakeAudio.allowPlay = true;
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.", { onEnded });
    await flushPromises();
    FakeAudio.instances[0]?.onended?.();
    vi.advanceTimersByTime(500);

    clock.freezePlayClock();
    vi.advanceTimersByTime(60_000);
    expect(onEnded).not.toHaveBeenCalled();

    clock.thawPlayClock();
    vi.advanceTimersByTime(1600 - 500 - 1);
    expect(onEnded).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("ends the line when the browser refuses to resume it, rather than leaving it held", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.", { onEnded });
    await flushPromises();
    audio.pauseStoryLineAudio();

    FakeAudio.refuse = "NotSupportedError";
    audio.resumeStoryLineAudio();
    await flushPromises();
    expect(onEnded).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1600);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("plays a clip the browser held back when the pause is resumed, and ends its line", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/held.mp3", "Dobrý deň.", { onEnded });
    await flushPromises();
    expect(audio.hasPendingStoryAudio()).toBe(true);

    FakeAudio.allowPlay = true;
    audio.resumeStoryLineAudio();
    await flushPromises();

    expect(audio.hasPendingStoryAudio()).toBe(false);
    expect(FakeAudio.instances[0]?.paused).toBe(false);
    FakeAudio.instances[0]?.onended?.();
    vi.advanceTimersByTime(1600);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("keeps a held clip silent while the pause holds, even to a tap, and plays it when the pause ends", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    const clock = await import("$lib/audio/play-clock");

    audio.playStoryLineAudio("/held.mp3", "Dobrý deň.");
    await flushPromises();

    clock.freezePlayClock();
    FakeAudio.allowPlay = true;
    audio.primeStoryAudio();
    await flushPromises();
    expect(audio.hasPendingStoryAudio()).toBe(true);
    expect(FakeAudio.instances[0]?.paused).toBe(true);

    clock.thawPlayClock();
    audio.resumeStoryLineAudio();
    await flushPromises();
    expect(FakeAudio.instances[0]?.paused).toBe(false);
  });
});

describe("muting a story line", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("keeps a silent line's end scheduled when sound is toggled again", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    storedSfx = "off";
    const onEnded = vi.fn();
    audio.playStoryLineAudio("/clip.mp3", "", { onEnded, silentMs: 3000 });
    vi.advanceTimersByTime(500);
    storedSfx = "on";
    sendWindowEvent(SFX_CHANGE_EVENT);
    storedSfx = "off";
    sendWindowEvent(SFX_CHANGE_EVENT);
    vi.advanceTimersByTime(2500);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("does not let a stale media event cancel the current line's end", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    audio.playStoryLineAudio("/old.mp3", "", { onEnded: vi.fn() });
    const staleEnd = FakeAudio.instances[0]!.onended!;
    const onEnded = vi.fn();
    audio.playStoryLineAudio(undefined, "", { onEnded, silentMs: 3000 });
    staleEnd();
    vi.advanceTimersByTime(3000);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("ends a line muted mid-clip where the clip would have, so the segment carries on", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.", { onEnded });
    await flushPromises();
    const clip = FakeAudio.instances[0]!;
    clip.duration = 3;
    clip.currentTime = 0.5;
    vi.advanceTimersByTime(500);

    storedSfx = "off";
    sendWindowEvent(SFX_CHANGE_EVENT);
    expect(clip.paused).toBe(true);
    expect(onEnded).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2499);
    expect(onEnded).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("ends a line muted mid-clip at half speed where the slowed clip would have", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const audio = await loadStoryAudio();
    FakeAudio.allowPlay = true;
    const onEnded = vi.fn();

    audio.playStoryLineAudio("/clip.mp3", "Dobrý deň.", { onEnded, playbackRate: 0.5 });
    await flushPromises();
    const clip = FakeAudio.instances[0]!;
    clip.duration = 3;
    // Half a second of media is a second of play time at half speed.
    clip.currentTime = 0.5;
    vi.advanceTimersByTime(1000);

    storedSfx = "off";
    sendWindowEvent(SFX_CHANGE_EVENT);
    // 2.5 s of media left at half speed is 5 s more of play time: the line ends 6 s in.
    vi.advanceTimersByTime(4999);
    expect(onEnded).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });
});
