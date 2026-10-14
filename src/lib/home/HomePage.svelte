<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    caseTopics,
    grammarEntries,
    pronunciationEntries,
    words,
  } from "$lib/catalog/entries";
  import { lessonPath, lessonTracks, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSets } from "$lib/catalog/practice/sets";
  import { dictionaryPathForSense } from "$lib/catalog/dictionary/lemma-senses";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { nounGenderLabel } from "$lib/catalog/types";
  import {
    lessonSceneSrc,
    storySettingForLesson,
    type LessonSceneArtId,
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

  const startLesson = lessonsForTrack("everyday")[0];
  const startSetting = storySettingForLesson(startLesson.id);
  const startLine = startLesson.scene[0];

  // One scene per track, never repeating the lesson 1 picture above.
  const shownArt = new Set<LessonSceneArtId>([startSetting.art]);
  const lessonGroups = lessonTracks.map((track) => {
    const lessons = lessonsForTrack(track.id).map((lesson, index) => ({
      lesson,
      number: index + 1,
      setting: storySettingForLesson(lesson.id),
    }));
    const pictured = lessons.find(
      (item) => item.setting.art !== "default" && !shownArt.has(item.setting.art),
    );
    if (pictured) shownArt.add(pictured.setting.art);

    return { track, lessons, pictured };
  });

  const practiceGroups = lessonTracks
    .map((track) => ({
      track,
      sets: practiceSets.filter((set) => set.track === track.id),
    }))
    .filter((group) => group.sets.length > 0);

  const phraseOfTheDay = {
    gloss: [
      { slovak: "Dobrý", english: "good" },
      { slovak: "deň.", english: "day" },
      { slovak: "Ako", english: "how" },
      { slovak: "sa", english: "-self" },
      { slovak: "máte?", english: "you have" },
    ],
    english: "Good day. How are you?",
    note: "Word for word, Slovak asks how you have yourself. That small sa points the verb mať, to have, back at the person you are speaking to, and the -te ending keeps the question polite, which is what you want with anyone you have only just met.",
  };

  const wordGroups = ["Essentials", "Greetings", "Questions", "People", "Food"]
    .map((topic) => ({
      category: topic === "Food" ? "Food and drink" : topic,
      // A taste of each group; "Browse all" covers the rest.
      entries: words.filter((word) => word.topics?.includes(topic)).slice(0, 7),
    }))
    .filter((group) => group.entries.length > 0);

  const referenceGroups = [
    {
      title: "Grammar",
      items: grammarEntries.map((entry) => ({
        href: `/grammar/${entry.slug}`,
        label: sentenceCase(entry.english),
        slovak: entry.slovak,
      })),
    },
    {
      title: "The six cases",
      items: caseTopics.map((topic) => ({
        href: `/grammar/cases/${topic.slug}`,
        label: topic.name,
        slovak: topic.question?.split("·")[0]?.trim(),
      })),
    },
    {
      title: "Pronunciation",
      items: pronunciationEntries.map((entry) => ({
        href: `/pronunciation/${entry.slug}`,
        label: sentenceCase(entry.english),
        slovak: entry.slovak,
      })),
    },
  ];

  const sectionHeadClass =
    "flex items-baseline justify-between gap-6 border-b border-slate-200 pb-2.5";
  const sectionTitleClass = "m-0 text-[1.1rem] font-semibold tracking-[-0.01em]";
  const groupTitleClass =
    "m-0 text-[0.8rem] font-semibold tracking-normal text-slate-600";
  const linkClass = "text-blue-800 hover:underline";

  function firstSense(english: string): string {
    return english.split(";")[0].trim();
  }
</script>

{#snippet sectionHead(id: string, title: string, linkHref?: string, linkLabel?: string)}
  <div class={sectionHeadClass}>
    <h2 {id} class={sectionTitleClass}>{title}</h2>

    {#if linkHref && linkLabel}
      <TextLink class="shrink-0" href={linkHref}>{linkLabel}</TextLink>
    {/if}
  </div>
{/snippet}

<main class="pb-20 max-[800px]:pb-14">
  <PageShell class="grid gap-y-16 pt-10 max-[800px]:gap-y-12 max-[800px]:pt-7">
    <h1 class="sr-only">Slovak Wiki</h1>

    <div
      class="grid grid-cols-[20rem_minmax(0,1fr)] gap-x-12 gap-y-12 max-[960px]:grid-cols-1"
    >
      <section aria-labelledby="word-heading">
        {@render sectionHead("word-heading", "Word to know", featuredHref, "Full entry")}

        <a class="group mt-5 inline-block" href={featuredHref}>
          <span
            class="block font-serif text-[3.25rem] font-medium leading-none tracking-[-0.03em] text-slate-900 group-hover:text-blue-800"
            lang="sk"
          >
            {featuredWord.slovak}
          </span>
        </a>

        <p class="m-0 mt-2.5 text-[0.85rem] text-slate-600">
          {featuredWord.category === "Nouns"
            ? "noun"
            : featuredWord.category.toLowerCase()}

          {#if featuredGender}
            · {featuredGender.english}
          {/if}
        </p>

        <ol class="m-0 mt-3.5 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
          {#each featuredSenses as sense, index (sense)}
            <li class="flex items-baseline gap-1.5 text-[1.1rem] font-medium">
              <span class="text-[0.78rem] tabular-nums text-slate-500">{index + 1}</span>
              {sense}
            </li>
          {/each}
        </ol>

        {#if featuredExample}
          <p
            class="m-0 mt-4 font-serif text-[1.1rem] leading-snug text-slate-900"
            lang="sk"
          >
            {#each highlightLemmaInText(featuredExample.slovak, featuredWord.slovak, featuredWord.category) as part, partIndex (`${partIndex}-${part.text}`)}
              {#if part.hit}
                <span class="font-semibold">{part.text}</span>
              {:else}
                {part.text}
              {/if}
            {/each}
          </p>

          <p class="m-0 mt-0.5 text-[0.85rem] text-slate-600">
            {featuredExample.english}
          </p>
        {/if}

        <dl
          class="m-0 mt-5 grid grid-cols-[6.5rem_minmax(0,1fr)] border-t border-slate-200 text-[0.85rem]"
        >
          {#if featuredWord.declension}
            <dt class="border-b border-slate-200 py-2 text-slate-600">Plural</dt>
            <dd
              class="m-0 border-b border-slate-200 py-2 font-serif text-[0.95rem]"
              lang="sk"
            >
              {featuredWord.declension.plural[0]}
            </dd>
          {/if}

          {#if featuredWord.frequency}
            <dt class="border-b border-slate-200 py-2 text-slate-600">Frequency</dt>
            <dd class="m-0 border-b border-slate-200 py-2">
              <span class="font-semibold tabular-nums"
                >#{featuredWord.frequency.rank}</span
              >
              among {FREQUENCY_PART_OF_SPEECH_LABEL[
                featuredWord.frequency.partOfSpeech
              ].toLowerCase()}
            </dd>
          {/if}
        </dl>
      </section>

      <section aria-labelledby="start-heading">
        {@render sectionHead(
          "start-heading",
          "Start with lesson 1",
          "/lessons",
          "All lessons",
        )}

        <div
          class="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-8 gap-y-5 max-[640px]:grid-cols-1"
        >
          <img
            class="block aspect-[3/2] w-full rounded-[2px] object-cover"
            src={lessonSceneSrc[startSetting.art]}
            alt={startSetting.place}
            width="1536"
            height="1024"
            loading="eager"
            decoding="async"
          />

          <div>
            <p class="m-0 text-[0.78rem] text-slate-600">
              {lessonTracks[0].title} · Lesson 1 of {lessonGroups[0].lessons.length}
            </p>

            <h3 class="m-0 mt-1 text-[1.25rem] font-semibold tracking-[-0.01em]">
              <a class="hover:text-blue-800" href={lessonPath(startLesson)}>
                {startLesson.title}
              </a>
            </h3>

            {#if startSetting.placeSk}
              <p class="m-0 mt-1 text-[0.85rem] text-slate-600">
                <span class="font-serif text-[0.95rem] text-slate-900" lang="sk">
                  {startSetting.placeSk}
                </span>
                · {startSetting.place}
              </p>
            {/if}

            <p class="m-0 mt-3 text-[0.95rem] leading-relaxed text-slate-700">
              {startLesson.promise}
            </p>

            {#if startLine}
              <div
                class="mt-4 grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2 border-t border-slate-200 pt-3"
              >
                <span class="pt-1 text-[0.75rem] font-semibold text-slate-500">
                  {startLine.speaker}
                </span>

                <div>
                  <p
                    class="m-0 font-serif text-[1.1rem] leading-snug text-slate-900"
                    lang="sk"
                  >
                    {startLine.slovak}
                  </p>
                  <p class="m-0 mt-0.5 text-[0.8rem] text-slate-600">
                    {startLine.english}
                  </p>
                </div>
              </div>
            {/if}

            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                class="min-h-10 rounded-[3px] px-4 text-[0.9rem]"
                href={lessonPath(startLesson)}
              >
                Start lesson
              </Button>

              <span class="max-w-[16rem] text-[0.75rem] leading-snug text-slate-600">
                Free. No account. Progress stays in this browser.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section aria-labelledby="words-heading">
      {@render sectionHead(
        "words-heading",
        "Words you will reach for first",
        "/dictionary",
        `Browse all ${words.length.toLocaleString("en")} words`,
      )}

      <div
        class="mt-5 grid grid-cols-5 gap-x-6 gap-y-8 max-[960px]:grid-cols-3 max-[560px]:grid-cols-2"
      >
        {#each wordGroups as group (group.category)}
          <section>
            <h3 class={cx(groupTitleClass, "mb-1.5")}>{group.category}</h3>

            {#each group.entries as word (word.slug)}
              <a
                class={cx(
                  "group -mx-1.5 grid grid-cols-[minmax(0,5.75rem)_minmax(0,1fr)] items-baseline gap-x-2 px-1.5 py-[3px]",
                  word.slug === featuredWord.slug && "bg-selected",
                )}
                href={dictionaryPathForSense(word, words)}
              >
                <span
                  class="truncate font-serif text-[1rem] text-slate-900 group-hover:text-blue-800"
                  lang="sk"
                >
                  {word.slovak}
                </span>

                <span class="truncate text-[0.8rem] text-slate-600">
                  {firstSense(word.english)}
                </span>
              </a>
            {/each}
          </section>
        {/each}
      </div>
    </section>

    <section aria-labelledby="phrase-heading">
      {@render sectionHead("phrase-heading", "Take a phrase apart")}

      <div
        class="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-14 gap-y-6 max-[960px]:grid-cols-1"
      >
        <p
          class="m-0 flex flex-wrap items-end gap-x-5 gap-y-4 self-start max-[480px]:gap-x-3.5"
          lang="sk"
        >
          {#each phraseOfTheDay.gloss as token (token.slovak)}
            <span class="grid gap-1.5">
              <span
                class="border-b border-slate-300 pb-1 font-serif text-[clamp(1.6rem,3vw,2.25rem)] leading-none text-slate-900"
              >
                {token.slovak}
              </span>

              <span class="text-[0.78rem] text-slate-600" lang="en">{token.english}</span>
            </span>
          {/each}
        </p>

        <div>
          <p class="m-0 text-[1rem] font-semibold">{phraseOfTheDay.english}</p>

          <p class="m-0 mt-2 max-w-[66ch] text-[0.95rem] leading-[1.65] text-slate-700">
            {phraseOfTheDay.note}
          </p>

          <p class="m-0 mt-3">
            <TextLink href={lessonPath(startLesson)}
              >Use it in the greeting lesson</TextLink
            >
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="tracks-heading">
      {@render sectionHead(
        "tracks-heading",
        "Start inside a scene",
        "/lessons",
        "All lessons",
      )}

      <p class="m-0 mt-4 max-w-[72ch] text-[0.95rem] leading-relaxed text-slate-700">
        Every track opens with a short conversation, lifts out the phrases worth keeping,
        then asks you to rebuild them from memory. There is nothing to sign up for, and
        stopping after a single scene still counts.
      </p>

      {#each lessonGroups as group (group.track.id)}
        <div
          class="mt-6 grid grid-cols-[12rem_10rem_minmax(0,1fr)] gap-x-8 gap-y-4 border-t border-slate-200 pt-5 max-[960px]:grid-cols-[10rem_minmax(0,1fr)] max-[560px]:grid-cols-1"
        >
          <div>
            <h3 class="m-0 text-[0.95rem] font-semibold tracking-normal">
              <a class="hover:text-blue-800" href="/lessons/{group.track.id}">
                {group.track.title}
              </a>
            </h3>

            <p class="m-0 mt-1 text-[0.8rem] leading-snug text-slate-600">
              {group.track.description}
            </p>
          </div>

          {#if group.pictured}
            <figure class="m-0 max-[960px]:hidden">
              <img
                class="block aspect-[3/2] w-full rounded-[2px] object-cover"
                src={lessonSceneSrc[group.pictured.setting.art]}
                alt={group.pictured.setting.place}
                width="1536"
                height="1024"
                loading="lazy"
                decoding="async"
              />

              {#if group.pictured.setting.placeSk}
                <figcaption class="mt-1.5 text-[0.75rem] text-slate-600">
                  {group.pictured.number} ·
                  <span class="font-serif text-[0.85rem] text-slate-900" lang="sk">
                    {group.pictured.setting.placeSk}
                  </span>
                </figcaption>
              {/if}
            </figure>
          {:else}
            <span class="max-[960px]:hidden"></span>
          {/if}

          <ol class="m-0 list-none p-0">
            {#each group.lessons as item (item.lesson.id)}
              <li
                class="grid grid-cols-[1.25rem_minmax(0,15rem)_minmax(0,1fr)] gap-x-4 border-b border-slate-200 py-2.5 first:pt-0 last:border-b-0 max-[760px]:grid-cols-[1.25rem_minmax(0,1fr)]"
              >
                <span class="text-[0.78rem] tabular-nums text-slate-500"
                  >{item.number}</span
                >

                <span>
                  <a
                    class="block text-[0.95rem] font-medium {linkClass}"
                    href={lessonPath(item.lesson)}
                  >
                    {item.lesson.title}
                  </a>

                  {#if item.setting.placeSk}
                    <span
                      class="block font-serif text-[0.85rem] text-slate-600"
                      lang="sk"
                    >
                      {item.setting.placeSk}
                    </span>
                  {/if}
                </span>

                <span
                  class="text-[0.85rem] leading-snug text-slate-600 max-[760px]:col-start-2"
                >
                  {item.lesson.promise}
                </span>
              </li>
            {/each}
          </ol>
        </div>
      {/each}
    </section>

    <div
      class="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-x-12 gap-y-12 max-[960px]:grid-cols-1"
    >
      <section aria-labelledby="reference-heading">
        {@render sectionHead("reference-heading", "When you need the rule, not a lesson")}

        <p class="m-0 mt-4 max-w-[70ch] text-[0.95rem] leading-relaxed text-slate-700">
          Four places to land when a form stops making sense halfway through a sentence.
          Each entry keeps the explanation short, shows the pattern beside a real example,
          and points you to the lesson that drills it.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-x-10 gap-y-6 max-[560px]:grid-cols-1">
          {#each referenceGroups as group (group.title)}
            <section class={group.title === "Grammar" ? "row-span-2" : ""}>
              <h3 class={cx(groupTitleClass, "mb-1.5")}>{group.title}</h3>

              <ul class="m-0 list-none p-0">
                {#each group.items as item (item.href)}
                  <li
                    class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 py-[3px]"
                  >
                    <a class="text-[0.9rem] {linkClass}" href={item.href}>{item.label}</a>

                    {#if item.slovak}
                      <span class="font-serif text-[0.95rem] text-slate-900" lang="sk">
                        {item.slovak}
                      </span>
                    {/if}
                  </li>
                {/each}
              </ul>
            </section>
          {/each}
        </div>

        <p class="m-0 mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[0.9rem]">
          <a class={linkClass} href="/dictionary">Dictionary</a>
          <a class={linkClass} href="/dictionary/common/verb">Most common words</a>
          <a class={linkClass} href="/glossary">Glossary</a>
        </p>
      </section>

      <section aria-labelledby="practice-heading">
        {@render sectionHead("practice-heading", "Drill the forms that stick")}

        <p class="m-0 mt-4 text-[0.95rem] leading-relaxed text-slate-700">
          Short topic sheets you can reopen anytime. Lesson completion stays on this
          device so you can pick up where you left off — no streaks, no scores.
        </p>

        {#each practiceGroups as group (group.track.id)}
          <h3 class={cx(groupTitleClass, "mt-5 mb-1.5")}>{group.track.title}</h3>

          <ul class="m-0 list-none p-0">
            {#each group.sets as set (set.id)}
              <li class="py-[3px]">
                <a class="text-[0.9rem] {linkClass}" href="/practice/{set.id}"
                  >{set.title}</a
                >
              </li>
            {/each}
          </ul>
        {/each}

        <p class="m-0 mt-5">
          <TextLink href="/practice">Open Practice</TextLink>
        </p>
      </section>
    </div>
  </PageShell>
</main>
