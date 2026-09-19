<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PracticeSetPoster from "$lib/components/practice/PracticeSetPoster.svelte";

  let {
    sheet,
    hidden = false,
  }: {
    sheet: PracticeHubSheet;
    hidden?: boolean;
  } = $props();
</script>

<li data-browse-sheet={sheet.set.id} data-exercise-count={sheet.exerciseCount} {hidden}>
  <a
    class="group grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 px-4 py-4 no-underline"
    href="/practice/{sheet.set.id}"
  >
    <PracticeSetPoster {sheet} />

    <div class="min-w-0">
      <strong
        class="font-serif text-base tracking-tight text-slate-900 underline-offset-2 group-hover:underline sm:text-lg"
      >
        {sheet.set.title}
      </strong>
      <p class="m-0 mt-1 text-sm leading-relaxed text-pretty text-slate-600">
        {sheet.purpose}
      </p>
      <p class="m-0 mt-2 text-xs tabular-nums text-slate-500">
        {sheet.exerciseCount}
        {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
      </p>
    </div>
  </a>
</li>
