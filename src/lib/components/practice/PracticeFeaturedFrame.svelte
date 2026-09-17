<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeDrillLine from "$lib/components/practice/PracticeDrillLine.svelte";
  import PracticeMotifField from "$lib/components/practice/PracticeMotifField.svelte";
  import { practiceMotifId } from "$lib/catalog/practice/motifs";

  let {
    sheet,
    completed = false,
  }: {
    sheet: PracticeHubSheet;
    completed?: boolean;
  } = $props();

  const motif = $derived(practiceMotifId(sheet.set.id, sheet.set.lessonId));
</script>

<section class="border-b border-slate-200/80" aria-labelledby="continue-heading">
  <PageShell class="py-12 max-[600px]:py-10">
    <div
      class="overflow-hidden rounded-(--frame-radius) bg-paper shadow-(--shadow-border)"
    >
      <a
        class="group flex transition-colors hover:bg-slate-50 max-[760px]:flex-col"
        href="/practice/{sheet.set.id}"
        aria-labelledby="continue-heading"
      >
        <PracticeMotifField {motif} slovak={sheet.drill.slovak} size="featured" />

        <div class="relative min-w-0 flex-1 px-8 py-9 max-[600px]:px-5 max-[600px]:py-7">
          <Eyebrow>Up next</Eyebrow>

          <PracticeDrillLine slovak={sheet.drill.slovak} size="featured" />

          {#if sheet.drill.english}
            <p class="m-0 mt-3 font-serif text-base text-pretty italic text-slate-600">
              {sheet.drill.english}
            </p>
          {/if}

          <span
            class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-rose-600"
          >
            Open set
            <ArrowRight />
          </span>
        </div>

        <div
          class="w-full border-l border-slate-200 bg-slate-50 px-8 py-9 min-[760px]:max-w-72 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:px-5 max-[760px]:py-6"
        >
          <p
            class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500"
          >
            {sheet.trackTitle}
          </p>
          <h2
            id="continue-heading"
            class="m-0 mt-2 font-serif text-2xl text-balance text-slate-900"
          >
            {sheet.set.title}
          </h2>
          <p class="m-0 mt-3 text-sm leading-relaxed text-pretty text-slate-600">
            {sheet.purpose}
          </p>
          <p class="m-0 mt-5 text-xs tabular-nums text-slate-500">
            {sheet.exerciseCount}
            {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
            {#if completed}
              · Done once
            {/if}
          </p>
        </div>
      </a>
    </div>
  </PageShell>
</section>
