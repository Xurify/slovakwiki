<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeRecentsCard from "$lib/components/practice/PracticeRecentsCard.svelte";
  import PracticeTrackSection from "$lib/components/practice/PracticeTrackSection.svelte";
  import PracticeUpNextCard from "$lib/components/practice/PracticeUpNextCard.svelte";
  import { emptyPracticeState } from "$lib/components/practice/practice-state";
  import {
    buildPracticeSheets,
    groupSheetsByTrack,
    pickFeaturedSheet,
  } from "$lib/catalog/practice/hub";

  // SSR assumes no progress; PracticeProgressBoot repaints before first paint.
  const sheets = buildPracticeSheets(emptyPracticeState());
  const sheetsByTrack = groupSheetsByTrack(sheets);
  const featuredId = pickFeaturedSheet(sheets)?.set.id ?? "";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-x-12 lg:gap-y-12">
      <header class="max-w-xl lg:col-start-1">
        <h1 class="text-balance">Practice</h1>

        <Lead class="text-pretty">
          Short drills built from the lessons, a few minutes each. Do the set that's up
          next, or pick any topic and come back to the lines that tripped you up.
        </Lead>
      </header>

      <aside
        class="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="Your practice"
      >
        {#if featuredId}
          <PracticeUpNextCard {sheets} {featuredId} />
        {/if}

        <PracticeRecentsCard />
      </aside>

      <div class="min-w-0 lg:col-start-1">
        <div class="space-y-14" data-practice-hydrate>
          {#each sheetsByTrack as group (group.track.id)}
            <PracticeTrackSection
              track={group.track}
              sheets={group.sheets}
              exerciseCount={group.exerciseCount}
              {featuredId}
            />
          {/each}
        </div>

        <p class="m-0 mt-14">
          <TextLink href="/lessons">Go to lessons</TextLink>
        </p>
      </div>
    </div>
  </PageShell>
</main>
