<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import {
    caseTopics,
    grammarEntries,
    pronunciationEntries,
    words,
  } from "$lib/content/data";
  import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";

  let { heroSearch }: { heroSearch: Snippet } = $props();

  const featuredWord = words.find((word) => word.slug === "dakujem") ?? words[0];
  const featuredExample = featuredWord.examples[0];

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

  const trackCards = lessonTracks.map((track, index) => {
    const trackLessons = lessonsForTrack(track.id);

    return {
      ...track,
      index: String(index + 1).padStart(2, "0"),
      lessonCount: trackLessons.length,
      preview: trackLessons[0]?.keyPhrases[0],
    };
  });

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
      entries: words.filter((word) => word.topics?.includes(topic)),
    }))
    .filter((group) => group.entries.length > 0);

  const referenceSections = [
    {
      href: "/dictionary",
      glyph: "ľ",
      title: "Dictionary",
      desc: "Every word with its meaning, a sentence you could actually say, and the entries it connects to.",
      action: "Browse words",
    },
    {
      href: "/grammar",
      glyph: "č",
      title: "Grammar",
      desc: "Gender, cases, and verb endings written as patterns you can copy straight into a sentence.",
      action: "Read patterns",
    },
    {
      href: "/pronunciation",
      glyph: "š",
      title: "Pronunciation",
      desc: "Where the stress lands, how long a vowel is held, and the soft consonants English ears miss.",
      action: "Hear the sounds",
    },
    {
      href: "/glossary",
      glyph: "ť",
      title: "Glossary",
      desc: "Plain definitions for the grammar words the rest of the site leans on, so nothing arrives unexplained.",
      action: "Check a term",
    },
  ];

  const stats = [
    { value: words.length, label: "dictionary entries" },
    { value: lessonTracks.length, label: "lesson tracks" },
    {
      value: grammarEntries.length + pronunciationEntries.length + caseTopics.length,
      label: "reference topics",
    },
  ];

  function firstSense(english: string): string {
    return english.split(";")[0].trim();
  }
</script>

