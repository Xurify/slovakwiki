import { afterEach, describe, expect, it, type Mock, vi } from "vitest";

import { ambienceFor } from "./ambience";

describe("the sound of a place", () => {
  it("has birds outside by day and crickets after dark", () => {
    expect(ambienceFor("default", { time: "day", weather: "clear" }).layers).toEqual([
      "birds",
      "wind",
    ]);
    expect(ambienceFor("default", { time: "night", weather: "clear" }).layers).toEqual([
      "wind",
      "crickets",
    ]);
  });

  it("runs the tram until night", () => {
    expect(ambienceFor("plaza", { time: "evening", weather: "clear" }).layers).toContain(
      "tram",
    );
    expect(
      ambienceFor("plaza", { time: "night", weather: "clear" }).layers,
    ).not.toContain("tram");
  });

  it("hears rain outside and through a window, and snow only outside", () => {
    expect(ambienceFor("cafe", { time: "day", weather: "rain" })).toEqual({
      dark: false,
      indoors: true,
      layers: ["murmur", "clinks", "rain"],
    });
    expect(ambienceFor("classroom", { time: "day", weather: "rain" }).layers).toEqual([
      "hum",
    ]);
    expect(ambienceFor("home", { time: "day", weather: "snow" }).layers).toEqual(["hum"]);
    expect(ambienceFor("market", { time: "day", weather: "snow" })).toEqual({
      dark: false,
      indoors: false,
      layers: ["murmur", "wind"],
    });
  });
});

interface GainMock {
  connect: Mock;
  disconnect: Mock;
  gain: {
    value: number;
    cancelScheduledValues: Mock;
    setTargetAtTime: Mock;
    setValueAtTime: Mock;
  };
}

/** Just enough of an AudioContext for the stage's sound: its state, and nodes that do nothing. */
class FakeAudioContext {
  static made: FakeAudioContext[] = [];
  /** Every gain node made, in order: a place's master is the first of its own. */
  static gains: GainMock[] = [];
  readonly sampleRate = 8000;
  readonly destination = {};
  currentTime = 0;
  state = "running";
  readonly suspend = vi.fn(() => {
    this.state = "suspended";
    return Promise.resolve();
  });
  readonly resume = vi.fn(() => {
    this.state = "running";
    return Promise.resolve();
  });
  readonly close = vi.fn(() => {
    this.state = "closed";
    return Promise.resolve();
  });

  constructor() {
    FakeAudioContext.made.push(this);
  }

  createBuffer(_channels: number, length: number) {
    return { getChannelData: () => new Float32Array(length) };
  }

  createGain(): GainMock {
    const node: GainMock = {
      gain: {
        value: 0,
        cancelScheduledValues: vi.fn(),
        setTargetAtTime: vi.fn(),
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    FakeAudioContext.gains.push(node);
    return node;
  }
}

/** A fresh copy of the module, so each test starts with no contexts and no hold. */
async function loadAmbience(): Promise<typeof import("./ambience")> {
  vi.resetModules();
  FakeAudioContext.made = [];
  FakeAudioContext.gains = [];
  vi.stubGlobal("window", {
    AudioContext: FakeAudioContext,
    addEventListener: () => {},
    removeEventListener: () => {},
    clearTimeout,
    setTimeout,
  });
  return import("./ambience");
}

describe("holding the stage's sound on a pause", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("suspends the stage's context on a pause and resumes it on release", async () => {
    const ambience = await loadAmbience();
    ambience.cues();
    const [ctx] = FakeAudioContext.made;

    ambience.holdStageSound();
    expect(ctx?.state).toBe("suspended");

    ambience.releaseStageSound();
    expect(ctx?.resume).toHaveBeenCalledTimes(1);
    expect(ctx?.state).toBe("running");
  });

  it("starts a context made during a pause held, and a cue asked for then stays silent", async () => {
    const ambience = await loadAmbience();
    ambience.holdStageSound();
    ambience.cues();
    const [ctx] = FakeAudioContext.made;
    expect(ctx?.state).toBe("suspended");

    ambience.cues();
    expect(ctx?.resume).not.toHaveBeenCalled();
    expect(ctx?.state).toBe("suspended");
  });

  it("resumes a context whose suspend had not yet taken effect when the pause ends", async () => {
    const ambience = await loadAmbience();
    ambience.cues();
    const [ctx] = FakeAudioContext.made;
    // The suspend is still on its way: the state has not changed yet.
    ctx?.suspend.mockImplementationOnce(() => new Promise<void>(() => {}));

    ambience.holdStageSound();
    expect(ctx?.state).toBe("running");
    ambience.releaseStageSound();
    expect(ctx?.resume).toHaveBeenCalledTimes(1);
  });

  it("silences a place stopped during a pause at once, not as a fade that starts on the thaw", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const ambience = await loadAmbience();
    const place = ambience.playAmbience({ dark: false, indoors: false, layers: [] });
    const [master] = FakeAudioContext.gains;

    ambience.holdStageSound();
    place?.stop();
    expect(master?.gain.cancelScheduledValues).toHaveBeenCalledTimes(1);
    expect(master?.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(master?.gain.setTargetAtTime).not.toHaveBeenCalledWith(0, 0, 0.1);
  });

  it("starts a place turned on during a pause held, so its sound waits for the thaw", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const ambience = await loadAmbience();

    ambience.holdStageSound();
    const place = ambience.playAmbience({ dark: false, indoors: false, layers: [] });
    const [ctx] = FakeAudioContext.made;
    expect(place).toBeDefined();
    expect(ctx?.state).toBe("suspended");

    ambience.releaseStageSound();
    expect(ctx?.state).toBe("running");
  });

  it("lets a place's close wait on the play clock, not the wall clock", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
    const ambience = await loadAmbience();
    const clock = await import("$lib/audio/play-clock");
    const place = ambience.playAmbience({ dark: false, indoors: false, layers: [] });
    const [ctx] = FakeAudioContext.made;

    place?.stop();
    clock.freezePlayClock();
    vi.advanceTimersByTime(5000);
    expect(ctx?.close).not.toHaveBeenCalled();

    clock.thawPlayClock();
    vi.advanceTimersByTime(499);
    expect(ctx?.close).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(ctx?.close).toHaveBeenCalledTimes(1);
  });
});
