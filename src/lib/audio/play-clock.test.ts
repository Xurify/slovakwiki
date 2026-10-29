import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  freezePlayClock,
  playClockFrame,
  playClockFrozen,
  playClockNow,
  playClockTimeout,
  thawPlayClock,
} from "./play-clock";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});

afterEach(() => {
  thawPlayClock();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the play clock", () => {
  it("runs with the wall clock until frozen", () => {
    const start = playClockNow();
    vi.advanceTimersByTime(250);
    expect(playClockNow() - start).toBe(250);
  });

  it("holds still while frozen and carries on from there when thawed", () => {
    const start = playClockNow();
    vi.advanceTimersByTime(100);
    freezePlayClock();
    expect(playClockFrozen()).toBe(true);

    vi.advanceTimersByTime(5000);
    expect(playClockNow() - start).toBe(100);

    thawPlayClock();
    expect(playClockFrozen()).toBe(false);
    vi.advanceTimersByTime(50);
    expect(playClockNow() - start).toBe(150);
  });

  it("does not stack freezes: one thaw ends it", () => {
    const start = playClockNow();
    freezePlayClock();
    freezePlayClock();
    vi.advanceTimersByTime(1000);
    thawPlayClock();
    expect(playClockNow() - start).toBe(0);
  });
});

describe("play-clock timeouts", () => {
  it("runs once its play time has passed", () => {
    const run = vi.fn();
    playClockTimeout(run, 300);
    vi.advanceTimersByTime(299);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("waits out a freeze, then runs with the time it had left", () => {
    const run = vi.fn();
    playClockTimeout(run, 300);
    vi.advanceTimersByTime(120);

    freezePlayClock();
    vi.advanceTimersByTime(10_000);
    expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);

    thawPlayClock();
    vi.advanceTimersByTime(179);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("starts a timeout set while frozen only once thawed", () => {
    const run = vi.fn();
    freezePlayClock();
    playClockTimeout(run, 200);
    vi.advanceTimersByTime(5000);
    expect(run).not.toHaveBeenCalled();

    thawPlayClock();
    vi.advanceTimersByTime(200);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("can be cancelled, frozen or not", () => {
    const run = vi.fn();
    const cancel = playClockTimeout(run, 300);
    freezePlayClock();
    cancel();
    thawPlayClock();
    vi.advanceTimersByTime(1000);
    expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("play-clock frames", () => {
  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 16),
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
  });

  it("runs on the next frame, and not once cancelled", () => {
    const run = vi.fn();
    playClockFrame(run);
    vi.advanceTimersByTime(15);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);

    const cancelled = vi.fn();
    playClockFrame(cancelled)();
    vi.advanceTimersByTime(100);
    expect(cancelled).not.toHaveBeenCalled();
  });

  it("disarms a frame pending at a freeze, and runs it on the first frame after the thaw", () => {
    const run = vi.fn();
    playClockFrame(run);
    vi.advanceTimersByTime(8);

    freezePlayClock();
    vi.advanceTimersByTime(5000);
    expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);

    thawPlayClock();
    vi.advanceTimersByTime(16);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("holds a frame asked for during a freeze until the thaw", () => {
    const run = vi.fn();
    freezePlayClock();
    playClockFrame(run);
    vi.advanceTimersByTime(5000);
    expect(run).not.toHaveBeenCalled();

    thawPlayClock();
    vi.advanceTimersByTime(16);
    expect(run).toHaveBeenCalledTimes(1);
  });
});
