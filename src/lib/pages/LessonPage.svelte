<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import type { Lesson } from "$lib/content/learning-types";
  import { lessonTracks } from "$lib/content/lessons";
  import KeyPhraseList from "$lib/components/lessons/KeyPhraseList.svelte";
  import LessonScene from "$lib/components/lessons/LessonScene.svelte";
  import PatternNote from "$lib/components/lessons/PatternNote.svelte";
  import { ClockIllustration } from "$lib/learning/time";

  let {
    data,
    practice,
  }: {
    data: { lesson: Lesson };
    practice: Snippet;
  } = $props();

  const trackTitle = $derived(
    lessonTracks.find((track) => track.id === data.lesson.track)?.title ??
      data.lesson.track,
  );

  const referenceLinkClass =
    "group flex min-h-14 items-center justify-between gap-4 border-b border-slate-200 -mx-4 px-4 py-4 font-serif text-base text-blue-800 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)]";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/lessons">Lessons</TextLink>
      <span aria-hidden="true">/</span>
      <TextLink href="/lessons/{data.lesson.track}">{trackTitle}</TextLink>
    </nav>

    <header class="max-w-[640px] border-b border-slate-200 pb-8">
      <h1>{data.lesson.title}</h1>
      <Lead>{data.lesson.promise}</Lead>
    </header>

    <section class="scroll-mt-[88px] pt-10" aria-labelledby="scene-heading">
      <h2 id="scene-heading" class="mb-5 font-serif text-2xl text-slate-900">
        Read it once
      </h2>
      <LessonScene scene={data.lesson.scene} mountPrefix="scene" />
    </section>

    <section
      class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="phrases-heading"
    >
      <h2 id="phrases-heading" class="mb-5 font-serif text-2xl text-slate-900">
        Key phrases
      </h2>
      <KeyPhraseList phrases={data.lesson.keyPhrases} mountPrefix="phrase" />
    </section>

    {#if data.lesson.pattern}
      <section class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10">
        <PatternNote pattern={data.lesson.pattern} />
      </section>
    {/if}

    {#if data.lesson.visual?.type === "clock-grid"}
      <section
        class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
        aria-labelledby="visual-heading"
      >
        <h2 id="visual-heading" class="mb-5 font-serif text-2xl text-slate-900">
          {data.lesson.visual.title}
        </h2>
        <ul
          class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-4 p-0"
        >
          {#each data.lesson.visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
            <li
              class="grid justify-items-center gap-2 border border-slate-200 bg-slate-50 px-3 py-4"
            >
              <ClockIllustration
                hour={item.time.hour}
                minute={item.time.minute}
                size={96}
              />
              <strong
                class="text-center font-serif text-sm leading-snug text-blue-800"
                lang="sk"
              >
                {item.slovak}
              </strong>
              <span class="text-center text-xs leading-snug text-slate-500">
                {item.english}
              </span>
              {#if item.note}
                <span class="text-center text-xs leading-snug text-slate-600">
                  {item.note}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      </section>
    {/if}

    <section
      class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="practice-heading"
    >
      <h2 id="practice-heading" class="mb-5 font-serif text-2xl text-slate-900">
        Use the scene
      </h2>
      {@render practice()}
    </section>

    <footer class="mt-14 border-t border-slate-200 pt-10">
      <h2 class="mb-2 font-serif text-2xl text-slate-900">Reference</h2>
      <nav class="mt-4" aria-label="Lesson reference links">
        {#each data.lesson.referenceLinks as link (link.href)}
          <a class={referenceLinkClass} href={link.href}>
            <span>{link.label}</span>
            <ArrowRight class="text-slate-400" />
          </a>
        {/each}
      </nav>
    </footer>
  </PageShell>
</main>
