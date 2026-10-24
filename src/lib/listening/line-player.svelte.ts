import { playStoryLineAudio, stopStoryLineAudio } from "$lib/lesson-story/story-audio";
import type { DialogueTurn } from "$lib/learning/types";

export const LINE_GAP_MS = 450;

export const SLOW_RATE = 0.8;

/** Where a line can play besides its bare clip: a stage that voices it and acts it out. */
export interface LineStage {
  play(index: number, onEnded: () => void, rate: number): void;
  stop(): void;
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
  slow = $state(false);

  #epoch = 0;
  #gap = 0;
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

    const rate = this.slow ? SLOW_RATE : 1;
    const onEnded = () => this.#onLineEnded(index, mine);
    const stage = this.#options.stage?.();
    if (stage) stage.play(index, onEnded, rate);
    else
      playStoryLineAudio(this.#srcs[line.id], line.slovak, {
        onEnded,
        playbackRate: rate,
      });
  }

  pause(): void {
    this.#clearGap();
    this.#epoch += 1;
    this.playing = false;
    this.#options.stage?.()?.stop();
    stopStoryLineAudio();
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
    this.#options.stage?.()?.stop();
    stopStoryLineAudio();
  }

  #onLineEnded(index: number, mine: number): void {
    if (mine !== this.#epoch || !this.playing) return;

    if (this.#options.isLast(index)) {
      this.playing = false;
      this.#options.onRunEnd(index);
      return;
    }

    this.#gap = window.setTimeout(() => {
      this.#gap = 0;
      if (mine !== this.#epoch || !this.playing) return;
      this.playFrom(index + 1);
    }, LINE_GAP_MS);
  }

  #clearGap(): void {
    if (!this.#gap) return;
    window.clearTimeout(this.#gap);
    this.#gap = 0;
  }
}
