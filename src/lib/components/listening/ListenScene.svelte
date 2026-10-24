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
  /** When the sound is due to stop; an earlier call keeps its earlier time. */
  let quietAt = Number.POSITIVE_INFINITY;
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { getStoredSfxPreference } from "$lib/audio/sfx";
  import SceneCaption from "$lib/components/stick-figure/SceneCaption.svelte";
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import type { DialogueTurn } from "$lib/learning/types";
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
    showEnglish = false,
    sound = true,
    subtitles = true,
    thingWords = {},
    turns = [],
  }: {
    class?: string;
    /**
     * The segment plays on from the one before: the stage fades in on the
     * new place, the break's sting plays, and the place is heard a moment
     * before anyone speaks.
     */
    follows?: boolean;
    scene: StagedScene;
    /** The English under the subtitle. */
    showEnglish?: boolean;
    /** The sound of the place under the voices. */
    sound?: boolean;
    /** The line being said, under the stage, from its first word until the next line starts. */
    subtitles?: boolean;
    /** Dictionary link and clip for each thing's word, for the card a tap opens. */
    thingWords?: Record<string, { href?: string; src?: string }>;
    /** The segment's lines as written, one per scene line, for the subtitle's marks and English. */
    turns?: readonly DialogueTurn[];
  } = $props();

  /** The place is seen and heard this long before the first line of a segment that follows on. */
  const SETTLE_MS = 1400;
  /** The next segment takes the sound over within this, rather than start it again. */
  const HANDOVER_MS = 1500;

  let stage = $state<ReturnType<typeof StickStage>>();
  /** The line on stage: the one playing, or the last one played. */
  let at = $state(-1);
  /** The line in the subtitle: `at` once its voice has started, so a walk-on is not read ahead. */
  let shown = $state(-1);
  let cue = $state(0);
  let speaking = $state(false);
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
      shown = index;
      cue += 1;
      speaking = true;
      onStart();
      stage?.play(
        index,
        () => {
          speaking = false;
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

  /**
   * Stop the line. On a pause the place falls silent with the voice; on
   * leaving the segment it is handed on to the next one instead.
   */
  export function stop(leaving = false): void {
    window.clearTimeout(waiting);
    live = false;
    speaking = false;
    stage?.stop();
    hush(leaving ? HANDOVER_MS : 0);
  }

  function listen(): void {
    window.clearTimeout(quiet);
    quietAt = Number.POSITIVE_INFINITY;
    if (!sound || getStoredSfxPreference() === "off") return;

    const ambience = ambienceFor(scene.setting, mood);
    if (place) place.set(ambience);
    else place = playAmbience(ambience);
  }

  function hush(after: number): void {
    const at = performance.now() + after;
    if (at >= quietAt) return;
    window.clearTimeout(quiet);
    quietAt = at;
    quiet = window.setTimeout(() => {
      quietAt = Number.POSITIVE_INFINITY;
      place?.stop();
      place = undefined;
    }, after);
  }
</script>

<div class={className}>
  <div class="relative">
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

  {#if subtitles}
    {@const turn = turns[shown]}

    <!-- Room for two lines, so the controls stay put as the lines change. -->
    <div
      class="min-h-[5.75rem] border-t border-slate-200/70 px-4 py-3 max-[600px]:min-h-[5rem] sm:px-5"
    >
      {#if turn}
        {#key shown}
          <SceneCaption
            clock={() => stage?.clock()}
            {cue}
            english={turn.english}
            marks={turn.marks}
            onthing={(id) => stage?.light(id)}
            plan={direction.lines[shown]?.plan}
            playing={speaking}
            {showEnglish}
            slovak={turn.slovak}
            things={direction.things}
          />
        {/key}
      {/if}
    </div>
  {/if}
</div>
