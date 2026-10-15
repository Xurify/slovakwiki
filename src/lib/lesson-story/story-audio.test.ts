import { afterEach, describe, expect, it, vi } from "vitest";

import {
  classifyPlayFailure,
  hasPendingStoryAudio,
  isStoryLineAudioActive,
  playStoryLineAudio,
  stopStoryLineAudio,
} from "./story-audio";

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

describe("isStoryLineAudioActive", () => {
  afterEach(() => {
    stopStoryLineAudio();
    vi.unstubAllGlobals();
  });

  it("goes false when an autoplay-blocked line is stopped by its Listen button", async () => {
    vi.stubGlobal("window", {
      addEventListener: () => {},
      clearTimeout,
      setTimeout,
    });
    vi.stubGlobal(
      "Audio",
      class {
        paused = true;
        volume = 1;
        pause(): void {
          this.paused = true;
        }
        play(): Promise<void> {
          return Promise.reject(new DOMException("blocked", "NotAllowedError"));
        }
      },
    );

    const onEnded = vi.fn();
    playStoryLineAudio("/line.mp3", "Dobrý deň.", { onEnded });
    await Promise.resolve();
    await Promise.resolve();

    expect(hasPendingStoryAudio()).toBe(true);
    expect(isStoryLineAudioActive()).toBe(true);

    stopStoryLineAudio();

    expect(isStoryLineAudioActive()).toBe(false);
    expect(onEnded).not.toHaveBeenCalled();
  });
});