{#snippet rail(index: string, label: string)}
  <div
    class="sticky top-[calc(var(--header-height)+2rem)] self-start max-[880px]:static max-[880px]:flex max-[880px]:items-baseline max-[880px]:gap-3"
  >
    <p
      class="m-0 font-serif text-[1.7rem] font-semibold leading-none tracking-[-0.05em] text-slate-300 tabular-nums"
    >
      {index}
    </p>

    <Eyebrow class="mt-3.5 max-[880px]:mt-0">{label}</Eyebrow>
  </div>
{/snippet}

<main>
  <section
    class="relative z-20 min-h-[min(80vh,700px)] max-[600px]:min-h-0"
    aria-label="Welcome"
  >
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden select-none font-serif text-[clamp(4rem,14vw,9rem)] font-semibold leading-none tracking-[-0.06em] text-slate-900/[0.045]"
      aria-hidden="true"
    >
      <span class="absolute left-[6%] top-[18%] rotate-[-8deg]" lang="sk">ľ</span>
      <span class="absolute right-[8%] top-[28%] rotate-[6deg]" lang="sk">č</span>
      <span class="absolute bottom-[18%] left-[14%] rotate-[4deg]" lang="sk">š</span>
      <span class="absolute bottom-[22%] right-[12%] rotate-[-5deg]" lang="sk">ť</span>
    </div>

    <PageShell
      class="relative flex min-h-[min(80vh,700px)] flex-col justify-center py-20 pb-28 max-[600px]:min-h-0 max-[600px]:py-12 max-[600px]:pb-16"
    >
      <div class="max-w-160">
        <p
          class="m-0 font-serif text-[clamp(3.25rem,8vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.05em] text-slate-900"
        >
          Slovak
          <br />
          <span class="text-blue-800">Wiki</span>
        </p>

        <h1
          class="mt-5 text-[clamp(1.25rem,2.4vw,1.55rem)] font-semibold leading-snug tracking-[-0.025em] text-slate-700"
        >
          Look it up. Learn it. Use it.
        </h1>

        <Lead class="mt-3">
          Short lessons and a practical reference for the forms you want to remember.
        </Lead>

        {@render heroSearch()}
      </div>
    </PageShell>
  </section>

  <PageShell class="pb-24 max-[880px]:pb-16">
    <div
      class="grid grid-cols-3 gap-x-10 gap-y-4 border-y border-slate-200 py-7 max-[560px]:grid-cols-1 max-[560px]:py-5"
    >
      {#each stats as stat (stat.label)}
        <p class="m-0 flex items-baseline gap-3">
          <span
            class="font-serif text-[1.75rem] font-semibold leading-none tracking-[-0.04em] text-slate-900 tabular-nums"
          >
            {stat.value}
          </span>
          <span class="text-[0.82rem] leading-tight text-slate-500">{stat.label}</span>
        </p>
      {/each}
    </div>

    <section
      class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-14 py-20 max-[880px]:grid-cols-1 max-[880px]:gap-y-7 max-[880px]:py-14"
      aria-labelledby="phrase-heading"
    >
      {@render rail("01", "Phrase")}

      <div>
        <h2 id="phrase-heading" class="m-0">Take a phrase apart</h2>

        <p
          class="mt-9 flex flex-wrap items-end gap-x-8 gap-y-6 font-serif text-[clamp(1.9rem,4.6vw,3rem)] font-semibold leading-none tracking-[-0.04em] text-slate-900"
          lang="sk"
        >
          {#each phraseOfTheDay.gloss as token (token.slovak)}
            <span class="grid gap-2">
              <span>{token.slovak}</span>
              <span
                class="border-t border-slate-300 pt-2 font-sans text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500"
                lang="en"
              >
                {token.english}
              </span>
            </span>
          {/each}
        </p>

        <p class="mt-8 font-serif text-lg italic text-slate-700">
          {phraseOfTheDay.english}
        </p>

        <p class="mt-4 max-w-[66ch] text-[0.95rem] leading-[1.7] text-slate-600">
          {phraseOfTheDay.note}
        </p>

        <p class="mt-6">
          <TextLink
            class="inline-flex items-center gap-1.5"
            href="/lessons/everyday/meet-someone"
          >
            Use it in the greeting lesson <ArrowRight />
          </TextLink>
        </p>
      </div>
    </section>

    <section
      class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-14 border-t border-slate-200 py-20 max-[880px]:grid-cols-1 max-[880px]:gap-y-7 max-[880px]:py-14"
      aria-labelledby="tracks-heading"
    >
      {@render rail("02", "Lessons")}

      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 id="tracks-heading" class="m-0">Start inside a scene</h2>
          <TextLink href="/lessons">All lessons</TextLink>
        </div>

        <p class="mt-4 max-w-[66ch] text-[0.95rem] leading-[1.7] text-slate-600">
          Every track opens with a short conversation, lifts out the phrases worth
          keeping, then asks you to rebuild them from memory. There is nothing to sign up
          for, and stopping after a single scene still counts.
        </p>

        <div class="mt-9 grid grid-cols-3 gap-4 max-[760px]:grid-cols-1">
          {#each trackCards as track (track.id)}
            <a
              class="group flex flex-col rounded-(--frame-radius) bg-surface/70 p-6 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover)"
              href="/lessons/{track.id}"
            >
              <div class="flex items-baseline justify-between gap-3">
                <strong
                  class="font-serif text-[1.3rem] font-semibold tracking-[-0.03em] text-slate-900 group-hover:text-blue-800"
                >
                  {track.title}
                </strong>
                <span class="font-serif text-sm tabular-nums text-slate-300">
                  {track.index}
                </span>
              </div>

              <p class="m-0 mt-2.5 text-sm leading-[1.6] text-slate-500">
                {track.description}
              </p>

              {#if track.preview}
                <div class="mt-6 border-t border-slate-200 pt-4">
                  <p class="m-0 font-serif text-[1.05rem] text-slate-900" lang="sk">
                    {track.preview.slovak}
                  </p>
                  <p class="m-0 mt-1 text-[0.8rem] text-slate-500">
                    {track.preview.english}
                  </p>
                </div>
              {/if}

              <div
                class="mt-auto flex items-baseline justify-between gap-3 pt-6 text-[0.78rem]"
              >
                <span class="text-slate-500">
                  {track.lessonCount}
                  {track.lessonCount === 1 ? "lesson" : "lessons"}
                </span>
                <span class="inline-flex items-center gap-1.5 font-bold text-blue-800">
                  Start <ArrowRight />
                </span>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <section
      class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-14 border-t border-slate-200 py-20 max-[880px]:grid-cols-1 max-[880px]:gap-y-7 max-[880px]:py-14"
      aria-labelledby="words-heading"
    >
      {@render rail("03", "Dictionary")}

      <div>
        <div class="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
          <h2 id="words-heading" class="m-0">Words you will reach for first</h2>
          <TextLink href="/dictionary">Full index</TextLink>
        </div>

        <div
          class="mt-9 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-end gap-x-10 gap-y-6 border-b border-slate-200 pb-9 max-[700px]:grid-cols-1"
        >
          <a class="group block" href="/dictionary/{featuredWord.slug}">
            <Eyebrow tone="muted">Word to know</Eyebrow>
            <p
              class="m-0 font-serif text-[clamp(2.4rem,5vw,3.1rem)] font-semibold leading-none tracking-[-0.045em] text-slate-900 group-hover:text-blue-800"
              lang="sk"
            >
              {featuredWord.slovak}
            </p>
            <p class="m-0 mt-3 text-sm text-slate-500">{featuredWord.english}</p>
          </a>

          {#if featuredExample}
            <div class="border-l-2 border-blue-200 pl-6">
              <p
                class="m-0 font-serif text-[1.15rem] leading-[1.5] text-slate-900"
                lang="sk"
              >
                {featuredExample.slovak}
              </p>
              <p class="m-0 mt-2 text-sm text-slate-500">{featuredExample.english}</p>
            </div>
          {/if}
        </div>

        <div class="mt-9 columns-3 gap-x-10 max-[900px]:columns-2 max-[560px]:columns-1">
          {#each wordGroups as group (group.category)}
            <section class="mb-8 break-inside-avoid">
              <Eyebrow tone="muted" compact>{group.category}</Eyebrow>

              {#each group.entries as word (word.slug)}
                <a
                  class="group flex items-baseline gap-2 py-1.5"
                  href="/dictionary/{word.slug}"
                >
                  <span
                    class="font-serif text-[1rem] text-slate-900 group-hover:text-blue-800"
                    lang="sk"
                  >
                    {word.slovak}
                  </span>
                  <span
                    class="min-w-3 flex-1 translate-y-[-0.2em] border-b border-dotted border-slate-300"
                    aria-hidden="true"
                  ></span>
                  <span class="text-[0.8rem] text-slate-500">
                    {firstSense(word.english)}
                  </span>
                </a>
              {/each}
            </section>
          {/each}
        </div>
      </div>
    </section>

    <section
      class="grid grid-cols-[7rem_minmax(0,1fr)] gap-x-14 border-t border-slate-200 py-20 max-[880px]:grid-cols-1 max-[880px]:gap-y-7 max-[880px]:py-14"
      aria-labelledby="reference-heading"
    >
      {@render rail("04", "Reference")}

      <div>
        <h2 id="reference-heading" class="m-0">When you need the rule, not a lesson</h2>

        <p class="mt-4 max-w-[66ch] text-[0.95rem] leading-[1.7] text-slate-600">
          Four places to land when a form stops making sense halfway through a sentence.
          Each entry keeps the explanation short, shows the pattern beside a real example,
          and points you to the lesson that drills it.
        </p>

        <div class="mt-9 grid grid-cols-2 gap-4 max-[640px]:grid-cols-1">
          {#each referenceSections as item (item.href)}
            <a
              class="group relative isolate flex flex-col overflow-hidden rounded-(--frame-radius) bg-surface/70 p-6 shadow-(--shadow-border) transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-surface hover:shadow-(--shadow-border-hover)"
              href={item.href}
            >
              <span
                class="pointer-events-none absolute -right-1 -top-7 -z-10 select-none font-serif text-[6rem] leading-none text-slate-900/[0.05]"
                aria-hidden="true"
                lang="sk"
              >
                {item.glyph}
              </span>

              <strong
                class="font-serif text-xl font-semibold tracking-[-0.03em] text-slate-900 group-hover:text-blue-800"
              >
                {item.title}
              </strong>

              <p class="m-0 mt-2.5 text-sm leading-[1.6] text-slate-500">
                {item.desc}
              </p>

              <span
                class="mt-6 inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-blue-800"
              >
                {item.action}
                <ArrowRight />
              </span>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <section
      class="relative isolate overflow-hidden rounded-(--frame-radius) bg-panel-inverse px-12 py-14 max-[720px]:px-7 max-[720px]:py-10"
      aria-labelledby="practice-heading"
    >
      <span
        class="pointer-events-none absolute -bottom-16 -right-6 -z-10 select-none font-serif text-[16rem] leading-none text-panel-inverse-ink/[0.04]"
        aria-hidden="true"
        lang="sk"
      >
        ď
      </span>

      <div class="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
        <div>
          <Eyebrow tone="inverse">Practice</Eyebrow>
          <h2 id="practice-heading" class="m-0 text-panel-inverse-ink">
            Drill the forms that stick
          </h2>
          <p
            class="mt-4 max-w-[70ch] text-[0.95rem] leading-[1.7] text-panel-inverse-ink/70"
          >
            Short topic sheets you can reopen anytime. Lesson completion stays on this
            device so you can pick up where you left off — no streaks, no scores.
          </p>
        </div>

        <Button href="/practice">Open Practice</Button>
      </div>
    </section>
  </PageShell>
</main>
