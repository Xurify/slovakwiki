<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import {
    caseTopics,
    grammarEntries,
    pronunciationEntries,
    words,
  } from "$lib/catalog/entries";
  import { lessonPath, lessonTracks, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSets } from "$lib/catalog/practice/sets";
  import { buildBrowseQueryHref } from "$lib/catalog/dictionary/browse-query";
  import { declensionRows } from "$lib/catalog/dictionary/declension";
  import { dictionaryPathForSense } from "$lib/catalog/dictionary/lemma-senses";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { nounGenderLabel } from "$lib/catalog/types";
  import {
    lessonSceneSrc,
    storySettingForLesson,
  } from "$lib/lesson-story/story-settings";
  import { cx } from "$lib/ui/classes";

  const featuredWord = words.find((word) => word.slug === "priatel") ?? words[0];
  const featuredHref = dictionaryPathForSense(featuredWord, words);
  const featuredSenses = featuredWord.english
    .split(";")
    .map((sense) => sense.trim())
    .filter(Boolean);
  const featuredExample = featuredWord.examples[0];
  const featuredGender = featuredWord.gender
    ? nounGenderLabel(featuredWord.gender, featuredWord.pluralOnlyGender)
    : undefined;

  const featuredForms = featuredWord.declension
    ? declensionRows(featuredWord.slovak, featuredWord.declension, featuredWord.gender)
    : [];

  const [firstTrack, ...otherTracks] = lessonTracks;
  const firstLessons = lessonsForTrack(firstTrack.id).map((lesson, index) => ({
    lesson,
    number: index + 1,
    setting: storySettingForLesson(lesson.id),
  }));
  const startLesson = firstLessons[0].lesson;
  const lessonCount = lessonTracks.reduce(
    (total, track) => total + lessonsForTrack(track.id).length,
    0,
  );

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
      // A taste of each group; "All words" covers the rest.
      entries: words.filter((word) => word.topics?.includes(topic)).slice(0, 6),
    }))
    .filter((group) => group.entries.length > 0);

  const commonLists = (["noun", "verb", "adjective", "adverb"] as const).map(
    (partOfSpeech) => ({
      href: `/dictionary/common/${partOfSpeech}`,
      label: FREQUENCY_PART_OF_SPEECH_LABEL[partOfSpeech].toLowerCase(),
    }),
  );

  const practiceGroups = lessonTracks
    .map((track) => ({
      track,
      sets: practiceSets.filter((set) => set.track === track.id),
    }))
    .filter((group) => group.sets.length > 0);

  const moduleHeadingClass =
    "m-0 border-b-2 border-slate-900 pb-2 text-[1.25rem] font-bold tracking-[-0.01em]";
  const labelClass =
    "m-0 text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-slate-600";
  const moreLinkClass = "text-[0.9rem] font-semibold text-blue-800 hover:underline";
  const listRowClass = "border-b border-slate-200 py-2";
  const formCellClass = "border border-slate-200 px-2.5 py-1.5";
  const endingClass = "rounded-[2px] bg-mark px-px font-semibold";

  function firstSense(english: string): string {
    return english.split(";")[0].trim();
  }
</script>

