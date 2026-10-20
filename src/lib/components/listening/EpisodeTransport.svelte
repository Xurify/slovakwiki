<script lang="ts">
  import { chipClass, eyebrowMutedClass } from "$lib/components/ui/system-ui";

  /**
   * The bar that stays at the bottom while the chapters scroll past:
   * what is playing, previous / play / next, and the three listening toggles.
   */
  let {
    canNext,
    canPrev,
    chapterLabel,
    english,
    onenglish,
    onnext,
    onprev,
    onslow,
    ontoggle,
    ontranscript,
    playing,
    slow,
    statusLabel,
    transcript,
  }: {
    canNext: boolean;
    canPrev: boolean;
    chapterLabel: string;
    english: boolean;
    onenglish: () => void;
    onnext: () => void;
    onprev: () => void;
    onslow: () => void;
    ontoggle: () => void;
    ontranscript: () => void;
    playing: boolean;
    slow: boolean;
    statusLabel: string;
    transcript: boolean;
  } = $props();

  const skipButtonClass =
    "inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-300 bg-surface text-slate-700 shadow-(--shadow-border) transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-blue-700 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:bg-surface";
</script>

<div
  class="sticky bottom-3 z-30 rounded-(--frame-radius) bg-surface px-4 py-3 shadow-(--shadow-float) sm:px-5"
  role="group"
  aria-label="Episode player"
>
  <div class="flex items-center gap-3">
    <div class="min-w-0 flex-1">
      <p class="{eyebrowMutedClass} truncate" lang="sk">{chapterLabel}</p>

      <p
        class="m-0 mt-0.5 truncate text-sm font-semibold text-slate-900"
        aria-live="polite"
      >
        {statusLabel}
      </p>
    </div>

    <button
      class={skipButtonClass}
      type="button"
      aria-label="Previous line"
      disabled={!canPrev}
      onclick={onprev}
    >
      <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6 5.5h2.5v13H6ZM19 5.5v13L9.5 12Z" />
      </svg>
    </button>

    <button
      class="inline-grid size-14 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-cta text-cta-ink transition-[background-color,box-shadow] duration-150 ease-out hover:bg-cta-strong"
      type="button"
      aria-label={playing ? "Pause" : "Play"}
      aria-pressed={playing}
      onclick={ontoggle}
    >
      <svg class="size-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {#if playing}
          <rect x="6.5" y="5" width="4" height="14" rx="1" />
          <rect x="13.5" y="5" width="4" height="14" rx="1" />
        {:else}
          <path d="M8 5v14l11-7Z" />
        {/if}
      </svg>
    </button>

    <button
      class={skipButtonClass}
      type="button"
      aria-label="Next line"
      disabled={!canNext}
      onclick={onnext}
    >
      <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M15.5 5.5H18v13h-2.5ZM5 5.5v13l9.5-6.5Z" />
      </svg>
    </button>
  </div>

  <div class="mt-3 flex flex-wrap gap-1.5">
    <button
      class={chipClass(slow)}
      type="button"
      aria-pressed={slow}
      title="Play every line a little slower"
      onclick={onslow}
    >
      Slow
    </button>

    <button
      class={chipClass(transcript)}
      type="button"
      aria-pressed={transcript}
      title="Show the transcript while listening"
      onclick={ontranscript}
    >
      Transcript
    </button>

    <button
      class={chipClass(english)}
      type="button"
      aria-pressed={english}
      title="Show English under every line"
      onclick={onenglish}
    >
      English
    </button>
  </div>
</div>
