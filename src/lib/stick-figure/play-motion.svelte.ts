/**
 * Tweens and springs that move on play time (see `$lib/audio/play-clock`).
 * They take the same steps as svelte/motion's `Tween` and `Spring`, but
 * Svelte's run on the wall clock, so a figure would keep settling while the
 * stage is paused. These hold still with the rest of the stage.
 */
import { untrack } from "svelte";

import { playClockFrame, playClockNow } from "$lib/audio/play-clock";

type Easing = (t: number) => number;
type Duration = number | (() => number);

/** Svelte's default for a tween without a duration. */
const DEFAULT_DURATION_MS = 400;

export interface PlayTweenOptions {
  delay?: number;
  duration?: Duration;
  easing?: Easing;
}

export interface PlaySpringOptions {
  stiffness?: number;
  damping?: number;
  precision?: number;
}

type Numbers = Record<string, number>;

function linear(t: number): number {
  return t;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function resolveDuration(duration: Duration | undefined): number {
  const ms = typeof duration === "function" ? duration() : duration;
  return ms ?? DEFAULT_DURATION_MS;
}

/** A number that eases from its value to a target over time. */
export class PlayTween {
  #shown = $state(0);
  /** The same value as `#shown`, read outside any reactive context. */
  #value = 0;
  #target = 0;
  #from = 0;
  #start = 0;
  #end = 0;
  /** Cancels the next frame of the move under way. */
  #cancelFrame: (() => void) | undefined;
  #settled: Array<() => void> = [];
  /** The curve of the move under way, as `set` chose it. */
  #easing: Easing;
  readonly #options: PlayTweenOptions;

  constructor(value: number, options: PlayTweenOptions = {}) {
    this.#shown = value;
    this.#value = value;
    this.#target = value;
    this.#easing = options.easing ?? linear;
    this.#options = options;
  }

  /** A tween that follows `fn`, for a value the component derives from its state. Call during component setup. */
  static of(fn: () => number, options: PlayTweenOptions = {}): PlayTween {
    const tween = new PlayTween(fn(), options);
    $effect.pre(() => {
      const to = fn();
      untrack(() => void tween.set(to));
    });
    return tween;
  }

  get current(): number {
    return this.#shown;
  }

  get target(): number {
    return this.#target;
  }

  set target(to: number) {
    void this.set(to);
  }

  /** Ease to `to` after `delay`, over `duration` ms, on `easing`. Resolves once it has got there. */
  set(
    to: number,
    options: { delay?: number; duration?: Duration; easing?: Easing } = {},
  ): Promise<void> {
    const duration = resolveDuration(options.duration ?? this.#options.duration);
    const delay = options.delay ?? this.#options.delay ?? 0;
    this.#easing = options.easing ?? this.#options.easing ?? linear;
    this.#target = to;
    this.#from = this.#value;
    this.#start = playClockNow() + delay;
    this.#end = this.#start + duration;
    this.#cancelFrame?.();
    this.#cancelFrame = undefined;

    if (duration <= 0 && delay <= 0) {
      this.#write(to);
      this.#flush();
      return Promise.resolve();
    }

    const settled = new Promise<void>((resolve) => this.#settled.push(resolve));
    this.#cancelFrame = playClockFrame(this.#step);
    return settled;
  }

  #step = (): void => {
    this.#cancelFrame = undefined;
    const now = playClockNow();
    const span = this.#end - this.#start;
    const t =
      span > 0 ? clamp((now - this.#start) / span, 0, 1) : now >= this.#start ? 1 : 0;

    if (t >= 1) {
      this.#write(this.#target);
      this.#flush();
      return;
    }

    this.#write(this.#from + (this.#target - this.#from) * this.#easing(t));
    this.#cancelFrame = playClockFrame(this.#step);
  };

  #write(value: number): void {
    this.#value = value;
    this.#shown = value;
  }

  #flush(): void {
    const settled = this.#settled;
    this.#settled = [];
    for (const resolve of settled) resolve();
  }
}

/**
 * Numbers that spring towards a target, each one a damped spring of its own
 * (a flat object of numbers, like the hair's angle and place). Same physics
 * as svelte/motion's `Spring`: a frame's motion is clamped at 1/30 s, and it
 * settles once every number is within `precision` of its target.
 */
export class PlaySpring<T extends Numbers> {
  #shown = $state.raw<T | undefined>(undefined);
  /** The same value as `#shown`, read outside any reactive context. */
  #value!: T;
  /** The value one frame before `#value`, which gives the spring its velocity. */
  #last!: T;
  #target!: T;
  #at = 0;
  /** Cancels the next frame of the spring. */
  #cancelFrame: (() => void) | undefined;
  // Hair retargets each frame. Keep one completion rather than accumulating
  // a resolver per frame until the figure eventually stops moving.
  #settled: Promise<void> | undefined;
  #resolve: (() => void) | undefined;
  readonly #stiffness: number;
  readonly #damping: number;
  readonly #precision: number;

  constructor(value: T, options: PlaySpringOptions = {}) {
    this.#value = value;
    this.#last = value;
    this.#target = value;
    this.#shown = value;
    this.#stiffness = clamp(options.stiffness ?? 0.15, 0, 1);
    this.#damping = clamp(options.damping ?? 0.8, 0, 1);
    this.#precision = options.precision ?? 0.01;
  }

  get current(): T {
    return this.#shown as T;
  }

  get target(): T {
    return this.#target;
  }

  /** Spring towards `to`. `instant` puts it there at once. Resolves once it has settled. */
  set(to: T, options: { instant?: boolean } = {}): Promise<void> {
    this.#target = to;

    if (options.instant) {
      this.#cancelFrame?.();
      this.#cancelFrame = undefined;
      this.#last = to;
      this.#write(to);
      this.#flush();
      return Promise.resolve();
    }

    const settled = (this.#settled ??= new Promise<void>((resolve) => {
      this.#resolve = resolve;
    }));
    if (!this.#cancelFrame) {
      this.#at = playClockNow();
      this.#cancelFrame = playClockFrame(this.#step);
    }
    return settled;
  }

  #step = (): void => {
    this.#cancelFrame = undefined;
    const now = playClockNow();
    // No play time has passed since the last step, so there is nothing to move by yet.
    const elapsed = Math.min(now - this.#at, 1000 / 30);
    if (elapsed <= 0) {
      this.#cancelFrame = playClockFrame(this.#step);
      return;
    }
    this.#at = now;

    const frames = (elapsed * 60) / 1000;
    const value = this.#value;
    const last = this.#last;
    const target = this.#target;
    const next: Numbers = { ...value };
    let settled = true;

    for (const key of Object.keys(value) as Array<keyof T & string>) {
      const delta = target[key] - value[key];
      const velocity = (value[key] - last[key]) / frames;
      const acceleration = this.#stiffness * delta - this.#damping * velocity;
      const step = (velocity + acceleration) * frames;

      if (Math.abs(step) < this.#precision && Math.abs(delta) < this.#precision) {
        next[key] = target[key];
      } else {
        settled = false;
        next[key] = value[key] + step;
      }
    }

    this.#last = value;
    this.#write(next as T);

    if (settled) {
      this.#flush();
      return;
    }
    this.#cancelFrame = playClockFrame(this.#step);
  };

  #write(value: T): void {
    this.#value = value;
    this.#shown = value;
  }

  #flush(): void {
    const resolve = this.#resolve;
    this.#resolve = undefined;
    this.#settled = undefined;
    resolve?.();
  }
}
