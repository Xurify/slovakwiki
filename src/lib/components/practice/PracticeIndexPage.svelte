<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeFeaturedFrame from "$lib/components/practice/PracticeFeaturedFrame.svelte";
  import PracticeSheetCard from "$lib/components/practice/PracticeSheetCard.svelte";
  import { emptyPracticeState } from "$lib/components/practice/practice-state";
  import {
    buildPracticeSheets,
    groupSheetsByTrack,
    pickFeaturedSheet,
    totalPracticeExercises,
  } from "$lib/catalog/practice/hub";

  // SSR assumes no progress; PracticeProgressBoot repaints before first paint.
  const sheets = buildPracticeSheets(emptyPracticeState());
  const sheetsByTrack = groupSheetsByTrack(sheets);
  const featured = pickFeaturedSheet(sheets);
  const featuredId = featured?.set.id ?? "";

  const exerciseTotal = totalPracticeExercises();

  const trackLinkClass =
    "font-semibold text-blue-800 underline decoration-slate-300 underline-offset-4 hover:decoration-current";

  function trackSeparator(index: number, count: number): string {
    if (index === count - 1) return ".";
    if (index === count - 2) return count > 2 ? ", or " : " or ";
    return ", ";
  }

  const recentCardClass =
    "group flex h-full flex-col gap-1.5 rounded-(--frame-radius) bg-surface/80 p-4 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow] duration-150 hover:bg-surface hover:shadow-(--shadow-border-hover)";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <section aria-label="Practice">
    <PageShell>
      <header class="max-w-2xl">
        <h1 class="text-balance">Practice</h1>

        <Lead class="text-pretty">
          Short drills by topic. Pick a set, work through a handful of exercises, and come
          back to the ones that tripped you up.
        </Lead>

        <nav aria-label="Jump to a track">
          <p class="m-0 mt-5 text-sm leading-relaxed text-pretty text-slate-500">
            {sheets.length}
            {sheets.length === 1 ? "set" : "sets"},
            {exerciseTotal}
            {exerciseTotal === 1 ? "exercise" : "exercises"}. Jump to
            {#each sheetsByTrack as group, index (group.track.id)}
              <a class={trackLinkClass} href="#browse-{group.track.id}">
                {group.track.title}</a
              >{trackSeparator(index, sheetsByTrack.length)}
            {/each}
          </p>
        </nav>
      </header>
    </PageShell>
  </section>

  {#if featured}
    <PracticeFeaturedFrame {sheets} {featuredId} />
  {/if}

  <section
    aria-labelledby="recents-heading"
    data-practice-recents
    data-practice-hydrate
    hidden
  >
    <PageShell class="pt-12 max-[600px]:pt-10">
      <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div class="max-w-xl">
          <h2 id="recents-heading" class="m-0 text-[clamp(1.35rem,2.2vw,1.75rem)]">
            Practice again
          </h2>

          <p class="m-0 mt-1.5 text-sm leading-relaxed text-pretty text-slate-600">
            Exercises you drilled recently. Each one reopens inside its set.
          </p>
        </div>
      </div>

      <ul
        class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3 p-0"
        data-practice-recents-list
      ></ul>

      <template data-practice-recent-template>
        <li class="min-w-0">
          <a class={recentCardClass} data-recent-href href="/practice">
            <p
              class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
              data-recent-source
            ></p>

            <p
              class="m-0 font-serif text-lg leading-snug font-semibold tracking-tight text-balance text-slate-900"
              lang="sk"
              data-recent-sk
            ></p>

            <p
              class="m-0 text-sm leading-snug text-pretty text-slate-600"
              data-recent-en
            ></p>

            <span
              class="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-blue-800"
            >
              Again
              <ArrowRight />
            </span>
          </a>
        </li>
      </template>
    </PageShell>
  </section>

  <section aria-labelledby="topics-heading">
    <PageShell class="pt-14 max-[600px]:pt-12">
      <div class="mb-8 max-w-xl">
        <h2 id="topics-heading" class="m-0 text-[clamp(1.35rem,2.2vw,1.75rem)]">
          Browse sets
        </h2>

        <p class="m-0 mt-1.5 text-sm leading-relaxed text-pretty text-slate-600">
          Every set is a short drill built from one lesson. Sets whose lesson you have
          finished are marked with a check.
        </p>
      </div>

      <div class="grid gap-14" data-practice-hydrate>
        {#each sheetsByTrack as group (group.track.id)}
          <section
            id="browse-{group.track.id}"
            class="scroll-mt-24"
            aria-labelledby="track-{group.track.id}-heading"
            data-browse-track={group.track.id}
          >
            <div
              class="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-slate-200/80 pb-4"
            >
              <div class="min-w-0 max-w-xl">
                <p
                  class="m-0 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
                >
                  Track
                </p>

                <h3
                  id="track-{group.track.id}-heading"
                  class="m-0 mt-1 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
                >
                  {group.track.title}
                </h3>

                <p class="m-0 mt-1.5 text-sm leading-relaxed text-pretty text-slate-600">
                  {group.track.description}
                </p>
              </div>

              <p class="m-0 shrink-0 text-xs tabular-nums text-slate-500">
                {group.sheets.length}
                {group.sheets.length === 1 ? "set" : "sets"}
                <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                {group.exerciseCount}
                {group.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </div>

            <ul class="m-0 grid list-none gap-3 p-0 min-[720px]:grid-cols-2">
              {#each group.sheets as sheet (sheet.set.id)}
                <PracticeSheetCard {sheet} next={sheet.set.id === featuredId} />
              {/each}
            </ul>
          </section>
        {/each}
      </div>

      <p class="mt-14 m-0">
        <TextLink href="/lessons">Go to lessons</TextLink>
      </p>
    </PageShell>
  </section>
</main>
