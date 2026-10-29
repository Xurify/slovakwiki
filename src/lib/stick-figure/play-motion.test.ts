import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { freezePlayClock, thawPlayClock } from "$lib/audio/play-clock";
import { PlaySpring, PlayTween } from "./play-motion.svelte";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  // A frame every 16 ms, on the fake clock, as a browser would give.
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16),
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
});

afterEach(() => {
  thawPlayClock();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("PlayTween", () => {
  it("eases to its target over its duration", () => {
    const tween = new PlayTween(0, { duration: 100 });
    void tween.set(10);

    vi.advanceTimersByTime(50);
    expect(tween.current).toBeGreaterThan(0);
    expect(tween.current).toBeLessThan(10);

    vi.advanceTimersByTime(100);
    expect(tween.current).toBe(10);
  });

  it("holds still while frozen and carries on from there when thawed", () => {
    const tween = new PlayTween(0, { duration: 100 });
    void tween.set(10);
    vi.advanceTimersByTime(50);
    const held = tween.current;

    freezePlayClock();
    const frames = vi.spyOn(globalThis, "requestAnimationFrame");
    vi.advanceTimersByTime(5000);
    expect(tween.current).toBe(held);
    expect(frames).not.toHaveBeenCalled();

    thawPlayClock();
    vi.advanceTimersByTime(20);
    expect(tween.current).toBeGreaterThan(held);
    expect(tween.current).toBeLessThan(10);

    vi.advanceTimersByTime(100);
    expect(tween.current).toBe(10);
  });

  it("takes the easing given to set", () => {
    const tween = new PlayTween(0);
    // A curve that is already at the end at the first frame, so the value shows it.
    void tween.set(10, { duration: 100, easing: () => 1 });

    vi.advanceTimersByTime(20);
    expect(tween.current).toBe(10);
  });
});

describe("PlaySpring", () => {
  it("does not move on while the play clock is frozen", () => {
    const spring = new PlaySpring({ x: 0 });
    void spring.set({ x: 1 });
    vi.advanceTimersByTime(32);
    const held = spring.current.x;
    expect(held).toBeGreaterThan(0);

    freezePlayClock();
    vi.advanceTimersByTime(5000);
    expect(spring.current.x).toBe(held);

    thawPlayClock();
    vi.advanceTimersByTime(3000);
    expect(spring.current.x).toBeCloseTo(1, 2);
  });

  it("jumps straight to its target when set instant", () => {
    const spring = new PlaySpring({ x: 0 });
    void spring.set({ x: 3 }, { instant: true });
    expect(spring.current.x).toBe(3);
  });
});
