<script lang="ts">
  import { untrack } from "svelte";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import {
    stickFrame,
    stickFrameSettled,
    type StickGestureId,
  } from "$lib/stick-figure/gestures";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import StickFigure from "./StickFigure.svelte";

  let {
    characterId,
    class: className = "",
    cue = 0,
    facing = 1,
    gesture = "talk",
    talking = false,
  }: {
    characterId: LessonCharacterId;
    class?: string;
    /** Bump to play `gesture` from the start. */
    cue?: number;
    facing?: 1 | -1;
    gesture?: StickGestureId;
    /** True while this character's clip plays; drives the mouth. */
    talking?: boolean;
  } = $props();

  let pose = $state<StickPose>(REST_POSE);

  let frame = 0;
  /** Long past, so `talking` without a cue moves only the mouth. */
  let startedAt = -60_000;
  let reducedMotion = false;

  $effect(() => {
    if (cue === 0) return;

    untrack(() => {
      startedAt = performance.now();
      run();
    });
  });

  $effect(() => {
    if (talking) untrack(run);
  });

  $effect(() => () => cancelAnimationFrame(frame));

  function run(): void {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // The loop only runs while a gesture or a clip is in flight, then parks on
  // the rest pose: no idle motion between lines.
  function tick(now: number): void {
    const input = { elapsed: now - startedAt, reducedMotion, talking };
    pose = stickFrame(gesture, input);
    frame = stickFrameSettled(gesture, input) ? 0 : requestAnimationFrame(tick);
  }
</script>

<StickFigure {characterId} class={className} {facing} {pose} />
