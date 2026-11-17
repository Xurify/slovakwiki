<script lang="ts">
  import { onMount, tick } from "svelte";

  import LessonDoneScreen from "$lib/components/lessons/LessonDoneScreen.svelte";
  import LessonFeedbackBar from "$lib/components/lessons/LessonFeedbackBar.svelte";
  import LessonInteraction from "$lib/components/lessons/LessonInteraction.svelte";
  import LessonPlayerFooter from "$lib/components/lessons/LessonPlayerFooter.svelte";
  import LessonStage from "$lib/components/lessons/LessonStage.svelte";
  import LessonStepTeach from "$lib/components/lessons/LessonStepTeach.svelte";
  import LessonStorySettings from "$lib/components/lessons/LessonStorySettings.svelte";
  import SessionChrome from "$lib/components/learning/SessionChrome.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import {
    emptyPracticeState,
    markLessonComplete,
    readPracticeState,
    writePracticeState,
  } from "$lib/components/practice/practice-state";
  import type { LessonGradeResult } from "$lib/components/lessons/lesson-review";
  import { lessonTracks, lessonsForTrack } from "$lib/catalog/lessons";
  import { practiceSetForLesson } from "$lib/catalog/practice";
  import { playAnswerSfx, unlockSfx } from "$lib/audio/sfx";
  import {
    ChoiceOptions,
    choiceIndexFromKeyboardEvent,
    isSayChoiceCorrect,
  } from "$lib/learning/exercises";
  import { FINALE_TITLE, lessonChapters, lessonSteps } from "$lib/learning/lesson-steps";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { cx } from "$lib/ui/classes";
  import type { DialogueTurn, Lesson } from "$lib/learning/types";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryAutoAdvance,
    getStoryShowEnglish,
  } from "$lib/lesson-story/prefs";
  import { hasPendingStoryAudio, primeStoryAudio } from "$lib/lesson-story/story-audio";
  import {
    clearLessonResume,
    readLessonResume,
    writeLessonResume,
  } from "$lib/lesson-progress/resume";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import { storySettingForLesson } from "$lib/lesson-story/story-settings";

  let {
    episode,
    lesson,
    keyPhraseAudioSrcs = {},
    exerciseOptionAudioSrcs = {},
    sceneAudioSrcs = {},
    stage,
    thingWords = {},
  }: {
    /** The podcast episode on the same topic, linked from the end of the lesson. */
    episode?: { href: string; title: string };
    lesson: Lesson;
    keyPhraseAudioSrcs?: Record<string, string>;
    exerciseOptionAudioSrcs?: Record<string, string>;
    sceneAudioSrcs?: Record<string, string>;
    /** The lesson's dialogue on the stick-figure stage, when it has one. */
    stage?: Scene;
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** At Alex's line: what the learner picks from, and how the line goes on once they have. */
  interface Turn {
    go: () => void;
    line: DialogueTurn;
    missed: string | null;
    picked: string | null;
  }

  let phase = $state<"play" | "done">("play");
  /** Furthest step reached; `reviewIndex` is set while looking at an earlier one. */
  let stepIndex = $state(0);
  let reviewIndex = $state<number | null>(null);
  let answers = $state<Record<string, LessonGradeResult>>({});
  let canSubmit = $state(false);
  let submitNonce = $state(0);
  let practiceState = $state(emptyPracticeState());
  let hydrated = $state(false);
  let playerRoot: HTMLDivElement | undefined = $state();
  let sceneStage = $state<ReturnType<typeof LessonStage>>();
  /** The learner has touched the page, so a chapter's lines may start on their own. */
  let activated = $state(false);
  /** The scene step on screen has started and played to its end. */
  let sceneStarted = $state(false);
  let sceneDone = $state(false);
  let turn = $state<Turn | null>(null);
  /** Lines said so far in the scene step on screen, in the order said. */
  let said = $state<number[]>([]);
  /** Auto-advance is off and the scene waits between lines: this plays the next one. */
  let waiting = $state<(() => void) | null>(null);
  let showEnglish = $state(false);

  const steps = $derived(lessonSteps(lesson, Boolean(stage)));
  const setting = $derived(storySettingForLesson(lesson.id));
  const sceneHint = $derived.by(() => {
    if (viewStep?.kind === "finale") {
      return "The whole scene from the start. This time you are Alex: it stops at each of your lines.";
    }
    return viewIndex === 0
      ? `${setting.place}. Watch what happens; at the end you play Alex.`
      : "The scene goes on.";
  });
  const chapters = $derived(lessonChapters(lesson, steps));
  const step = $derived(steps[stepIndex]);
  const gradeResult = $derived(step ? (answers[step.id] ?? null) : null);
  const reviewing = $derived(reviewIndex !== null);
  const viewIndex = $derived(reviewIndex ?? stepIndex);
  const viewStep = $derived(steps[viewIndex]);
  const viewResult = $derived(viewStep ? (answers[viewStep.id] ?? null) : null);
  const chapterTitle = $derived(
    chapters.find(
      (chapter) => viewIndex >= chapter.start && viewIndex < chapter.start + chapter.length,
    )?.title,
  );
  const practiceSet = $derived(practiceSetForLesson(lesson.id));
  const backHref = $derived(`/lessons/${lesson.track}`);
  const trackTitle = $derived(
    lessonTracks.find((track) => track.id === lesson.track)?.title ?? lesson.track,
  );
  const played = $derived(viewStep?.kind === "scene" || viewStep?.kind === "finale");
  const missParts = $derived(turn?.missed ? splitEmphasis(turn.missed) : []);

  const nextLesson = $derived.by((): Lesson | null => {
    const siblings = lessonsForTrack(lesson.track);
    const index = siblings.findIndex((entry) => entry.id === lesson.id);
    if (index < 0) return null;
    return siblings[index + 1] ?? null;
  });

  const teachAudioSrcs = $derived.by(() => {
    if (!viewStep || viewStep.kind !== "teach") return keyPhraseAudioSrcs;
    const srcs: Record<string, string> = { ...keyPhraseAudioSrcs, ...sceneAudioSrcs };
    for (const phrase of viewStep.beat.teach.phrases ?? []) {
      const fromLesson = keyPhraseAudioSrcs[phrase.slovak];
      if (fromLesson) srcs[phrase.slovak] = fromLesson;
    }
    for (const line of viewStep.scene) {
      const fromScene = sceneAudioSrcs[line.id];
      if (fromScene) srcs[line.id] = fromScene;
    }
    return srcs;
  });

  onMount(() => {
    practiceState = readPracticeState(localStorage);
    const saved = readLessonResume(
      localStorage,
      lesson.id,
      steps.map(({ id }) => id),
    );
    if (saved) {
      answers = saved.answers;
      stepIndex = saved.at;
    }

    preloadFirstLines();

    const root = document.documentElement;
    if (root.hasAttribute("data-lesson-play-queued")) {
      root.removeAttribute("data-lesson-play-queued");
      activated = true;
      playScene();
    }
    showEnglish = getStoryShowEnglish() === "on";
    hydrated = true;

    // Controls play or replace a blocked line themselves (Next, Listen, say-choice).
    const controls = "a, button, input, label, select, textarea";
    const gestures = ["touchend", "click", "keydown"] as const;

    function onGesture(event: Event): void {
      unlockSfx();
      activated = true;

      const target = event.target;
      const onControl = target instanceof Element && target.closest(controls);
      if (onControl && hasPendingStoryAudio()) return;

      primeStoryAudio();
    }

    function onPrefsChange(): void {
      showEnglish = getStoryShowEnglish() === "on";
    }

    for (const type of gestures) {
      window.addEventListener(type, onGesture, { passive: true });
    }
    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);

    return () => {
      for (const type of gestures) {
        window.removeEventListener(type, onGesture);
      }
      window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
      window.clearTimeout(startTimer);
    };
  });

  $effect(() => {
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

  /** The first lines' clips fetched ahead, so the first Play is heard at once. */
  function preloadFirstLines(): void {
    for (const line of lesson.scene.slice(0, 3)) {
      const src = stage?.lines.find((staged) => staged.id === line.id)?.src;
      if (!src) continue;
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = src;
    }
  }

  /** Line ids of the lesson's dialogue as indexes into the stage's lines. */
  function stageIndexes(lines: readonly DialogueTurn[]): number[] {
    return lines.flatMap((line) => {
      const index = lesson.scene.findIndex((turn) => turn.id === line.id);
      return index < 0 ? [] : [index];
    });
  }

  /** Play the scene step on screen: the chapter's lines, or the whole scene at the end. */
  function playScene(): void {
    const current = viewStep;
    if (!current || (current.kind !== "scene" && current.kind !== "finale")) return;

    const lines = current.kind === "scene" ? current.lines : lesson.scene;
    window.clearTimeout(startTimer);
    sceneStarted = true;
    sceneDone = false;
    turn = null;
    waiting = null;
    said = [];
    sceneStage?.run(stageIndexes(lines), {
      waits: () => getStoryAutoAdvance() === "off",
      onwait: (goOn) => {
        waiting = goOn;
      },
      onsay: (index) => {
        said = [...said.filter((line) => line !== index), index];
      },
      // Only the whole scene at the end stops for the learner: a chapter's lines come
      // before what they teach, so a pick there would be a guess. A replay looks back.
      holds: (index) =>
        current.kind === "finale" && !reviewing && Boolean(lesson.scene[index]?.sayChoices),
      onturn: (index, go) => {
        const line = lesson.scene[index];
        if (!line) return go();
        turn = { go, line, missed: null, picked: null };
        void revealTurn();
      },
      ondone: () => {
        sceneDone = true;
      },
    });
  }

  function pickLine(id: string | null): void {
    if (!turn?.line.sayChoices || !id) return;

    turn.picked = id;
    if (isSayChoiceCorrect(id, turn.line.sayChoices)) {
      const { go } = turn;
      turn = null;
      playAnswerSfx("correct");
      sceneStage?.react("nod");
      // The nod is seen before Alex says the line, which would end it.
      window.clearTimeout(startTimer);
      startTimer = window.setTimeout(go, NOD_MS);
      playerRoot?.focus({ preventScroll: true });
      return;
    }

    const choice = turn.line.sayChoices.choices.find((option) => option.id === id);
    playAnswerSfx("incorrect");
    if (choice?.label) sceneStage?.slip(choice.label);
    turn.missed =
      choice?.whyWrong?.trim() || "Not that line: pick the reply that matches what you mean.";
  }

  /** The choices for Alex's line in view and in focus, so a keyboard or screen reader finds them. */
  async function revealTurn(): Promise<void> {
    await tick();
    const panel = playerRoot?.querySelector<HTMLElement>("[data-turn]");
    panel?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    panel?.querySelector<HTMLElement>("[data-answer-option]")?.focus({ preventScroll: true });
  }

  /** How long the one Alex talks with nods at a right pick before Alex says it. */
  const NOD_MS = 650;

  /** Long enough for the cast's cheer at a chapter's end to be seen before the next lines. */
  const CHEER_MS = 1300;

  let startTimer = 0;

  /** Into the step on screen: a scene starts on its own once the learner has touched the page. */
  function enter(cheer = false): void {
    window.clearTimeout(startTimer);
    sceneStage?.clear();
    canSubmit = false;
    sceneStarted = false;
    sceneDone = false;
    turn = null;
    waiting = null;
    said = [];
    if (cheer) sceneStage?.cheer();
    if (activated && played && !reviewing) {
      startTimer = window.setTimeout(playScene, cheer ? CHEER_MS : 0);
    }
  }

  function advance(): void {
    const from = steps[stepIndex];
    if (stepIndex >= steps.length - 1) {
      sceneStage?.stop();
      persistLessonComplete();
      if (hydrated) clearLessonResume(localStorage, lesson.id);
      phase = "done";
      return;
    }

    stepIndex += 1;
    saveResume();
    reviewIndex = null;
    const to = steps[stepIndex];
    enter(from?.kind === "check" && to !== undefined && to.chapter !== from.chapter);
  }

  /** Coming back to the lesson opens it here. */
  function saveResume(): void {
    if (!hydrated) return;
    writeLessonResume(localStorage, lesson.id, {
      answers: $state.snapshot(answers),
      at: stepIndex,
      stepIds: steps.map(({ id }) => id),
    });
  }

  function restart(): void {
    if (hydrated) clearLessonResume(localStorage, lesson.id);
    answers = {};
    reviewIndex = null;
    stepIndex = 0;
    phase = "play";
    enter();
  }

  function reopenStep(index: number): void {
    phase = "play";
    showStep(index);
  }

  function showStep(index: number): void {
    reviewIndex = index >= stepIndex ? null : Math.max(index, 0);
    enter();
  }

  function goBack(): void {
    showStep(viewIndex - 1);
  }

  function goForward(): void {
    showStep(viewIndex + 1);
  }

  function onFooterPrimary(): void {
    if (!step) return;

    if (step.kind === "scene" || step.kind === "finale") {
      if (!sceneStarted) {
        activated = true;
        playScene();
        return;
      }
      if (waiting && !sceneDone) {
        const goOn = waiting;
        waiting = null;
        goOn();
        return;
      }
      advance();
      return;
    }

    if (step.kind === "teach" || gradeResult) {
      advance();
      return;
    }

    submitNonce += 1;
  }

  function onGraded(result: LessonGradeResult): void {
    if (step) answers[step.id] = result;
    saveResume();
    canSubmit = false;
    sceneStage?.react(result.correct ? "nod" : "think");
  }

  const footerLabel = $derived.by(() => {
    if (!step) return "Continue";
    if (step.kind === "scene" || step.kind === "finale") {
      if (!sceneStarted) return "Play";
      if (waiting && !sceneDone) return "Next line";
      if (step.kind === "finale") return "Finish";
      return sceneDone ? "Continue" : "Skip";
    }
    if (step.kind === "teach") return "Continue";
    if (step.exercise.type === "personal") return "I said it";
    if (gradeResult) return "Continue";
    return "Check";
  });

  const footerEnabled = $derived.by(() => {
    if (!step) return false;
    if (step.kind === "finale") return !sceneStarted || sceneDone || Boolean(waiting);
    if (step.kind === "scene") return !turn;
    if (step.kind === "teach") return true;
    if (gradeResult) return true;
    if (step.exercise.type === "personal") return true;
    return canSubmit;
  });

  function isNativeEnterTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    if (target.closest("[data-answer-option]")) return false;
    return (
      target.closest("a, button, input, select, textarea, [contenteditable]") !== null
    );
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (phase !== "play") return;

    if (turn) {
      const index = choiceIndexFromKeyboardEvent(event);
      const choice = index === null ? undefined : turn.line.sayChoices?.choices[index];
      if (choice) {
        event.preventDefault();
        pickLine(choice.id);
      }
      return;
    }

    if (event.key !== "Enter") return;
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.repeat || event.isComposing || isNativeEnterTarget(event.target)) return;

    if (reviewing) {
      event.preventDefault();
      goForward();
      return;
    }

    if (gradeResult) {
      event.preventDefault();
      advance();
      return;
    }

    if (!footerEnabled) return;
    event.preventDefault();
    onFooterPrimary();
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div
  bind:this={playerRoot}
  class="fixed inset-0 z-[90] flex flex-col bg-paper"
  role="dialog"
  data-hydrated={hydrated ? "" : undefined}
  aria-modal="true"
  aria-label={lesson.title}
  tabindex="-1"
>
  <div class="relative z-30 shrink-0 border-b border-slate-200 bg-paper">
    <div
      class="mx-auto w-full px-4 pt-3 sm:px-8 {stage ? 'max-w-[1120px]' : 'max-w-[640px]'}"
    >
      <SessionChrome
        class="mb-3"
        activeIndex={stepIndex}
        {backHref}
        chapters={stage ? chapters : undefined}
        closeLabel="Close lesson"
        complete={phase === "done"}
        onselect={phase === "done" ? reopenStep : showStep}
        progressLabel="Lesson steps"
        subtitle={stage && phase === "play" ? chapterTitle : trackTitle}
        title={lesson.title}
        titleTag="h1"
        total={steps.length}
        {viewIndex}
      >
        {#snippet controls()}
          <LessonStorySettings />
        {/snippet}
      </SessionChrome>
    </div>
  </div>

  {#if phase === "done"}
    <LessonDoneScreen
      {answers}
      {backHref}
      {episode}
      {lesson}
      {nextLesson}
      onback={() => reopenStep(stepIndex)}
      onRestart={restart}
      practiceSet={practiceSet ?? null}
      {steps}
      {trackTitle}
    />
  {:else}
    <div
      class="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent"
    >
      <!--
        While lines play the stage is the thing to watch, as large as the window lets it be.
        While the learner reads or answers, on a wide screen it stands beside the step.
      -->
      <div
        class={cx(
          stage && "mx-auto grid w-full max-w-[1120px] gap-x-12 px-4 sm:px-8",
          stage && !played && "lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-start",
        )}
      >
      {#if stage}
        <div
          class={cx(
            "pt-5 sm:pt-6",
            played
              ? "mx-auto w-full lg:w-[min(960px,calc((100dvh-20rem)*2))] lg:pt-8"
              : "lg:sticky lg:top-0 lg:pt-10 lg:pb-10",
          )}
        >
          <LessonStage
            bind:this={sceneStage}
            captions={played}
            compact={!played}
            hint={played && !sceneStarted && !reviewing ? sceneHint : undefined}
            scene={stage}
            {showEnglish}
            {thingWords}
          />
        </div>
      {/if}

      {#if viewStep}
        {#key viewStep.id}
          {#if viewStep.kind === "scene" || viewStep.kind === "finale"}
            <div class="mx-auto w-full max-w-[640px] pt-2 pb-8">
              {#if turn?.line.sayChoices}
                <div class="animate-rise" data-turn>
                  <p class={eyebrowMutedClass} role="status">Your turn: what does Alex say?</p>

                  <ChoiceOptions
                    choices={turn.line.sayChoices.choices}
                    bind:selectedId={() => turn?.picked ?? null, pickLine}
                    submitted={false}
                    wrongChoiceId={turn.missed ? turn.picked : null}
                    variant="cards"
                  />

                  {#if missParts.length}
                    <p
                      class="m-0 mt-3 text-sm leading-relaxed text-pretty text-rose-800"
                      role="status"
                    >
                      {#each missParts as part, index (`${part.type}-${index}-${part.value}`)}
                        {#if part.type === "em"}
                          <strong class="font-semibold">{part.value}</strong>
                        {:else if part.type === "i"}
                          <em>{part.value}</em>
                        {:else}
                          {part.value}
                        {/if}
                      {/each}
                    </p>
                  {/if}
                </div>
              {:else if !sceneStarted && reviewing}
                <button
                  class="mt-2 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900"
                  type="button"
                  onclick={playScene}
                >
                  Play it again
                </button>
              {:else if sceneDone}
                <button
                  class="mt-2 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900"
                  type="button"
                  onclick={playScene}
                >
                  Play it again
                </button>
              {/if}
            </div>
          {:else if viewStep.kind === "teach"}
            <LessonStepTeach
              class={stage
                ? "pt-5 pb-10 lg:pt-10"
                : "mx-auto w-full max-w-[640px] px-4 pt-5 pb-10 sm:px-8 sm:pt-6"}
              title={viewStep.beat.title}
              teach={viewStep.beat.teach}
              scene={viewStep.scene}
              audioSrcs={teachAudioSrcs}
            />
          {:else}
            <div
              class={stage
                ? "pt-6 pb-10 lg:pt-10"
                : "mx-auto w-full max-w-[640px] px-4 py-8 sm:px-8 sm:py-10"}
            >
              <LessonInteraction
                chrome="player"
                exercise={viewStep.exercise}
                review={viewResult?.answer}
                {sceneAudioSrcs}
                {exerciseOptionAudioSrcs}
                {submitNonce}
                bind:canSubmit
                ongraded={onGraded}
                onresolve={reviewing ? goForward : advance}
              />
            </div>
          {/if}
        {/key}
      {/if}
      </div>
    </div>

    {#if viewResult}
      {#key viewStep?.id}
        <LessonFeedbackBar
          autofocus={!reviewing}
          grade={viewResult.grade}
          why={viewResult.why}
          attempt={viewResult.attempt}
          correction={viewResult.correction}
          english={viewResult.english}
          revealed={viewResult.revealed}
          missHeadline={viewResult.missHeadline}
          markWords={viewResult.markWords}
          showCorrection={viewResult.showCorrection}
          otherChoices={viewResult.otherChoices}
          onback={viewIndex > 0 ? goBack : undefined}
          oncontinue={reviewing ? goForward : advance}
          wide={Boolean(stage)}
        />
      {/key}
    {:else if reviewing}
      <LessonPlayerFooter
        label="Continue"
        onback={viewIndex > 0 ? goBack : undefined}
        onclick={goForward}
        wide={Boolean(stage)}
      />
    {:else}
      <LessonPlayerFooter
        disabled={!footerEnabled}
        label={footerLabel}
        onback={viewIndex > 0 ? goBack : undefined}
        onclick={onFooterPrimary}
        queues={played && !sceneStarted}
        wide={Boolean(stage)}
      />
    {/if}
  {/if}
</div>
