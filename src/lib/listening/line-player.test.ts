import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { playClockFrozen, thawPlayClock } from "$lib/audio/play-clock";
import type { DialogueTurn } from "$lib/learning/types";
import {
  ANSWER_BEAT_MS,
  BACK_MS,
  LINE_GAP_MS,
  LinePlayer,
  type LineStage,
  SLOW_RATE,
} from "./line-player.svelte";

const LINES = ["Ahoj.", "Ako sa máš?", "Dobre.", "Tak poď."].map(
  (slovak, index) => ({ id: `l${index}`, slovak }) as DialogueTurn,
);

/** Every player a test makes: play time is shared, so none may keep a timer past its test. */
const players: LinePlayer[] = [];

function track(player: LinePlayer): LinePlayer {
  players.push(player);
  return player;
}

/** A stage that starts each line's voice at once and ends it when the test says. */
function fakeStage() {
  const played: number[] = [];
  const rates: number[] = [];
  const ends: Array<() => void> = [];
  const stops: boolean[] = [];
  const holds = { freezes: 0, thaws: 0 };
  const stage: LineStage = {
    play(index, onEnded, rate, onStart) {
      played.push(index);
      rates.push(rate);
      ends[index] = onEnded;
      onStart();
    },
    stop(leaving = false) {
      stops.push(leaving);
    },
    freeze() {
      holds.freezes += 1;
    },
    thaw() {
      holds.thaws += 1;
    },
  };
  return {
    stage,
    played,
    rates,
    stops,
    holds,
    end: (index: number) => ends[index]?.(),
  };
}

function playerOn(stage: LineStage, holdsAfter?: (index: number) => boolean) {
  return track(
    new LinePlayer(
      LINES,
      {},
      {
        holdsAfter,
        isLast: (index) => index === LINES.length - 1,
        onRunEnd: () => {},
        stage: () => stage,
      },
    ),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance"] });
  vi.stubGlobal("window", { setTimeout, clearTimeout });
});

