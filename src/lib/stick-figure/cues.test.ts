import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Just enough of Web Audio to see what a cue leaves connected to the
 * speakers. Every node's params take any automation; only what reaches
 * `destination` is tracked.
 */
class FakeContext {
  currentTime = 0;
  sampleRate = 8000;
  state = "running";
  readonly destination = { id: "destination" };
  /** Nodes connected straight to the speakers and not disconnected since. */
  readonly live = new Set<object>();

  #node(): Record<string, unknown> {
    const param = () => ({
      value: 0,
      setValueAtTime: () => {},
      setTargetAtTime: () => {},
      linearRampToValueAtTime: () => {},
      exponentialRampToValueAtTime: () => {},
    });
    const node: Record<string, unknown> = {
      gain: param(),
      frequency: param(),
      detune: param(),
      playbackRate: param(),
      Q: param(),
      connect: (to: object) => {
        if (to === this.destination) this.live.add(node);
        return to;
      },
      disconnect: () => this.live.delete(node),
      start: () => {},
      stop: () => {},
      addEventListener: () => {},
    };
    return node;
  }

  createGain = () => this.#node();
  createOscillator = () => this.#node();
  createBufferSource = () => this.#node();
  createBiquadFilter = () => this.#node();
  createBuffer = (_channels: number, length: number) => ({
    getChannelData: () => new Float32Array(length),
  });
  resume = async () => {};
  close = async () => {};
}

let ctx: FakeContext;

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  ctx = new FakeContext();
  const Context = function () {
    return ctx;
  };
  vi.stubGlobal("window", {
    AudioContext: Context,
    setTimeout,
    clearTimeout,
    addEventListener: () => {},
    removeEventListener: () => {},
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("cues the stage schedules", () => {
  // When the full suite shares a worker, these imports load slowly. A timed-out one
  // would land in the next test's fake context and fail that test instead.
  it(
    "are all cut off by stopCues: steps, a phone, the sting, a tram, foley",
    { timeout: 20_000 },
    async () => {
      const { playPhoneCue, playSegmentCue, playSteps, playTramCue, stopCues } =
        await import("./ambience");
      const { playFoley } = await import("./foley");

      playSteps(8, 420, { ground: "tile" });
      playPhoneCue("call");
      playSegmentCue();
      playTramCue();
      playFoley("rattle");
      expect(ctx.live.size).toBe(5);

      stopCues();
      expect(ctx.live.size).toBe(0);
    },
  );

  it("stop at once on a skip, so a second walk does not pile onto the first", async () => {
    const { playSteps, stopCues } = await import("./ambience");

    playSteps(12, 420, { ground: "stone" });
    stopCues();
    playSteps(12, 420, { ground: "stone" });
    expect(ctx.live.size).toBe(1);
  });

  it("cuts off cues on seek during an edge enter, throw, or dog run", async () => {
    const { playSteps, stopCues } = await import("./ambience");
    const { playFoley } = await import("./foley");

    // Edge enter starts servo steps
    playSteps(10, 300, { ground: "wood", shoes: "servo" });
    expect(ctx.live.size).toBe(1);

    // Seeking cuts it off immediately
    stopCues();
    expect(ctx.live.size).toBe(0);

    // Compute foley or clink
    playFoley("compute");
    expect(ctx.live.size).toBe(1);
    stopCues();
    expect(ctx.live.size).toBe(0);
  });

  it("let go of their output on their own once done", async () => {
    const { playPhoneCue } = await import("./ambience");
    const { playFoley } = await import("./foley");

    playPhoneCue("message");
    playFoley("clink");
    vi.runAllTimers();
    expect(ctx.live.size).toBe(0);
  });
});
