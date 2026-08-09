<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ContextRail from "$lib/components/ui/ContextRail.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { tick } from "svelte";
  import { canCheckBuild, gradeBuild, resolveBuiltTiles } from "$lib/client/build-tiles";
  import {
    gradeAnswer,
    suggestCloseAnswer,
    type AnswerGrade,
  } from "$lib/client/practice-state";
  import { playAnswerSfx, playFinishSfx, type AnswerSfxKind } from "$lib/client/sfx";
  import AudioButton from "$lib/components/AudioButton.svelte";
  import ClozeHintPanel from "$lib/components/practice/ClozeHintPanel.svelte";
  import GrammarHintAccordion from "$lib/components/practice/GrammarHintAccordion.svelte";
  import {
    BuildSentenceOptions,
    ChoiceOptions,
    SelectAllOptions,
    choiceFeedbackWhy,
    gradeSelectAll,
    selectAllFeedbackWhy,
  } from "$lib/learning/exercises";
  import { formatClockFaceLabel } from "$lib/learning/time/clock";
  import PracticeDialogueBubble from "$lib/components/practice/PracticeDialogueBubble.svelte";
  import PracticeExerciseCard from "$lib/components/practice/PracticeExerciseCard.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    feedbackFooterClass,
    feedbackToneFromGrade,
    isMissFeedback,
    shouldShowCorrection,
  } from "$lib/components/practice/practice-feedback-ui";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";
  import PracticeSessionComplete, {
    type SessionPhraseResult,
  } from "$lib/components/practice/PracticeSessionComplete.svelte";
  import { entryBySlug, words } from "$lib/content/data";
  import { dictionaryPathForSense } from "$lib/content/lemma-senses";
  import type { PracticeItem, PracticeTask } from "$lib/learning/types";

  const SK_CHARS = [
    "á",
    "ä",
    "č",
    "ď",
    "é",
    "í",
    "ĺ",
    "ľ",
    "ň",
    "ó",
    "ô",
    "ŕ",
    "š",
    "ť",
    "ú",
    "ý",
    "ž",
  ] as const;

  function sectionTitleFor(task: PracticeTask): string {
    if (task.type === "typed" && task.task === "repair") return "Repair this sentence";
    if (task.type === "cloze") return "Fill the gap";
    if (task.type === "selectAll") return "";
    if (task.type === "choice" && task.clock) return "";
    if (task.type === "choice") return "Choose the answer";
    if (task.type === "build") return "";
    if (task.type === "typed") return "Write the sentence";
    return "Practice";
  }

  function dictionaryHrefForLemma(lemmaId: string): string {
    const entry = entryBySlug.get(lemmaId);
    if (!entry) return `/dictionary/${lemmaId}`;
    return dictionaryPathForSense(entry, words);
  }

  let {
    items,
    hintMode = "inline",
    audioSrcs = {},
    sectionTitle = $bindable(""),
    sessionTitle = "Practice",
    backHref,
    backLabel = "Practice",
  }: {
    items: PracticeItem[];
    hintMode?: "inline" | "rail";
    audioSrcs?: Record<string, string>;
    sectionTitle?: string;
    sessionTitle?: string;
    backHref?: string;
    backLabel?: string;
  } = $props();

  let activeIndex = $state(0);
  let builtBankIndexes = $state<number[]>([]);
  let input = $state("");
  let selectedId = $state<string | null>(null);
  let selectedIds = $state<Set<string>>(new Set());
  let submitted = $state(false);
  let revealed = $state(false);
  let finished = $state(false);
  let hintOpen = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);
  let itemOverride = $state<PracticeItem[] | null>(null);
  let sessionResults = $state<SessionPhraseResult[]>([]);

  const activeItems = $derived(itemOverride ?? items);
  const current = $derived(activeItems[activeIndex]);
  const task = $derived(current.task);
  const builtTiles = $derived(
    task.type === "build" ? resolveBuiltTiles(task.tiles, builtBankIndexes) : [],
  );
  const isRepair = $derived(task.type === "typed" && task.task === "repair");
  const dialogueContext = $derived(isRepair ? [] : (task.context ?? []));
  const repairLine = $derived(isRepair ? task.context?.[0] : undefined);
  const hasScene = $derived(dialogueContext.length > 0);
  const typedWithScene = $derived(task.type === "typed" && hasScene);

  $effect(() => {
    if (!finished) sectionTitle = sectionTitleFor(task);
  });

  const frameParts = $derived(task.type === "cloze" ? task.frame.split("{}") : []);
  const framePrefix = $derived(frameParts[0] ?? "");
  const frameSuffix = $derived(frameParts[1] ?? "");
  const spokenFrame = $derived(
    task.type === "cloze" ? task.frame.replace("{}", task.answer) : "",
  );

  const grade = $derived.by<AnswerGrade | null>(() => {
    if (!submitted || revealed) return null;
    if (task.type === "choice")
      return selectedId === task.answerId ? "correct" : "incorrect";
    if (task.type === "selectAll")
      return gradeSelectAll(selectedIds, task.choices) ? "correct" : "incorrect";
    if (task.type === "build")
      return gradeBuild(builtTiles, task.answer) ? "correct" : "incorrect";
    if (task.type === "cloze" || task.type === "typed")
      return gradeAnswer(input, task.answer, task.acceptedAnswers);
    return "incorrect";
  });

  const closeSuggestion = $derived.by(() => {
    if (!submitted || revealed || grade !== "incorrect") return null;
    if (task.type !== "cloze" && task.type !== "typed") return null;
    const suggestion = suggestCloseAnswer(input, task.answer, task.acceptedAnswers);
    const correction = current.feedback.correction;
    if (!suggestion || suggestion === correction) return null;
    return suggestion;
  });

  const canCheck = $derived.by(() => {
    if (submitted) return false;
    if (task.type === "choice") return selectedId !== null;
    if (task.type === "selectAll") return selectedIds.size > 0;
    if (task.type === "build")
      return canCheckBuild(builtTiles.length, task.answer.length);
    return input.trim().length > 0;
  });

  function sfxKindForGrade(value: AnswerGrade | null): AnswerSfxKind {
    if (value === "correct") return "correct";
    if (value === "accents") return "almost";
    return "incorrect";
  }

  function resolveCheckGrade(): AnswerGrade {
    if (task.type === "choice")
      return selectedId === task.answerId ? "correct" : "incorrect";
    if (task.type === "selectAll")
      return gradeSelectAll(selectedIds, task.choices) ? "correct" : "incorrect";
    if (task.type === "build")
      return gradeBuild(builtTiles, task.answer) ? "correct" : "incorrect";
    if (task.type === "cloze" || task.type === "typed")
      return gradeAnswer(input, task.answer, task.acceptedAnswers);
    return "incorrect";
  }

  async function check(): Promise<void> {
    if (!canCheck) return;
    const kind = sfxKindForGrade(resolveCheckGrade());
    submitted = true;
    playAnswerSfx(kind);
    await tick();
    feedbackPanel?.focus();
  }

  async function reveal(): Promise<void> {
    if (submitted) return;
    if (task.type !== "typed" && task.type !== "cloze") return;
    revealed = true;
    submitted = true;
    playAnswerSfx("incorrect");
    await tick();
    feedbackPanel?.focus();
  }

  function onAnswerKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey || submitted || !canCheck) return;
    event.preventDefault();
    void check();
  }

  function onContinueKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.shiftKey || !submitted || finished) return;
    event.preventDefault();
    next();
  }

  function insertChar(char: string): void {
    if (submitted || !inputEl) return;
    const start = inputEl.selectionStart ?? input.length;
    const end = inputEl.selectionEnd ?? start;
    input = input.slice(0, start) + char + input.slice(end);
    inputEl.focus();
    queueMicrotask(() => inputEl?.setSelectionRange(start + 1, start + 1));
  }

  function gradeForResult(): SessionPhraseResult["grade"] {
    if (revealed) return "revealed";
    return resolveCheckGrade();
  }

  function attemptForResult(): string | undefined {
    if (task.type === "choice" && selectedId) {
      const choice = task.choices.find((entry) => entry.id === selectedId);
      if (!choice) return undefined;
      if (choice.label) return choice.label;
      if (choice.clock) return formatClockFaceLabel(choice.clock);
      return undefined;
    }
    if (task.type === "selectAll" && selectedIds.size > 0) {
      return task.choices
        .filter((entry) => selectedIds.has(entry.id))
        .map((entry) => entry.label)
        .join("; ");
    }
    if (task.type === "build" && builtTiles.length > 0) return builtTiles.join(" ");
    if (task.type === "cloze" || task.type === "typed") {
      const trimmed = input.trim();
      return trimmed || undefined;
    }
    return undefined;
  }

  function recordResult(): void {
    sessionResults = [
      ...sessionResults,
      {
        itemId: current.id,
        prompt: current.task.prompt,
        promptLang: current.task.promptLang,
        slovak: current.feedback.correction,
        english: current.feedback.english,
        why: feedbackWhy,
        attempt: attemptForResult(),
        grade: gradeForResult(),
      },
    ];
  }

  function resetExerciseState(): void {
    builtBankIndexes = [];
    input = "";
    selectedId = null;
    selectedIds = new Set();
    submitted = false;
    revealed = false;
    hintOpen = false;
  }

  function next(): void {
    recordResult();

    if (activeIndex === activeItems.length - 1) {
      finished = true;
      playFinishSfx();
      return;
    }

    activeIndex += 1;
    resetExerciseState();
  }

  function retry(): void {
    itemOverride = null;
    sessionResults = [];
    activeIndex = 0;
    finished = false;
    resetExerciseState();
    if (activeItems[0]) sectionTitle = sectionTitleFor(activeItems[0].task);
  }

  function retryMissed(): void {
    const missedIds = new Set(
      sessionResults
        .filter((row) => row.grade !== "correct" && row.grade !== "accents")
        .map((row) => row.itemId),
    );
    const missed = items.filter((item) => missedIds.has(item.id));

    itemOverride = missed.length > 0 ? missed : null;
    sessionResults = [];
    activeIndex = 0;
    finished = false;
    resetExerciseState();

    const first = (itemOverride ?? items)[0];
    if (first) sectionTitle = sectionTitleFor(first.task);
  }

  const showCorrection = $derived(shouldShowCorrection(submitted, grade, revealed));

  const isMiss = $derived(submitted && isMissFeedback(grade, revealed));

  const feedbackAttempt = $derived(isMiss && !revealed ? attemptForResult() : undefined);

  const feedbackWhy = $derived.by(() => {
    const baseWhy = current.feedback.why;
    if (!isMiss || revealed) return baseWhy;
    if (task.type === "selectAll") {
      return selectAllFeedbackWhy(baseWhy, selectedIds, task.choices);
    }
    if (task.type === "choice") {
      return choiceFeedbackWhy(baseWhy, selectedId, task.choices, task.answerId);
    }
    return baseWhy;
  });

  function exerciseFooterClass(): string {
    if (!submitted) return "border-t border-slate-200 bg-paper/70";
    return feedbackFooterClass(feedbackToneFromGrade(grade, revealed));
  }