afterEach(() => {
  for (const player of players.splice(0)) player.destroy();
  thawPlayClock();
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
    const { stage, played, stops, holds, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.pause();
    expect(vi.getTimerCount()).toBe(0);
    vi.runAllTimers();
    expect(played).toEqual([0]);

    player.toggle();
    player.playFrom(1);
    player.pause();
    expect(vi.getTimerCount()).toBe(0);
    // A line ended late, after the pause, moves nothing on.
    end(1);
    vi.runAllTimers();
    expect(played).toEqual([0, 1]);
    expect(stops).toEqual([]);
    expect(holds.freezes).toBe(2);
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

  it("holds the stage and the line on a pause mid-line, without stopping it", () => {
    const { stage, played, stops, holds } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    expect(played).toEqual([0]);
    player.pause();
    expect(player.playing).toBe(false);
    expect(playClockFrozen()).toBe(true);
    expect(holds.freezes).toBe(1);
    expect(stops).toEqual([]);
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

describe("pausing and resuming", () => {
  it("reads as paused from the first line on, until it resumes", () => {
    const { stage } = fakeStage();
    const player = playerOn(stage);

    expect(player.paused).toBe(false);
    player.playFrom(0);
    player.pause();
    expect(player.paused).toBe(true);
    expect(player.cursor).toBe(0);

    player.resume();
    expect(player.paused).toBe(false);
  });

  it("resumes the line where it was held, not from the top", () => {
    const { stage, played, holds } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    vi.advanceTimersByTime(60_000);
    player.toggle();

    expect(player.playing).toBe(true);
    expect(played).toEqual([0]);
    expect(holds.thaws).toBe(1);
    expect(playClockFrozen()).toBe(false);
  });

  it("starts a line again at the speed set while it was paused", () => {
    const { stage, played, rates } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    player.toggleSlow();
    expect(played).toEqual([0]);

    player.resume();
    expect(played).toEqual([0, 0]);
    expect(rates).toEqual([1, SLOW_RATE]);
    expect(player.playing).toBe(true);
    expect(player.slow).toBe(true);
  });

  it("resumes where it was held when the speed is back as it was", () => {
    const { stage, played, holds } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    player.toggleSlow();
    player.toggleSlow();
    player.resume();

    expect(played).toEqual([0]);
    expect(holds.thaws).toBe(1);
    expect(player.playing).toBe(true);
  });

  it("holds the wait between lines, and plays on after the time left", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    vi.advanceTimersByTime(LINE_GAP_MS - 100);
    player.pause();
    vi.advanceTimersByTime(60_000);
    expect(played).toEqual([0]);

    player.resume();
    vi.advanceTimersByTime(99);
    expect(played).toEqual([0]);
    vi.advanceTimersByTime(1);
    expect(played).toEqual([0, 1]);
  });

  it("does not count the time paused as heard, so Replay line keeps its meaning", () => {
    const { stage, played } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(1);
    vi.advanceTimersByTime(100);
    player.pause();
    vi.advanceTimersByTime(10_000);
    player.resume();
    vi.advanceTimersByTime(100);

    // 200 ms heard in all, so back goes to the line before.
    player.back();
    expect(played).toEqual([1, 0]);
  });

  it("a seek while paused starts the line sought and thaws the stage", () => {
    const { stage, played, holds } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    player.playFrom(2);

    expect(played).toEqual([0, 2]);
    expect(holds.thaws).toBe(1);
    expect(playClockFrozen()).toBe(false);
  });

  it("halts a paused line on a stop, so the next play starts it from the top", () => {
    const { stage, played, stops } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    player.halt();
    expect(stops).toEqual([false]);
    expect(playClockFrozen()).toBe(false);

    player.toggle();
    expect(played).toEqual([0, 0]);
  });

  it("thaws the play clock when a paused player is destroyed", () => {
    const { stage } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    player.pause();
    expect(playClockFrozen()).toBe(true);

    player.destroy();
    expect(playClockFrozen()).toBe(false);
  });
});

describe("changing speed between lines", () => {
  it("a speed change while paused in the gap plays the next line at it, not the one just ended", () => {
    const { stage, played, rates, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.pause();
    player.toggleSlow();
    player.resume();
    vi.advanceTimersByTime(LINE_GAP_MS);

    expect(played).toEqual([0, 1]);
    expect(rates).toEqual([1, SLOW_RATE]);
  });

  it("Slower in the gap leaves the line just ended alone, and the next line takes it", () => {
    const { stage, played, rates, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(0);
    end(0);
    player.toggleSlow();
    expect(played).toEqual([0]);

    vi.advanceTimersByTime(LINE_GAP_MS);
    expect(played).toEqual([0, 1]);
    expect(rates).toEqual([1, SLOW_RATE]);
  });

  it("Slower in the answer beat plays the next line at the new speed", () => {
    const { stage, played, rates, end } = fakeStage();
    const player = playerOn(stage, (index) => index === 0);

    player.playFrom(0);
    end(0);
    player.answered();
    player.toggleSlow();
    expect(played).toEqual([0]);

    vi.advanceTimersByTime(ANSWER_BEAT_MS);
    expect(played).toEqual([0, 1]);
    expect(rates).toEqual([1, SLOW_RATE]);
  });

  it("a speed change paused in the answer beat is taken by the next line", () => {
    const { stage, played, rates, end } = fakeStage();
    const player = playerOn(stage, (index) => index === 0);

    player.playFrom(0);
    end(0);
    player.answered();
    player.pause();
    player.toggleSlow();
    player.resume();
    vi.advanceTimersByTime(ANSWER_BEAT_MS);

    expect(played).toEqual([0, 1]);
    expect(rates).toEqual([1, SLOW_RATE]);
  });

  it("Previous in the gap after a line nearly all heard goes back a line, not over Replay's mark", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage);

    player.playFrom(1);
    vi.advanceTimersByTime(1200);
    end(1);
    vi.advanceTimersByTime(LINE_GAP_MS - 50);
    player.back();

    expect(played).toEqual([1, 0]);
  });
});

describe("sharing the play clock", () => {
  it("a player that starts a line takes the clock from one paused elsewhere", () => {
    const paused = fakeStage();
    const other = fakeStage();
    const first = playerOn(paused.stage);
    const second = playerOn(other.stage);

    first.playFrom(0);
    first.pause();
    expect(playClockFrozen()).toBe(true);

    second.playFrom(0);
    expect(playClockFrozen()).toBe(false);
    expect(first.paused).toBe(false);
    expect(paused.holds.thaws).toBe(1);

    other.end(0);
    vi.advanceTimersByTime(LINE_GAP_MS);
    expect(other.played).toEqual([0, 1]);

    first.resume();
    expect(paused.played).toEqual([0]);
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

  it("stays just begun through the wait after a short line, as Previous still goes back from it", () => {
    const { stage, played, end } = fakeStage();
    const player = playerOn(stage, (index) => index === 1);

    player.playFrom(1);
    vi.advanceTimersByTime(300);
    end(1);
    expect(player.held).toBe(true);

    // The timer set at the voice's start has run out by now, though only 300 ms was heard.
    vi.advanceTimersByTime(BACK_MS);
    expect(player.justBegun).toBe(true);
    player.back();
    expect(played).toEqual([1, 0]);
  });

  it("follows options.prev when provided instead of flat decrement", () => {
    const { stage, played } = fakeStage();
    // Suppose index 3 was preceded by index 1 on the active path (skipping index 2)
    const player = track(
      new LinePlayer(
        LINES,
        {},
        {
          isLast: (index) => index === LINES.length - 1,
          onRunEnd: () => {},
          stage: () => stage,
          prev: (index) => (index === 3 ? 1 : index > 0 ? index - 1 : undefined),
        },
      ),
    );

    player.playFrom(3);
    vi.advanceTimersByTime(100);
    expect(player.canGoBack).toBe(true);
    player.back();
    expect(played).toEqual([3, 1]);
  });

  it("reports canGoBack false on the first line or when prev returns undefined", () => {
    const { stage } = fakeStage();
    const player = track(
      new LinePlayer(
        LINES,
        {},
        {
          isLast: (index) => index === LINES.length - 1,
          onRunEnd: () => {},
          stage: () => stage,
          prev: () => undefined,
        },
      ),
    );

    player.playFrom(2);
    expect(player.canGoBack).toBe(false);
  });
});
