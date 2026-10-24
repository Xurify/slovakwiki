import { LINE_GAP_MS } from "$lib/listening/line-player.svelte";
import type { SceneLine } from "./scene-line";
import type { StageControl, StageTake } from "./stage-control";

/** Where a scene is: not started, playing a line, paused, at the learner's turn, over. */
export type PlaybackPhase = "ready" | "playing" | "paused" | "turn" | "done";

export interface PlaybackOptions {
  lines: () => readonly SceneLine[];
  stage: () => StageControl | undefined;
  /** Stop before line `index`, for the learner to say it. */
  holdsAt?: (index: number) => boolean;
  /** Line `index` in the learner's own voice, when they recorded it and want to hear it. */
  takeAt?: (index: number) => StageTake | undefined;
  /** Below 1 to play the lines slower. */
  rate?: () => number;
  /** Wait on each line's words until the learner asks for the next one. */
  listenFirst?: () => boolean;
  /** Just before the scene plays from its first line. */
  onStart?: () => void;
  /** The last line has been said. */
  onEnd?: () => void;
}

/**
 * A scene played line by line on the stage, the way LinePlayer plays a
 * podcast segment: one line, a gap, the next. On top of that it waits for
 * a walk to end, stops at the learner's turns, and can wait after each
 * line for the learner to go on.
 */
export class ScenePlayback {
  phase = $state<PlaybackPhase>("ready");
  /** The line the scene is on: playing, waiting for the learner, or next after a pause. */
  at = $state(0);
  /** The line in the caption: the one playing, or the last one played. */
  shown = $state(-1);
  speaking = $state(false);
  /** Bumps each time a line starts, so the caption restarts with it. */
  cue = $state(0);

  #timer = 0;
  readonly #options: PlaybackOptions;

  constructor(options: PlaybackOptions) {
    this.#options = options;
  }

  get #stage(): StageControl | undefined {
    return this.#options.stage();
  }

  get #rate(): number {
    return this.#options.rate?.() ?? 1;
  }

  /** From where it is, or from the top once it is over. */
  play(): void {
    if (this.phase === "done") {
      this.reset();
      this.#stage?.place(0);
    }
    this.halt();
    if (this.phase === "ready" && this.at === 0) this.#options.onStart?.();
    this.phase = "playing";
    this.#step(this.at);
  }

  pause(): void {
    this.halt();
    this.phase = "paused";
  }

  /** Stop whatever is playing, and keep the place. */
  halt(): void {
    window.clearTimeout(this.#timer);
    this.#stage?.stop();
    this.speaking = false;
  }

  reset(): void {
    this.halt();
    this.phase = "ready";
    this.at = 0;
    this.shown = -1;
  }

  /** Play on from line `index`, with everyone where it finds them. */
  startAt(index: number): void {
    this.halt();
    this.#stage?.place(index);
    this.phase = "playing";
    this.#step(index);
  }

  /** The line in the caption once more; the scene then waits on the one after it. */
  again(): void {
    if (this.shown < 0) return;

    const line = this.shown;
    this.halt();
    this.#stage?.place(line);
    this.phase = "paused";
    this.#say(line, () => {
      this.at = line + 1;
    });
  }

  /** The learner's line is in: say it, and go on. */
  answered(): void {
    const index = this.at;
    this.phase = "playing";
    this.#say(index, () => this.#advance(index));
  }

  /** Line `index` acted out again outside the run, as a question replays it. */
  replay(index: number, onEnded: () => void): void {
    this.halt();
    this.#stage?.place(index);
    this.shown = index;
    this.#stage?.play(index, onEnded, this.#rate);
  }

  /** The cast's own clip of line `index`, to copy before saying it; the turn waits. */
  hear(index: number): void {
    this.halt();
    this.#stage?.place(index);
    this.speaking = true;
    this.#stage?.play(index, () => {
      this.speaking = false;
    });
  }

  #step(index: number): void {
    const line = this.#options.lines()[index];
    if (!line) {
      this.phase = "done";
      this.#stage?.foldUmbrellas();
      this.#options.onEnd?.();
      return;
    }

    this.at = index;
    const walking = this.#stage?.ready(index) ?? 0;
    if (walking > 0) {
      this.#timer = window.setTimeout(() => this.#step(index), walking);
      return;
    }

    if (this.#options.holdsAt?.(index)) {
      this.phase = "turn";
      return;
    }

    this.#say(index, () => this.#advance(index));
  }

  /** After a line: on to the next, or, when listening first, wait on its words. */
  #advance(index: number): void {
    if (this.#options.listenFirst?.() && this.#options.lines()[index + 1]) {
      this.at = index + 1;
      this.phase = "paused";
      return;
    }
    this.#timer = window.setTimeout(() => this.#step(index + 1), LINE_GAP_MS);
  }

  #say(index: number, onDone?: () => void): void {
    this.shown = index;
    this.speaking = true;
    this.cue += 1;
    this.#stage?.play(
      index,
      () => {
        this.speaking = false;
        onDone?.();
      },
      this.#rate,
      this.#options.takeAt?.(index),
    );
  }
}
