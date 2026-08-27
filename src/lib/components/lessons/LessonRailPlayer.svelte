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
    type AnswerGrade,
  } from "$lib/components/practice/practice-state";
  import type { Lesson } from "$lib/learning/types";
  import { lessonTracks, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSetForLesson } from "$lib/catalog/practice";
  import { hasPendingStoryAudio, unlockStoryAudio } from "$lib/lesson-story/story-audio";

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
    attempt?: string;
    correction?: string;
    english?: string;
    grade: AnswerGrade;
    missHeadline?: string;
    revealed?: boolean;
    showCorrection?: boolean;
    why: string;
  } | null>(null);
  let lastStepId = "";
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  let playerRoot: HTMLDivElement | undefined = $state();
  let teachStoryComplete = $state(false);
  let teachChoiceOpen = $state(false);
  let teachAdvanceSignal = $state(0);

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

    playerRoot?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const pageHeaderAndFooter = [
      document.querySelector("header"),
      document.querySelector("footer"),
    ];
    for (const element of pageHeaderAndFooter) {
      element?.setAttribute("inert", "");
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      for (const element of pageHeaderAndFooter) {
        element?.removeAttribute("inert");
      }
    };
  });

  function persist(nextState: typeof practiceState): void {
    practiceState = nextState;
    if (hydrated) writePracticeState(localStorage, nextState);
  }

  function persistLessonComplete(): void {
    if (!hydrated) return;
    persist(markLessonComplete(readPracticeState(localStorage), lesson.id));
  }

  function resetStepUi(): void {
    canSubmit = false;
    gradeResult = null;
    teachChoiceOpen = false;
    teachAdvanceSignal = 0;
  }

  $effect(() => {
    const stepId = step?.id ?? "";

    if (step?.kind === "teach") {
      if (lastStepId === stepId) return;
      lastStepId = stepId;
      teachStoryComplete = step.scene.length === 0;
      teachAdvanceSignal = 0;
      return;
    }

    lastStepId = stepId;
    teachStoryComplete = true;
    teachChoiceOpen = false;
  });

  function advance(): void {
    if (stepIndex >= steps.length - 1) {
      persistLessonComplete();
      phase = "done";
      return;
    }

    stepIndex += 1;
    resetStepUi();
  }

  function onFooterPrimary(): void {
    if (!step) return;

    if (step.kind === "teach") {
      if (!teachStoryComplete) {
        const replayBlockedClip = hasPendingStoryAudio();
        unlockStoryAudio();
        if (replayBlockedClip) return;

        teachAdvanceSignal += 1;
        return;
      }

      advance();
      return;
    }

    if (gradeResult) {
      advance();
      return;
    }

    submitNonce += 1;
  }

  function onGraded(result: {
    attempt?: string;
    correction?: string;
    english?: string;
    grade: AnswerGrade;
    missHeadline?: string;
    revealed?: boolean;
    showCorrection?: boolean;
    why: string;
  }): void {
    gradeResult = result;
    canSubmit = false;
  }

  const footerLabel = $derived.by(() => {
    if (!step) return "Continue";
    if (step.kind === "teach") {
      return teachStoryComplete ? "Continue" : "Next";
    }
    if (step.exercise.type === "personal") return "I said it";
    if (gradeResult) return "Continue";
    return "Check";
  });

  const footerEnabled = $derived.by(() => {
    if (!step) return false;
    if (step.kind === "teach") return !teachChoiceOpen;
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
  <div
    bind:this={playerRoot}
    class="fixed inset-0 z-[90] flex flex-col bg-paper"
    role="dialog"
    aria-modal="true"
    aria-label={lesson.title}
    tabindex="-1"
  >
    <LessonPlayerChrome
      {backHref}
      {progressPercent}
      stepCount={steps.length}
      {stepIndex}
    />

    <div
      class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
    >
      {#if step}
        {#key step.id}
          {#if step.kind === "teach"}
            <LessonStepTeach
              title={step.beat.title}
              teach={step.beat.teach}
              scene={step.scene}
              audioSrcs={teachAudioSrcs}
              lessonId={lesson.id}
              advanceSignal={teachAdvanceSignal}
              bind:storyComplete={teachStoryComplete}
              bind:choiceOpen={teachChoiceOpen}
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
        grade={gradeResult.grade}
        why={gradeResult.why}
        attempt={gradeResult.attempt}
        correction={gradeResult.correction}
        english={gradeResult.english}
        revealed={gradeResult.revealed}
        missHeadline={gradeResult.missHeadline}
        showCorrection={gradeResult.showCorrection}
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
