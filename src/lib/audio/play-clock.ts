/**
 * Play time: the clock a podcast segment's stage, figures, caption and clips
 * keep. It runs on the wall clock until a pause freezes it. Nothing on it moves
 * while frozen: a gesture, a walk, a timer, a frame or a clip stops where it is
 * and carries on when it thaws.
 */

interface PlayTimer {
  /** Play time it is due at; a frame has none and runs on the next one. */
  due: number;
  run: () => void;
  /** Whether this is an animation frame rather than a timeout. */
  frame: boolean;
  /** The browser's timer id while armed; 0 when not. */
  handle: number;
}

/** Wall time the clock froze at; undefined while it runs. */
let frozenAt: number | undefined;
let frozenFor = 0;
const timers = new Set<PlayTimer>();

/** Play time in ms: the wall clock less the time spent frozen. */
export function playClockNow(): number {
  return (frozenAt ?? performance.now()) - frozenFor;
}

export function playClockFrozen(): boolean {
  return frozenAt !== undefined;
}

/** Hold play time, and every timer and frame on it, where they are. Does nothing when already frozen. */
export function freezePlayClock(): void {
  if (frozenAt !== undefined) return;
  frozenAt = performance.now();
  for (const timer of timers) disarm(timer);
}

/** Start play time again, where it was held. Does nothing when not frozen. */
export function thawPlayClock(): void {
  if (frozenAt === undefined) return;
  frozenFor += performance.now() - frozenAt;
  frozenAt = undefined;
  for (const timer of timers) arm(timer);
}

/**
 * Run `run` once `ms` of play time have passed: not while the clock is
 * frozen. Returns a function that cancels it.
 */
export function playClockTimeout(run: () => void, ms: number): () => void {
  return start({ due: playClockNow() + Math.max(0, ms), run, frame: false, handle: 0 });
}

/**
 * Run `run` on the next animation frame. A frame asked for while the clock is
 * frozen waits for the thaw, so a figure asked to move during a pause stays
 * where the pause found it. Returns a function that cancels it.
 */
export function playClockFrame(run: () => void): () => void {
  return start({ due: 0, run, frame: true, handle: 0 });
}

function start(timer: PlayTimer): () => void {
  timers.add(timer);
  if (frozenAt === undefined) arm(timer);

  return () => {
    disarm(timer);
    timers.delete(timer);
  };
}

function arm(timer: PlayTimer): void {
  const fire = () => {
    timer.handle = 0;
    timers.delete(timer);
    timer.run();
  };

  timer.handle = timer.frame
    ? requestAnimationFrame(fire)
    : window.setTimeout(fire, Math.max(0, timer.due - playClockNow()));
}

function disarm(timer: PlayTimer): void {
  if (!timer.handle) return;

  if (timer.frame) cancelAnimationFrame(timer.handle);
  else window.clearTimeout(timer.handle);
  timer.handle = 0;
}
