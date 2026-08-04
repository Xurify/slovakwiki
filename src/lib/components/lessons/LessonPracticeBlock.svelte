<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { onMount } from "svelte";
  import {
    emptyPracticeState,
    markLessonComplete,
    readPracticeState,
    writePracticeState,
  } from "$lib/client/practice-state";
  import type { Lesson } from "$lib/content/learning-types";
  import { practiceSetForLesson } from "$lib/content/practice";
  import LessonInteraction from "$lib/components/lessons/LessonInteraction.svelte";
  import LessonPracticeSkeleton from "$lib/components/lessons/LessonPracticeSkeleton.svelte";

  let { lesson }: { lesson: Lesson } = $props();

  let activeIndex = $state(0);
  let finished = $state(false);
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const currentExercise = $derived(lesson.exercises[activeIndex]);
  const practiceSet = $derived(practiceSetForLesson(lesson.id));

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });

  function persist(nextState: typeof practiceState): void {
    practiceState = nextState;
    if (hydrated) writePracticeState(localStorage, nextState);
  }

  function resolveExercise(): void {
    if (activeIndex === lesson.exercises.length - 1) {
      persist(markLessonComplete(practiceState, lesson.id));
      finished = true;
      return;
    }

    activeIndex += 1;
  }
</script>

{#if !hydrated}
  <LessonPracticeSkeleton />
{:else if finished}
  <div class="border-l-2 border-emerald-600 py-2 pl-6">
    <Eyebrow tone="muted">Lesson complete</Eyebrow>
    <h3 class="mb-1 mt-2 font-serif text-2xl text-slate-900">
      Keep the scene, not a score.
    </h3>
    <p class="m-0 font-serif text-slate-600">
      You can practise this topic again whenever you want another pass.
    </p>
    <div class="mt-6 flex flex-wrap items-center gap-4">
      {#if practiceSet}
        <Button href={`/practice/${practiceSet.id}`}>Open practice</Button>
      {/if}
      <TextLink href="/lessons">Browse lessons</TextLink>
    </div>
  </div>
{:else}
  <p class="m-0 mb-4 text-xs text-slate-500">
    Step {activeIndex + 1} of {lesson.exercises.length}
  </p>
  {#key currentExercise.id}
    <LessonInteraction exercise={currentExercise} onresolve={resolveExercise} />
  {/key}
{/if}
