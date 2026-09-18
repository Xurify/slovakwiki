<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PracticeSetPoster from "$lib/components/practice/PracticeSetPoster.svelte";

  let { sheet }: { sheet: PracticeHubSheet } = $props();
</script>

<li>
  <a
    class="group grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-4 px-4 py-4 no-underline min-[700px]:grid-cols-[7rem_minmax(0,1fr)_auto]"
    href="/practice/{sheet.set.id}"
  >
    <PracticeSetPoster {sheet} size="thumb" />

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
        <span data-sheet-done={sheet.set.lessonId}></span>
      </p>
    </div>

    <span
      class="inline-flex min-h-11 w-fit items-center justify-center rounded-(--control-radius) bg-blue-600 px-4 font-sans font-bold text-paper transition-[background-color] duration-150 ease-out group-hover:bg-blue-700 max-[699px]:col-start-2"
      data-sheet-cta={sheet.set.lessonId}
    >
      Start now
    </span>
  </a>
</li>
