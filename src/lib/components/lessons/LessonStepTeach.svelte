<script lang="ts">
  import { eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import { onDestroy, onMount, tick, untrack } from "svelte";
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import FormTable from "$lib/components/lessons/FormTable.svelte";
  import MarkedNote from "$lib/components/lessons/MarkedNote.svelte";
  import LessonSceneBackdrop from "$lib/components/lessons/LessonSceneBackdrop.svelte";
  import LessonStoryLine from "$lib/components/lessons/LessonStoryLine.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
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
    isStoryLineAudioActive,
    playStoryLineAudio,
    stopStoryLineAudio,
    unlockStoryAudio,
  } from "$lib/lesson-story/story-audio";
  import type { DialogueTurn, KeyPhrase, LessonBeatTeach } from "$lib/learning/types";

  let {
    advanceSignal = 0,
    audioSrcs = {},
    lessonId = "",
    review = false,
    scene = [],
    storyComplete = $bindable(false),
    choiceOpen = $bindable(false),
    teach,
    title,
  }: {
    advanceSignal?: number;
    audioSrcs?: Record<string, string>;
    lessonId?: string;
    /** Already played: open with every line shown and nothing autoplaying. */
    review?: boolean;
    scene?: DialogueTurn[];
    storyComplete?: boolean;
    choiceOpen?: boolean;
    teach: LessonBeatTeach;
    title: string;
  } = $props();

  let revealedCount = $state(untrack(() => (review ? scene.length : 0)));
  let scrollEl: HTMLElement | undefined = $state();
  let lastAdvance = 0;
  let autoAdvanceOn = $state(getStoryAutoAdvance() === "on");
  let showEnglishOn = $state(getStoryShowEnglish() === "on");
  let soundOn = $state(getStoredSfxPreference() === "on");
  let autoAdvanceTimer = 0;
  let lineEpoch = 0;

  let pendingChoiceLine = $state<DialogueTurn | null>(null);
  let choiceSelectedId = $state<string | null>(null);
  let choiceMissWhy = $state<string | null>(null);
  let lineAudioPlaying = $state(false);
  let waitingForChoiceAfterAudio = $state(false);

  const setting = $derived(storySettingForLesson(lessonId));

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
    takeaways.length > 0 || Boolean(teach.note) || Boolean(teach.visual),
  );

  const visualHeadingClass = `${eyebrowMutedClass} mb-4`;

  const visuals = $derived(teach.visual ? [teach.visual].flat() : []);

  const visibleLines = $derived(scene.slice(0, revealedCount));
  const storyActive = $derived(scene.length > 0);
  const allLinesRevealed = $derived(!storyActive || revealedCount >= scene.length);
  const showAftercare = $derived(!storyActive || allLinesRevealed);
  const awaitingChoice = $derived(pendingChoiceLine !== null);
  const wrongChoiceId = $derived(choiceMissWhy ? choiceSelectedId : null);
  const choiceMissParts = $derived(choiceMissWhy ? splitEmphasis(choiceMissWhy) : []);

  function syncComplete(): void {
    storyComplete =
      (!storyActive || revealedCount >= scene.length) &&
      pendingChoiceLine === null &&
      !waitingForChoiceAfterAudio;
    choiceOpen = pendingChoiceLine !== null;
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
    waitingForChoiceAfterAudio = false;
  }

  function isSayChoiceTurn(line: DialogueTurn | undefined): line is DialogueTurn {
    return Boolean(
      line &&
      isLearnerSpeaker(line.speaker) &&
      line.sayChoices &&
      line.sayChoices.choices.length > 0,
    );
  }

  function openChoiceGate(line: DialogueTurn): void {
    clearAutoAdvance();
    waitingForChoiceAfterAudio = false;
    lineAudioPlaying = false;
    stopStoryLineAudio();
    pendingChoiceLine = line;
    choiceSelectedId = null;
    choiceMissWhy = null;
    syncComplete();
    void scrollToChoice();
  }

  function finishLineAudio(count: number, epoch: number): void {
    if (epoch !== lineEpoch) return;

    lineAudioPlaying = false;

    if (waitingForChoiceAfterAudio) {
      waitingForChoiceAfterAudio = false;
      const next = scene[revealedCount];
      if (isSayChoiceTurn(next)) {
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

  function revealLine(): void {
    clearAutoAdvance();
    lineEpoch += 1;
    waitingForChoiceAfterAudio = false;
    lineAudioPlaying = false;
    stopStoryLineAudio();

    if (revealedCount < scene.length) {
      revealedCount += 1;
      syncComplete();
      playLineAt(revealedCount);
      void scrollToLatest();
    }
  }

  function advanceStory(): void {
    if (pendingChoiceLine) return;

    if (lineAudioPlaying && !isStoryLineAudioActive()) {
      lineAudioPlaying = false;
      waitingForChoiceAfterAudio = false;
    }

    if (waitingForChoiceAfterAudio) return;
    if (revealedCount >= scene.length) return;

    const next = scene[revealedCount];
    if (isSayChoiceTurn(next)) {
      if (lineAudioPlaying) {
        waitingForChoiceAfterAudio = true;
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
    if (waitingForChoiceAfterAudio) return;
    if (epoch !== lineEpoch) return;
    if (forCount !== revealedCount) return;
    if (revealedCount >= scene.length) return;

    const next = scene[revealedCount];
    const openChoiceOrAutoplay = isSayChoiceTurn(next) || (autoAdvanceOn && soundOn);
    if (!openChoiceOrAutoplay) return;

    clearAutoAdvance();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    autoAdvanceTimer = window.setTimeout(
      () => {
        autoAdvanceTimer = 0;
        if (pendingChoiceLine) return;
        if (waitingForChoiceAfterAudio) return;
        if (epoch !== lineEpoch) return;
        if (forCount !== revealedCount) return;

        const upcoming = scene[revealedCount];
        if (isSayChoiceTurn(upcoming)) {
          openChoiceGate(upcoming);
          return;
        }

        if (!autoAdvanceOn || !soundOn) return;
        advanceStory();
      },
      reduced ? 120 : 420,
    );
  }

  function resolveChoice(selectedId: string): void {
    const line = pendingChoiceLine;
    const choices = line?.sayChoices;
    if (!line || !choices) return;

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

  function setChoiceSelectedId(id: string | null): void {
    choiceSelectedId = id;
    if (id) resolveChoice(id);
  }

  function onChoiceKeydown(event: KeyboardEvent): void {
    if (!pendingChoiceLine?.sayChoices) return;

    const index = choiceIndexFromKeyboardEvent(event);
    if (index === null) return;

    const choice = pendingChoiceLine.sayChoices.choices[index];
    if (!choice) return;

    event.preventDefault();
    setChoiceSelectedId(choice.id);
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

  function startStoryAfterCurtain(): void {
    const waitingToStart =
      scene.length > 0 &&
      revealedCount === 0 &&
      pendingChoiceLine === null &&
      !waitingForChoiceAfterAudio;
    if (waitingToStart) advanceStory();
  }

  onMount(() => {
    lastAdvance = advanceSignal;
    autoAdvanceOn = getStoryAutoAdvance() === "on";
    showEnglishOn = getStoryShowEnglish() === "on";
    soundOn = getStoredSfxPreference() === "on";
    syncComplete();

    function onPrefsChange(): void {
      autoAdvanceOn = getStoryAutoAdvance() === "on";
      showEnglishOn = getStoryShowEnglish() === "on";
    }

    function onSfxChange(): void {
      soundOn = getStoredSfxPreference() === "on";
      if (soundOn) return;

      // Mute calls stopAll() without onEnded — unstick say-choice wait.
      clearAutoAdvance();
      lineAudioPlaying = false;

      if (!waitingForChoiceAfterAudio) return;

      waitingForChoiceAfterAudio = false;
      const next = scene[revealedCount];
      if (isSayChoiceTurn(next)) {
        openChoiceGate(next);
        return;
      }

      syncComplete();
    }

    window.addEventListener(STORY_PREFS_CHANGE_EVENT, onPrefsChange);
    window.addEventListener(SFX_CHANGE_EVENT, onSfxChange);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const curtainDelay = reduced ? 0 : 220;
    const curtain = window.setTimeout(startStoryAfterCurtain, curtainDelay);

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

  $effect(() => {
    const signal = advanceSignal;
    if (signal === 0 || signal === lastAdvance) return;
    lastAdvance = signal;
    advanceStory();
  });
</script>

<svelte:window onkeydown={onChoiceKeydown} />

<div class="relative mx-auto flex min-h-full w-full max-w-[640px] flex-col">
  {#if storyActive}
    <div class="border-b border-slate-200/70">
      <div class="relative h-24 overflow-hidden sm:h-28">
        <LessonSceneBackdrop art={setting.art} />
      </div>

      <div class="px-4 pt-3 pb-5 sm:px-8">
        <p class={eyebrowMutedClass}>
          {#if setting.placeSk}
            <span lang="sk">{setting.placeSk}</span>
            <span class="mx-1.5 text-slate-400" aria-hidden="true">·</span>
          {/if}
          <span class="font-semibold tracking-normal normal-case">{setting.place}</span>
        </p>

        <div class="mt-1.5 flex items-baseline justify-between gap-4">
          <h2
            class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl"
          >
            {title}
          </h2>

          {#if scene.length > 1}
            <p class="m-0 shrink-0 text-xs text-slate-500 tabular-nums">
              Line {Math.max(1, Math.min(revealedCount, scene.length))} of {scene.length}
            </p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="px-4 pt-8 pb-2 sm:px-8 sm:pt-10">
      <h2
        class="m-0 font-serif text-xl tracking-tight text-pretty text-slate-900 sm:text-2xl"
      >
        {title}
      </h2>
    </div>
  {/if}

  <div bind:this={scrollEl} class="min-h-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
    {#if storyActive}
      <ol class="{dataPanelClass} m-0 list-none p-0">
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
        <div class="story-say-choice mt-8 animate-rise">
          <p class={eyebrowMutedClass}>Your turn</p>

          <ChoiceOptions
            choices={pendingChoiceLine.sayChoices.choices}
            bind:selectedId={() => choiceSelectedId, setChoiceSelectedId}
            submitted={false}
            {wrongChoiceId}
            variant="cards"
          />

          {#if choiceMissParts.length}
            <p
              class="m-0 mt-3 text-sm leading-relaxed text-pretty text-rose-800"
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
        <p class="m-0 mt-3 text-sm text-slate-500" aria-live="polite">
          Listening — your turn next
        </p>
      {:else if !allLinesRevealed && revealedCount > 0}
        <p class="m-0 mt-3 text-sm text-slate-500" aria-hidden="true">
          {autoAdvanceOn && soundOn
            ? "Listening — next line plays automatically"
            : "Next line continues the conversation"}
        </p>
      {/if}
    {/if}

    {#if showAftercare && hasAftercare}
      <div
        class="story-aftercare mt-8 grid animate-rise gap-6 {storyActive
          ? 'border-t border-slate-200/80 pt-8'
          : ''}"
      >
        {#if takeaways.length}
          <div>
            <h3 class={visualHeadingClass}>
              {takeaways.length === 1 ? "Key term" : "Key terms"}
            </h3>

            <ul class="{dataPanelClass} m-0 list-none p-0">
              {#each takeaways as phrase (phrase.slovak)}
                <li
                  class="flex items-start justify-between gap-4 border-b border-slate-200/70 px-4 py-3.5 last:border-b-0 sm:px-5"
                >
                  <div class="min-w-0">
                    <p
                      class="m-0 font-serif text-lg font-semibold leading-snug text-slate-900"
                      lang="sk"
                    >
                      {phrase.slovak}
                    </p>

                    <p class="m-0 mt-0.5 text-sm text-slate-600">{phrase.english}</p>

                    {#if phrase.note}
                      <p class="m-0 mt-2 text-sm leading-relaxed text-slate-500">
                        <MarkedNote text={phrase.note} />
                      </p>
                    {/if}
                  </div>

                  {#if audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                    <AudioButton
                      size="sm"
                      src={audioSrcs[phrase.slovak] ?? phrase.audio?.src}
                      text={phrase.audio?.transcript ?? phrase.slovak}
                      label={`Listen: ${phrase.slovak}`}
                    />
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if teach.note}
          <p
            class="m-0 max-w-[62ch] text-[1.02rem] leading-relaxed text-pretty text-slate-800"
          >
            <MarkedNote text={teach.note} />
          </p>
        {/if}

        {#each visuals as visual (visual.title)}
          {#if visual.type === "clock-grid"}
            <div>
              <h3 class={visualHeadingClass}>
                {visual.title}
              </h3>

              <ul
                class="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] gap-4 p-0"
              >
                {#each visual.items as item (`${item.slovak}-${item.time.hour}-${item.time.minute}`)}
                  <li class="{panelClass} grid justify-items-center gap-1.5 px-3 py-4">
                    <ClockIllustration
                      hour={item.time.hour}
                      minute={item.time.minute}
                      size={84}
                    />

                    <strong
                      class="text-center font-serif text-sm text-slate-900"
                      lang="sk"
                    >
                      {item.slovak}
                    </strong>

                    <span class="text-center text-xs text-slate-500">{item.english}</span>
                  </li>
                {/each}
              </ul>
            </div>
          {:else}
            <FormTable table={visual} />
          {/if}
        {/each}
      </div>
    {/if}
  </div>
</div>
