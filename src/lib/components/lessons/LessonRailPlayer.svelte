<script lang="ts">
  import LessonDoneScreen from "$lib/components/lessons/LessonDoneScreen.svelte";
  import LessonFeedbackBar from "$lib/components/lessons/LessonFeedbackBar.svelte";
  import LessonInteraction from "$lib/components/lessons/LessonInteraction.svelte";
  import LessonPlayerChrome from "$lib/components/lessons/LessonPlayerChrome.svelte";
  import LessonPlayerFooter from "$lib/components/lessons/LessonPlayerFooter.svelte";
  import LessonStepTeach from "$lib/components/lessons/LessonStepTeach.svelte";
  import { lessonSteps } from "$lib/learning/lesson-steps";
  import { onMount } from "svelte";
  import {
    emptyPracticeState,
    markLessonComplete,
    readPracticeState,
    writePracticeState,
  } from "$lib/client/practice-state";
  import type { Lesson } from "$lib/content/learning-types";
  import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";
  import { practiceSetForLesson } from "$lib/content/practice";

  let {
    lesson,
    keyPhraseAudioSrcs = {},
    sceneAudioSrcs = {},
  }: {
    lesson: Lesson;
    keyPhraseAudioSrcs?: Record<string, string>;
    sceneAudioSrcs?: Record<string, string>;
  } = $props();

  let phase = $state<"play" | "done">("play");
  let stepIndex = $state(0);
  let canSubmit = $state(false);
  let submitNonce = $state(0);
  let gradeResult = $state<{
    correct: boolean;
    why: string;
  } | null>(null);
  let whyOpen = $state(false);
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);

  const steps = $derived(lessonSteps(lesson));
  const step = $derived(steps[stepIndex]);
  const practiceSet = $derived(practiceSetForLesson(lesson.id));
  const backHref = $derived(`/lessons/${lesson.track}`);
  const trackTitle = $derived(
    lessonTracks.find((track) => track.id === lesson.track)?.title ?? lesson.track,
  );

  const progressPercent = $derived(
    steps.length <= 0 ? 0 : (stepIndex / steps.length) * 100,
  );

  const nextLesson = $derived.by((): Lesson | null => {
    const siblings = lessonsForTrack(lesson.track);
    const index = siblings.findIndex((entry) => entry.id === lesson.id);
    if (index < 0) return null;
    return siblings[index + 1] ?? null;
  });

  const teachAudioSrcs = $derived.by(() => {
    if (!step || step.kind !== "teach") return keyPhraseAudioSrcs;
    const srcs: Record<string, string> = { ...keyPhraseAudioSrcs, ...sceneAudioSrcs };
    for (const phrase of step.beat.teach.phrases ?? []) {
      const fromLesson = keyPhraseAudioSrcs[phrase.slovak];
      if (fromLesson) srcs[phrase.slovak] = fromLesson;
    }
    for (const line of step.scene) {
      const fromScene = sceneAudioSrcs[line.id];
      if (fromScene) srcs[line.id] = fromScene;
    }
    return srcs;
  });

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    hydrated = true;
  });

  $effect(() => {
    if (phase !== "play") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  });

  function persist(nextState: typeof practiceState): void {
    practiceState = nextState;
    if (hydrated) writePracticeState(localStorage, nextState);
  }

  function resetStepUi(): void {
    canSubmit = false;
    gradeResult = null;
    whyOpen = false;
  }

  function advance(): void {
    if (stepIndex >= steps.length - 1) {
      persist(markLessonComplete(practiceState, lesson.id));
      phase = "done";
      return;
    }

    stepIndex += 1;
    resetStepUi();
  }

  function onFooterPrimary(): void {
    if (!step) return;

    if (step.kind === "teach") {
      advance();
      return;
    }

    if (gradeResult) {
      advance();
      return;
    }

    submitNonce += 1;
  }

  function onGraded(result: { correct: boolean; why: string }): void {
    gradeResult = result;
    whyOpen = false;
    canSubmit = false;
  }

  const footerLabel = $derived.by(() => {
    if (!step) return "Continue";
    if (step.kind === "teach") return "Continue";
    if (step.exercise.type === "personal") return "I said it";
    if (gradeResult) return "Continue";
    return "Check";
  });

  const footerEnabled = $derived.by(() => {
    if (!step) return false;
    if (step.kind === "teach") return true;
    if (gradeResult) return true;
    if (step.exercise.type === "personal") return true;
    return canSubmit;
  });
</script>

{#if phase === "done"}
  <LessonDoneScreen
    {backHref}
    {lesson}
    {nextLesson}
    practiceSet={practiceSet ?? null}
    {trackTitle}
  />
{:else}
  <div class="fixed inset-0 z-[90] flex flex-col bg-paper">
    <LessonPlayerChrome
      {backHref}
      {progressPercent}
      stepCount={steps.length}
      {stepIndex}
    />

    <div class="min-h-0 flex-1 overflow-y-auto">
      {#if step}
        {#key step.id}
          {#if step.kind === "teach"}
            <LessonStepTeach
              title={step.beat.title}
              teach={step.beat.teach}
              scene={step.scene}
              audioSrcs={teachAudioSrcs}
            />
          {:else}
            <div class="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-12">
              <LessonInteraction
                chrome="player"
                exercise={step.exercise}
                {sceneAudioSrcs}
                {submitNonce}
                bind:canSubmit
                ongraded={onGraded}
                onresolve={advance}
              />
            </div>
          {/if}
        {/key}
      {/if}
    </div>

    {#if gradeResult}
      <LessonFeedbackBar
        grade={gradeResult.correct ? "correct" : "incorrect"}
        why={gradeResult.why}
        {whyOpen}
        onwhy={() => {
          whyOpen = !whyOpen;
        }}
        oncontinue={advance}
      />
    {:else}
      <LessonPlayerFooter
        disabled={!footerEnabled}
        label={footerLabel}
        onclick={onFooterPrimary}
      />
    {/if}
  </div>
{/if}
