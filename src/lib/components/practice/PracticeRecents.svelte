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
  import { buildRecentDrills } from "$lib/catalog/practice/hub";

  let { initialState }: { initialState?: PracticeState } = $props();

  let practiceState = $state(initialState ?? emptyPracticeState());
  let hydrated = $state(initialState !== undefined);

  const recentDrills = $derived(buildRecentDrills(practiceState));

  onMount(() => {
    if (initialState === undefined) {
      practiceState = readPracticeState(localStorage);
    }
    hydrated = true;
  });
</script>

{#if hydrated && recentDrills.length}
  <section class="border-t border-slate-200/80" aria-labelledby="recents-heading">
    <PageShell class="py-12 max-[600px]:py-10">
      <div class="mb-8 max-w-160">
        <Eyebrow>Recently practiced</Eyebrow>
        <h2 id="recents-heading" class="m-0">Practice again</h2>
        <p class="mt-3 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Solo drills from a lesson or topic page. Opens the matching exercise in its
          sheet.
        </p>
      </div>

      <ul class="m-0 list-none p-0">
        {#each recentDrills as entry (entry.id)}
          <li>
            <a
              class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200 py-5 no-underline"
              href={entry.href}
            >
              <div class="min-w-0">
                <p
                  class="m-0 font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-blue-800"
                  lang="sk"
                >
                  {entry.drill.slovak}
                </p>

                {#if entry.drill.english}
                  <p class="m-0 mt-1.5 text-sm text-slate-500">
                    {entry.drill.english}
                  </p>
                {/if}

                <p class="m-0 mt-3 text-xs text-slate-500">
                  From
                  <span class="text-slate-700">{entry.sourceLabel}</span>
                </p>
              </div>

              <span
                class="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-blue-800"
              >
                Again
                <ArrowRight />
              </span>
            </a>
          </li>
        {/each}
      </ul>
    </PageShell>
  </section>
{/if}
