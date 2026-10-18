<script lang="ts">
  import type { Snippet } from "svelte";

  import SfxMuteToggle from "$lib/audio/SfxMuteToggle.svelte";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";
  import { iconButtonClass, iconButtonToneClass } from "$lib/components/ui/system-ui";

  /**
   * The strip above a lesson or practice session: close, title and track,
   * step counter, controls, and one segment per step. Graded segments carry
   * their result; otherwise everything up to the current step is filled.
   */
  let {
    activeIndex = 0,
    backHref,
    backLabel = "Practice",
    closeLabel,
    complete = false,
    controls,
    class: className = "mb-5",
    progressLabel = "Progress",
    results = [],
    subtitle,
    title,
    total,
  }: {
    activeIndex?: number;
    backHref?: string;
    backLabel?: string;
    /** Accessible name of the close link; defaults to "Back to {backLabel}". */
    closeLabel?: string;
    complete?: boolean;
    /** Extra icon buttons before the sound toggle. */
    controls?: Snippet;
    class?: string;
    progressLabel?: string;
    results?: readonly (AnswerGrade | "revealed")[];
    subtitle?: string;
    title?: string;
    total: number;
  } = $props();

  const segments = $derived(
    Array.from({ length: Math.max(total, 0) }, (_, index) => index),
  );
  const displayIndex = $derived(complete ? total : Math.min(activeIndex + 1, total));
  const correctCount = $derived(
    results.filter((grade) => grade === "correct" || grade === "accents").length,
  );
  const progressText = $derived(
    complete ? `${correctCount} of ${total} correct` : `${displayIndex} of ${total}`,
  );

  function segmentClass(index: number): string {
    const grade = results[index];
    if (grade === "correct") return "bg-emerald-600";
    if (grade === "accents") return "bg-emerald-400";
    if (grade === "incorrect" || grade === "revealed") return "bg-rose-400";
    if (!complete && index <= activeIndex) return "bg-blue-600";
    return "bg-slate-200";
  }
</script>

<header class="grid gap-3.5 {className}">
  <div class="flex min-w-0 items-center gap-3">
    {#if backHref}
      <a
        class="{iconButtonClass} {iconButtonToneClass} -ml-1.5 size-9"
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
        <p
          class="m-0 truncate font-serif text-base font-semibold leading-snug text-slate-900"
        >
          {title}
        </p>
      {/if}

      {#if subtitle}
        <p class="m-0 truncate text-xs leading-snug text-slate-500">{subtitle}</p>
      {/if}
    </div>

    <p
      class="m-0 shrink-0 text-xs font-semibold tabular-nums text-slate-500"
      aria-hidden="true"
    >
      {displayIndex} / {total}
    </p>

    <div class="-mr-1.5 flex shrink-0 items-center gap-0.5">
      {#if controls}
        {@render controls()}
      {/if}

      <SfxMuteToggle />
    </div>
  </div>

  <div
    class="flex gap-1"
    role="progressbar"
    aria-label={progressLabel}
    aria-valuemin={0}
    aria-valuemax={total}
    aria-valuenow={complete ? total : activeIndex}
    aria-valuetext={progressText}
  >
    {#each segments as index (index)}
      <span
        class="h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300 {segmentClass(
          index,
        )}"
      ></span>
    {/each}
  </div>
</header>
