<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import { emptyPracticeState, readPracticeState } from "$lib/client/practice-state";
  import type { PracticeItem } from "$lib/content/learning-types";
  import { practiceItemById, practiceSets } from "$lib/content/practice";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const completedSets = $derived(
    practiceSets.filter((set) => practiceState.completedLessonIds.includes(set.lessonId)),
  );
  const savedItems = $derived.by(() => {
    const items: PracticeItem[] = [];
    for (const itemId of practiceState.savedReferenceItemIds) {
      const item = practiceItemById.get(itemId);
      if (item) items.push(item);
    }
    return items;
  });

  const rowLinkClass =
    "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200 -mx-4 px-4 py-5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)]";

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });
</script>

<main class="py-14 pb-20 max-[800px]:py-[30px] max-[800px]:pb-[50px]">
  <PageShell class="max-w-[900px] pt-14 max-[600px]:pt-8">
    <header class="max-w-[700px]">
      <Eyebrow>Practice</Eyebrow>
      <h1>Bring Slovak back.</h1>
      <Lead>
        Review what was uncertain, or return to a lesson topic when you want another pass.
      </Lead>
    </header>

    <section
      class="mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="review-heading"
    >
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div class="max-w-[520px]">
          <Eyebrow>Review</Eyebrow>
          <h2 id="review-heading">What needs another try</h2>
          <Lead class="mt-2">
            Missed and revealed forms return here. Nothing else is tracked.
          </Lead>
          <p class="mt-3 text-sm text-slate-500">
            <span class="font-serif text-blue-800" lang="sk">Skús to znova.</span>
            Try it again.
          </p>
        </div>
        <Button href="/practice/review">Open Review</Button>
      </div>
    </section>

    <section class="mt-12" aria-labelledby="topics-heading">
      <div class="border-b border-slate-200 pb-4">
        <Eyebrow>Practice a topic</Eyebrow>
        <h2 id="topics-heading">From your lessons</h2>
      </div>

      {#if !hydrated || completedSets.length}
        <div>
          {#each completedSets as set (set.id)}
            <a class={rowLinkClass} href="/practice/{set.id}">
              <div class="grid gap-0.5">
                <span
                  class="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
                >
                  {set.track}
                </span>
                <strong class="font-serif text-lg text-blue-800">{set.title}</strong>
              </div>
              <span class="inline-flex items-center gap-2 text-sm text-slate-500">
                Practice again
                <ArrowRight class="text-blue-800" />
              </span>
            </a>
          {/each}
        </div>
      {:else}
        <div class="border-b border-slate-200 py-6">
          <p class="m-0 font-serif text-slate-600">
            Finish a lesson to practise its language again here.
          </p>
          <TextLink class="mt-3 inline-block" href="/lessons">Browse lessons</TextLink>
        </div>
      {/if}
    </section>

    {#if hydrated && practiceState.savedReferenceItemIds.length}
      <section class="mt-12" aria-labelledby="saved-heading">
        <div class="border-b border-slate-200 pb-4">
          <Eyebrow>Saved from Reference</Eyebrow>
          <h2 id="saved-heading">Focused items</h2>
        </div>
        <div>
          {#each savedItems as item (item.id)}
            <a class={rowLinkClass} href="/practice/reference/{item.id}">
              <div class="grid gap-0.5">
                <span
                  class="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
                >
                  {item.source.label}
                </span>
                <strong class="font-serif text-blue-800">{item.task.prompt}</strong>
              </div>
              <ArrowRight class="text-blue-800" />
            </a>
          {/each}
        </div>
      </section>
    {/if}
  </PageShell>
</main>
