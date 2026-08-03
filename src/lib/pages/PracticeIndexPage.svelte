<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import { emptyPracticeState, readPracticeState } from "$lib/client/practice-state";
  import type { PracticeItem } from "$lib/content/learning-types";
  import { lessonById, lessonTracks } from "$lib/content/lessons";
  import {
    practiceItemById,
    practiceSessionCount,
    practiceSets,
  } from "$lib/content/practice";

  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const reviewCount = $derived(practiceState.reviewItemIds.length);

  function drillLine(item: PracticeItem | undefined): {
    slovak: string;
    english: string;
  } {
    if (!item) {
      return { slovak: "…", english: "" };
    }

    const clean = (value: string) =>
      value.includes("-") ? value.replace(/-/g, "").toLocaleLowerCase("sk-SK") : value;

    const task = item.task;

    if (task.type === "cloze") {
      return {
        slovak: task.frame.replace("{}", "______"),
        english: task.sentenceEn ?? task.gapEn,
      };
    }

    if (task.type === "choice") {
      const correction = item.feedback.correction?.trim() ?? "";
      const chosen =
        task.choices.find((choice) => choice.id === task.answerId)?.label ?? correction;
      return {
        slovak: clean(correction || chosen),
        english: item.feedback.english ?? "",
      };
    }

    if (task.type === "build") {
      return {
        slovak: task.answer.join(" "),
        english: item.feedback.english ?? "",
      };
    }

    return {
      slovak: task.answer,
      english: item.feedback.english ?? "",
    };
  }

  const sheets = $derived(
    practiceSets.map((set) => {
      const lesson = lessonById.get(set.lessonId);
      const previewItem = practiceItemById.get(set.previewItemId ?? set.itemIds[0] ?? "");

      return {
        set,
        purpose: set.summary ?? lesson?.promise ?? "Work through this topic again.",
        exerciseCount: practiceSessionCount(set),
        completed: practiceState.completedLessonIds.includes(set.lessonId),
        drill: drillLine(previewItem),
        trackTitle:
          lessonTracks.find((entry) => entry.id === set.track)?.title ?? set.track,
      };
    }),
  );

  const sheetsByTrack = $derived(
    lessonTracks
      .map((track) => {
        const trackSheets = sheets.filter((sheet) => sheet.set.track === track.id);
        return {
          track,
          sheets: trackSheets,
          exerciseCount: trackSheets.reduce((sum, sheet) => sum + sheet.exerciseCount, 0),
        };
      })
      .filter((group) => group.sheets.length > 0),
  );

  const featured = $derived.by(() => {
    const waiting = sheets.find((sheet) => !sheet.completed);
    return waiting ?? sheets[0];
  });

  const primaryHref = $derived(
    reviewCount > 0 ? "/practice/review" : `/practice/${featured?.set.id ?? ""}`,
  );

  const primaryLabel = $derived(
    reviewCount > 0
      ? `Open Review · ${reviewCount}`
      : featured?.completed
        ? `Try again · ${featured.set.title}`
        : `Start · ${featured?.set.title ?? "practice"}`,
  );

  const savedItems = $derived.by(() => {
    const items: PracticeItem[] = [];
    for (const itemId of practiceState.savedReferenceItemIds) {
      const item = practiceItemById.get(itemId);
      if (item) items.push(item);
    }
    return items;
  });

  const totalExercises = $derived(
    practiceSets.reduce((sum, set) => sum + practiceSessionCount(set), 0),
  );

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });
</script>