{#snippet moduleHead(id: string, title: string, linkHref?: string, linkLabel?: string)}
  <div class="flex items-baseline justify-between gap-6 border-b-2 border-slate-900 pb-2">
    <h2 {id} class="m-0 text-[1.25rem] font-bold tracking-[-0.01em]">{title}</h2>

    {#if linkHref && linkLabel}
      <a class={cx(moreLinkClass, "shrink-0")} href={linkHref}>{linkLabel} ›</a>
    {/if}
  </div>
{/snippet}

<main class="pb-20 max-[800px]:pb-14">
  <PageShell class="pt-8 max-[800px]:pt-6">
    <header class="border-b border-slate-200 pb-5">
      <h1 class="m-0 text-[clamp(1.5rem,2.6vw,2rem)] font-bold tracking-[-0.02em]">
        Slovak–English dictionary and lessons
      </h1>

      <p class="m-0 mt-1.5 text-[0.95rem] text-slate-600">
        Free, for English speakers. {words.length.toLocaleString("en")} words,
        {grammarEntries.length} grammar guides, {lessonCount} lessons and
        {practiceSets.length} practice sets.
      </p>
    </header>

    <div
      class="mt-8 grid grid-cols-[minmax(0,1fr)_22rem] gap-x-12 gap-y-12 max-[900px]:grid-cols-1"
    >
      <section aria-labelledby="featured-heading">
        <h2 id="featured-heading" class={moduleHeadingClass}>Sample entry</h2>

        <p class="m-0 mt-3 text-[0.9rem] leading-snug text-slate-600">
          What a noun entry gives you: its meanings, a real sentence and all twelve forms.
        </p>

        <div class="pt-4">
          <p class="m-0">
            <a
              class="font-serif text-[clamp(2.5rem,5vw,3.25rem)] font-semibold leading-none tracking-[-0.02em] text-slate-900 hover:text-blue-800"
              href={featuredHref}
              lang="sk"
            >
              {featuredWord.slovak}
            </a>
          </p>

          <p
            class="m-0 mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.95rem] text-slate-700"
          >
            <span class="font-semibold italic text-slate-900">noun</span>

            {#if featuredGender}
              <span>{featuredGender.english}</span>
            {/if}

            {#if featuredWord.declension}
              <span>
                plural
                <span class="font-serif font-semibold text-slate-900" lang="sk">
                  {featuredWord.declension.plural[0]}
                </span>
              </span>
            {/if}

            {#if featuredWord.frequency}
              <span>
                #{featuredWord.frequency.rank} among {FREQUENCY_PART_OF_SPEECH_LABEL[
                  featuredWord.frequency.partOfSpeech
                ].toLowerCase()}
              </span>
            {/if}
          </p>

          <div
            class="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-x-10 gap-y-6 max-[560px]:grid-cols-1"
          >
            <div>
              <h3 class={labelClass}>What it means</h3>

              <ol class="m-0 mt-2 list-none p-0">
                {#each featuredSenses as sense, index (sense)}
                  <li class="flex items-baseline gap-2.5 py-0.5">
                    <span class="text-[0.9rem] font-bold tabular-nums">{index + 1}</span>
                    <span class="text-[1.15rem] font-semibold">{sense}</span>
                  </li>
                {/each}
              </ol>
            </div>

            {#if featuredExample}
              <div>
                <h3 class={labelClass}>In a sentence</h3>

                <p
                  class="m-0 mt-2 font-serif text-[1.2rem] leading-snug text-slate-900"
                  lang="sk"
                >
                  {#each highlightLemmaInText(featuredExample.slovak, featuredWord.slovak, featuredWord.category) as part, partIndex (`${partIndex}-${part.text}`)}
                    {#if part.hit}
                      <span class="rounded-[2px] bg-mark px-px font-semibold"
                        >{part.text}</span
                      >
                    {:else}
                      {part.text}
                    {/if}
                  {/each}
                </p>

                <p class="m-0 mt-0.5 text-[0.9rem] text-slate-600">
                  {featuredExample.english}
                </p>
              </div>
            {/if}
          </div>

          {#if featuredForms.length > 0}
            <h3 class={cx(labelClass, "mt-7")}>Forms</h3>

            <table
              class="mt-2 w-full border-collapse border border-slate-200 text-left text-[0.9rem]"
            >
              <thead>
                <tr class="bg-subtle text-[0.75rem] text-slate-700">
                  <th class={cx(formCellClass, "font-semibold")} scope="col">Case</th>
                  <th class={cx(formCellClass, "font-semibold")} scope="col">Singular</th>
                  <th class={cx(formCellClass, "font-semibold")} scope="col">Plural</th>
                </tr>
              </thead>

              <tbody>
                {#each featuredForms as row (row.caseSlug)}
                  <tr>
                    <th class={cx(formCellClass, "font-normal")} scope="row">
                      <a
                        class="font-semibold text-blue-800 hover:underline"
                        href="/grammar/cases/{row.caseSlug}"
                      >
                        {sentenceCase(row.caseName)}
                      </a>
                    </th>
                    <td class={cx(formCellClass, "font-serif text-[1rem]")} lang="sk">
                      {row.singular.stem}{#if row.singular.ending}<span
                          class={endingClass}>{row.singular.ending}</span
                        >{/if}
                    </td>
                    <td class={cx(formCellClass, "font-serif text-[1rem]")} lang="sk">
                      {row.plural.stem}{#if row.plural.ending}<span class={endingClass}
                          >{row.plural.ending}</span
                        >{/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {/if}

          <p class="m-0 mt-5">
            <a class={moreLinkClass} href={featuredHref}>
              Full entry: examples, frequency and related words ›
            </a>
          </p>
        </div>
      </section>

      <section class="max-[900px]:order-first" aria-labelledby="learn-heading">
        <h2 id="learn-heading" class={moduleHeadingClass}>Learn Slovak</h2>

        <p class="m-0 mt-3 text-[0.9rem] leading-snug text-slate-600">
          {firstTrack.title}: a short conversation in each lesson, then drills. No account
          needed.
        </p>

        <ol class="m-0 mt-3 list-none p-0">
          {#each firstLessons as item (item.lesson.id)}
            <li>
              <a
                class="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-3 border-b border-slate-200 py-2.5"
                href={lessonPath(item.lesson)}
              >
                <img
                  class="block size-14 rounded-[4px] object-cover"
                  src={lessonSceneSrc[item.setting.art]}
                  alt=""
                  width="56"
                  height="56"
                  loading={item.number === 1 ? "eager" : "lazy"}
                  decoding="async"
                />

                <span class="min-w-0">
                  <span class="block text-[0.75rem] text-slate-600">
                    Lesson {item.number}
                    {#if item.setting.placeSk}
                      ·
                      <span class="font-serif text-[0.85rem]" lang="sk">
                        {item.setting.placeSk}
                      </span>
                    {/if}
                  </span>

                  <span
                    class="block text-[0.95rem] font-semibold leading-snug text-blue-800 group-hover:underline"
                  >
                    {item.lesson.title}
                  </span>
                </span>
              </a>
            </li>
          {/each}
        </ol>

        <Button class="mt-4 w-full rounded-[4px]" href={lessonPath(startLesson)}>
          Start lesson 1
        </Button>

        <p class="m-0 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem]">
          {#each otherTracks as track (track.id)}
            <a class="text-blue-800 hover:underline" href="/lessons/{track.id}">
              {track.title} ({lessonsForTrack(track.id).length})
            </a>
          {/each}

          <a class="text-blue-800 hover:underline" href="/lessons">All lessons</a>
        </p>
      </section>
    </div>

    <section class="mt-14 max-[800px]:mt-12" aria-labelledby="browse-heading">
      {@render moduleHead(
        "browse-heading",
        "Browse the dictionary",
        "/dictionary",
        `All ${words.length.toLocaleString("en")} words`,
      )}

      <nav class="mt-4" aria-label="Browse by first letter">
        <ul class="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {#each letters as letter (letter)}
            <li>
              <a
                class="grid h-9 min-w-9 place-items-center rounded-[4px] border border-slate-200 px-2 font-serif text-[1.05rem] text-slate-900 hover:border-blue-800 hover:bg-selected hover:text-blue-800"
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
        class="mt-7 grid grid-cols-5 gap-x-6 gap-y-8 max-[960px]:grid-cols-3 max-[560px]:grid-cols-2"
      >
        {#each wordGroups as group (group.category)}
          <section>
            <h3 class={labelClass}>{group.category}</h3>

            <ul class="m-0 mt-1.5 list-none p-0">
              {#each group.entries as word (word.slug)}
                <li>
                  <a
                    class="group block border-b border-slate-200 py-1.5"
                    href={dictionaryPathForSense(word, words)}
                  >
                    <span
                      class="block truncate font-serif text-[1.05rem] text-blue-800 group-hover:underline"
                      lang="sk"
                    >
                      {word.slovak}
                    </span>

                    <span class="block truncate text-[0.8rem] text-slate-600">
                      {firstSense(word.english)}
                    </span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>

      <p
        class="m-0 mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.9rem] text-slate-700"
      >
        <span class="font-semibold">Most common words:</span>

        {#each commonLists as list (list.href)}
          <a class="text-blue-800 hover:underline" href={list.href}>{list.label}</a>
        {/each}
      </p>
    </section>

    <div
      class="mt-14 grid grid-cols-[minmax(0,1fr)_22rem] gap-x-12 gap-y-12 max-[800px]:mt-12 max-[900px]:grid-cols-1"
    >
      <section aria-labelledby="grammar-heading">
        {@render moduleHead(
          "grammar-heading",
          "Grammar guides",
          "/grammar",
          "All grammar",
        )}

        <ul class="m-0 grid list-none grid-cols-2 gap-x-8 p-0 max-[640px]:grid-cols-1">
          {#each grammarEntries as entry (entry.slug)}
            <li class={listRowClass}>
              <a class="group block" href="/grammar/{entry.slug}">
                <span class="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span
                    class="text-[0.95rem] font-semibold text-blue-800 group-hover:underline"
                  >
                    {sentenceCase(entry.english)}
                  </span>
                  <span class="font-serif text-[0.9rem] text-slate-600" lang="sk">
                    {entry.slovak}
                  </span>
                </span>

                {#if entry.summary}
                  <span class="mt-0.5 block text-[0.85rem] leading-snug text-slate-600">
                    {entry.summary}
                  </span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </section>

      <div class="grid content-start gap-y-10">
        <section aria-labelledby="cases-heading">
          <h2 id="cases-heading" class={moduleHeadingClass}>The six cases</h2>

          <ul class="m-0 list-none p-0">
            {#each caseTopics as topic (topic.slug)}
              <li>
                <a
                  class="group flex items-baseline justify-between gap-3 border-b border-slate-200 py-2"
                  href="/grammar/cases/{topic.slug}"
                >
                  <span
                    class="text-[0.95rem] font-semibold text-blue-800 group-hover:underline"
                  >
                    {topic.name}
                  </span>
                  <span class="font-serif text-[0.9rem] text-slate-600" lang="sk">
                    {topic.question?.split("·")[0]?.trim()}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>

        <section aria-labelledby="pronunciation-heading">
          <h2 id="pronunciation-heading" class={moduleHeadingClass}>Pronunciation</h2>

          <ul class="m-0 list-none p-0">
            {#each pronunciationEntries as entry (entry.slug)}
              <li>
                <a
                  class="group flex flex-wrap items-baseline justify-between gap-x-3 border-b border-slate-200 py-2"
                  href="/pronunciation/{entry.slug}"
                >
                  <span
                    class="text-[0.95rem] font-semibold text-blue-800 group-hover:underline"
                  >
                    {sentenceCase(entry.english)}
                  </span>
                  <span class="ml-auto font-serif text-[0.9rem] text-slate-600" lang="sk">
                    {entry.slovak}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      </div>
    </div>

    <section class="mt-14 max-[800px]:mt-12" aria-labelledby="practice-heading">
      {@render moduleHead("practice-heading", "Practice", "/practice", "Open Practice")}

      <div
        class="mt-1 grid grid-cols-3 gap-x-8 gap-y-8 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1"
      >
        {#each practiceGroups as group (group.track.id)}
          <section>
            <h3 class={cx(labelClass, "pt-4")}>{group.track.title}</h3>

            <ul class="m-0 mt-1 list-none p-0">
              {#each group.sets as set (set.id)}
                <li class={listRowClass}>
                  <a class="group block" href="/practice/{set.id}">
                    <span
                      class="block text-[0.95rem] font-semibold text-blue-800 group-hover:underline"
                    >
                      {set.title}
                    </span>
                    <span class="mt-0.5 block text-[0.85rem] leading-snug text-slate-600">
                      {set.summary}
                    </span>
                  </a>
                </li>
              {/each}
            </ul>
          </section>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
