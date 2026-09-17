<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";
  import PracticeMotifField from "$lib/components/practice/PracticeMotifField.svelte";

  let { sheet }: { sheet: PracticeHubSheet } = $props();
</script>

<li>
  <a
    class="group flex h-full items-stretch gap-4 rounded-(--frame-radius) bg-surface/80 p-5 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-1 hover:bg-surface hover:shadow-(--shadow-border-hover) active:scale-[0.98] max-[600px]:gap-3 max-[600px]:p-4"
    href="/practice/{sheet.set.id}"
  >
    <div class="flex min-w-0 flex-1 flex-col">
      <PracticeDrillLine slovak={sheet.drill.slovak} />

      {#if sheet.drill.english}
        <p class="m-0 mt-2 text-sm text-pretty text-slate-500">
          {sheet.drill.english}
        </p>
      {/if}

      <div class="mt-5 border-t border-slate-200 pt-4">
        <strong class="font-serif text-base tracking-tight text-blue-800">
          {sheet.set.title}
        </strong>
        <p class="m-0 mt-1 text-sm leading-relaxed text-pretty text-slate-600">
          {sheet.purpose}
        </p>
      </div>

      <div class="mt-auto flex items-center justify-between gap-3 pt-5 text-sm">
        <span class="tabular-nums text-slate-500">
          {sheet.exerciseCount}
          {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
          <span data-sheet-done={sheet.set.lessonId}></span>
        </span>

        <span
          class="inline-flex items-center gap-1.5 font-bold text-blue-800 transition-transform duration-200 ease-out group-hover:translate-x-1"
        >
          Drill
          <ArrowRight />
        </span>
      </div>
    </div>

    <PracticeMotifField setId={sheet.set.id} lessonId={sheet.set.lessonId} />
  </a>
</li>
