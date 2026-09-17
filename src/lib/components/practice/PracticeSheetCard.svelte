<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";
  import PracticeMotifField from "$lib/components/practice/PracticeMotifField.svelte";
  import { practiceMotifId } from "$lib/catalog/practice/motifs";

  let { sheet }: { sheet: PracticeHubSheet } = $props();

  const motif = $derived(practiceMotifId(sheet.set.id, sheet.set.lessonId));
  const pipCount = $derived(Math.min(sheet.exerciseCount, 4));
</script>

<li>
  <a
    class="group flex h-full overflow-hidden rounded-(--frame-radius) bg-surface/80 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover) max-[520px]:flex-col"
    href="/practice/{sheet.set.id}"
  >
    <PracticeMotifField {motif} slovak={sheet.drill.slovak} />

    <div class="flex min-w-0 flex-1 flex-col p-5 max-[600px]:p-4">
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
        <span class="flex items-center gap-2.5 text-slate-500">
          <span
            class="h-1.5 w-[calc(var(--pips)*10px-4px)] bg-[repeating-linear-gradient(90deg,var(--color-blue-700)_0_6px,transparent_6px_10px)]"
            style:--pips={pipCount}
            aria-hidden="true"
          ></span>
          <span>
            {sheet.exerciseCount}
            {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
            <span data-sheet-done={sheet.set.lessonId}></span>
          </span>
        </span>

        <span class="inline-flex items-center gap-1.5 font-bold text-blue-800">
          Drill
          <ArrowRight />
        </span>
      </div>
    </div>
  </a>
</li>
