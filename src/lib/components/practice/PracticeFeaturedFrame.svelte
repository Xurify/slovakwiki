<script lang="ts">
  import type { PracticeHubSheet } from "$lib/catalog/practice/hub";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import PracticeSetPoster from "$lib/components/practice/PracticeSetPoster.svelte";

  let {
    sheets,
    featuredId,
    doneCount = 0,
    totalCount = 0,
  }: {
    sheets: PracticeHubSheet[];
    featuredId: string;
    doneCount?: number;
    totalCount?: number;
  } = $props();

  const donePercent = $derived(
    totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100),
  );

  const posterLinkClass =
    "group block h-full overflow-clip rounded-2xl shadow-(--shadow-border) transition-[box-shadow] duration-200 ease-out hover:shadow-(--shadow-border-hover)";
</script>

<section aria-label="Today">
  <PageShell class="py-10 max-[600px]:py-8">
    <div data-practice-hydrate>
      {#if totalCount > 0}
        <div
          class="mb-8 flex max-w-xl items-center gap-3 rounded-2xl bg-surface px-4 py-3 ring-1 ring-slate-200/80 ring-inset"
        >
          <p class="m-0 shrink-0 text-sm text-slate-600">Sets done</p>
          <div class="h-1.5 min-w-0 flex-1 rounded-full bg-slate-200">
            <span
              class="block h-full rounded-full bg-rose-600"
              data-hub-done-bar
              style:width="{donePercent}%"
            ></span>
          </div>
          <p class="m-0 text-sm tabular-nums text-slate-700">
            <span data-hub-done-count>{doneCount}</span>/<span data-hub-total-count
              >{totalCount}</span
            >
          </p>
        </div>
      {/if}

      {#each sheets as candidate (candidate.set.id)}
        {@const siblings = sheets.filter(
          (entry) =>
            entry.set.track === candidate.set.track && entry.set.id !== candidate.set.id,
        )}
        {@const peek = siblings.length === 1 ? siblings[0] : undefined}
        {@const chips = siblings.length === 1 ? [] : siblings}

        <div
          data-featured-sheet={candidate.set.id}
          data-featured-lesson={candidate.set.lessonId}
          hidden={candidate.set.id !== featuredId}
        >
          <p class="m-0 text-sm text-slate-500">
            {candidate.trackTitle}
          </p>
          <h2
            class="m-0 mt-1 font-serif text-[clamp(1.6rem,2.4vw,2rem)] tracking-tight text-balance text-slate-900"
          >
            {candidate.set.title}
          </h2>

          <div class={["mt-5 grid gap-4", peek && "min-[860px]:grid-cols-2"]}>
            <a class={posterLinkClass} href="/practice/{candidate.set.id}">
              <PracticeSetPoster sheet={candidate} size="hero" cta="Start set" />
            </a>

            {#if peek}
              <a class={posterLinkClass} href="/practice/{peek.set.id}">
                <PracticeSetPoster sheet={peek} size="peek" />
              </a>
            {/if}
          </div>

          {#if chips.length}
            <ul
              class="m-0 mt-4 grid list-none grid-cols-2 gap-3 p-0 min-[860px]:grid-cols-4"
            >
              {#each chips as chip (chip.set.id)}
                <li>
                  <a class={posterLinkClass} href="/practice/{chip.set.id}">
                    <PracticeSetPoster sheet={chip} size="chip" />
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      {/each}
    </div>
  </PageShell>
</section>
