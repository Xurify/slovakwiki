<script lang="ts">
  import { untrack } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { LineBeat, LinePlan } from "$lib/stick-figure/line-plan";
  import {
    performFrame,
    planTime,
    startPerformance,
    type PerformanceState,
    type SpeechClock,
  } from "$lib/stick-figure/performance";
  import type { StickPictureId } from "$lib/stick-figure/pictures";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import type { Dress } from "$lib/stick-figure/dress";
  import type { Held } from "$lib/stick-figure/props";
  import { walkPose } from "$lib/stick-figure/walk";
  import StickFigure from "./StickFigure.svelte";

  /** Sitting down or getting up takes about as long as a step and a half. */
  const SIT_MS = 600;

  let {
    characterId,
    clock,
    cue = 0,
    facing = 1,
    front = false,
    onbeat,
    plan,
    held,
    dress,
    seated = false,
    talking = false,
    turnDelay = 0,
    walk,
  }: {
    characterId: LessonCharacterId;
    /** Playback position of the line's clip; without one the line runs on the wall clock. */
    clock?: () => SpeechClock | undefined;
    /** Bump to perform `plan` from the start. */
    cue?: number;
    facing?: 1 | -1;
    /** Talking to the listeners: the head turned to the front. */
    front?: boolean;
    onbeat?: (beat: LineBeat) => void;
    plan?: LinePlan;
    /** In the lead hand. */
    held?: Held;
    /** What the weather on them does to what they wear. */
    dress?: Dress;
    /** On a chair: they sit once any walk there is over, and get up before walking on. */
    seated?: boolean;
    /** True while the line `plan` belongs to plays: this figure's own, or one it reacts to. */
    talking?: boolean;
    /** Ms before a change of `facing` starts. */
    turnDelay?: number;
    /** Bump `cue` to take steps for `ms` while the stage moves the figure. */
    walk?: { cue: number; ms: number };
  } = $props();

  let pose = $state<StickPose>(REST_POSE);
  const sitting = new Tween(0, { easing: cubicInOut });

  let picture = $state<StickPictureId>();
  /** The way a point in flight turns the figure, when its target is behind it. */
  let turned = $state<1 | -1>();

  let frame = 0;
  let startedAt = 0;
  let act: PerformanceState = startPerformance();
  let reducedMotion = false;
  let walkStartedAt = 0;
  let walkMs = 0;
  let walkCue = 0;

  $effect(() => {
    if (cue === 0) return;

    untrack(() => {
      startedAt = performance.now();
      act = startPerformance(startedAt, $state.snapshot(pose));
      run();
    });
  });

  $effect(() => {
    if (talking) untrack(run);
  });

  $effect(() => {
    // The stage hands out a new record of walks whenever anyone walks; only a
    // new cue means this figure steps, or it would walk on the spot.
    if (!walk?.cue || walk.cue === walkCue) return;
    walkCue = walk.cue;
    const ms = walk.ms;

    untrack(() => {
      walkStartedAt = performance.now();
      walkMs = ms;
      run();
    });
  });

  // After the walk's effect, so a walk to the chair this same line is counted.
  $effect(() => {
    const down = seated;
    untrack(() => {
      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const walkLeft = Math.max(0, walkStartedAt + walkMs - performance.now());
      void sitting.set(down ? 1 : 0, {
        delay: down && !still ? walkLeft : 0,
        duration: still ? 0 : SIT_MS,
      });
    });
  });

  $effect(() => () => cancelAnimationFrame(frame));

  function run(): void {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // The loop runs only while a line, its last gesture, a picture or a walk is in
  // flight, then parks on the rest pose: no idle motion between lines.
  function tick(now: number): void {
    const next = plan
      ? performFrame(plan, act, {
          now,
          reducedMotion,
          speechMs: planTime(plan, clock?.(), now - startedAt),
          talking,
        })
      : undefined;
    if (next?.started) onbeat?.(next.started);
    if (next) act = next.state;
    if (next?.facing !== turned) turned = next?.facing;
    if (next?.picture !== picture) picture = next?.picture;

    const walked = now - walkStartedAt;
    const walking = walked < walkMs && !reducedMotion;
    const body = next?.pose ?? REST_POSE;
    pose = walking ? walkPose(body, walked, walkMs) : body;

    frame = !(next?.settled ?? true) || walking ? requestAnimationFrame(tick) : 0;
  }
</script>

<StickFigure
  {characterId}
  facing={turned ?? facing}
  {front}
  {picture}
  {pose}
  {held}
  {dress}
  sit={sitting.current}
  turnDelay={turned ? 0 : turnDelay}
/>
