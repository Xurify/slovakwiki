<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import {
    addReviewItem,
    emptyPracticeState,
    markLessonComplete,
    readPracticeState,
    writePracticeState,
  } from "$lib/client/practice-state";
  import { lessonTracks } from "$lib/content/lessons";
  import KeyPhraseList from "$lib/components/lessons/KeyPhraseList.svelte";
  import LessonInteraction from "$lib/components/lessons/LessonInteraction.svelte";
  import LessonScene from "$lib/components/lessons/LessonScene.svelte";
  import PatternNote from "$lib/components/lessons/PatternNote.svelte";

  let { data } = $props();

  let activeIndex = $state(0);
  let finished = $state(false);
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const trackTitle = $derived(
    lessonTracks.find((track) => track.id === data.lesson.track)?.title ??
      data.lesson.track,
  );
  const currentExercise = $derived(data.lesson.exercises[activeIndex]);

  const referenceLinkClass =
    "group flex min-h-14 items-center justify-between gap-4 border-b border-slate-200 -mx-4 px-4 py-4 font-serif text-base text-blue-800 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)]";

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });

  function persist(nextState: typeof practiceState): void {
    practiceState = nextState;
    if (hydrated) writePracticeState(localStorage, nextState);
  }

  function resolveExercise(result: {
    needsReview: boolean;
    practiceItemId?: string;
  }): void {
    if (result.needsReview && result.practiceItemId) {
      persist(addReviewItem(practiceState, result.practiceItemId));
    }

    if (activeIndex === data.lesson.exercises.length - 1) {
      persist(markLessonComplete(practiceState, data.lesson.id));
      finished = true;
      return;
    }

    activeIndex += 1;
  }
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex flex-wrap gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/lessons">Lessons</TextLink>
      <span aria-hidden="true">/</span>
      <TextLink href="/lessons/{data.lesson.track}">{trackTitle}</TextLink>
    </nav>

    <header class="max-w-[640px] border-b border-slate-200 pb-8">
      <Eyebrow>{trackTitle}</Eyebrow>
      <h1>{data.lesson.title}</h1>
      <Lead>{data.lesson.promise}</Lead>
    </header>

    <section class="scroll-mt-[88px] pt-10" aria-labelledby="scene-heading">
      <Eyebrow>Start with the scene</Eyebrow>
      <h2 id="scene-heading" class="mb-5">Read it once</h2>
      <LessonScene scene={data.lesson.scene} />
    </section>

    <section
      class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="phrases-heading"
    >
      <Eyebrow>Keep these close</Eyebrow>
      <h2 id="phrases-heading" class="mb-5">Key phrases</h2>
      <KeyPhraseList phrases={data.lesson.keyPhrases} />
    </section>

    {#if data.lesson.pattern}
      <section class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10">
        <PatternNote pattern={data.lesson.pattern} />
      </section>
    {/if}

    <section
      class="scroll-mt-[88px] mt-12 border-t border-slate-200 pt-10"
      aria-labelledby="practice-heading"
    >
      <Eyebrow>Practice in context</Eyebrow>
      <h2 id="practice-heading" class="mb-5">Use the scene</h2>

      {#if !hydrated}
        <p class="font-serif text-slate-500">Loading your lesson…</p>
      {:else if finished}
        <div class="border-l-2 border-emerald-600 py-2 pl-6">
          <Eyebrow tone="muted">Lesson complete</Eyebrow>
          <h3 class="mb-1 mt-2 font-serif text-2xl text-slate-900">
            Keep the scene, not a score.
          </h3>
          <p class="m-0 font-serif text-slate-600">
            Anything you missed or revealed is ready in Review.
          </p>
          <div class="mt-6 flex flex-wrap items-center gap-4">
            <Button href="/practice/review">Open Review</Button>
            <TextLink href="/lessons">Browse lessons</TextLink>
          </div>
        </div>
      {:else}
        <p class="m-0 mb-3 text-xs text-slate-500">
          Step {activeIndex + 1} of {data.lesson.exercises.length}
        </p>
        {#key currentExercise.id}
          <LessonInteraction exercise={currentExercise} onresolve={resolveExercise} />
        {/key}
      {/if}
    </section>

    <footer class="mt-14 border-t border-slate-200 pt-10">
      <Eyebrow>Go deeper</Eyebrow>
      <h2 class="mb-2">Reference</h2>
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
