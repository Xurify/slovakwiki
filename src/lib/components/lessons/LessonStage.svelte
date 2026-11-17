<script lang="ts">
  import { untrack } from "svelte";

  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import SceneCaption from "$lib/components/stick-figure/SceneCaption.svelte";
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import { LINE_GAP_MS } from "$lib/listening/line-player.svelte";
  import type { StickGestureId } from "$lib/stick-figure/gestures";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import { sceneMood } from "$lib/stick-figure/scene-mood";
  import { cx } from "$lib/ui/classes";

  /**
   * The lesson's scene on the stick-figure stage, there for the whole lesson:
   * it plays a chapter's lines, waits at Alex's turns, and the cast reacts to
   * the learner's answers in between.
   */
  let {
    captions = true,
    compact = false,
    hint,
    onpause,
    onplay,
    playLabel = "Play the scene",
    scene,
    showEnglish = false,
    thingWords = {},
  }: {
    /** The line being said, under the stage. */
    captions?: boolean;
    /** Smaller while the learner reads or answers below it. */
    compact?: boolean;
    /** In the caption's place before any line is said: the chapter's title and what to do. */
    hint?: { text?: string; title: string };
    /** Stop after the line being said, as on a video. */
    onpause?: () => void;
    /** A play button over the stage, as on a video, while the lines have not started or wait. */
    onplay?: () => void;
    playLabel?: string;
    scene: Scene;
    showEnglish?: boolean;
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  let stage = $state<ReturnType<typeof StickStage>>();
  /** The line in the caption. */
  let shown = $state(-1);
  let speaking = $state(false);
  let cue = $state(0);
  /** The line last played to its end, so the next one in order needs no jump. */
  let last = -1;
  let timer = 0;
  /** Bumped by every run and stop, so a stale run's callbacks do nothing. */
  let epoch = 0;

  const direction = $derived(directScene(scene.lines, scene.setting, scene.order));
  const mood = $derived(
    sceneMood(
      scene.lines.map((line) => line.slovak),
      Math.max(shown, 0),
    ),
  );
  const learnerId = $derived(
    scene.lines.find((line) => line.learner)?.characterId ?? undefined,
  );
  /** Whoever Alex talks with: they react to the learner's answers. */
  const partnerId = $derived(
    direction.cast.find((id) => id !== learnerId) ?? direction.cast[0],
  );
  const caption = $derived(shown >= 0 ? scene.lines[shown] : undefined);

  $effect(
    () => () =>
      untrack(() => {
        window.clearTimeout(timer);
        stage?.stop();
      }),
  );

  /**
   * Play `indices` in order. Before a line `holds` is true for, stop and hand
   * it to `onturn` with a `go` that says it and goes on.
   */
  export function run(
    indices: readonly number[],
    {
      holds,
      ondone,
      onsay,
      onturn,
      onwait,
      waits,
    }: {
      holds?: (index: number) => boolean;
      ondone?: () => void;
      /** A line starts to be said. */
      onsay?: (index: number) => void;
      onturn?: (index: number, go: () => void) => void;
      /** Between lines, when `waits` says so: `goOn` plays the next one. */
      onwait?: (goOn: () => void) => void;
      /** Stop after each line for the learner to go on (Auto-advance off). */
      waits?: () => boolean;
    } = {},
  ): void {
    stop();
    const mine = epoch;
    let k = 0;

    const next = (): void => {
      if (mine !== epoch) return;
      const index = indices[k];
      k += 1;
      if (index === undefined) {
        ondone?.();
        return;
      }

      if (index !== last + 1) stage?.place(index);
      const go = (): void => {
        if (mine !== epoch) return;
        onsay?.(index);
        say(index, () => {
          if (mine !== epoch) return;
          last = index;
          if (k < indices.length && waits?.() && onwait) {
            onwait(() => {
              if (mine === epoch) next();
            });
            return;
          }
          timer = window.setTimeout(next, LINE_GAP_MS);
        });
      };
      const start = (): void => {
        if (mine !== epoch) return;
        if (holds?.(index) && onturn) onturn(index, go);
        else go();
      };
      const walking = stage?.ready(index) ?? 0;
      if (walking > 0) timer = window.setTimeout(start, walking);
      else start();
    };

    next();
  }

  /** A new chapter: no line from the last one left in the caption. */
  export function clear(): void {
    stop();
    shown = -1;
  }

  export function stop(): void {
    epoch += 1;
    window.clearTimeout(timer);
    stage?.stop();
    speaking = false;
  }

  /** The one Alex talks with answers the learner without words. */
  export function react(gesture: StickGestureId): void {
    if (partnerId) stage?.gesture(partnerId, gesture);
  }

  /** Alex says something that does not fit, in a bubble; the other one takes it in. */
  export function slip(text: string): void {
    if (learnerId) stage?.say(learnerId, text);
    react("puzzle");
  }

  /** Everyone on stage at the end of a chapter. */
  export function cheer(): void {
    for (const id of direction.cast) stage?.gesture(id as LessonCharacterId, "cheer");
  }

  function say(index: number, done: () => void): void {
    shown = index;
    speaking = true;
    cue += 1;
    stage?.play(index, () => {
      speaking = false;
      done();
    });
  }
</script>

<div
  class={cx(
    "mx-auto w-full transition-[max-width] duration-300 ease-out",
    compact && "max-w-[280px] sm:max-w-[300px] lg:max-w-none",
  )}
>
  <div
    class={cx(
      "relative overflow-hidden rounded-(--frame-radius) ring-1 ring-slate-200",
      // On a phone the playing stage runs edge to edge.
      !compact && "max-sm:rounded-none max-sm:ring-0",
    )}
  >
    <StickStage
      bind:this={stage}
      {direction}
      lines={scene.lines}
      {mood}
      setting={scene.setting}
      tall={!compact}
      {thingWords}
    />

    {#if onplay}
      <!-- A shaded band along the foot of the stage, as on a paused video: on its own the button sat on whatever was drawn there, a chair leg or a face. -->
      <button
        class={cx(
          "group absolute inset-x-0 bottom-0 flex cursor-pointer items-center gap-3 border-0 px-4 pt-12 pb-3 text-left",
          "bg-linear-to-t from-black/60 to-transparent text-white",
        )}
        type="button"
        data-lesson-play
        onclick={onplay}
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-full bg-white text-black transition-colors duration-150 ease-out group-hover:bg-white/85"
          aria-hidden="true"
        >
          <svg class="ml-0.5 size-5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>

        <span class="text-sm font-semibold">{playLabel}</span>
      </button>
    {:else if onpause}
      <button
        class={cx(
          "absolute bottom-3 left-4 grid size-11 cursor-pointer place-items-center rounded-full border-0",
          "bg-black/70 text-white shadow-(--shadow-float) transition-colors duration-150 ease-out hover:bg-black/85",
        )}
        type="button"
        aria-label="Pause after this line"
        onclick={onpause}
      >
        <svg class="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
        </svg>
      </button>
    {/if}
  </div>

  {#if captions && !compact}
    <!-- The caption's words are buttons, so a screen reader hears the line from a plain copy. -->
    <p class="sr-only" aria-live="polite">
      {#if caption}{caption.speaker}: {caption.slovak}{/if}
    </p>

    <div class="min-h-[4.5rem] pt-3 max-sm:px-4">
      {#if caption}
        {#key shown}
          <p
            class={cx(
              "m-0 mb-0.5 text-sm font-semibold",
              (caption.characterId && LOOKS[caption.characterId].nameClass) ||
                "text-slate-600",
            )}
          >
            {caption.speaker}
          </p>

          <SceneCaption
            clock={() => stage?.clock()}
            {cue}
            english={caption.english}
            marks={caption.marks}
            onthing={(id) => stage?.light(id)}
            plan={direction.lines[shown]?.plan}
            playing={speaking}
            {showEnglish}
            slovak={caption.slovak}
            things={direction.things}
          />
        {/key}
      {:else if hint}
        <h2 class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl">
          {hint.title}
        </h2>

        {#if hint.text}
          <p class="m-0 mt-1 text-slate-600">{hint.text}</p>
        {/if}
      {/if}
    </div>
  {/if}
</div>
