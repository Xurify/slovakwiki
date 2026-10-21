<script lang="ts">
  import { untrack } from "svelte";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import { gestureDuration } from "$lib/stick-figure/gestures";
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
  import type { StickPropId } from "$lib/stick-figure/props";
  import { walkPose } from "$lib/stick-figure/walk";
  import StickFigure from "./StickFigure.svelte";

  let {
    characterId,
    class: className = "",
    clock,
    cue = 0,
    facing = 1,
    onbeat,
    plan,
    prop,
    talking = false,
    walk,
  }: {
    characterId: LessonCharacterId;
    class?: string;
    /** Playback position of the line's clip; without one the line runs on the wall clock. */
    clock?: () => SpeechClock | undefined;
    /** Bump to perform `plan` from the start. */
    cue?: number;
    facing?: 1 | -1;
    /** Called as each beat of `plan` starts. */
    onbeat?: (beat: LineBeat) => void;
    plan?: LinePlan;
    /** Held in the lead hand. */
    prop?: StickPropId;
    /** True while the line `plan` belongs to plays: this figure's own, or one it reacts to. */
    talking?: boolean;
    /** Bump `cue` to take steps for `ms` while the stage moves the figure. */
    walk?: { cue: number; ms: number };
  } = $props();

  /** Long enough to see the picture, short enough not to outstay the line. */
  const PICTURE_MS = 1800;

  let pose = $state<StickPose>(REST_POSE);
  let picture = $state<StickPictureId>();
  /** The way a point in flight turns the figure, when its target is behind it. */
  let turned = $state<1 | -1>();

  let frame = 0;
  let startedAt = 0;
  let act: PerformanceState = startPerformance();
  let reducedMotion = false;
  let walkStartedAt = 0;
  let walkMs = 0;
  let pictureCalled: StickPictureId | undefined;
  let pictureUntil = 0;

  $effect(() => {
    if (cue === 0) return;

    untrack(() => {
      startedAt = performance.now();
      act = startPerformance(startedAt, $state.snapshot(pose));
      pictureCalled = undefined;
      run();
    });
  });

  $effect(() => {
    if (talking) untrack(run);
  });

  $effect(() => {
    if (!walk?.cue) return;
    const ms = walk.ms;

    untrack(() => {
      walkStartedAt = performance.now();
      walkMs = ms;
      run();
    });
  });

  $effect(() => () => cancelAnimationFrame(frame));

  function run(): void {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // The loop runs only while a line, its last gesture or a walk is in
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
    if (next && next.state.beatIndex !== act.beatIndex) {
      const started = plan?.beats[next.state.beatIndex];
      if (started) onbeat?.(started);
    }
    if (next) act = next.state;

    const beat = plan?.beats[act.beatIndex];
    const aiming =
      beat?.point?.facing !== undefined &&
      now - act.beatStartedAt < gestureDuration(beat.gesture)
        ? beat.point.facing
        : undefined;
    if (aiming !== turned) turned = aiming;

    const walked = now - walkStartedAt;
    const walking = walked < walkMs && !reducedMotion;
    const body = next?.pose ?? REST_POSE;
    pose = walking ? walkPose(body, walked, walkMs) : body;

    if (next?.picture && next.picture !== pictureCalled) {
      pictureCalled = next.picture;
      pictureUntil = now + PICTURE_MS;
    }
    const showing = now < pictureUntil ? pictureCalled : undefined;
    if (showing !== picture) picture = showing;

    const busy = !(next?.settled ?? true) || walking || showing !== undefined;
    frame = busy ? requestAnimationFrame(tick) : 0;
  }
</script>

<StickFigure
  {characterId}
  class={className}
  facing={turned ?? facing}
  {picture}
  {pose}
  {prop}
/>
