<script lang="ts">
  import SfxMuteToggle from "$lib/audio/SfxMuteToggle.svelte";
  import LessonStorySettings from "$lib/components/lessons/LessonStorySettings.svelte";

  let {
    backHref,
    stepCount,
    stepIndex,
    subtitle,
    title,
  }: {
    backHref: string;
    stepCount: number;
    stepIndex: number;
    subtitle?: string;
    title: string;
  } = $props();

  const segments = $derived(Array.from({ length: Math.max(stepCount, 0) }, (_, i) => i));
  const displayIndex = $derived(Math.min(stepIndex + 1, stepCount));

  function segmentClass(index: number): string {
    if (index < stepIndex) return "bg-blue-600";
    if (index === stepIndex) return "bg-blue-300";
    return "bg-slate-200";
  }
</script>

<header class="relative z-30 shrink-0 border-b border-slate-200 bg-paper">
  <div class="mx-auto grid w-full max-w-2xl gap-3 px-4 py-3 sm:px-8">
    <div class="flex items-center gap-3">
      <a
        class="-ml-1.5 inline-grid size-9 shrink-0 place-items-center rounded-(--control-radius) text-slate-500 transition-colors duration-150 ease-out hover:bg-subtle hover:text-slate-800"
        href={backHref}
        aria-label="Close lesson"
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

      <div class="min-w-0 flex-1">
        <p
          class="m-0 truncate font-serif text-base font-semibold leading-snug text-slate-900"
        >
          {title}
        </p>

        {#if subtitle}
          <p class="m-0 truncate text-xs leading-snug text-slate-500">{subtitle}</p>
        {/if}
      </div>

      <p
        class="m-0 shrink-0 text-xs font-semibold tabular-nums text-slate-500"
        aria-hidden="true"
      >
        {displayIndex} / {stepCount}
      </p>

      <div class="-mr-1.5 flex shrink-0 items-center gap-0.5">
        <LessonStorySettings />
        <SfxMuteToggle />
      </div>
    </div>

    <div
      class="flex gap-1"
      role="progressbar"
      aria-label="Lesson progress"
      aria-valuemin={0}
      aria-valuemax={stepCount}
      aria-valuenow={stepIndex}
      aria-valuetext={`Step ${displayIndex} of ${stepCount}`}
    >
      {#each segments as index (index)}
        <span
          class="h-1.5 min-w-0 flex-1 rounded-full transition-colors duration-300 {segmentClass(
            index,
          )}"
        ></span>
      {/each}
    </div>
  </div>
</header>
