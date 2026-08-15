<script lang="ts">
  import SfxMuteToggle from "$lib/components/chrome/SfxMuteToggle.svelte";
  import LessonStorySettings from "$lib/components/lessons/LessonStorySettings.svelte";

  let {
    backHref,
    progressPercent,
    stepCount,
    stepIndex,
  }: {
    backHref: string;
    progressPercent: number;
    stepCount: number;
    stepIndex: number;
  } = $props();
</script>

<header class="relative z-30 shrink-0 border-b border-slate-200 bg-paper">
  <div class="flex items-center gap-3 px-4 py-3 sm:px-8">
    <a
      class="inline-grid size-9 shrink-0 place-items-center rounded-full text-slate-500 transition-[background-color,color,transform] duration-150 hover:bg-subtle hover:text-slate-800 active:scale-[0.96]"
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

    <div
      class="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progressPercent)}
      aria-label="Lesson progress"
    >
      <span
        class="block h-full rounded-full bg-blue-600 transition-[width] duration-300 ease-out"
        style:width="{progressPercent}%"
      ></span>
    </div>

    <p class="m-0 shrink-0 text-xs tabular-nums text-slate-500">
      {Math.min(stepIndex + 1, stepCount)} / {stepCount}
    </p>

    <div class="flex shrink-0 items-center gap-1.5">
      <LessonStorySettings />
      <SfxMuteToggle />
    </div>
  </div>
</header>
