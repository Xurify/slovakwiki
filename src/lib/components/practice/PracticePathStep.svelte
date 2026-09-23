<script lang="ts">
  import type { PracticeHubSheet, PracticeStepState } from "$lib/catalog/practice/hub";
  import PracticeSetPoster from "$lib/components/practice/PracticeSetPoster.svelte";
  import { cx } from "$lib/ui/classes";

  let {
    sheet,
    step,
    state = "todo",
  }: {
    sheet: PracticeHubSheet;
    step: number;
    /** SSR guess; the hub boot rewrites `data-state` from storage before first paint. */
    state?: PracticeStepState;
  } = $props();

  const railClass =
    "absolute left-[1.125rem] w-0.5 -translate-x-1/2 bg-slate-200 group-data-[state=done]/step:bg-emerald-100";

  const nodeClass = cx(
    "relative z-10 flex size-9 items-center justify-center self-center rounded-full border-2",
    "border-slate-300 bg-surface font-serif text-sm font-semibold tabular-nums text-slate-500",
    "group-data-[state=next]/step:border-blue-600 group-data-[state=next]/step:bg-blue-600 group-data-[state=next]/step:text-paper",
    "group-data-[state=done]/step:border-emerald-100 group-data-[state=done]/step:bg-emerald-100 group-data-[state=done]/step:text-emerald-700",
  );

  const cardClass = cx(
    "group grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 rounded-(--frame-radius)",
    "border-2 border-transparent bg-surface/80 px-3 py-3 no-underline shadow-(--shadow-border)",
    "transition-[background-color,box-shadow,border-color] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)",
    "group-data-[state=next]/step:border-blue-600 group-data-[state=next]/step:bg-surface",
    "max-[480px]:grid-cols-[minmax(0,1fr)_auto]",
  );
</script>

<li
  class="group/step relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3.5"
  data-browse-sheet={sheet.set.id}
  data-browse-lesson={sheet.set.lessonId}
  data-state={state}
>
  <span class="{railClass} top-0 h-1/2 group-first/step:hidden" aria-hidden="true"></span>

  <span class="{railClass} top-1/2 -bottom-3 group-last/step:hidden" aria-hidden="true"
  ></span>

  <span class={nodeClass} aria-hidden="true">
    <span class="group-data-[state=done]/step:hidden">{step}</span>

    <svg
      class="hidden size-4 group-data-[state=done]/step:block"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        stroke-width="2.25"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>

  <a class={cardClass} href="/practice/{sheet.set.id}">
    <span class="max-[480px]:hidden">
      <PracticeSetPoster {sheet} />
    </span>

    <span class="min-w-0">
      <strong
        class="block font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
      >
        {sheet.set.title}
      </strong>

      <span
        class="mt-0.5 line-clamp-2 block text-sm leading-snug text-pretty text-slate-500"
      >
        {sheet.purpose}
      </span>

      <span class="mt-1.5 block text-xs tabular-nums text-slate-500">
        {sheet.exerciseCount}
        {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        about {sheet.minutes} min
        <span class="sr-only hidden group-data-[state=done]/step:block">
          — lesson done
        </span>
      </span>
    </span>

    <span
      class="hidden min-h-8 items-center rounded-(--control-radius) bg-blue-600 px-3.5 text-xs font-bold text-paper group-data-[state=next]/step:inline-flex"
    >
      Start
    </span>
  </a>
</li>
