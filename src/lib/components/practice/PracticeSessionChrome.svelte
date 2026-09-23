<script lang="ts">
  import SfxMuteToggle from "$lib/audio/SfxMuteToggle.svelte";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";

  let {
    activeIndex = 0,
    backHref,
    backLabel = "Practice",
    complete = false,
    results = [],
    subtitle,
    title,
    total,
  }: {
    activeIndex?: number;
    backHref?: string;
    backLabel?: string;
    complete?: boolean;
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
    complete
      ? `${correctCount} of ${total} correct`
      : `Question ${displayIndex} of ${total}`,
  );

  function segmentClass(index: number): string {
    const grade = results[index];
    if (grade === "correct") return "bg-emerald-600";
    if (grade === "accents") return "bg-emerald-400";
    if (grade === "incorrect" || grade === "revealed") return "bg-rose-400";
    if (!complete && index === activeIndex) return "bg-blue-600";
    return "bg-slate-200";
  }
</script>

<header class="mb-5 grid gap-3.5">
  <div class="flex items-center gap-3">
    {#if backHref}
      <a
        class="-ml-1.5 inline-grid size-9 shrink-0 place-items-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-subtle hover:text-slate-800 active:scale-[0.96]"
        href={backHref}
        aria-label={`Back to ${backLabel}`}
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

    <SfxMuteToggle />
  </div>

  <div
    class="flex gap-1"
    role="progressbar"
    aria-label="Practice progress"
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
