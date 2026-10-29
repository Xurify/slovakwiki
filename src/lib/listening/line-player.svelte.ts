import {
  freezePlayClock,
  playClockNow,
  playClockTimeout,
  thawPlayClock,
} from "$lib/audio/play-clock";
import {
  pauseStoryLineAudio,
  playStoryLineAudio,
  resumeStoryLineAudio,
  stopStoryLineAudio,
} from "$lib/lesson-story/story-audio";
import type { DialogueTurn } from "$lib/learning/types";

export const LINE_GAP_MS = 450;

export const SLOW_RATE = 0.8;

/** After the listener's pick, a beat before the answer, so it lands as a reply and not a snap. */
export const ANSWER_BEAT_MS = 900;

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
  /**
   * A pause holds the stage where it is: its motion and sound. Its timers
   * are held by the play clock, which the player freezes itself.
   */
  freeze(): void;
  /** Carry on from `freeze`, where the stage was held. */
  thaw(): void;
}

export interface LinePlayerOptions {
  /** The line puts a question to the listener: the run holds after it until `answered`. */
  holdsAfter?: (index: number) => boolean;
  isLast: (index: number) => boolean;
  /** The line after `index`, where some lines are on another path; the following one unless set. */
  next?: (index: number) => number | undefined;
  /** The line before `index`, where some lines are on another path; the preceding one unless set. */
  prev?: (index: number) => number | undefined;
  onRunEnd: (index: number) => void;
  /** The stage to play each line on, once there is one; the clip alone until then. */
  stage?: () => LineStage | undefined;
}

/**
 * Only one player owns the page's clock and shared audio, including during
 * gaps and pauses. Replaced players must not stop their successor on teardown.
 */