<main>
  <section
    class="relative overflow-hidden border-b border-slate-200/80"
    aria-label="Practice"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none font-serif text-[clamp(5rem,18vw,11rem)] font-semibold leading-none tracking-[-0.06em] text-slate-900/5"
      aria-hidden="true"
    >
      <span class="absolute left-[4%] top-[12%] -rotate-[9deg]" lang="sk">ľ</span>
      <span class="absolute right-[6%] top-[22%] rotate-[7deg]" lang="sk">č</span>
      <span class="absolute bottom-[8%] left-[18%] rotate-[5deg]" lang="sk">š</span>
      <span class="absolute bottom-[14%] right-[10%] -rotate-6" lang="sk">ť</span>
    </div>

    <PageShell class="relative py-16 max-[600px]:py-12">
      <p
        class="m-0 font-serif text-[clamp(3rem,9vw,5.75rem)] font-semibold leading-[0.9] tracking-tighter text-slate-900"
      >
        Practice
      </p>

      <p
        class="mt-5 min-h-[2.75em] max-w-160 font-serif text-[clamp(1.15rem,2.2vw,1.45rem)] leading-snug text-slate-700"
      >
        Drill the forms until they come back without looking.
      </p>

      <div class="mt-9 flex flex-wrap items-center gap-4">
        {#if hydrated}
          <Button href={primaryHref} class="min-w-48 px-6">
            {primaryLabel}
            <ArrowRight />
          </Button>
        {:else}
          <Button href="/practice/{practiceSets[0]?.id}" class="min-w-48 px-6">
            Start
            <ArrowRight />
          </Button>
        {/if}

        <TextLink href="/lessons" class="inline-flex items-center gap-1.5">
          Prefer a lesson first
        </TextLink>
      </div>

      <div
        class="mt-14 flex flex-wrap gap-x-10 gap-y-3 border-t border-slate-200/90 pt-6 text-sm text-slate-500"
      >
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {practiceSets.length}
          </span>
          topic sets
        </p>
        <p class="m-0">
          <span class="font-serif text-xl font-semibold tabular-nums text-slate-900">
            {totalExercises}
          </span>
          exercises
        </p>
        {#if hydrated && reviewCount > 0}
          <p class="m-0">
            <a
              class="text-inherit no-underline transition-colors hover:text-rose-600"
              href="/practice/review"
            >
              <span class="font-serif text-xl font-semibold tabular-nums text-rose-600">
                {reviewCount}
              </span>
              waiting in Review
            </a>
          </p>
        {/if}
      </div>
    </PageShell>
  </section>

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
              <h2
                id="continue-heading"
                class="m-0 mt-2 font-serif text-2xl text-slate-900"
              >
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

  <section aria-labelledby="topics-heading">
    <PageShell class="py-14 pb-20 max-[600px]:py-10 max-[600px]:pb-14">
      <div class="mb-10 max-w-160">
        <Eyebrow>Practice sheets</Eyebrow>
        <h2 id="topics-heading" class="m-0">Pick a form to drill</h2>
        <p class="mt-3 m-0 text-[0.95rem] leading-[1.65] text-slate-600">
          Each sheet is a short set. Lessons teach; these ask you to use it.
        </p>
      </div>

      <div class="grid gap-12">
        {#each sheetsByTrack as group (group.track.id)}
          <section aria-labelledby={`track-${group.track.id}`}>
            <div class="mb-4 flex flex-wrap items-baseline justify-between gap-3">
              <h3
                id={`track-${group.track.id}`}
                class="m-0 font-serif text-lg text-slate-900"
              >
                {group.track.title}
              </h3>
              <p class="m-0 text-xs tabular-nums text-slate-500">
                {group.sheets.length}
                {group.sheets.length === 1 ? "sheet" : "sheets"}
                ·
                {group.exerciseCount}
                {group.exerciseCount === 1 ? "exercise" : "exercises"}
              </p>
            </div>

            <ul class="m-0 grid list-none grid-cols-2 gap-4 p-0 max-[700px]:grid-cols-1">
              {#each group.sheets as sheet (sheet.set.id)}
                <li>
                  <a
                    class="group flex h-full flex-col rounded-(--frame-radius) bg-surface/80 p-6 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover)"
                    href="/practice/{sheet.set.id}"
                  >
                    <p
                      class="m-0 font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold leading-snug tracking-tight text-slate-900"
                      lang="sk"
                    >
                      {sheet.drill.slovak}
                    </p>

                    {#if sheet.drill.english}
                      <p class="m-0 mt-2 text-sm text-slate-500">
                        {sheet.drill.english}
                      </p>
                    {/if}

                    <div class="mt-6 border-t border-slate-200 pt-4">
                      <strong class="font-serif text-base tracking-tight text-blue-800">
                        {sheet.set.title}
                      </strong>
                      <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">
                        {sheet.purpose}
                      </p>
                    </div>

                    <div
                      class="mt-auto flex items-center justify-between gap-3 pt-5 text-sm"
                    >
                      <span class="text-slate-500">
                        {sheet.exerciseCount}
                        {sheet.exerciseCount === 1 ? "exercise" : "exercises"}
                        {#if hydrated && sheet.completed}
                          · Done
                        {/if}
                      </span>
                      <span
                        class="inline-flex items-center gap-1.5 font-bold text-blue-800"
                      >
                        Drill
                        <ArrowRight />
                      </span>
                    </div>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </PageShell>
  </section>

  {#if hydrated && savedItems.length}
    <section class="border-t border-slate-200/80" aria-labelledby="saved-heading">
      <PageShell class="py-12 max-[600px]:py-10">
        <Eyebrow>Saved items</Eyebrow>
        <h2 id="saved-heading" class="m-0">Focused items</h2>
        <ul class="mt-6 m-0 list-none p-0">
          {#each savedItems as item (item.id)}
            <li>
              <a
                class="group flex items-center justify-between gap-4 border-b border-slate-200 py-4"
                href="/practice/reference/{item.id}"
              >
                <div>
                  <p
                    class="m-0 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500"
                  >
                    {item.source.label}
                  </p>
                  <strong
                    class="font-serif text-lg text-slate-900 group-hover:text-blue-800"
                  >
                    {item.task.prompt}
                  </strong>
                </div>
                <ArrowRight class="text-blue-800" />
              </a>
            </li>
          {/each}
        </ul>
      </PageShell>
    </section>
  {/if}
</main>
