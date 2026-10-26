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
  /** The line puts a question to the listener: the run holds after it until `answered`. */
  holdsAfter?: (index: number) => boolean;
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
  /** Less than BACK_MS of the line heard: Replay line would go back a line instead. */
  justBegun = $state(true);
  /** Stopped after the line for the listener's answer; play goes on from the next line. */
  held = $state(false);

  #epoch = 0;
  #begun = 0;
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
    this.held = false;
    this.playing = true;
    this.speaking = false;
    this.#heardMs = 0;
    this.#speakingSince = null;
    this.#markBegun();

    const rate = this.slow ? SLOW_RATE : 1;
    const onEnded = () => this.#onLineEnded(index, mine);
    const onStart = () => {
      if (mine !== this.#epoch) return;
      this.speaking = true;
      this.#speakingSince = Date.now();
      this.#markBegun();
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
    this.held = false;
    this.playing = false;
    this.speaking = false;
    this.#heardMs = this.#heard();
    this.#speakingSince = null;
    this.#markBegun();
    this.#options.stage?.()?.stop();
    stopStoryLineAudio();
  }

  /** The current line over, or the one before it when this one has only just begun. */
  back(): void {
    const index =
      this.#heard() < BACK_MS && this.cursor > 0 ? this.cursor - 1 : this.cursor;
    this.playFrom(index);
  }

  /** `justBegun` from the time heard, and off once the voice reaches BACK_MS. */
  #markBegun(): void {
    this.#clearBegun();
    const left = BACK_MS - this.#heard();
    this.justBegun = left > 0;
    if (left > 0 && this.#speakingSince !== null) {
      this.#begun = window.setTimeout(() => {
        this.#begun = 0;
        this.justBegun = false;
      }, left);
    }
  }

  #heard(): number {
    return (
      this.#heardMs +
      (this.#speakingSince === null ? 0 : Date.now() - this.#speakingSince)
    );
  }

  toggle(): void {
    if (this.playing) this.pause();
    else if (this.held) this.answered();
    else this.playFrom(this.cursor);
  }

  /** On from a held line, after a beat: the listener has done the thinking the next line's wait is for. */
  answered(): void {
    if (!this.held) return;
    this.held = false;
    this.playing = true;
    const mine = this.#epoch;
    this.#gap = window.setTimeout(() => {
      this.#gap = 0;
      if (mine !== this.#epoch || !this.playing) return;
      this.playFrom(this.cursor + 1);
    }, LINE_GAP_MS);
  }

  toggleSlow(): void {
    this.slow = !this.slow;
    if (this.playing) this.playFrom(this.cursor);
  }

  destroy(): void {
    this.#clearGap();
    this.#clearBegun();
    this.#options.stage?.()?.stop(true);
    stopStoryLineAudio();
  }

  #onLineEnded(index: number, mine: number): void {
    if (mine !== this.#epoch || !this.playing) return;

    this.speaking = false;
    if (this.#options.holdsAfter?.(index) && !this.#options.isLast(index)) {
      this.playing = false;
      this.held = true;
      return;
    }
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

  /** Safe on the server too, where destroy runs after a render and there is no window. */
  #clearBegun(): void {
    if (!this.#begun) return;
    window.clearTimeout(this.#begun);
    this.#begun = 0;
  }

  #clearGap(): void {
    if (!this.#gap) return;
    window.clearTimeout(this.#gap);
    this.#gap = 0;
  }
}
