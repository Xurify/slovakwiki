import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { DialogueTurn } from "$lib/learning/types";
import {
  ANSWER_BEAT_MS,
  LINE_GAP_MS,
  LinePlayer,
  type LineStage,
} from "./line-player.svelte";

const LINES = ["Ahoj.", "Ako sa máš?", "Dobre.", "Tak poď."].map(
  (slovak, index) => ({ id: `l${index}`, slovak }) as DialogueTurn,
);

/** A stage that starts each line's voice at once and ends it when the test says. */
function fakeStage() {
  const played: number[] = [];
  const ends: Array<() => void> = [];
  const stops: boolean[] = [];
  const stage: LineStage = {
    play(index, onEnded, _rate, onStart) {
      played.push(index);
      ends[index] = onEnded;
      onStart();
    },
    stop(leaving = false) {
      stops.push(leaving);
    },
  };
  return { stage, played, stops, end: (index: number) => ends[index]?.() };
}

function playerOn(stage: LineStage, holdsAfter?: (index: number) => boolean) {
  return new LinePlayer(
    LINES,
    {},
    {
      holdsAfter,
      isLast: (index) => index === LINES.length - 1,
      onRunEnd: () => {},
      stage: () => stage,
    },
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("the line player's timers", () => {
  it("plays on to the next line after the gap", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    vi.advanceTimersByTime(LINE_GAP_MS);
    expect(played).toEqual([0, 1]);
  });

  it("leaves nothing scheduled on a pause, in the gap between lines or mid-line", () => {
    const { stage, played, stops, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.pause();
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(played).toEqual([0]);

    player.playFrom(1);
    player.pause();
    expect(vi.getTimerCount()).toBe(0);
    // A line ended late, after the pause, moves nothing on.
    end(1);
    vi.runAllTimers();
    expect(played).toEqual([0, 1]);
    expect(stops).toEqual([false, false]);
  });

  it("drops the old line's gap on a seek, so only the line sought plays", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.playFrom(2);
    vi.runAllTimers();
    expect(played).toEqual([0, 2]);
    // The first line's end, if it comes now, belongs to a run that is over.
    end(0);
    vi.runAllTimers();
    expect(played).toEqual([0, 2]);
  });

  it("cancels playing immediately on a pause mid-line", () => {
    const { stage, played, stops } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    expect(played).toEqual([0]);
    player.pause();
    expect(stops).toEqual([false]);
  });

  it("does not play on after a pause during the beat after an answer", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage, (index) => index === 0);

    player.playFrom(0);
    end(0);
    expect(player.held).toBe(true);
    player.answered();
    vi.advanceTimersByTime(ANSWER_BEAT_MS / 2);
    player.pause();
    vi.runAllTimers();
    expect(played).toEqual([0]);
  });

  it("stops the stage as leaving and fires nothing after the segment is left", () => {
    const { stage, played, stops, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.destroy();
    expect(stops).toEqual([true]);
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(played).toEqual([0]);

    player.playFrom(1);
    player.destroy();
    end(1);
    vi.runAllTimers();
    expect(played).toEqual([0, 1]);
  });
});

describe("stepping back", () => {
  it("replays the current line once BACK_MS has elapsed", () => {
    const { stage, played } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(1);
    vi.advanceTimersByTime(2000);
    player.back();
    expect(played).toEqual([1, 1]);
  });

  it("steps to the previous line when just begun", () => {
    const { stage, played } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(1);
    vi.advanceTimersByTime(100);
    player.back();
    expect(played).toEqual([1, 0]);
  });

  it("follows options.prev when provided instead of flat decrement", () => {
    const { stage, played } = fakeStage();
    // Suppose index 3 was preceded by index 1 on the active path (skipping index 2)
    const player = new LinePlayer(
      LINES,
      {},
      {
        isLast: (index) => index === LINES.length - 1,
        onRunEnd: () => {},
        stage: () => stage,
        prev: (index) => (index === 3 ? 1 : index > 0 ? index - 1 : undefined),
      },
    );

    player.playFrom(3);
    vi.advanceTimersByTime(100);
    expect(player.canGoBack).toBe(true);
    player.back();
    expect(played).toEqual([3, 1]);
  });

  it("reports canGoBack false on the first line or when prev returns undefined", () => {
    const { stage } = fakeStage();
    const player = new LinePlayer(
      LINES,
      {},
      {
        isLast: (index) => index === LINES.length - 1,
        onRunEnd: () => {},
        stage: () => stage,
        prev: () => undefined,
      },
    );

    player.playFrom(2);
    expect(player.canGoBack).toBe(false);
  });
});
