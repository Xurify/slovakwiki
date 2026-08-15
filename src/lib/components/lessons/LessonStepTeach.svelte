<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import LessonSceneBackdrop from "$lib/components/lessons/LessonSceneBackdrop.svelte";
  import LessonStoryLine from "$lib/components/lessons/LessonStoryLine.svelte";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryAutoAdvance,
    getStoryShowEnglish,
  } from "$lib/lesson-story/prefs";
  import { SFX_CHANGE_EVENT, getStoredSfxPreference } from "$lib/audio/sfx";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import {
    ChoiceOptions,
    choiceIndexFromKeyboardEvent,
    isSayChoiceCorrect,
  } from "$lib/learning/exercises";
  import { ClockIllustration } from "$lib/learning/time";
  import { isLearnerSpeaker } from "$lib/lesson-story/story-cast";
  import { storySettingForLesson } from "$lib/lesson-story/story-settings";
  import {
    playStoryLineAudio,
    stopStoryLineAudio,
    unlockStoryAudio,
  } from "$lib/lesson-story/story-audio";
  import type { DialogueTurn, KeyPhrase, LessonBeatTeach } from "$lib/learning/types";

  let {
    advanceSignal = 0,
    audioSrcs = {},
    lessonId = "",
    scene = [],
    storyComplete = $bindable(false),
    teach,
    title,
  }: {
    /** Increment from the player footer to reveal the next story line. */
    advanceSignal?: number;
    audioSrcs?: Record<string, string>;
    lessonId?: string;
    scene?: DialogueTurn[];
    storyComplete?: boolean;
    teach: LessonBeatTeach;
    title: string;
  } = $props();

  let revealedCount = $state(0);
  let stageReady = $state(false);
  let scrollEl: HTMLElement | undefined = $state();
  let lastAdvance = $state(0);
  let autoAdvanceOn = $state(getStoryAutoAdvance() === "on");
  let showEnglishOn = $state(getStoryShowEnglish() === "on");
  let soundOn = $state(getStoredSfxPreference() === "on");
  let autoAdvanceTimer = 0;
  let lineEpoch = 0;

  let pendingChoiceLine = $state<DialogueTurn | null>(null);
  let choiceSelectedId = $state<string | null>(null);
  let choiceMissWhy = $state<string | null>(null);
  let lastGradedChoiceId = $state<string | null>(null);
  /** True while the newest revealed line’s story clip is in flight (or dwell). */
  let lineAudioPlaying = $state(false);
  /**
   * Next/advance asked for a say-choice gate while the prior line still plays —
   * open the gate only after that clip ends (do not stop audio / show options early).
   */
  let openChoiceWhenAudioEnds = $state(false);

  const setting = $derived(storySettingForLesson(lessonId));

  /**
   * Keep phrase cards only when they teach something the scene did not already
   * show — prefer a note (grammar / usage). Bare stem repeats get dropped.
   */
  const takeaways = $derived.by((): KeyPhrase[] => {
    const all = teach.phrases ?? [];
    if (!all.length) return [];

    const spoken = scene.map((line) => line.slovak.toLowerCase()).join(" · ");

    return all.filter((phrase) => {
      const hasNote = Boolean(phrase.note?.trim());
      const isStem = phrase.slovak.includes("…");
      const core = phrase.slovak
        .replace(/[.…]+$/g, "")
        .trim()
        .toLowerCase();
      const alreadySpoken = core.length > 0 && spoken.includes(core);

      if (hasNote) return true;
      if (isStem || alreadySpoken) return false;
      return true;
    });
  });

  const hasAftercare = $derived(
    takeaways.length > 0 || Boolean(teach.note) || teach.visual?.type === "clock-grid",
  );

  const visibleLines = $derived(scene.slice(0, revealedCount));
  const storyActive = $derived(scene.length > 0);
  const allLinesRevealed = $derived(!storyActive || revealedCount >= scene.length);
  const showAftercare = $derived(!storyActive || allLinesRevealed);
  const awaitingChoice = $derived(pendingChoiceLine !== null);
  const waitingForChoiceAfterAudio = $derived(openChoiceWhenAudioEnds);
  const choiceMissParts = $derived(choiceMissWhy ? splitEmphasis(choiceMissWhy) : []);

  function syncComplete(): void {
    storyComplete =
      (!storyActive || revealedCount >= scene.length) &&
      pendingChoiceLine === null &&
      !openChoiceWhenAudioEnds;
  }

  function clearAutoAdvance(): void {
    if (autoAdvanceTimer) {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = 0;
    }
  }

  function clearChoiceGate(): void {
    pendingChoiceLine = null;
    choiceSelectedId = null;
    choiceMissWhy = null;
    lastGradedChoiceId = null;
    openChoiceWhenAudioEnds = false;
  }

  function isGatedYouLine(line: DialogueTurn | undefined): line is DialogueTurn {
    return Boolean(
      line &&
      isLearnerSpeaker(line.speaker) &&
      line.sayChoices &&
      line.sayChoices.choices.length > 0,
    );
  }

  function openChoiceGate(line: DialogueTurn): void {
    clearAutoAdvance();
    openChoiceWhenAudioEnds = false;
    lineAudioPlaying = false;
    stopStoryLineAudio();
    pendingChoiceLine = line;
    choiceSelectedId = null;
    choiceMissWhy = null;
    lastGradedChoiceId = null;
    syncComplete();
    void scrollToChoice();
  }

  function finishLineAudio(count: number, epoch: number): void {
    if (epoch !== lineEpoch) return;

    lineAudioPlaying = false;

    // Early Next queued the say-choice gate — open only now that audio finished.
    if (openChoiceWhenAudioEnds) {
      openChoiceWhenAudioEnds = false;
      const next = scene[revealedCount];
      if (isGatedYouLine(next)) {
        openChoiceGate(next);
        return;
      }
      syncComplete();
    }

    onLineAudioEnded(count, epoch);
  }

  function playLineAt(count: number): void {
    const line = scene[count - 1];
    if (!line) return;

    const epoch = lineEpoch;
    const text = line.audio?.transcript ?? line.slovak;
    const src = audioSrcs[line.id] ?? line.audio?.src;

    lineAudioPlaying = true;
    playStoryLineAudio(src, text, {
      onEnded: () => finishLineAudio(count, epoch),
    });
  }

  /** Reveal the next scene line and play it (no gate check). */
  function revealLine(): void {
    clearAutoAdvance();
    lineEpoch += 1;
    openChoiceWhenAudioEnds = false;
    lineAudioPlaying = false;
    stopStoryLineAudio();

    if (revealedCount < scene.length) {
      revealedCount += 1;
      syncComplete();
      playLineAt(revealedCount);
      void scrollToLatest();
    }
  }

  /**
   * Advance one beat: either open a say-choices gate for the next You line,
   * or reveal the next line.
   *
   * Say-choice options never appear while the prior line’s audio is still
   * playing — Next during playback queues the gate until `onEnded`.
   */
  function tryAdvance(): void {
    if (pendingChoiceLine) return;
    if (openChoiceWhenAudioEnds) return;
    if (revealedCount >= scene.length) return;

    const next = scene[revealedCount];
    if (isGatedYouLine(next)) {
      if (lineAudioPlaying) {
        openChoiceWhenAudioEnds = true;
        syncComplete();
        return;
      }

      openChoiceGate(next);
      return;
    }

    revealLine();
  }

  function onLineAudioEnded(forCount: number, epoch: number): void {
    if (pendingChoiceLine) return;
    if (openChoiceWhenAudioEnds) return;
    if (epoch !== lineEpoch) return;
    if (forCount !== revealedCount) return;
    if (revealedCount >= scene.length) return;

    const next = scene[revealedCount];
    // Say-choice gates always open after the prior line finishes — they are the
    // interaction, not a passive auto-advance preference.
    const shouldAdvance = isGatedYouLine(next) || (autoAdvanceOn && soundOn);
    if (!shouldAdvance) return;

    clearAutoAdvance();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    autoAdvanceTimer = window.setTimeout(
      () => {
        autoAdvanceTimer = 0;
        if (pendingChoiceLine) return;
        if (openChoiceWhenAudioEnds) return;
        if (epoch !== lineEpoch) return;
        if (forCount !== revealedCount) return;

        const upcoming = scene[revealedCount];
        if (isGatedYouLine(upcoming)) {
          openChoiceGate(upcoming);
          return;
        }

        if (!autoAdvanceOn || !soundOn) return;
        tryAdvance();
      },
      reduced ? 120 : 420,
    );
  }

  function resolveChoice(selectedId: string): void {
    const line = pendingChoiceLine;
    const choices = line?.sayChoices;
    if (!line || !choices) return;
    if (selectedId === lastGradedChoiceId) return;

    lastGradedChoiceId = selectedId;

    if (isSayChoiceCorrect(selectedId, choices)) {
      clearChoiceGate();
      unlockStoryAudio();
      revealLine();
      return;
    }

    const picked = choices.choices.find((choice) => choice.id === selectedId);
    choiceMissWhy =
      picked?.whyWrong?.trim() ||
      "Not that line — pick the reply that matches what you mean.";
  }

  function onChoiceKeydown(event: KeyboardEvent): void {
    if (!pendingChoiceLine?.sayChoices) return;

    const index = choiceIndexFromKeyboardEvent(event);
    if (index === null) return;

    const choice = pendingChoiceLine.sayChoices.choices[index];
    if (!choice) return;

    event.preventDefault();
    choiceSelectedId = choice.id;
  }

  async function scrollToLatest(): Promise<void> {
    await tick();
    const latest = scrollEl?.querySelector<HTMLElement>(".story-line-newest");
    latest?.scrollIntoView({
      block: "nearest",
      behavior:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
    });
  }

  async function scrollToChoice(): Promise<void> {
    await tick();
    const panel = scrollEl?.querySelector<HTMLElement>(".story-say-choice");
    panel?.scrollIntoView({
      block: "nearest",
      behavior:
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
    });
  }

  onMount(() => {
    storyComplete = scene.length === 0;
    lastAdvance = advanceSignal;
    autoAdvanceOn = getStoryAutoAdvance() === "on";
    showEnglishOn = getStoryShowEnglish() === "on";
    soundOn = getStoredSfxPreference() === "on";

    function onPrefsChange(): void {
      autoAdvanceOn = getStoryAutoAdvance() === "on";
      showEnglishOn = getStoryShowEnglish() === "on";
    }

    function onSfxChange(): void {
      soundOn = getStoredSfxPreference() === "on";
      if (!soundOn) clearAutoAdvance();
    }

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    window.addEventListener(SFX_CHANGE_EVENT, onSfxChange);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Open the curtain, then land the first line — or a say-choice gate.
    const curtain = window.setTimeout(
      () => {
        stageReady = true;
        if (scene.length > 0) {
          tryAdvance();
        }
      },
      reduced ? 0 : 220,
    );

    return () => {
      window.clearTimeout(curtain);
      clearAutoAdvance();
      window.removeEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
      window.removeEventListener(SFX_CHANGE_EVENT, onSfxChange);
      stopStoryLineAudio();
    };
  });

  onDestroy(() => {
    clearAutoAdvance();
    stopStoryLineAudio();
  });

  // Footer Continue while mid-story → next line (blocked while choosing).
  $effect(() => {
    const signal = advanceSignal;
    if (signal === 0 || signal === lastAdvance) return;
    lastAdvance = signal;
    tryAdvance();
  });

  // Grade as soon as a say-choice is tapped or keyed.
  $effect(() => {
    const selectedId = choiceSelectedId;
    if (!pendingChoiceLine || !selectedId) return;
    resolveChoice(selectedId);
  });
