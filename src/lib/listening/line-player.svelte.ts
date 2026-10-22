import { playStoryLineAudio, stopStoryLineAudio } from "$lib/lesson-story/story-audio";
import type { DialogueTurn } from "$lib/learning/types";

export const LINE_GAP_MS = 450;

export const SLOW_RATE = 0.8;

export interface LinePlayerOptions {
  isLast: (index: number) => boolean;
  onRunEnd: (index: number) => void;
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

    playStoryLineAudio(this.#srcs[line.id], line.slovak, {
      playbackRate: this.slow ? SLOW_RATE : 1,
      onEnded: () => this.#onLineEnded(index, mine),
    });
  }

  pause(): void {
    this.#clearGap();
    this.#epoch += 1;
    this.playing = false;
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
