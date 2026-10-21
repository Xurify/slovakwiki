<script lang="ts">
  import { untrack } from "svelte";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { LinePlan } from "$lib/stick-figure/line-plan";
  import {
    performFrame,
    startPerformance,
    type PerformanceState,
    type SpeechClock,
  } from "$lib/stick-figure/performance";
  import { REST_POSE, type StickPose } from "$lib/stick-figure/pose";
  import type { StickPropId } from "$lib/stick-figure/props";
  import StickFigure from "./StickFigure.svelte";

  let {
    characterId,
    class: className = "",
    clock,
    cue = 0,
    facing = 1,
    plan,
    prop,
    talking = false,
  }: {
    characterId: LessonCharacterId;
    class?: string;
    /** Playback position of the line's clip; without one the line runs on the wall clock. */
    clock?: () => SpeechClock | undefined;
    /** Bump to perform `plan` from the start. */
    cue?: number;
    facing?: 1 | -1;
    plan?: LinePlan;
    /** Held in the lead hand. */
    prop?: StickPropId;
    /** True while the line `plan` belongs to plays: this figure's own, or one it reacts to. */
    talking?: boolean;
  } = $props();

  let pose = $state<StickPose>(REST_POSE);

  let frame = 0;
  let startedAt = 0;
  let act: PerformanceState = startPerformance();
  let reducedMotion = false;

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

  $effect(() => () => cancelAnimationFrame(frame));

  function run(): void {
    reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function speechPosition(now: number): number | null {
    const reading = clock?.();
    if (!reading) return now - startedAt;
    if (!(reading.durationMs > 0)) return null;

    // A plan timed from text alone stretches to the real clip; a measured one already fits it.
    if (plan?.track) return reading.timeMs;
    return (
      reading.timeMs * ((plan?.durationMs ?? reading.durationMs) / reading.durationMs)
    );
  }

  // The loop runs only while a line or its last gesture is in flight, then
  // parks on the rest pose: no idle motion between lines.
  function tick(now: number): void {
    if (!plan) {
      pose = REST_POSE;
      frame = 0;
      return;
    }

    const next = performFrame(plan, act, {
      now,
      reducedMotion,
      speechMs: speechPosition(now),
      talking,
    });
    act = next.state;
    pose = next.pose;
    frame = next.settled ? 0 : requestAnimationFrame(tick);
  }
</script>

<StickFigure {characterId} class={className} {facing} {pose} {prop} />