</script>

<svelte:window onkeydown={onContinueKeydown} />

{#snippet exerciseFooter()}
  {#if submitted}
    <div class="grid gap-2" bind:this={feedbackPanel} aria-live="polite" tabindex="-1">
      <PracticeExerciseFeedback
        attempt={feedbackAttempt}
        {closeSuggestion}
        correction={current.feedback.correction}
        english={current.feedback.english}
        why={feedbackWhy}
        newUse={current.newUse}
        {grade}
        {revealed}
        {showCorrection}
        density={isMiss ? "compact" : "default"}
        correctionLabelTone={isMiss || grade === "correct" ? "emerald" : "rose"}
        dictionaryHref={task.type === "cloze" && task.lemmaId
          ? dictionaryHrefForLemma(task.lemmaId)
          : undefined}
      />

      <Button class="w-full" type="button" variant="accent" onclick={next}>
        {activeIndex === activeItems.length - 1 ? "Finish" : "Continue"}
      </Button>
    </div>
  {:else}
    <div
      class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {#if task.type === "typed" || task.type === "cloze"}
        <button
          class="border-0 bg-transparent py-1 text-sm font-bold text-blue-800 underline underline-offset-2"
          type="button"
          onclick={reveal}
        >
          Reveal answer
        </button>
      {:else}
        <span aria-hidden="true"></span>
      {/if}

      <Button
        class="w-full sm:min-w-[9rem] sm:w-auto"
        type="button"
        variant="accent"
        disabled={!canCheck}
        onclick={check}
      >
        Check
      </Button>
    </div>
  {/if}
{/snippet}

{#if finished}
  <PracticeSessionComplete
    {backHref}
    {backLabel}
    onRetry={retry}
    onRetryMissed={retryMissed}
    results={sessionResults}
    {sessionTitle}
  />
{:else}
  <div class="mx-auto w-full max-w-[640px]" aria-labelledby="practice-question">
    <PracticeSessionChrome
      {activeIndex}
      {backHref}
      {backLabel}
      total={activeItems.length}
    />

    <PracticeExerciseCard footer={exerciseFooter} footerClass={exerciseFooterClass()}>
      {#if sectionTitle && !hasScene}
        <p class="m-0 mb-4 text-sm font-medium text-slate-500">{sectionTitle}</p>
      {/if}

      {#if hasScene}
        <div class="grid gap-4">
          {#each dialogueContext as line (line.id)}
            <PracticeDialogueBubble {line} {audioSrcs} />
          {/each}
        </div>
      {/if}

      {#if isRepair}
        <h1 id="practice-question" class="sr-only">{task.prompt}</h1>
      {:else}
        <h1
          id="practice-question"
          class="{hasScene
            ? 'mt-5'
            : ''} m-0 font-serif text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold leading-snug text-pretty text-slate-900"
          lang={task.promptLang === "sk" ? "sk" : undefined}
        >
          {task.prompt}
        </h1>
      {/if}

      {#if repairLine}
        <div class="mt-6 border-l-4 border-slate-300 bg-slate-50 px-4 py-3" lang="sk">
          <p class="m-0 font-serif text-lg font-semibold text-slate-900">
            {repairLine.slovak}
          </p>

          {#if repairLine.english}
            <p class="m-0 mt-1 text-sm text-slate-500">{repairLine.english}</p>
          {/if}
        </div>
      {/if}

      {#if task.type === "choice"}
        <div class="mt-6">
          <ChoiceOptions
            choices={task.choices}
            choiceStyle={task.choiceStyle}
            promptClock={task.clock}
            bind:selectedId
            {submitted}
          />
        </div>
      {:else if task.type === "selectAll"}
        <div class="mt-6">
          <SelectAllOptions
            choices={task.choices}
            promptClock={task.clock}
            bind:selectedIds
            {submitted}
          />
        </div>
      {:else if task.type === "build"}
        <BuildSentenceOptions
          tiles={task.tiles}
          answerLength={task.answer.length}
          bind:builtBankIndexes
          {submitted}
        />
      {:else if task.type === "cloze"}
        <div
          class={hintMode === "rail"
            ? "mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]"
            : "mt-6 grid gap-4"}
        >
          <div class="grid gap-3">
            <p
              class="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-3 font-serif text-xl leading-9"
              lang="sk"
            >
              {#if framePrefix}
                <span>{framePrefix}</span>
              {/if}

              <input
                class="min-w-[7ch] border-0 border-b-2 border-blue-600 bg-blue-50 px-2 py-1 text-center font-serif text-xl outline-none focus:ring-2 focus:ring-blue-100"
                style:width={`${Math.max(task.answer.length + 2, 8)}ch`}
                bind:this={inputEl}
                bind:value={input}
                disabled={submitted}
                aria-label={`Missing word: ${task.gapEn}`}
                autocomplete="off"
                autocapitalize="none"
                lang="sk"
                onkeydown={onAnswerKeydown}
              />

              {#if frameSuffix}
                <span>{frameSuffix}</span>
              {/if}

              {#if audioSrcs[task.id]}
                <AudioButton src={audioSrcs[task.id]} text={spokenFrame} />
              {/if}
            </p>

            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm text-slate-500">{task.gapEn}</span>

              <GrammarHintAccordion
                hint={task.hint}
                bind:open={hintOpen}
                variant="chip"
                panelPlacement={hintMode === "inline" ? "inline" : "none"}
              />
            </div>

            <div class="flex flex-wrap gap-1" aria-label="Slovak characters">
              {#each SK_CHARS as char (char)}
                <button
                  class="min-w-9 border border-slate-200 bg-slate-50 px-1.5 py-1 font-serif text-sm text-slate-600 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-40"
                  type="button"
                  disabled={submitted}
                  onclick={() => insertChar(char)}
                  tabindex="-1"
                >
                  {char}
                </button>
              {/each}
            </div>
          </div>

          {#if hintMode === "rail"}
            <ContextRail>
              {#if hintOpen}
                <ClozeHintPanel hint={task.hint} variant="rail" />
              {/if}
            </ContextRail>
          {/if}
        </div>
      {:else}
        <div class="mt-6 grid gap-3">
          {#if !typedWithScene}
            <label class="text-xs font-bold text-slate-600" for="practice-typed-input">
              {task.inputLabel}
            </label>
          {/if}

          <input
            id="practice-typed-input"
            class="min-h-[3.25rem] w-full rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3 font-serif text-xl text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            bind:this={inputEl}
            bind:value={input}
            disabled={submitted}
            aria-label={task.inputLabel}
            placeholder="Type in Slovak…"
            autocomplete="off"
            autocapitalize="none"
            lang="sk"
            onkeydown={onAnswerKeydown}
          />

          <div class="flex flex-wrap gap-1.5" aria-label="Slovak characters">
            {#each SK_CHARS as char (char)}
              <button
                class="min-w-9 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-2 py-1.5 font-serif text-sm text-slate-600 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-40"
                type="button"
                disabled={submitted}
                onclick={() => insertChar(char)}
                tabindex="-1"
              >
                {char}
              </button>
            {/each}
          </div>
        </div>
      {/if}

      {#if task.hint && (task.type === "choice" || task.type === "selectAll")}
        <div class="mt-6 border-t border-slate-200 pt-4">
          <GrammarHintAccordion hint={task.hint} bind:open={hintOpen} />
        </div>
      {/if}

      {#if current.source.href}
        <p class="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          From lesson:
          <TextLink class="text-xs" href={current.source.href}>
            {current.source.label}
          </TextLink>
        </p>
      {/if}
    </PracticeExerciseCard>
  </div>
{/if}
