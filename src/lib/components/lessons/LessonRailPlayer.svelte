<script module lang="ts">
  /** Clips fetched ahead for the first chapter, kept so they are not dropped before they load. */
  const preloaded: HTMLAudioElement[] = [];
</script>

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
  import {
    FINALE_TITLE,
    lessonChapters,
    lessonSteps,
    type LessonStep,
  } from "$lib/learning/lesson-steps";
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
    LESSON_RESUME_PENDING_ATTR,
    readLessonResume,
    writeLessonResume,
  } from "$lib/lesson-progress/resume";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import type { StageStatus } from "$lib/components/lessons/LessonStage.svelte";
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
  /** Where the stage's run of lines is: idle, playing, paused, waiting, at a turn, done. */
  let stageStatus = $state<StageStatus>("idle");
  let turn = $state<Turn | null>(null);
  /** A chapter's lines start on their own after the cheer: Play would start them twice. */
  let starting = $state(false);
  /** A wrong pick's bubble is still over Alex: the same pick again waits for it to clear. */
  let slipUntil = 0;
  let slipped: string | null = null;
  /** Scene steps whose lines have played through: from then on the way on is Continue, even mid-replay. */
  let playedSteps = $state<string[]>([]);
  let showEnglish = $state(false);

  const steps = $derived(lessonSteps(lesson, Boolean(stage)));
  const setting = $derived(storySettingForLesson(lesson.id));
  /** What a chapter's opening says before its lines play: its title, and what to do. */
  const sceneHint = $derived.by((): { text?: string; title: string } | undefined => {
    if (viewStep?.kind === "finale") {
      return {
        title: FINALE_TITLE,
        text: "From the start, with you as Alex: it stops at each of Alex's lines.",
      };
    }
    if (viewStep?.kind !== "scene") return undefined;
    return viewIndex === 0
      ? {
          title: viewStep.beat.title,
          text: `${setting.place}. Watch what happens; at the end you play Alex.`,
        }
      : { title: viewStep.beat.title };
  });
  const chapters = $derived(lessonChapters(lesson, steps));
  const step = $derived(steps[stepIndex]);
  const gradeResult = $derived(step ? (answers[step.id] ?? null) : null);
  const reviewing = $derived(reviewIndex !== null);
  const viewIndex = $derived(reviewIndex ?? stepIndex);
  const viewStep = $derived(steps[viewIndex]);
  const viewResult = $derived(viewStep ? (answers[viewStep.id] ?? null) : null);
  const practiceSet = $derived(practiceSetForLesson(lesson.id));
  const backHref = $derived(`/lessons/${lesson.track}`);
  const trackTitle = $derived(
    lessonTracks.find((track) => track.id === lesson.track)?.title ?? lesson.track,
  );
  const played = $derived(viewStep?.kind === "scene" || viewStep?.kind === "finale");
  const sceneStarted = $derived(stageStatus !== "idle");
  const sceneDone = $derived(stageStatus === "done");
  /** The scene step on screen has been heard to its end once. */
  const heard = $derived(Boolean(viewStep && playedSteps.includes(viewStep.id)));
  /**
   * The stage while lines play, and what sits under it: as wide as the window's
   * height allows, and narrower at the end, where Alex's choices need room below it.
   */
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
    showEnglish = getStoryShowEnglish() === "on";
    hydrated = true;

    const root = document.documentElement;
    void tick().then(() => {
      root.removeAttribute(LESSON_RESUME_PENDING_ATTR);
    });

    if (root.hasAttribute("data-lesson-play-queued")) {
      root.removeAttribute("data-lesson-play-queued");
      activated = true;
      if (footerEnabled) onFooterPrimary();
    }

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

  /** The first chapter's clips fetched ahead, so the first Play is heard at once. */
  function preloadFirstLines(): void {
    preloaded.length = 0;
    const first = steps.find((entry) => entry.kind === "scene");
    if (!first || first.kind !== "scene") return;
    for (const line of first.lines) {
      const src = stage?.lines.find((staged) => staged.id === line.id)?.src;
      if (!src) continue;
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = src;
      // Held, or the browser may drop an element nothing refers to before it loads.
      preloaded.push(audio);
    }
  }

  /** Line ids of the lesson's dialogue as indexes into the stage's lines. */
  function stageIndexes(lines: readonly DialogueTurn[]): number[] {
    return lines.flatMap((line) => {
      const index = lesson.scene.findIndex((turn) => turn.id === line.id);
      return index < 0 ? [] : [index];
    });
  }

  /** The stage's lines a scene step plays: its chapter's, or the whole scene at the end. */
  function sceneLines(entry: LessonStep | undefined): number[] {
    if (entry?.kind === "scene") return stageIndexes(entry.lines);
    if (entry?.kind === "finale") return stageIndexes(lesson.scene);
    return [];
  }

  function startScene(): void {
    activated = true;
    playScene();
  }

  /** Play the scene step on screen: the chapter's lines, or the whole scene at the end. */
  function playScene(): void {
    const current = viewStep;
    if (!current || (current.kind !== "scene" && current.kind !== "finale")) return;

    window.clearTimeout(startTimer);
    starting = false;
    turn = null;
    sceneStage?.run(sceneLines(current), {
      waits: () => getStoryAutoAdvance() === "off",
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
        if (!playedSteps.includes(current.id)) playedSteps = [...playedSteps, current.id];
      },
    });
  }

  function pickLine(id: string | null): void {
    if (!turn?.line.sayChoices || !id) return;
    if (id === slipped && Date.now() < slipUntil) return;

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
    slipUntil = Date.now() + SLIP_MS;
    slipped = id;
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
    panel?.querySelector<HTMLElement>("[data-turn-label]")?.focus({ preventScroll: true });
  }

  /** How long the one Alex talks with nods at a right pick before Alex says it. */
  const NOD_MS = 650;

  /** About as long as the bubble of a wrong pick stays up. */
  const SLIP_MS = 1200;

  /** Long enough for the cast's cheer at a chapter's end to be seen before the next lines. */
  const CHEER_MS = 1300;

  let startTimer = 0;

  /** Into the step on screen: a scene starts on its own once the learner has touched the page. */
  function enter(cheer = false): void {
    window.clearTimeout(startTimer);
    const first = sceneLines(viewStep)[0];
    if (first === undefined) sceneStage?.clear();
    else sceneStage?.seekTo(first);
    canSubmit = false;
    turn = null;
    starting = false;
    if (cheer) sceneStage?.cheer();
    // A chapter heard before waits for Play; one not yet heard starts on its own.
    if (heard) return;
    if (activated && played && !reviewing) {
      starting = true;
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

  /**
   * A press on the bar, like a seek on a video: that part on screen, and its
   * lines playing from their start, a part heard before too.
   */
  async function seek(index: number): Promise<void> {
    if (phase === "done") phase = "play";
    showStep(index);
    await tick();
    if (!played) return;
    activated = true;
    playScene();
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
      if (starting || (!sceneStarted && !heard)) {
        activated = true;
        playScene();
        return;
      }
      if (stageStatus === "waiting") {
        sceneStage?.goOnNow();
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
      const onward = step.kind === "finale" ? "Finish" : "Continue";
      if (starting || (!sceneStarted && !heard)) return "Play";
      if (stageStatus === "waiting") return "Next line";
      if (heard || sceneDone) return onward;
      return step.kind === "finale" ? onward : "Skip";
    }
    if (step.kind === "teach") return "Continue";
    if (step.exercise.type === "personal") return "I said it";
    if (gradeResult) return "Continue";
    return "Check";
  });

  const footerEnabled = $derived.by(() => {
    if (!step) return false;
    if (starting) return true;
    if (step.kind === "finale") {
      return heard || !sceneStarted || sceneDone || stageStatus === "waiting";
    }
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
    // Keys typed into the settings popover are not answers.
    if (event.target instanceof Element && event.target.closest("[popover]")) return;

    if (turn) {
      const index = choiceIndexFromKeyboardEvent(event);
      const choice = index === null ? undefined : turn.line.sayChoices?.choices[index];
      if (choice) {
        event.preventDefault();
        pickLine(choice.id);
      }
      return;
    }

    if (event.key === " " && played && !isNativeEnterTarget(event.target)) {
      event.preventDefault();
      if (!sceneStarted) startScene();
      else sceneStage?.toggle();
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
  class="fixed inset-0 z-[90] flex flex-col bg-paper outline-none"
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
        currentDone={Boolean(gradeResult) || (played && sceneDone && !reviewing)}
        closeLabel="Close lesson"
        complete={phase === "done"}
        onselect={seek}
        progressLabel="Lesson steps"
        subtitle={stage ? undefined : trackTitle}
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
      wide={Boolean(stage)}
    />
  {:else}
    <div
      class={cx(
        "min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent",
        "[html[data-lesson-resume-pending]_&]:invisible",
      )}
    >
      <!--
        While lines play the stage is the thing to watch, as large as the window lets it be.
        While the learner reads or answers, on a wide screen it stands beside the step.
      -->
      <div
        class={cx(
          stage && "mx-auto grid w-full max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-x-12 px-4 sm:px-8",
          stage && !played && "lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start",
          // The whole scene: Alex's choices beside the stage, so neither has to shrink for the other.
          stage &&
            viewStep?.kind === "finale" &&
            sceneStarted &&
            !sceneDone &&
            "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start",
        )}
      >
      {#if stage}
        <div
          class={cx(
            "pt-5 sm:pt-6",
            played
              ? "mx-auto w-full"
              : viewStep?.kind === "teach"
                ? "lg:row-start-1 lg:pt-10 lg:pb-0"
                : "lg:sticky lg:top-0 lg:pt-10 lg:pb-10",
            played &&
              !(viewStep?.kind === "finale" && sceneStarted && !sceneDone) &&
              "lg:max-w-[min(100%,calc((100dvh-22rem)*2))]",
            played && "max-sm:-mx-4 max-sm:w-auto max-sm:pt-[8svh] lg:pt-8",
          )}
        >
          <LessonStage
            bind:this={sceneStage}
            bind:status={stageStatus}
            compact={!played}
            hint={played && !sceneStarted && !starting && !reviewing ? sceneHint : undefined}
            onstart={played && !starting ? startScene : undefined}
            scene={stage}
            {showEnglish}
            {thingWords}
          />
        </div>
      {/if}

      {#if viewStep}
        {#key viewStep.id}
          {#if viewStep.kind === "scene" || viewStep.kind === "finale"}
            <div
              class={cx(
                "mx-auto w-full pt-2 pb-10",
                viewStep.kind === "finale" && sceneStarted && !sceneDone
                  ? "lg:pt-7"
                  : "lg:max-w-[min(100%,calc((100dvh-22rem)*2))]",
              )}
            >
              {#if turn?.line.sayChoices}
                <div class="animate-rise" data-turn>
                  <p
                    class={cx(eyebrowMutedClass, "outline-none")}
                    role="status"
                    tabindex="-1"
                    data-turn-label
                  >
                    Your turn: what does Alex say?
                  </p>

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
              {/if}
            </div>
          {:else if viewStep.kind === "teach"}
            <LessonStepTeach
              beside={Boolean(stage)}
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
          attemptLabel={viewResult.attemptLabel}
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
        queues
        quiet={footerLabel === "Skip"}
        wide={Boolean(stage)}
      />
    {/if}
  {/if}
</div>