</script>

<svelte:window onkeydown={onChoiceKeydown} />

<div class="relative mx-auto flex min-h-full w-full max-w-2xl flex-col">
  {#if storyActive}
    <div
      class="sticky top-0 z-20 isolate overflow-hidden border-b border-slate-200/70 bg-paper/95 backdrop-blur-md"
    >
      <div class="relative h-[6.5rem] sm:h-[7.75rem]">
        <LessonSceneBackdrop art={setting.art} />
      </div>

      <div
        class="relative z-10 -mt-6 flex flex-col items-center gap-2 bg-linear-to-b from-transparent to-paper px-4 pt-2 pb-5 text-center sm:px-8 sm:pb-6 {stageReady
          ? 'story-header-in'
          : 'story-header-prep'}"
      >
        <p
          class="m-0 inline-flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.12em] text-slate-600 uppercase shadow-(--shadow-border) backdrop-blur-sm"
        >
          {#if setting.placeSk}
            <span lang="sk">{setting.placeSk}</span>
            <span class="text-slate-400" aria-hidden="true">·</span>
          {/if}
          <span class="normal-case tracking-normal">{setting.place}</span>
        </p>

        <h2
          class="m-0 font-serif text-[clamp(1.4rem,3.2vw,1.95rem)] leading-snug tracking-tight text-balance text-slate-900"
        >
          {title}
        </h2>

        {#if scene.length > 1}
          <div class="mt-1 flex items-center gap-1.5" aria-hidden="true">
            {#each scene as _, index (index)}
              <span
                class="size-1.5 rounded-full transition-colors duration-300 {index <
                revealedCount
                  ? 'bg-blue-700'
                  : index === revealedCount &&
                      (awaitingChoice || waitingForChoiceAfterAudio)
                    ? 'bg-blue-400'
                    : 'bg-slate-300'}"
              ></span>
            {/each}
          </div>
          <p class="sr-only">
            Line {Math.min(revealedCount, scene.length)} of {scene.length}
          </p>
        {/if}
      </div>
    </div>
  {:else}
    <div class="px-4 pt-10 pb-2 text-center sm:px-8 sm:pt-12">
      <h2
        class="m-0 font-serif text-[clamp(1.35rem,3vw,1.85rem)] leading-snug tracking-tight text-balance text-slate-900"
      >
        {title}
      </h2>
    </div>
  {/if}

  <div bind:this={scrollEl} class="min-h-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
    {#if storyActive}
      <ol class="m-0 flex list-none flex-col gap-5 p-0">
        {#each visibleLines as line, index (line.id)}
          <LessonStoryLine
            {line}
            audioSrc={audioSrcs[line.id] ?? line.audio?.src}
            newest={index === visibleLines.length - 1 &&
              !awaitingChoice &&
              !waitingForChoiceAfterAudio}
            showEnglish={showEnglishOn}
          />
        {/each}
      </ol>

      {#if pendingChoiceLine?.sayChoices}
        <div class="story-say-choice mt-8">
          <p
            class="m-0 text-[0.62rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
          >
            Your turn
          </p>

          <ChoiceOptions
            choices={pendingChoiceLine.sayChoices.choices}
            bind:selectedId={choiceSelectedId}
            submitted={false}
            variant="cards"
          />

          {#if choiceMissParts.length}
            <p
              class="m-0 mt-4 rounded-(--frame-radius) bg-rose-50 px-4 py-3 text-sm leading-relaxed text-pretty text-rose-900 shadow-(--shadow-border)"
              role="status"
            >
              {#each choiceMissParts as part, index (`${part.type}-${index}-${part.value}`)}
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
      {:else if waitingForChoiceAfterAudio}
        <p
          class="story-nudge m-0 mt-6 text-center text-sm text-slate-500"
          aria-live="polite"
        >
          Listening — your turn next
        </p>
      {:else if !allLinesRevealed && revealedCount > 0}
        <p
          class="story-nudge m-0 mt-6 text-center text-sm text-slate-500"
          aria-hidden="true"
        >
          {autoAdvanceOn && soundOn
            ? "Listening — next line plays automatically"
            : "Next line continues the conversation"}
        </p>
      {/if}
    {/if}

    {#if showAftercare && hasAftercare}
      <div
        class="story-aftercare mt-8 grid gap-4 {storyActive
          ? 'border-t border-slate-200/80 pt-8'
          : ''}"
      >
        {#if takeaways.length}
          {#each takeaways as phrase (phrase.slovak)}
            <div
              class="rounded-(--frame-radius) bg-subtle px-5 py-4 shadow-(--shadow-border) sm:px-6 sm:py-5"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p
                    class="m-0 text-[0.62rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
                  >
                    Takeaway
                  </p>

                  <p
                    class="m-0 mt-2 font-serif text-[clamp(1.2rem,2.5vw,1.5rem)] font-semibold leading-snug text-slate-900"
                    lang="sk"
                  >
                    {phrase.slovak}
                  </p>

                  <p class="m-0 mt-1.5 text-sm text-slate-600">{phrase.english}</p>
                </div>

                {#if audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                  <AudioButton
                    size="sm"
                    src={audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                    text={phrase.audio?.transcript ?? phrase.slovak}
                    label={`Listen: ${phrase.slovak}`}
                  />
                {/if}
              </div>

              {#if phrase.note}
                <p class="m-0 mt-3 text-sm leading-relaxed text-slate-600">
                  {phrase.note}
                </p>
              {/if}
            </div>
          {/each}
        {/if}

        {#if teach.note}
          <p
            class="m-0 rounded-(--frame-radius) bg-surface/80 px-5 py-4 font-serif text-sm leading-relaxed text-slate-700 shadow-(--shadow-border) sm:px-6"
          >
            {teach.note}
          </p>
        {/if}

        {#if teach.visual?.type === "clock-grid"}
          <div>
            <h3
              class="m-0 mb-4 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
            >
              {teach.visual.title}
            </h3>

            <ul
              class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4 p-0"
            >
              {#each teach.visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
                <li
                  class="grid justify-items-center gap-1.5 rounded-(--frame-radius) bg-surface/80 px-3 py-4 shadow-(--shadow-border)"
                >
                  <ClockIllustration
                    hour={item.time.hour}
                    minute={item.time.minute}
                    size={84}
                  />

                  <strong class="text-center font-serif text-sm text-slate-900" lang="sk">
                    {item.slovak}
                  </strong>

                  <span class="text-center text-xs text-slate-500">{item.english}</span>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .story-header-prep {
    opacity: 0;
    transform: translateY(8px);
  }

  .story-header-in {
    opacity: 1;
    transform: translateY(0);
    transition:
      opacity 480ms cubic-bezier(0.2, 0, 0, 1),
      transform 480ms cubic-bezier(0.2, 0, 0, 1);
  }

  .story-nudge {
    animation: story-nudge-pulse 2.4s ease-in-out infinite;
  }

  .story-say-choice {
    animation: story-aftercare-in 420ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  .story-aftercare {
    animation: story-aftercare-in 480ms cubic-bezier(0.2, 0, 0, 1) both;
  }

  @keyframes story-nudge-pulse {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 0.9;
    }
  }

  @keyframes story-aftercare-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .story-header-prep,
    .story-header-in,
    .story-nudge,
    .story-say-choice,
    .story-aftercare {
      opacity: 1;
      transform: none;
      animation: none;
      transition: none;
    }
  }
</style>
