<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { words } from "$lib/catalog/entries";
  import { lessonPath, lessonTracks, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSets } from "$lib/catalog/practice/sets";
  import { dictionaryPathForSense } from "$lib/catalog/dictionary/lemma-senses";
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
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
  const featuredExamples = featuredWord.examples.slice(0, 2);
  const featuredGender = featuredWord.gender
    ? nounGenderLabel(featuredWord.gender, featuredWord.pluralOnlyGender)
    : undefined;

  const firstLessons = lessonsForTrack("everyday");
  const startLesson = firstLessons[0];
  const startSetting = storySettingForLesson(startLesson.id);
  const startLine = startLesson.scene[0];

  const lessonGroups = lessonTracks.map((track) => ({
    track,
    lessons: lessonsForTrack(track.id).map((lesson, index) => ({
      lesson,
      number: index + 1,
      setting: storySettingForLesson(lesson.id),
    })),
  }));

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

  const wordGroups = [
    "Essentials",
    "Greetings",
    "Questions",
    "People",
    "Conversation",
    "Learning",
    "Food",
  ]
    .map((topic) => ({
      category: topic,
      // A taste of each group; "Browse all" covers the rest.
      entries: words.filter((word) => word.topics?.includes(topic)).slice(0, 6),
    }))
    .filter((group) => group.entries.length > 0);

  const referenceSections = [
    {
      href: "/dictionary",
      title: "Dictionary",
      desc: "Every word with its meaning, a sentence you could actually say, and the entries it connects to.",
    },
    {
      href: "/grammar",
      title: "Grammar",
      desc: "Gender, cases, and verb endings written as patterns you can copy straight into a sentence.",
    },
    {
      href: "/pronunciation",
      title: "Pronunciation",
      desc: "Where the stress lands, how long a vowel is held, and the soft consonants English ears miss.",
    },
    {
      href: "/glossary",
      title: "Glossary",
      desc: "Plain definitions for the grammar words the rest of the site leans on, so nothing arrives unexplained.",
    },
  ];

  const sectionHeadClass =
    "flex items-baseline justify-between gap-6 border-b border-slate-200 pb-2.5";
  const sectionTitleClass = "m-0 text-[1.05rem] font-semibold tracking-[-0.01em]";
  const glossRowClass = cx(
    "group grid grid-cols-[6.25rem_minmax(0,1fr)] items-baseline gap-x-2.5 py-[3px]",
  );

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
  <PageShell class="pt-10 max-[800px]:pt-6">
    <header class="border-b border-slate-200 pb-5">
      <h1 class="sr-only">Slovak Wiki</h1>

      <p class="m-0 max-w-[70ch] text-[1.05rem] leading-relaxed text-slate-700">
        Short lessons and a practical reference for the forms you want to remember.
        <span class="text-slate-600">
          Diacritics are optional when you search:
          <span class="font-serif text-slate-900" lang="sk">priatel</span>
          finds
          <span class="font-serif text-slate-900" lang="sk">priateľ</span>.
        </span>
      </p>
    </header>

    <div
      class="mt-10 grid grid-cols-[minmax(0,1fr)_20rem] gap-x-12 gap-y-14 max-[900px]:mt-8 max-[900px]:grid-cols-1 max-[900px]:gap-y-12"
    >
      <div class="grid content-start gap-y-14 max-[900px]:contents">
        <section class="max-[900px]:order-1" aria-labelledby="word-heading">
          {@render sectionHead(
            "word-heading",
            "Word to know",
            featuredHref,
            "Open the full entry",
          )}

          <div
            class="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-10 gap-y-6 max-[640px]:grid-cols-1"
          >
            <div>
              <a class="group inline-block" href={featuredHref}>
                <span
                  class="block font-serif text-[clamp(2.75rem,5vw,3.5rem)] font-medium leading-none tracking-[-0.03em] text-slate-900 group-hover:text-blue-800"
                  lang="sk"
                >
                  {featuredWord.slovak}
                </span>
              </a>

              <p class="m-0 mt-3 text-[0.85rem] text-slate-600">
                {featuredWord.category === "Nouns"
                  ? "noun"
                  : featuredWord.category.toLowerCase()}

                {#if featuredGender}
                  · {featuredGender.english}
                {/if}
              </p>

              <ol class="m-0 mt-4 flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
                {#each featuredSenses as sense, index (sense)}
                  <li class="flex items-baseline gap-2 text-[1.15rem] font-medium">
                    <span class="text-[0.8rem] tabular-nums text-slate-500"
                      >{index + 1}</span
                    >
                    {sense}
                  </li>
                {/each}
              </ol>

              {#if featuredWord.frequency}
                <p class="m-0 mt-5 text-[0.8rem] text-slate-600">
                  <span class="font-semibold tabular-nums text-slate-900">
                    #{featuredWord.frequency.rank}
                  </span>
                  among {FREQUENCY_PART_OF_SPEECH_LABEL[
                    featuredWord.frequency.partOfSpeech
                  ].toLowerCase()} in the Slovak National Corpus
                </p>
              {/if}
            </div>

            <ul class="m-0 grid list-none content-start gap-4 p-0">
              {#each featuredExamples as example (example.slovak)}
                <li>
                  <p
                    class="m-0 font-serif text-[1.15rem] leading-snug text-slate-900"
                    lang="sk"
                  >
                    {#each highlightLemmaInText(example.slovak, featuredWord.slovak, featuredWord.category) as part, partIndex (`${partIndex}-${part.text}`)}
                      {#if part.hit}
                        <span class="font-semibold">{part.text}</span>
                      {:else}
                        {part.text}
                      {/if}
                    {/each}
                  </p>

                  <p class="m-0 mt-0.5 text-[0.85rem] text-slate-600">
                    {example.english}
                  </p>
                </li>
              {/each}
            </ul>
          </div>
        </section>

        <section class="max-[900px]:order-3" aria-labelledby="words-heading">
          {@render sectionHead(
            "words-heading",
            "Words you will reach for first",
            "/dictionary",
            `Browse all ${words.length.toLocaleString("en")} words`,
          )}

          <div
            class="mt-5 columns-3 gap-x-8 max-[1000px]:columns-2 max-[480px]:columns-1"
          >
            {#each wordGroups as group (group.category)}
              <section class="mb-6 break-inside-avoid">
                <h3
                  class="m-0 mb-1.5 text-[0.75rem] font-semibold tracking-normal text-slate-600"
                >
                  {group.category}
                </h3>

                {#each group.entries as word (word.slug)}
                  <a class={glossRowClass} href={dictionaryPathForSense(word, words)}>
                    <span
                      class="truncate font-serif text-[1rem] text-slate-900 group-hover:text-blue-800"
                      lang="sk"
                    >
                      {word.slovak}
                    </span>

                    <span class="text-[0.8rem] leading-snug text-slate-600">
                      {firstSense(word.english)}
                    </span>
                  </a>
                {/each}
              </section>
            {/each}
          </div>
        </section>

        <section class="max-[900px]:order-4" aria-labelledby="phrase-heading">
          {@render sectionHead(
            "phrase-heading",
            "Take a phrase apart",
            lessonPath(startLesson),
            "Use it in the greeting lesson",
          )}

          <p
            class="m-0 mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 max-[480px]:gap-x-3.5"
            lang="sk"
          >
            {#each phraseOfTheDay.gloss as token (token.slovak)}
              <span class="grid gap-1.5">
                <span
                  class="border-b border-slate-300 pb-1 font-serif text-[clamp(1.6rem,3.4vw,2.4rem)] leading-none text-slate-900"
                >
                  {token.slovak}
                </span>

                <span class="text-[0.78rem] text-slate-600" lang="en"
                  >{token.english}</span
                >
              </span>
            {/each}
          </p>

          <p class="m-0 mt-5 text-[1rem] font-semibold">{phraseOfTheDay.english}</p>

          <p class="m-0 mt-2 max-w-[66ch] text-[0.95rem] leading-[1.65] text-slate-700">
            {phraseOfTheDay.note}
          </p>
        </section>
      </div>

      <div class="grid content-start gap-y-14 max-[900px]:contents">
        <section class="max-[900px]:order-2" aria-labelledby="scene-heading">
          {@render sectionHead(
            "scene-heading",
            "Start inside a scene",
            "/lessons",
            "All lessons",
          )}

          <figure class="m-0 mt-6">
            <img
              class="block aspect-[3/2] w-full rounded-[2px] object-cover"
              src={lessonSceneSrc[startSetting.art]}
              alt={startSetting.place}
              width="1536"
              height="1024"
              loading="eager"
              decoding="async"
            />

            <figcaption class="mt-3">
              <span class="block text-[0.75rem] text-slate-500">
                Lesson 1 · {lessonTracks[0].title}
              </span>

              <a
                class="mt-0.5 block text-[1.05rem] font-semibold hover:text-blue-800"
                href={lessonPath(startLesson)}
              >
                {startLesson.title}
              </a>

              {#if startSetting.placeSk}
                <span class="mt-0.5 block text-[0.85rem] text-slate-600">
                  <span class="font-serif text-[0.95rem] text-slate-900" lang="sk">
                    {startSetting.placeSk}
                  </span>
                  · {startSetting.place}
                </span>
              {/if}
            </figcaption>
          </figure>

          {#if startLine}
            <div
              class="mt-4 grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2 border-t border-slate-200 pt-3.5"
            >
              <span class="pt-1 text-[0.72rem] font-semibold text-slate-500">
                {startLine.speaker}
              </span>

              <div>
                <p
                  class="m-0 font-serif text-[1.1rem] leading-snug text-slate-900"
                  lang="sk"
                >
                  {startLine.slovak}
                </p>

                <p class="m-0 mt-0.5 text-[0.8rem] text-slate-600">{startLine.english}</p>
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

            <span class="text-[0.75rem] leading-snug text-slate-500">
              Free. No account. Progress stays in this browser.
            </span>
          </div>
        </section>

        <section class="max-[900px]:order-5" aria-labelledby="tracks-heading">
          {@render sectionHead("tracks-heading", "Lessons by track")}

          <p class="m-0 mt-4 text-[0.85rem] leading-relaxed text-slate-600">
            Every track opens with a short conversation, lifts out the phrases worth
            keeping, then asks you to rebuild them from memory. There is nothing to sign
            up for, and stopping after a single scene still counts.
          </p>

          {#each lessonGroups as group (group.track.id)}
            <div class="mt-5 border-t border-slate-200 pt-3">
              <h3 class="m-0 text-[0.75rem] font-semibold tracking-normal text-slate-600">
                <a class="hover:text-blue-800" href="/lessons/{group.track.id}">
                  {group.track.title}
                </a>
              </h3>

              <ol class="m-0 mt-1.5 list-none p-0">
                {#each group.lessons as item (item.lesson.id)}
                  <li>
                    <a
                      class="group grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2 py-1"
                      href={lessonPath(item.lesson)}
                    >
                      <span class="text-[0.75rem] tabular-nums text-slate-500">
                        {item.number}
                      </span>

                      <span>
                        <span
                          class="block text-[0.9rem] font-medium group-hover:text-blue-800"
                        >
                          {item.lesson.title}
                        </span>

                        {#if item.setting.placeSk}
                          <span
                            class="block font-serif text-[0.85rem] text-slate-600"
                            lang="sk"
                          >
                            {item.setting.placeSk}
                          </span>
                        {/if}
                      </span>
                    </a>
                  </li>
                {/each}
              </ol>
            </div>
          {/each}
        </section>
      </div>
    </div>

    <section class="mt-20 max-[800px]:mt-14" aria-labelledby="practice-heading">
      {@render sectionHead(
        "practice-heading",
        "Drill the forms that stick",
        "/practice",
        "Open Practice",
      )}

      <p class="m-0 mt-4 max-w-[70ch] text-[0.95rem] leading-relaxed text-slate-700">
        Short topic sheets you can reopen anytime. Lesson completion stays on this device
        so you can pick up where you left off — no streaks, no scores.
      </p>

      <div class="mt-6 grid grid-cols-3 gap-x-10 gap-y-6 max-[900px]:grid-cols-1">
        {#each practiceGroups as group (group.track.id)}
          <div>
            <h3
              class="m-0 border-b border-slate-200 pb-1.5 text-[0.75rem] font-semibold tracking-normal text-slate-600"
            >
              {group.track.title}
            </h3>

            <ul class="m-0 list-none p-0">
              {#each group.sets as set (set.id)}
                <li class="border-b border-slate-200 py-2.5">
                  <a
                    class="text-[0.9rem] font-medium hover:text-blue-800"
                    href="/practice/{set.id}"
                  >
                    {set.title}
                  </a>

                  {#if set.summary}
                    <p class="m-0 mt-0.5 text-[0.8rem] leading-snug text-slate-600">
                      {set.summary}
                    </p>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </section>

    <section class="mt-20 max-[800px]:mt-14" aria-labelledby="reference-heading">
      {@render sectionHead("reference-heading", "When you need the rule, not a lesson")}

      <p class="m-0 mt-4 max-w-[70ch] text-[0.95rem] leading-relaxed text-slate-700">
        Four places to land when a form stops making sense halfway through a sentence.
        Each entry keeps the explanation short, shows the pattern beside a real example,
        and points you to the lesson that drills it.
      </p>

      <dl class="m-0 mt-5">
        {#each referenceSections as item (item.href)}
          <div
            class="grid grid-cols-[12rem_minmax(0,1fr)] gap-x-10 gap-y-1 border-b border-slate-200 py-3.5 max-[640px]:grid-cols-1"
          >
            <dt class="m-0">
              <a
                class="text-[0.95rem] font-semibold hover:text-blue-800"
                href={item.href}
              >
                {item.title}
              </a>
            </dt>

            <dd class="m-0 max-w-[62ch] text-[0.9rem] leading-relaxed text-slate-600">
              {item.desc}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  </PageShell>
</main>
