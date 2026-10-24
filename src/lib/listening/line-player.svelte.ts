import { playStoryLineAudio, stopStoryLineAudio } from "$lib/lesson-story/story-audio";
import type { DialogueTurn } from "$lib/learning/types";

export const LINE_GAP_MS = 450;

export const SLOW_RATE = 0.8;

/**
 * Heard this much of a line, Replay line starts it over; before that it goes
 * back a line, the way a player's previous button does on a track just begun.
 */
export const BACK_MS = 1500;

/** Where a line can play besides its bare clip: a stage that voices it and acts it out. */
export interface LineStage {
  /** `onStart` once the voice starts, which waits for anyone still walking over. */
  play(index: number, onEnded: () => void, rate: number, onStart: () => void): void;
  /** `leaving` when the player is done with the segment, not pausing it. */
  stop(leaving?: boolean): void;
}

export interface LinePlayerOptions {
  isLast: (index: number) => boolean;
  onRunEnd: (index: number) => void;
  /** The stage to play each line on, once there is one; the clip alone until then. */
  stage?: () => LineStage | undefined;
}

export class LinePlayer {
  cursor = $state(0);
  playing = $state(false);
  /** The line's voice has started: on a stage, after anyone walking over is there. */
  speaking = $state(false);
  slow = $state(false);

  #epoch = 0;
  #gap = 0;
  /** How long the current line's voice has been heard, over its pauses. */
  #heardMs = 0;
  #speakingSince: number | null = null;
  readonly #lines: DialogueTurn[];
  readonly #srcs: Record<string, string>;
  readonly #options: LinePlayerOptions;

  constructor(
    lines: DialogueTurn[],
    srcs: Record<string, string>,
    options: LinePlayerOptions,
  ) {
    this.#lines = lines;
    this.#srcs = srcs;
    this.#options = options;
  }

  get line(): DialogueTurn | undefined {
    return this.#lines[this.cursor];
  }

  playFrom(index: number): void {
    const line = this.#lines[index];
    if (!line) return;

    this.#clearGap();
    this.#epoch += 1;
    const mine = this.#epoch;
    this.cursor = index;
    this.playing = true;
    this.speaking = false;
    this.#heardMs = 0;
    this.#speakingSince = null;

    const rate = this.slow ? SLOW_RATE : 1;
    const onEnded = () => this.#onLineEnded(index, mine);
    const onStart = () => {
      if (mine !== this.#epoch) return;
      this.speaking = true;
      this.#speakingSince = Date.now();
    };
    const stage = this.#options.stage?.();
    if (stage) stage.play(index, onEnded, rate, onStart);
    else {
      onStart();
      playStoryLineAudio(this.#srcs[line.id], line.slovak, {
        onEnded,
        playbackRate: rate,
      });
    }
  }

  pause(): void {
    this.#clearGap();
    this.#epoch += 1;
    this.playing = false;
    this.speaking = false;
    this.#heardMs = this.#heard();
    this.#speakingSince = null;
    this.#options.stage?.()?.stop();
    stopStoryLineAudio();
  }

  /** The current line over, or the one before it when this one has only just begun. */
  back(): void {
    const index =
      this.#heard() < BACK_MS && this.cursor > 0 ? this.cursor - 1 : this.cursor;
    this.playFrom(index);
  }

  #heard(): number {
    return (
      this.#heardMs +
      (this.#speakingSince === null ? 0 : Date.now() - this.#speakingSince)
    );
  }

  toggle(): void {
    if (this.playing) this.pause();
    else this.playFrom(this.cursor);
  }

  toggleSlow(): void {
    this.slow = !this.slow;
    if (this.playing) this.playFrom(this.cursor);
  }

  destroy(): void {
    this.#clearGap();
    this.#options.stage?.()?.stop(true);
    stopStoryLineAudio();
  }

  #onLineEnded(index: number, mine: number): void {
    if (mine !== this.#epoch || !this.playing) return;

    this.speaking = false;
    if (this.#options.isLast(index)) {
      this.playing = false;
      this.#options.onRunEnd(index);
      return;
    }

    this.#gap = window.setTimeout(
      () => {
        this.#gap = 0;
        if (mine !== this.#epoch || !this.playing) return;
        this.playFrom(index + 1);
      },
      LINE_GAP_MS + (this.#lines[index + 1]?.wait ?? 0),
    );
  }

  #clearGap(): void {
    if (!this.#gap) return;
    window.clearTimeout(this.#gap);
    this.#gap = 0;
  }
}
