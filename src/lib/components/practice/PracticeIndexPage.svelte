<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeFeaturedFrame from "$lib/components/practice/PracticeFeaturedFrame.svelte";
  import PracticeSheetCard from "$lib/components/practice/PracticeSheetCard.svelte";
  import { emptyPracticeState } from "$lib/components/practice/practice-state";
  import {
    buildPracticeSheets,
    groupSheetsByTrack,
    practiceToday,
  } from "$lib/catalog/practice/hub";

  const sheets = buildPracticeSheets(emptyPracticeState());
  const sheetsByTrack = groupSheetsByTrack(sheets);
  const today = practiceToday(sheets);
</script>

<main>
  <section aria-label="Practice">
    <PageShell class="pt-14 pb-2 max-[600px]:pt-10">
      <h1
        class="m-0 font-serif text-[clamp(2.25rem,5vw,3.25rem)] font-semibold tracking-tight text-slate-900"
      >
        Practice
      </h1>

      <p class="mt-3 m-0 max-w-xl text-[1.05rem] leading-snug text-slate-600">
        Drill the forms until they come back without looking.
      </p>

      <p class="mt-5 m-0">
        <TextLink href="/lessons">Try a lesson first</TextLink>
      </p>
    </PageShell>
  </section>

  {#if today}
    <PracticeFeaturedFrame
      {sheets}
      featuredId={today.featured.set.id}
      doneCount={today.doneCount}
      totalCount={today.totalCount}
    />
  {/if}

  <section aria-labelledby="topics-heading">
    <PageShell class="pt-4 pb-20 max-[600px]:pb-14">
      <div class="mb-8 max-w-160">
        <h2 id="topics-heading" class="m-0">All sets</h2>
        <p class="mt-2 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Lessons teach. These ask you to use it.
        </p>
      </div>

      <div class="grid gap-12" data-practice-hydrate>
        {#each sheetsByTrack as group (group.track.id)}
          <section aria-labelledby={`track-${group.track.id}`}>
            <div class="mb-3 flex flex-wrap items-baseline justify-between gap-3">
              <h3
                id={`track-${group.track.id}`}
                class="m-0 font-serif text-xl text-slate-900"
              >
                {group.track.title}
              </h3>
              <p class="m-0 text-xs tabular-nums text-slate-500">
                {group.sheets.length}
                {group.sheets.length === 1 ? "set" : "sets"}
                ·
                {group.exerciseCount}
                {group.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </div>

            <ul
              class="m-0 list-none divide-y divide-slate-200/80 overflow-hidden rounded-2xl bg-surface p-0 ring-1 ring-slate-200/80 ring-inset"
            >
              {#each group.sheets as sheet (sheet.set.id)}
                <PracticeSheetCard {sheet} />
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </PageShell>
  </section>

  <section
    class="border-t border-slate-200/80"
    aria-labelledby="recents-heading"
    data-practice-recents
    data-practice-hydrate
    hidden
  >
    <PageShell class="py-12 max-[600px]:py-10">
      <div class="mb-8 max-w-160">
        <h2 id="recents-heading" class="m-0">Practice again</h2>
        <p class="mt-3 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Solo drills from a lesson or topic page. Opens the matching exercise in its
          sheet.
        </p>
      </div>

      <ul class="m-0 list-none p-0" data-practice-recents-list></ul>

      <template data-practice-recent-template>
        <li>
          <a
            class="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-slate-200 py-5 no-underline"
            data-recent-href
            href="/practice"
          >
            <div class="min-w-0">
              <p
                class="m-0 font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] font-semibold leading-snug tracking-tight text-slate-900 group-hover:text-blue-800"
                lang="sk"
                data-recent-sk
              ></p>
              <p class="m-0 mt-1.5 text-sm text-slate-500" data-recent-en></p>
              <p class="m-0 mt-3 text-xs text-slate-500">
                From
                <span class="text-slate-700" data-recent-source></span>
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
      </template>
    </PageShell>
  </section>
</main>
