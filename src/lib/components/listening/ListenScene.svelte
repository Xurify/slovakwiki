<script module lang="ts">
  import {
    ambienceFor,
    playAmbience,
    playSegmentCue,
    type AmbiencePlayer,
  } from "$lib/stick-figure/ambience";

  /** One sound of the place for the episode: the next segment fades it over to its own. */
  let place: AmbiencePlayer | undefined;
  let quiet = 0;
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { getStoredSfxPreference } from "$lib/audio/sfx";
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { StagedScene } from "$lib/stick-figure/scene-line";
  import { sceneMood } from "$lib/stick-figure/scene-mood";
  import { cx } from "$lib/ui/classes";

  /**
   * A podcast segment acted out on the stick-figure stage: the segment's
   * line player hands each line to `play`, and the cast says it and acts it
   * out. Jumping to a line puts everyone where the segment finds them.
   */
  let {
    class: className = "",
    follows = false,
    scene,
    sound = true,
    thingWords = {},
  }: {
    class?: string;
    /**
     * The segment plays on from the one before: the stage fades in on the
     * new place, the break's sting plays, and the place is heard a moment
     * before anyone speaks.
     */
    follows?: boolean;
    scene: StagedScene;
    /** The sound of the place under the voices. */
    sound?: boolean;
    /** Dictionary link and clip for each thing's word, for the card a tap opens. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** The place is seen and heard this long before the first line of a segment that follows on. */
  const SETTLE_MS = 1400;
  /** The next segment takes the sound over within this, rather than start it again. */
  const HANDOVER_MS = 1500;

  let stage = $state<ReturnType<typeof StickStage>>();
  /** The line on stage: the one playing, or the last one played. */
  let at = $state(-1);
  let veiled = $state(follows);
  /** A line is playing or about to: the place is heard. */
  let live = $state(false);
  let settled = !follows;
  let waiting = 0;

  const direction = $derived(directScene(scene.lines, scene.setting, scene.order));
  const mood = $derived(
    sceneMood(
      scene.lines.map((line) => line.slovak),
      Math.max(at, 0),
    ),
  );

  $effect(() => {
    if (!follows) return;
    const frame = window.requestAnimationFrame(() => (veiled = false));
    return () => window.cancelAnimationFrame(frame);
  });

  // The learner turns the sound of the place on or off as it plays.
  $effect(() => {
    if (!sound) hush(0);
    else if (live) untrack(listen);
  });

  export function play(
    index: number,
    onEnded: () => void,
    rate: number,
    onStart: () => void,
  ): void {
    window.clearTimeout(waiting);
    if (index !== at + 1) stage?.place(index);
    at = index;
    live = true;
    listen();

    let wait = stage?.ready(index) ?? 0;
    if (!settled && index === 0) {
      settled = true;
      playSegmentCue();
      wait = Math.max(wait, SETTLE_MS);
    }

    const last = index === scene.lines.length - 1;
    // Someone still walking over gets there before they speak or are spoken to.
    waiting = window.setTimeout(() => {
      onStart();
      stage?.play(
        index,
        () => {
          if (last) {
            live = false;
            hush(HANDOVER_MS);
          }
          onEnded();
        },
        rate,
      );
    }, wait);
  }

  export function stop(): void {
    window.clearTimeout(waiting);
    live = false;
    stage?.stop();
    hush(HANDOVER_MS);
  }

  function listen(): void {
    window.clearTimeout(quiet);
    if (!sound || getStoredSfxPreference() === "off") return;

    const ambience = ambienceFor(scene.setting, mood);
    if (place) place.set(ambience);
    else place = playAmbience(ambience);
  }

  function hush(after: number): void {
    window.clearTimeout(quiet);
    quiet = window.setTimeout(() => {
      place?.stop();
      place = undefined;
    }, after);
  }
</script>

<div class={cx("relative", className)}>
  <StickStage
    bind:this={stage}
    {direction}
    lines={scene.lines}
    {mood}
    setting={scene.setting}
    {thingWords}
  />

  {#if follows}
    <div
      class={cx(
        "pointer-events-none absolute inset-0 z-20 bg-paper transition-opacity duration-200 ease-out",
        veiled ? "opacity-100" : "opacity-0",
      )}
      aria-hidden="true"
    ></div>
  {/if}
</div>
