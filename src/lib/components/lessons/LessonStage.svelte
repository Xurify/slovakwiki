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
    scene,
    showEnglish = false,
    thingWords = {},
  }: {
    /** The line being said, under the stage. */
    captions?: boolean;
    /** Smaller while the learner reads or answers below it. */
    compact?: boolean;
    /** In the caption's place before any line is said. */
    hint?: string;
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
    compact ? "max-w-[220px] sm:max-w-[300px] lg:max-w-none" : "max-w-[960px]",
  )}
>
  <div class="overflow-hidden rounded-(--frame-radius) ring-1 ring-slate-200">
    <StickStage
      bind:this={stage}
      {direction}
      lines={scene.lines}
      {mood}
      setting={scene.setting}
      tall={!compact}
      {thingWords}
    />
  </div>

  {#if captions && !compact}
    <div class="min-h-[4.5rem] px-1 pt-3" aria-live="polite">
      {#if caption}
        <div>
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
        </div>
      {:else if hint}
        <p class="m-0 text-slate-600">{hint}</p>
      {/if}
    </div>
  {/if}
</div>
