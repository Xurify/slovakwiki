<script lang="ts">
  import type { Snippet } from "svelte";

  import SfxMuteToggle from "$lib/audio/SfxMuteToggle.svelte";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";
  import type { LessonChapter } from "$lib/learning/lesson-steps";
  import { iconButtonClass, iconButtonToneClass } from "$lib/components/ui/system-ui";

  /**
   * The strip above a lesson or practice session: close, title and track,
   * step counter, controls, and one segment per step. Graded segments carry
   * their result; otherwise everything up to the current step is filled.
   */
  let {
    activeIndex = 0,
    backHref,
    chapters,
    currentDone = false,
    backLabel = "Practice",
    closeLabel,
    complete = false,
    controls,
    class: className = "mb-5",
    onselect,
    progressLabel = "Progress",
    results = [],
    subtitle,
    title,
    titleTag = "p",
    total,
    viewIndex,
  }: {
    activeIndex?: number;
    backHref?: string;
    backLabel?: string;
    /**
     * One piece of the bar per chapter, filling as its steps are done, in
     * place of one per step: twenty-odd equal dashes read as a long haul.
     */
    chapters?: readonly LessonChapter[];
    /** The step at `activeIndex` is finished (answered, or its lines played), so its chapter counts it. */
    currentDone?: boolean;
    /** Accessible name of the close link; defaults to "Back to {backLabel}". */
    closeLabel?: string;
    complete?: boolean;
    /** Extra icon buttons before the sound toggle. */
    controls?: Snippet;
    class?: string;
    /** Makes segments up to `activeIndex` buttons that jump back to that step. */
    onselect?: (index: number) => void;
    progressLabel?: string;
    results?: readonly (AnswerGrade | "revealed")[];
    subtitle?: string;
    title?: string;
    /** Lesson dialogs have no other h1. Practice keeps its question as the h1. */
    titleTag?: "h1" | "p";
    total: number;
    /** Step on screen when reviewing behind `activeIndex`; defaults to it. */
    viewIndex?: number;
  } = $props();

  const segments = $derived(
    Array.from({ length: Math.max(total, 0) }, (_, index) => index),
  );
  const shownIndex = $derived(viewIndex ?? activeIndex);
  const displayIndex = $derived(complete ? total : Math.min(shownIndex + 1, total));
  const correctCount = $derived(
    results.filter((grade) => grade === "correct" || grade === "accents").length,
  );
  const chapterAt = $derived(
    chapters?.findIndex(
      (chapter) => shownIndex >= chapter.start && shownIndex < chapter.start + chapter.length,
    ) ?? -1,
  );
  const progressText = $derived(
    complete ? `${correctCount} of ${total} correct` : `${displayIndex} of ${total}`,
  );

  function segmentClass(index: number): string {
    const grade = results[index];
    if (grade === "correct") return "bg-emerald-600";
    if (grade === "accents") return "bg-emerald-400";
    if (grade === "incorrect" || grade === "revealed") return "bg-rose-400";
    if (!complete && index <= shownIndex) return "bg-blue-600";
    if (!complete && index <= activeIndex) return "bg-blue-600/35";
    return "bg-slate-200";
  }

  const segmentBarClass =
    "h-1.5 min-w-0 flex-1 rounded-full transition-[background-color,opacity] duration-300";
  const segmentButtonClass =
    "group -my-2 flex min-h-11 min-w-0 flex-1 cursor-pointer items-center border-0 bg-transparent py-2";
</script>

<header class="grid gap-3.5 {className}">
  <div class="flex min-w-0 items-center gap-3">
    {#if backHref}
      <a
        class="{iconButtonClass} {iconButtonToneClass} -ml-1.5 size-11"
        href={backHref}
        aria-label={closeLabel ?? `Back to ${backLabel}`}
      >
        <svg
          class="size-5 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </a>
    {/if}

    <div class="min-w-0 flex-1">
      {#if title}
        <svelte:element
          this={titleTag}
          class="m-0 truncate font-serif text-base font-semibold leading-snug text-slate-900"
        >
          {title}
        </svelte:element>
      {/if}

      {#if subtitle}
        <p class="m-0 truncate text-xs leading-snug text-slate-500">{subtitle}</p>
      {/if}
    </div>

    <p
      class="m-0 shrink-0 text-xs font-semibold tabular-nums text-slate-500"
      aria-hidden="true"
    >
      {#if chapters}
        {complete ? chapters.length : chapterAt + 1} / {chapters.length}
      {:else}
        {displayIndex} / {total}
      {/if}
    </p>

    <div class="-mr-1.5 flex shrink-0 items-center gap-0.5">
      {#if controls}
        {@render controls()}
      {/if}

      <SfxMuteToggle />
    </div>
  </div>

  {#if chapters}
    <nav class="flex items-center gap-1.5" aria-label={progressLabel}>
      {#each chapters as chapter, index (chapter.start)}
        {@const done = complete
          ? 1
          : Math.min(
              Math.max((activeIndex - chapter.start + (currentDone ? 1 : 0)) / chapter.length, 0),
              1,
            )}
        {@const reached = chapter.start <= activeIndex}

        <button
          class={segmentButtonClass}
          type="button"
          disabled={!reached || !onselect}
          aria-label="{chapter.title}, part {index + 1} of {chapters.length}"
          aria-current={index === chapterAt ? "step" : undefined}
          onclick={() =>
            onselect?.(
              activeIndex >= chapter.start && activeIndex < chapter.start + chapter.length
                ? activeIndex
                : chapter.start,
            )}
        >
          <span class="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <span
              class="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
              style:width="{done * 100}%"
            ></span>
          </span>
        </button>
      {/each}
    </nav>
  {:else if onselect}
    <nav class="flex items-center gap-1" aria-label={progressLabel}>
      {#each segments as index (index)}
        {#if index <= activeIndex}
          <button
            class={segmentButtonClass}
            type="button"
            aria-label="Step {index + 1} of {total}"
            aria-current={index === shownIndex ? "step" : undefined}
            onclick={() => onselect(index)}
          >
            <span class="{segmentBarClass} {segmentClass(index)} group-hover:opacity-70"
            ></span>
          </button>
        {:else}
          <span class="{segmentBarClass} {segmentClass(index)}" aria-hidden="true"></span>
        {/if}
      {/each}
    </nav>
  {:else}
    <div
      class="flex gap-1"
      role="progressbar"
      aria-label={progressLabel}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={complete ? total : Math.min(displayIndex, total)}
      aria-valuetext={progressText}
    >
      {#each segments as index (index)}
        <span class="{segmentBarClass} {segmentClass(index)}"></span>
      {/each}
    </div>
  {/if}
</header>