let activePlayer: LinePlayer | undefined;

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
  /** Cancels the `justBegun` timer. */
  #begun: (() => void) | undefined;
  /** Cancels the wait between lines. */
  #gap: (() => void) | undefined;
  /** How long the current line's voice has been heard, over its pauses. */
  #heardMs = 0;
  #speakingSince: number | null = null;
  /** Paused mid-run: play time, the voice and the stage are held until `resume`. */
  #frozen = $state(false);
  /** The speed the current line started at. */
  #rate = 1;
  /** The line's voice, or its stage, is still going: the line has not ended. */
  #voicing = false;
  /** This run reached its end, unlike a pause on its last line. */
  #ended = false;
  /** Keep the frozen instance even if Svelte clears its binding before teardown. */
  #frozenStage: LineStage | undefined;
  /** The stage that actually started this run, not a potentially cleared binding. */
  #stage: LineStage | undefined;
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

  get canGoBack(): boolean {
    return this.#prev(this.cursor) !== undefined;
  }

  /** Held by `pause`, from the first line on: `resume` carries on from it. */
  get paused(): boolean {
    return this.#frozen;
  }

  playFrom(index: number): void {
    const line = this.#lines[index];
    if (!line) return;

    if (activePlayer && activePlayer !== this) activePlayer.halt();
    activePlayer = this;
    this.#release();
    this.#clearGap();
    this.#epoch += 1;
    const mine = this.#epoch;
    this.cursor = index;
    this.held = false;
    this.#ended = false;
    this.playing = true;
    this.#voicing = true;
    this.speaking = false;
    this.#heardMs = 0;
    this.#speakingSince = null;
    this.#markBegun();

    const rate = this.#speed();
    this.#rate = rate;
    const onEnded = () => this.#onLineEnded(index, mine);
    const onStart = () => {
      if (mine !== this.#epoch) return;
      this.speaking = true;
      this.#speakingSince = playClockNow();
      this.#markBegun();
    };
    const stage = this.#options.stage?.();
    this.#stage = stage;
    if (stage) stage.play(index, onEnded, rate, onStart);
    else {
      onStart();
      playStoryLineAudio(this.#srcs[line.id], line.slovak, {
        onEnded,
        playbackRate: rate,
      });
    }
  }

  /**
   * A transcript row's play: the paused line carries on from its pause, and any
   * other line starts again from its top.
   */
  playLine(index: number): void {
    if (this.#frozen && index === this.cursor) this.resume();
    else this.playFrom(index);
  }

  /**
   * Hold the line where it is: its voice, its stage and the wait after it stop
   * with play time, and `resume` carries on from there.
   */
  pause(): void {
    if (!this.playing) return;
    this.playing = false;
    this.#frozen = true;
    freezePlayClock();
    pauseStoryLineAudio();
    this.#frozenStage = this.#stage;
    this.#frozenStage?.freeze();
  }

  /**
   * Carry on from a pause, from where the line was held. A line held mid-voice
   * whose speed was changed starts again from its top at the new speed, as a
   * change of speed does while it plays. Held in a gap or an answer beat, the
   * line has ended, so the next one simply takes the new speed.
   */
  resume(): void {
    if (this.playing || !this.#frozen) return;
    if (this.#voicing && this.#speed() !== this.#rate) {
      this.playFrom(this.cursor);
      return;
    }
    this.playing = true;
    this.#release();
    resumeStoryLineAudio();
  }

  /** Stop the line and its voice; the next play starts the line again from the top. */
  halt(): void {
    this.#release();
    this.#clearGap();
    this.#epoch += 1;
    this.held = false;
    this.playing = false;
    this.#voicing = false;
    this.speaking = false;
    this.#heardMs = this.#heard();
    this.#speakingSince = null;
    this.#markBegun();
    this.#stopStage();
  }

  /** The current line over, or the one before it when this one has only just begun. */
  back(): void {
    const prev = this.#prev(this.cursor);
    const index = this.#heard() < BACK_MS && prev !== undefined ? prev : this.cursor;
    this.playFrom(index);
  }

  /** `justBegun` from the time heard, and off once the voice reaches BACK_MS. */
  #markBegun(): void {
    this.#clearBegun();
    const left = BACK_MS - this.#heard();
    this.justBegun = left > 0;
    if (left > 0 && this.#speakingSince !== null) {
      this.#begun = playClockTimeout(() => {
        this.#begun = undefined;
        this.justBegun = false;
      }, left);
    }
  }

  #heard(): number {
    return (
      this.#heardMs +
      (this.#speakingSince === null ? 0 : playClockNow() - this.#speakingSince)
    );
  }

  /** Start play time again after a pause, for a seek or a stop; `resume` also starts the voice. */
  #release(): void {
    if (!this.#frozen) return;
    this.#frozen = false;
    thawPlayClock();
    const stage = this.#frozenStage;
    this.#frozenStage = undefined;
    stage?.thaw();
  }

  toggle(): void {
    if (this.playing) this.pause();
    else if (this.held) this.answered();
    else if (this.#frozen) this.resume();
    else this.playFrom(this.#ended ? 0 : this.cursor);
  }

  /** On from a held line, after a beat: the listener has done the thinking the next line's wait is for. */
  answered(): void {
    if (!this.held) return;
    this.held = false;
    this.playing = true;
    const mine = this.#epoch;
    this.gapTimeout(
      mine,
      () => {
        const next = this.#next(this.cursor);
        if (next !== undefined) this.playFrom(next);
      },
      ANSWER_BEAT_MS,
    );
  }

  private gapTimeout(mine: number, fn: () => void, ms: number): void {
    this.#gap = playClockTimeout(() => {
      this.#gap = undefined;
      if (mine !== this.#epoch || !this.playing) return;
      fn();
    }, ms);
  }

  /**
   * While a line is voicing, it starts again at the new speed (`resume` does that
   * for a paused one). In a gap or an answer beat the line has ended, so the next
   * line plays at the new speed rather than the one just ended playing again.
   */
  toggleSlow(): void {
    this.slow = !this.slow;
    if (this.playing && this.#voicing) this.playFrom(this.cursor);
  }

  #speed(): number {
    return this.slow ? SLOW_RATE : 1;
  }

  destroy(): void {
    // Play time is shared by the whole page, so a player that goes must not leave it held.
    this.#release();
    this.#epoch += 1;
    this.playing = false;
    this.#voicing = false;
    this.#clearGap();
    this.#clearBegun();
    this.#stopStage(true);
  }

  #stopStage(leaving = false): void {
    // openChapter halts before Svelte unmounts the old segment. Destruction
    // must not repeat its global stop once the next segment has started.
    if (activePlayer !== this) return;
    activePlayer = undefined;
    const stage = this.#stage;
    this.#stage = undefined;
    stage?.stop(leaving);
    stopStoryLineAudio();
  }

  #onLineEnded(index: number, mine: number): void {
    if (mine !== this.#epoch || !this.playing) return;

    this.speaking = false;
    this.#voicing = false;
    // The line is heard to its end. Its time stops there, so the wait after it does not count toward Replay or Previous.
    this.#heardMs = this.#heard();
    this.#speakingSince = null;
    // The timer set at the voice's start may fire in the wait after a short line, so settle it from the time heard.
    this.#markBegun();
    if (this.#options.holdsAfter?.(index) && !this.#options.isLast(index)) {
      this.playing = false;
      this.held = true;
      return;
    }
    if (this.#options.isLast(index)) {
      this.playing = false;
      this.#ended = true;
      this.#options.onRunEnd(index);
      return;
    }

    const next = this.#next(index);
    if (next === undefined) return;
    this.gapTimeout(
      mine,
      () => this.playFrom(next),
      LINE_GAP_MS + (this.#lines[next]?.wait ?? 0),
    );
  }

  #next(index: number): number | undefined {
    if (this.#options.next) return this.#options.next(index);
    return index + 1 < this.#lines.length ? index + 1 : undefined;
  }

  #prev(index: number): number | undefined {
    if (this.#options.prev) return this.#options.prev(index);
    return index > 0 ? index - 1 : undefined;
  }

  #clearBegun(): void {
    this.#begun?.();
    this.#begun = undefined;
  }

  #clearGap(): void {
    this.#gap?.();
    this.#gap = undefined;
  }
}
