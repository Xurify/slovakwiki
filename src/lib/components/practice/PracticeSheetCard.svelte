<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PracticeSetPoster from "$lib/components/practice/PracticeSetPoster.svelte";
  import PracticeTaskChips from "$lib/components/practice/PracticeTaskChips.svelte";

  let {
    sheet,
    next = false,
  }: {
    sheet: PracticeHubSheet;
    /** SSR guess; the boot repaints from storage before first paint. */
    next?: boolean;
  } = $props();

  const cardClass =
    "group grid h-full grid-cols-[4.5rem_minmax(0,1fr)] gap-4 rounded-(--frame-radius) bg-surface/80 p-4 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)";
</script>

<li
  class="min-w-0"
  data-browse-sheet={sheet.set.id}
  data-browse-lesson={sheet.set.lessonId}
  data-exercise-count={sheet.exerciseCount}
>
  <a class={cardClass} href="/practice/{sheet.set.id}">
    <PracticeSetPoster {sheet} />

    <div class="flex min-w-0 flex-col gap-1.5">
      <div class="flex items-start justify-between gap-3">
        <strong
          class="font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
        >
          {sheet.set.title}
        </strong>

        <span class="flex shrink-0 items-center gap-1.5">
          <span
            class="inline-flex min-h-6 items-center rounded-full bg-blue-600 px-2.5 text-[0.66rem] font-bold tracking-[0.06em] text-paper uppercase"
            data-browse-next
            hidden={!next}
          >
            Up next
          </span>

          <span
            class="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
            data-browse-done
            hidden
          >
            <svg class="size-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3.5 8.5 6.5 11.5 12.5 4.5"
                stroke="currentColor"
                stroke-width="2.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span class="sr-only">Lesson completed</span>
          </span>
        </span>
      </div>

      <p class="m-0 line-clamp-2 text-sm leading-relaxed text-pretty text-slate-600">
        {sheet.purpose}
      </p>

      <div class="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1.5">
        <p class="m-0 text-xs tabular-nums text-slate-500">
          {sheet.exerciseCount}
          {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          ~{sheet.minutes} min
        </p>

        <PracticeTaskChips kinds={sheet.taskKinds} />
      </div>
    </div>
  </a>
</li>
