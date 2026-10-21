<script lang="ts">
  import {
    letterChipClass,
    moreLinkClass,
    panelClass,
    panelHoverClass,
  } from "$lib/components/ui/system-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import SectionHead from "$lib/components/ui/SectionHead.svelte";
  import LessonMotif from "$lib/components/lessons/LessonMotif.svelte";
  import LessonsContinueCard from "$lib/components/lessons/LessonsContinueCard.svelte";
  import LessonTrackSection from "$lib/components/lessons/LessonTrackSection.svelte";
  import GrammarQuestionsCard from "$lib/components/reference/GrammarQuestionsCard.svelte";

  import {
    caseTopics,
    grammarEntries,
    pronunciationEntries,
    words,
  } from "$lib/catalog/entries";
  import { lessonTracks, lessons, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSets } from "$lib/catalog/practice/sets";
  import { buildBrowseQueryHref } from "$lib/catalog/dictionary/browse-query";
  import { dictionaryPathForSense } from "$lib/catalog/dictionary/lemma-senses";
  import {
    FREQUENCY_PART_OF_SPEECH_LABEL,
    FREQUENCY_PARTS,
  } from "$lib/catalog/frequency/types";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { nextLessonInList } from "$lib/lesson-progress/progress";
  import { lessonMotifId } from "$lib/lesson-story/lesson-motifs";

  // Lessons: SSR assumes no progress; LessonsProgressBoot paints before first paint.
  const trackGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id),
  }));
  const [firstGroup, ...otherGroups] = trackGroups;
  const doneIds = new Set<string>();
  const focusLesson = nextLessonInList(doneIds, lessons);
  const focusGroup =
    trackGroups.find((group) => group.track.id === focusLesson?.track) ?? null;
  const lessonNumber =
    focusGroup && focusLesson
      ? focusGroup.lessons.findIndex((lesson) => lesson.id === focusLesson.id) + 1
      : 1;

  const letters = [
    ...new Set(
      words
        .filter((word) => word.kind === "word")
        .map((word) => word.slovak.at(0)?.toLocaleUpperCase("sk") ?? ""),
    ),
  ]
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "sk"));

  const wordGroups = ["Essentials", "Greetings", "Questions", "People", "Food"]
    .map((topic) => ({
      category: topic === "Food" ? "Food and drink" : topic,
      // A taste of each group; the browse page has the rest.
      entries: words.filter((word) => word.topics?.includes(topic)).slice(0, 6),
    }))
    .filter((group) => group.entries.length > 0);

  // Top of each Slovak National Corpus list; the /dictionary/common pages have the rest.
  const commonGroups = FREQUENCY_PARTS.map((partOfSpeech) => {
    const ranked = words
      .filter((word) => word.frequency?.partOfSpeech === partOfSpeech)
      .sort((left, right) => (left.frequency?.rank ?? 0) - (right.frequency?.rank ?? 0));

    return {
      partOfSpeech,
      label: FREQUENCY_PART_OF_SPEECH_LABEL[partOfSpeech],
      total: ranked.length,
      entries: ranked.slice(0, 6),
    };
  });

  const practiceGroups = lessonTracks
    .map((track) => ({
      track,
      sets: practiceSets.filter((set) => set.track === track.id),
    }))
    .filter((group) => group.sets.length > 0);

  const wordCount = words.length.toLocaleString("en");

  const trackCardClass = `${panelClass} ${panelHoverClass} group grid grid-cols-[3.25rem_minmax(0,1fr)_auto] items-center gap-3.5 border-2 border-transparent px-3 py-3 no-underline`;

  const wordRowClass =
    "group grid gap-0.5 border-b border-slate-200/70 py-1.5 no-underline";
  const wordClass =
    "font-serif text-base leading-snug text-slate-900 group-hover:text-blue-800 group-hover:underline";
  const glossClass = "text-xs leading-snug text-slate-500";

  const indexRowClass = "border-b border-slate-200/70 py-2.5 last:border-b-0";
  const indexTitleClass = "text-sm font-bold text-blue-800 group-hover:underline";

  function firstSense(english: string): string {
    return english.split(";")[0].trim();
  }
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div
      class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0"
    >
      <header class="max-w-xl lg:col-start-1 lg:row-start-1">
        <h1 class="text-balance">Slovak for English speakers</h1>

        <Lead class="text-pretty">
          A dictionary of {wordCount} words with examples, audio and every form; story lessons
          you can finish in one sitting; practice sets; and short guides to grammar and pronunciation.
          Free, no account — progress stays in this browser.
        </Lead>
      </header>

      <aside
        class="grid gap-6 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
      >
        <LessonsContinueCard
          {focusLesson}
          {lessonNumber}
          {lessons}
          track={focusGroup?.track ?? null}
          trackLessonCount={focusGroup?.lessons.length ?? 0}
        />

        <div class="max-lg:hidden">
          <GrammarQuestionsCard />
        </div>
      </aside>

      <div class="min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-12">
        <div class="space-y-12">
          <section aria-labelledby="browse-heading">
            <SectionHead
              title="Browse {wordCount} words"
              id="browse-heading"
              href="/dictionary"
              description="Every lemma with an English gloss; most with example sentences, audio and a frequency rank from the Slovak National Corpus."
            >
              {#snippet aside()}
                <a
                  class="font-bold text-blue-800 no-underline hover:underline"
                  href="/dictionary"
                >
                  All words
                </a>
              {/snippet}
            </SectionHead>

            <nav class="mt-4" aria-label="Browse by first letter">
              <ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {#each letters as letter (letter)}
                  <li>
                    <a
                      class={letterChipClass(false)}
                      href={buildBrowseQueryHref("all", letter, 1)}
                      lang="sk"
                    >
                      {letter}
                    </a>
                  </li>
                {/each}
              </ul>
            </nav>

            <div
              class="mt-6 grid grid-cols-5 gap-x-6 gap-y-6 max-[960px]:grid-cols-3 max-[560px]:grid-cols-2"
            >
              {#each wordGroups as group (group.category)}
                <section>
                  <Eyebrow compact tone="muted">{group.category}</Eyebrow>

                  <ul class="m-0 list-none p-0">
                    {#each group.entries as word (word.slug)}
                      <li>
                        <a
                          class={wordRowClass}
                          href={dictionaryPathForSense(word, words)}
                        >
                          <span class={wordClass} lang="sk">{word.slovak}</span>
                          <span class={glossClass}>{firstSense(word.english)}</span>
                        </a>
                      </li>
                    {/each}
                  </ul>
                </section>
              {/each}
            </div>
          </section>

          <div class="space-y-12" data-lessons-hydrate>
            <LessonTrackSection
              track={firstGroup.track}
              lessons={firstGroup.lessons}
              statusFor={(lesson) =>
                focusLesson?.id === lesson.id ? "active" : "upcoming"}
            />

            {#if otherGroups.length > 0}
              <section aria-labelledby="tracks-heading">
                <SectionHead
                  title="Grammar and pronunciation lessons"
                  id="tracks-heading"
                  href="/lessons"
                  description="Each track opens with a short scene, lifts out the pattern, then asks you to use it."
                >
                  {#snippet aside()}
                    <a
                      class="font-bold text-blue-800 no-underline hover:underline"
                      href="/lessons"
                    >
                      All lessons
                    </a>
                  {/snippet}
                </SectionHead>

                <ul class="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
                  {#each otherGroups as group (group.track.id)}
                    <li>
                      <a class={trackCardClass} href="/lessons/{group.track.id}">
                        <LessonMotif motif={lessonMotifId(group.lessons[0].id)} />

                        <span class="min-w-0">
                          <strong
                            class="block font-serif text-base leading-snug tracking-tight text-balance text-blue-800 underline-offset-2 group-hover:underline sm:text-lg"
                          >
                            {group.track.title}
                          </strong>

                          <span
                            class="mt-0.5 block text-sm leading-snug text-pretty text-slate-500"
                          >
                            {group.lessons.length}
                            {group.lessons.length === 1 ? "lesson" : "lessons"}
                            <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
                            <span data-track-done-count={group.track.id}>0</span> done
                          </span>
                        </span>

                        <ArrowRight class="text-slate-400" />
                      </a>
                    </li>
                  {/each}
                </ul>
              </section>
            {/if}
          </div>

          <section aria-labelledby="common-heading">
            <SectionHead
              title="The words you will meet first"
              id="common-heading"
              href="/dictionary/common/verb"
              description="Ranked by how often they appear in the Slovak National Corpus. Each list runs to the top thousand or more."
            >
              {#snippet aside()}
                <a
                  class="font-bold text-blue-800 no-underline hover:underline"
                  href="/dictionary/common/verb"
                >
                  All lists
                </a>
              {/snippet}
            </SectionHead>

            <div class="mt-4 grid grid-cols-4 gap-x-6 gap-y-6 max-[800px]:grid-cols-2">
              {#each commonGroups as group (group.partOfSpeech)}
                <section>
                  <Eyebrow compact tone="muted">{group.label}</Eyebrow>

                  <ol class="m-0 list-none p-0">
                    {#each group.entries as word (word.slug)}
                      <li>
                        <a
                          class="group grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-2 border-b border-slate-200/70 py-1.5 no-underline"
                          href={dictionaryPathForSense(word, words)}
                        >
                          <span class="text-xs tabular-nums text-slate-500">
                            {word.frequency?.rank}
                          </span>
                          <span class="grid gap-0.5">
                            <span class={wordClass} lang="sk">{word.slovak}</span>
                            <span class={glossClass}>{firstSense(word.english)}</span>
                          </span>
                        </a>
                      </li>
                    {/each}
                  </ol>

                  <a
                    class="{moreLinkClass} mt-2"
                    href="/dictionary/common/{group.partOfSpeech}"
                  >
                    All {group.total.toLocaleString("en")}
                    {group.label.toLowerCase()}
                    <ArrowRight />
                  </a>
                </section>
              {/each}
            </div>
          </section>

          <section aria-labelledby="reference-heading">
            <SectionHead
              title="Grammar and pronunciation"
              id="reference-heading"
              href="/grammar"
              description="Short explanations of the patterns you meet in the lessons, each with real examples and a link to the practice that drills it."
            >
              {#snippet aside()}
                <a
                  class="font-bold text-blue-800 no-underline hover:underline"
                  href="/glossary"
                >
                  Glossary
                </a>
              {/snippet}
            </SectionHead>

            <div
              class="mt-4 grid gap-x-10 gap-y-8 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
            >
              <div>
                <Eyebrow compact tone="muted">Grammar</Eyebrow>

                <ul class="m-0 grid list-none gap-x-8 p-0 sm:grid-cols-2">
                  {#each grammarEntries as entry (entry.slug)}
                    <li class={indexRowClass}>
                      <a class="group block no-underline" href="/grammar/{entry.slug}">
                        <span
                          class="flex flex-wrap items-baseline justify-between gap-x-3"
                        >
                          <span class={indexTitleClass}
                            >{sentenceCase(entry.english)}</span
                          >
                          <span class="font-serif text-sm text-slate-500" lang="sk">
                            {entry.slovak}
                          </span>
                        </span>
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>

              <div class="grid content-start gap-8">
                <div>
                  <Eyebrow compact tone="muted">The six cases</Eyebrow>

                  <ul class="m-0 list-none p-0">
                    {#each caseTopics as topic (topic.slug)}
                      <li class={indexRowClass}>
                        <a
                          class="group flex items-baseline justify-between gap-x-3 no-underline"
                          href="/grammar/cases/{topic.slug}"
                        >
                          <span class={indexTitleClass}>{topic.name}</span>
                          <span class="font-serif text-sm text-slate-500" lang="sk">
                            {topic.question?.split("·")[0]?.trim()}
                          </span>
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>

                <div>
                  <Eyebrow compact tone="muted">Pronunciation</Eyebrow>

                  <ul class="m-0 list-none p-0">
                    {#each pronunciationEntries as entry (entry.slug)}
                      <li class={indexRowClass}>
                        <a
                          class="group flex flex-wrap items-baseline justify-between gap-x-3 no-underline"
                          href="/pronunciation/{entry.slug}"
                        >
                          <span class={indexTitleClass}
                            >{sentenceCase(entry.english)}</span
                          >
                          <span
                            class="ml-auto font-serif text-sm text-slate-500"
                            lang="sk"
                          >
                            {entry.slovak}
                          </span>
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="practice-heading">
            <SectionHead
              title="Drill what you learned"
              id="practice-heading"
              href="/practice"
              description="Short sets built from the lessons, a few minutes each. Reopen any topic whenever a form stops making sense."
            >
              {#snippet aside()}
                <a
                  class="font-bold text-blue-800 no-underline hover:underline"
                  href="/practice"
                >
                  Open Practice
                </a>
              {/snippet}
            </SectionHead>

            <div class="mt-4 grid gap-x-8 gap-y-8 sm:grid-cols-2 md:grid-cols-3">
              {#each practiceGroups as group (group.track.id)}
                <div>
                  <Eyebrow compact tone="muted">{group.track.title}</Eyebrow>

                  <ul class="m-0 list-none p-0">
                    {#each group.sets as set (set.id)}
                      <li class={indexRowClass}>
                        <a class="group block no-underline" href="/practice/{set.id}">
                          <span class="block {indexTitleClass}">{set.title}</span>
                          <span
                            class="mt-0.5 block text-sm leading-snug text-pretty text-slate-600"
                          >
                            {set.summary}
                          </span>
                        </a>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          </section>
        </div>
      </div>
    </div>
  </PageShell>
</main>
