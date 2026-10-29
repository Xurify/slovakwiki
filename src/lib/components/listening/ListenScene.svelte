<script module lang="ts">
  import { playClockFrame, playClockNow, playClockTimeout } from "$lib/audio/play-clock";
  import {
    PHONE_CUE_MS,
    ambienceFor,
    holdStageSound,
    playAmbience,
    playPhoneCue,
    playSegmentCue,
    releaseStageSound,
    stopCues,
    type AmbiencePlayer,
  } from "$lib/stick-figure/ambience";

  /** One sound of the place for the episode: the next segment fades it over to its own. */
  let place: AmbiencePlayer | undefined;
  /** Cancels the place's sound going quiet. */
  let quiet: (() => void) | undefined;
  /** When the sound is due to stop; an earlier call keeps its earlier time. */
  let quietAt = Number.POSITIVE_INFINITY;
</script>

<script lang="ts">
  import { untrack } from "svelte";
  import { slide } from "svelte/transition";

  import SceneCaption from "$lib/components/stick-figure/SceneCaption.svelte";
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import type { DialogueTurn } from "$lib/learning/types";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { StagedScene } from "$lib/stick-figure/scene-line";
  import { sceneMood } from "$lib/stick-figure/scene-mood";
  import { animateResize } from "$lib/ui/animate-resize";
  import { cx } from "$lib/ui/classes";

  /** This repo's motion convention (see `StickWeather.svelte`): read live, not cached, since the setting can change mid-visit. */
  const reducedMotion = (): boolean =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * A podcast segment acted out on the stick-figure stage: the segment's
   * line player hands each line to `play`, and the cast says it and acts it
   * out. Jumping to a line puts everyone where the segment finds them.
   */
  let {
    class: className = "",
    follows = false,
    hint,
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
    hint?: string;
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
  // Mounted once per segment (ListenStage), so whether it follows on is fixed for its life.
  let veiled = $state(untrack(() => follows));
  /** A line is playing or about to: the place is heard. */
  let live = $state(false);
  let settled = untrack(() => !follows);
  /** Cancels the wait for anyone still walking over before the line is said. */
  let waiting: (() => void) | undefined;
  /** The line on stage has played to its end, so the next one follows on from it. */
  let finished = true;

  const direction = $derived(
    directScene(scene.lines, scene.setting, scene.order, scene.carried),
  );
  const mood = $derived(
    sceneMood(
      scene.lines.map((line) => line.slovak),
      Math.max(at, 0),
      scene.before,
    ),
  );

  $effect(() => {
    if (!follows) return;
    return playClockFrame(() => (veiled = false));
  });

  // The learner turns the sound of the place on or off as it plays.
  $effect(() => {
    if (!sound) hush(0);
    else if (live) untrack(listen);
  });

  // An effect's teardown, not onDestroy: onDestroy also runs after a server render, where there is no window.
  $effect(
    () => () =>
      untrack(() => {
        waiting?.();
        stage?.stop();
        stopCues();
      }),
  );

  export function play(
    index: number,
    onEnded: () => void,
    rate: number,
    onStart: () => void,
  ): void {
    waiting?.();
    // Anything but the next line once this one is over is a jump: a skip, a
    // replay, or a click ahead while a walk or a ring is still going. The stage
    // stops, which silences its cues, and puts everyone where the line finds them.
    if (index !== at + 1 || !finished) {
      stage?.stop();
      stage?.place(index);
      shown = index;
    }
    finished = false;
    at = index;
    live = true;
    listen();

    let wait = Math.max(stage?.ready(index) ?? 0, stage?.lead(index) ?? 0);
    if (!settled && index === 0) {
      settled = true;
      playSegmentCue();
      wait = Math.max(wait, SETTLE_MS);
    }

    const ring = scene.lines[index]?.ring;
    if (ring) {
      playPhoneCue(ring);
      wait = Math.max(wait, PHONE_CUE_MS[ring]);
    }

    const last = index === scene.lines.length - 1;
    // Someone still walking over gets there before they speak or are spoken to.
    waiting = playClockTimeout(() => {
      waiting = undefined;
      shown = index;
      cue += 1;
      speaking = true;
      onStart();
      stage?.play(
        index,
        () => {
          speaking = false;
          finished = true;
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
    waiting?.();
    waiting = undefined;
    live = false;
    speaking = false;
    finished = true;
    stage?.stop();
    // A walk-off at the segment's end would go on sounding under the next segment's card.
    stopCues();
    hush(leaving ? HANDOVER_MS : 0);
  }

  /** A pause holds the stage where it is: its motion, and the sound of the place and the steps. */
  export function freeze(): void {
    holdStageSound();
    stage?.freeze();
  }

  /** Carry on from `freeze`. */
  export function thaw(): void {
    releaseStageSound();
    stage?.thaw();
  }

  function listen(): void {
    quiet?.();
    quiet = undefined;
    quietAt = Number.POSITIVE_INFINITY;
    if (!sound) return;

    const ambience = ambienceFor(scene.setting, mood);
    if (place) place.set(ambience);
    else place = playAmbience(ambience);
  }

  function hush(after: number): void {
    // With no delay the place falls silent at once, even while a pause holds play time, so it does not wait for the thaw.
    // A later stop counts play time, so a pause holds it until the thaw.
    if (after <= 0) {
      quiet?.();
      quiet = undefined;
      quietAt = Number.POSITIVE_INFINITY;
      place?.stop();
      place = undefined;
      return;
    }
    const at = playClockNow() + after;
    if (at >= quietAt) return;
    quiet?.();
    quietAt = at;
    quiet = playClockTimeout(() => {
      quiet = undefined;
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
      start={scene.world}
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

    <!--
      A caption band with a floor, not a fixed height: the floor gives a short line and its
      English row their room from the start, so the controls don't move on load or on pause.
      A longer line still grows past it, but `animateResize` eases that growth instead of
      snapping, and `transition:slide` eases the band's own mount/unmount when subtitles are
      turned on or off, rather than the row beneath it jumping.
    -->
    <div
      class="border-t border-slate-200/70"
      data-listen-captions
      transition:slide={{ duration: reducedMotion() ? 0 : 200 }}
    >
      <div
        class="min-h-[5.4375rem] px-4 py-3 max-[600px]:min-h-[5.125rem] sm:px-5"
        aria-live="polite"
        use:animateResize
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
        {:else if hint}
          <p class="m-0 text-sm leading-snug text-pretty text-slate-500">{hint}</p>
        {/if}
      </div>
    </div>
  {/if}
</div>
