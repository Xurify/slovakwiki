<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { onMount } from "svelte";
  import {
    emptyPracticeState,
    readPracticeState,
    type PracticeState,
  } from "$lib/client/practice-state";
  import { buildPracticeSheets, pickFeaturedSheet } from "$lib/content/practice-hub";

  let { initialState }: { initialState?: PracticeState } = $props();

  let practiceState = $state(initialState ?? emptyPracticeState());
  let hydrated = $state(initialState !== undefined);

  const featured = $derived(pickFeaturedSheet(buildPracticeSheets(practiceState)));

  onMount(() => {
    if (initialState === undefined) {
      practiceState = readPracticeState(localStorage);
    }
    hydrated = true;
  });
</script>

{#if featured}
  <section class="border-b border-slate-200/80" aria-labelledby="continue-heading">
    <PageShell class="py-12 max-[600px]:py-10">
      <div
        class="overflow-hidden rounded-(--frame-radius) bg-paper shadow-(--shadow-border)"
      >
        <div
          class="grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] max-[760px]:grid-cols-1"
        >
          <a
            class="group relative block px-8 py-9 transition-colors hover:bg-slate-50 max-[600px]:px-5 max-[600px]:py-7"
            href="/practice/{featured.set.id}"
            aria-labelledby="continue-heading"
          >
            <Eyebrow>Up next</Eyebrow>
            <p
              class="m-0 mt-4 font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-slate-900"
              lang="sk"
            >
              {featured.drill.slovak}
            </p>
            {#if featured.drill.english}
              <p class="m-0 mt-3 font-serif text-base italic text-slate-600">
                {featured.drill.english}
              </p>
            {/if}
            <span
              class="mt-8 inline-flex items-center gap-2 text-sm font-bold text-rose-600"
            >
              Open set
              <ArrowRight />
            </span>
          </a>

          <div
            class="border-l border-slate-200 bg-slate-50 px-8 py-9 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:px-5 max-[760px]:py-6"
          >
            <p
              class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.14em] text-slate-500"
            >
              {featured.trackTitle}
            </p>
            <h2 id="continue-heading" class="m-0 mt-2 font-serif text-2xl text-slate-900">
              {featured.set.title}
            </h2>
            <p class="m-0 mt-3 text-sm leading-relaxed text-slate-600">
              {featured.purpose}
            </p>
            <p class="m-0 mt-5 text-xs text-slate-500">
              {featured.exerciseCount}
              {featured.exerciseCount === 1 ? "exercise" : "exercises"}
              {#if hydrated && featured.completed}
                · Done once
              {/if}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  </section>
{/if}
