<script module lang="ts">
  /** Where a run of lines is, as a video player shows it. */
  export type StageStatus = "idle" | "playing" | "paused" | "waiting" | "turn" | "done";
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { freezePlayClock, playClockTimeout, thawPlayClock } from "$lib/audio/play-clock";
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import SceneCaption from "$lib/components/stick-figure/SceneCaption.svelte";
  import StickStage from "$lib/components/stick-figure/StickStage.svelte";
  import { LINE_GAP_MS } from "$lib/listening/line-player.svelte";
  import { setStoryShowEnglish } from "$lib/lesson-story/prefs";
  import { pauseStoryLineAudio, resumeStoryLineAudio } from "$lib/lesson-story/story-audio";
  import type { StickGestureId } from "$lib/stick-figure/gestures";
  import { LOOKS } from "$lib/stick-figure/looks";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import { sceneMood } from "$lib/stick-figure/scene-mood";
  import { cx } from "$lib/ui/classes";

  /**
   * The lesson's scene on the stick-figure stage, there for the whole lesson.
   * While a chapter's lines play it works like a video: play and pause (the
   * voice, the mouths and the moves all hold), a line again, a jump to any
   * line, English under the line, and a slower speed. Between chapters it is
   * small and the cast reacts to the learner's answers.
   */
  let {
    compact = false,
    hint,
    onstart,
    scene,
    showEnglish = false,
    status = $bindable("idle"),
    thingWords = {},
  }: {
    /** Smaller while the learner reads or answers beside or under it. */
    compact?: boolean;
    /** In the caption's place before any line is said: the chapter's title and what to do. */
    hint?: { text?: string; title: string };
    /** The play button before the first line: the parent starts the chapter's run. */
    onstart?: () => void;
    scene: Scene;
    showEnglish?: boolean;
    status?: StageStatus;
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  interface RunOptions {
    holds?: (index: number) => boolean;
    ondone?: () => void;
    onturn?: (index: number, go: () => void) => void;
    /** Stop after each line until the learner goes on (Auto-advance off). */
    waits?: () => boolean;
  }

  let stage = $state<ReturnType<typeof StickStage>>();
  /** The line in the caption. */
  let shown = $state(-1);
  let speaking = $state(false);
  let cue = $state(0);
  /** Lines of the run on screen, and the one it is at. */
  let lines = $state<readonly number[]>([]);
  let at = $state(-1);
  let rate = $state(1);
  let options: RunOptions = {};
  /** The line last played to its end, so the next one in order needs no jump. */
  let last = -1;
  /** Cancels the wait before the next line or for a walk to end; it runs on play time, so a pause holds it. */
  let cancel: (() => void) | undefined;
  /** What goes on when a wait between lines ends (Auto-advance off). */
  let goOn: (() => void) | undefined;
  /** Bumped by every run, jump and stop, so a stale callback does nothing. */
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
  const controls = $derived(!compact && status !== "idle");

  $effect(
    () => () =>
      untrack(() => {
        halt();
        stage?.stop();
      }),
  );

  /**
   * Play `indices` in order. Before a line `holds` is true for, stop and hand
   * it to `onturn` with a `go` that says it and goes on.
   */
  export function run(indices: readonly number[], runOptions: RunOptions = {}): void {
    stop();
    lines = indices;
    options = runOptions;
    playFrom(0);
  }

  /** Play or pause, as the space bar does on a video. */
  export function toggle(): void {
    if (status === "playing") pause();
    else if (status === "paused") resume();
    else if (status === "waiting") goOnNow();
    else if (status === "done") playFrom(0);
  }

  /** The next line, when the scene waits for the learner between lines. */
  export function goOnNow(): void {
    if (status !== "waiting" || !goOn) return;
    const next = goOn;
    goOn = undefined;
    status = "playing";
    next();
  }

  /** A new chapter: nothing playing, no line from the last one in the caption. */
  export function clear(): void {
    stop();
    lines = [];
    at = -1;
    shown = -1;
    status = "idle";
  }

  export function stop(): void {
    halt();
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

  function halt(): void {
    epoch += 1;
    cancel?.();
    cancel = undefined;
    goOn = undefined;
    if (status === "paused") thaw();
  }

  function pause(): void {
    if (status !== "playing") return;
    status = "paused";
    freezePlayClock();
    pauseStoryLineAudio();
    stage?.freeze();
  }

  function resume(): void {
    if (status !== "paused") return;
    status = "playing";
    thaw();
  }

  function thaw(): void {
    thawPlayClock();
    resumeStoryLineAudio();
    stage?.thaw();
  }

  /** From line `k` of the run on, everyone put where that line finds them. */
  function playFrom(k: number): void {
    stop();
    status = "playing";
    step(k, epoch);
  }

  function step(k: number, mine: number): void {
    if (mine !== epoch) return;
    const index = lines[k];
    at = k;
    if (index === undefined) {
      status = "done";
      options.ondone?.();
      return;
    }

    if (index !== last + 1) stage?.place(index);
    const go = (): void => {
      if (mine !== epoch) return;
      status = "playing";
      say(index, () => {
        if (mine !== epoch) return;
        last = index;
        if (k + 1 < lines.length && options.waits?.()) {
          status = "waiting";
          goOn = () => step(k + 1, mine);
          return;
        }
        cancel = playClockTimeout(() => step(k + 1, mine), LINE_GAP_MS / rate);
      });
    };
    const start = (): void => {
      if (mine !== epoch) return;
      if (options.holds?.(index) && options.onturn) {
        status = "turn";
        options.onturn(index, go);
      } else {
        go();
      }
    };
    const walking = stage?.ready(index) ?? 0;
    if (walking > 0) cancel = playClockTimeout(start, walking);
    else start();
  }

  function say(index: number, done: () => void): void {
    shown = index;
    speaking = true;
    cue += 1;
    stage?.play(
      index,
      () => {
        speaking = false;
        done();
      },
      rate,
    );
  }

  function toggleEnglish(): void {
    setStoryShowEnglish(showEnglish ? "off" : "on");
  }
</script>

<div
  class={cx(
    "mx-auto w-full transition-[max-width] duration-300 ease-out",
    compact && "max-w-[280px] sm:max-w-[300px] lg:max-w-none",
  )}
>
  <!--
    Small, the stage is a picture of the scene beside the step: its things are not tappable there,
    since their word cards were clipped by the small frame.
  -->
  <div
    class={cx(
      "group/stage relative overflow-hidden rounded-(--frame-radius) ring-1 ring-slate-200",
      compact && "pointer-events-none",
      // On a phone the playing stage runs edge to edge.
      !compact && "max-sm:rounded-none max-sm:ring-0",
    )}
    inert={compact || undefined}
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

    {#if !compact && status === "idle" && onstart}
      <!-- A paused video's poster: the scene dimmed a little, one large play in the middle. -->
      <button
        class="group absolute inset-0 grid cursor-pointer place-items-center border-0 bg-black/15 transition-colors duration-150 ease-out hover:bg-black/25"
        type="button"
        aria-label="Play the scene"
        data-lesson-play
        onclick={onstart}
      >
        <span
          class="grid size-16 place-items-center rounded-full bg-white/95 text-black shadow-(--shadow-float) transition-transform duration-150 ease-out group-hover:bg-white sm:size-20"
          aria-hidden="true"
        >
          <svg class="ml-1 size-7 fill-current sm:size-8" viewBox="0 0 24 24">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
      </button>
    {/if}

    {#if controls}
      <!--
        The player's bar, over the foot of the stage. While the scene plays it fades out until the
        pointer comes over the stage; paused, waiting or done it stays. On a touch screen it stays.
      -->
      <div
        class={cx(
          "absolute inset-x-0 bottom-0 flex items-center gap-1 bg-linear-to-t from-black/70 via-black/35 to-transparent px-2 pt-10 pb-2 text-white sm:gap-2 sm:px-3",
          "transition-opacity duration-200 ease-out",
          status === "playing" &&
            "opacity-0 group-hover/stage:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100",
        )}
      >
        <button
          class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-white hover:bg-white/15"
          type="button"
          disabled={status === "turn"}
          aria-label={status === "playing"
            ? "Pause"
            : status === "waiting"
              ? "Next line"
              : status === "done"
                ? "Play the lines again"
                : "Play"}
          onclick={toggle}
        >
          {#if status === "playing"}
            <svg class="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
            </svg>
          {:else if status === "done"}
            <svg
              class="size-5 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          {:else}
            <svg class="ml-0.5 size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          {/if}
        </button>

        <button
          class="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-white hover:bg-white/15 disabled:opacity-40"
          type="button"
          aria-label="This line again"
          disabled={at < 0 || status === "turn" || status === "done"}
          onclick={() => playFrom(Math.max(at, 0))}
        >
          <svg class="size-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 14 4 9l5-5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M4 9h11a5 5 0 0 1 0 10h-3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <!-- One mark per line of the chapter: the ones said are filled, and each jumps to its line. -->
        <ol class="m-0 flex min-w-0 flex-1 list-none items-center gap-1 p-0 px-1" aria-label="Lines">
          {#each lines as index, k (index)}
            <li class="flex min-w-0 flex-1">
              <button
                class="group/mark flex h-8 w-full cursor-pointer items-center border-0 bg-transparent p-0 disabled:cursor-default"
                type="button"
                aria-label="Line {k + 1} of {lines.length}"
                aria-current={k === at ? "step" : undefined}
                disabled={status === "turn"}
                onclick={() => playFrom(k)}
              >
                <span
                  class={cx(
                    "h-1 w-full rounded-full transition-colors duration-150 ease-out group-hover/mark:h-1.5",
                    k < at || status === "done"
                      ? "bg-white"
                      : k === at
                        ? "bg-white/80"
                        : "bg-white/30",
                  )}
                ></span>
              </button>
            </li>
          {/each}
        </ol>

        <button
          class={cx(
            "h-8 shrink-0 cursor-pointer rounded-(--control-radius) border-0 px-2 text-xs font-bold text-white hover:bg-white/15",
            showEnglish ? "bg-white/20" : "bg-transparent",
          )}
          type="button"
          aria-pressed={showEnglish}
          aria-label="English under the line"
          onclick={toggleEnglish}
        >
          EN
        </button>

        <button
          class="h-8 w-12 shrink-0 cursor-pointer rounded-(--control-radius) border-0 bg-transparent px-1 text-xs font-bold text-white tabular-nums hover:bg-white/15"
          type="button"
          aria-label={rate === 1 ? "Slower" : "Normal speed"}
          onclick={() => {
            rate = rate === 1 ? 0.75 : 1;
          }}
        >
          {rate === 1 ? "1×" : "0.75×"}
        </button>
      </div>
    {/if}
  </div>

  {#if !compact}
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
