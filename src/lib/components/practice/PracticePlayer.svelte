<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import ContextRail from "$lib/components/ui/ContextRail.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { tick } from "svelte";
  import {
    canCheckBuild,
    gradeBuild,
    isBankTileUsed,
    resolveBuiltTiles,
  } from "$lib/client/build-tiles";
  import {
    gradeAnswer,
    suggestCloseAnswer,
    type AnswerGrade,
  } from "$lib/client/practice-state";
  import { playAnswerSfx, playFinishSfx, type AnswerSfxKind } from "$lib/client/sfx";
  import AudioButton from "$lib/components/AudioButton.svelte";
  import ClockIllustration from "$lib/components/ClockIllustration.svelte";
  import ClozeHintPanel from "$lib/components/practice/ClozeHintPanel.svelte";
  import PracticeDialogueBubble from "$lib/components/practice/PracticeDialogueBubble.svelte";
  import PracticeExerciseCard from "$lib/components/practice/PracticeExerciseCard.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";
  import type { PracticeItem, PracticeTask } from "$lib/content/learning-types";

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

  const checkButtonClass =
    "!bg-blue-600 !text-white hover:!bg-blue-700 disabled:!bg-slate-200 disabled:!text-slate-500 disabled:hover:!bg-slate-200";

  function sectionTitleFor(task: PracticeTask): string {
    if (task.type === "typed" && task.task === "repair") return "Repair this sentence";
    if (task.type === "cloze") return "Fill the gap";
    if (task.type === "choice") return "Choose the answer";
    if (task.type === "build") return "Build the sentence";
    if (task.type === "typed") return "Write the sentence";
    return "Practice";
  }

  let {
    items,
    hintMode = "inline",
    audioSrcs = {},
    sectionTitle = $bindable(""),
    backHref,
    backLabel = "Practice",
  }: {
    items: PracticeItem[];
    hintMode?: "inline" | "rail";
    audioSrcs?: Record<string, string>;
    sectionTitle?: string;
    backHref?: string;
    backLabel?: string;
  } = $props();

  let activeIndex = $state(0);
  let builtBankIndexes = $state<number[]>([]);
  let input = $state("");
  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let revealed = $state(false);
  let finished = $state(false);
  let hintOpen = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);
  let inputEl = $state<HTMLInputElement | null>(null);

  const current = $derived(items[activeIndex]);
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

  function selectTile(bankIndex: number): void {
    if (submitted || task.type !== "build") return;
    if (isBankTileUsed(builtBankIndexes, bankIndex)) return;
    if (builtBankIndexes.length >= task.answer.length) return;
    builtBankIndexes = [...builtBankIndexes, bankIndex];
  }

  function removeTile(builtIndex: number): void {
    if (!submitted)
      builtBankIndexes = builtBankIndexes.filter((_, index) => index !== builtIndex);
  }

  function insertChar(char: string): void {
    if (submitted || !inputEl) return;
    const start = inputEl.selectionStart ?? input.length;
    const end = inputEl.selectionEnd ?? start;
    input = input.slice(0, start) + char + input.slice(end);
    inputEl.focus();
    queueMicrotask(() => inputEl?.setSelectionRange(start + 1, start + 1));
  }

  function next(): void {
    if (activeIndex === items.length - 1) {
      finished = true;
      playFinishSfx();
      return;
    }
    activeIndex += 1;
    builtBankIndexes = [];
    input = "";
    selectedId = null;
    submitted = false;
    revealed = false;
    hintOpen = false;
  }

  const showCorrection = $derived(
    submitted && (revealed || grade === "incorrect" || grade === "accents"),
  );

  function feedbackToneClass(): string {
    if (revealed || grade === "incorrect" || grade === null)
      return "border-t border-rose-200 bg-rose-50";
    if (grade === "accents") return "border-t border-blue-200 bg-blue-50";
    return "border-t border-emerald-200 bg-emerald-50";
  }

  function feedbackContinueClass(): string {
    if (revealed || grade === "incorrect" || grade === null)
      return "!bg-rose-700 hover:!bg-rose-800 disabled:!bg-rose-200 disabled:!text-rose-500";
    if (grade === "accents")
      return "!bg-blue-700 hover:!bg-blue-800 disabled:!bg-blue-200 disabled:!text-blue-500";
    return "!bg-emerald-700 hover:!bg-emerald-800 disabled:!bg-emerald-200 disabled:!text-emerald-500";
  }
</script>

{#snippet exerciseFooter()}
  {#if submitted}
    <div class="grid gap-4" bind:this={feedbackPanel} aria-live="polite" tabindex="-1">
      <PracticeExerciseFeedback
        {closeSuggestion}
        correction={current.feedback.correction}
        english={current.feedback.english}
        why={current.feedback.why}
        newUse={current.newUse}
        {grade}
        {revealed}
        {showCorrection}
        dictionaryHref={task.type === "cloze" && task.lemmaId
          ? `/dictionary/${task.lemmaId}`
          : undefined}
      />

      <Button
        class="{feedbackContinueClass()} w-full !text-white"
        type="button"
        onclick={next}
      >
        {activeIndex === items.length - 1 ? "Finish" : "Continue"}
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
        class="{checkButtonClass} w-full sm:min-w-[9rem] sm:w-auto"
        type="button"
        disabled={!canCheck}
        onclick={check}
      >
        Check
      </Button>
    </div>
  {/if}
{/snippet}

{#if finished}
  <section
    class="max-w-[640px] border-l-4 border-emerald-600 bg-emerald-50 px-5 py-5"
    aria-labelledby="practice-finished-heading"
  >
    <p class="m-0 text-sm font-semibold text-emerald-800">Finished</p>

    <h2
      id="practice-finished-heading"
      class="mb-0 mt-3 font-serif text-3xl text-slate-900"
    >
      Keep the useful ones close.
    </h2>

    <p class="mt-2 mb-0 text-base text-slate-700">
      Come back to this set whenever you want another pass.
    </p>

    <div class="mt-6">
      <Button href="/practice">Back to Practice</Button>
    </div>
  </section>
{:else}
  <div class="mx-auto w-full max-w-[640px]" aria-labelledby="practice-question">
    <PracticeSessionChrome {activeIndex} {backHref} {backLabel} total={items.length} />

    <PracticeExerciseCard
      footer={exerciseFooter}
      footerClass={submitted
        ? feedbackToneClass()
        : "border-t border-slate-200 bg-paper/70"}
    >
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
        {@const hasClocks = task.choices.some((choice) => choice.clock)}
        <div
          class={hasClocks
            ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
            : "mt-6 grid gap-2"}
        >
          {#each task.choices as choice (choice.id)}
            <button
              class={hasClocks
                ? "press-key grid min-h-14 w-full cursor-pointer justify-items-center gap-2 rounded-(--control-radius) px-3 py-4 text-center font-serif text-sm font-semibold"
                : "press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3 text-left font-serif text-base font-semibold"}
              disabled={submitted}
              type="button"
              aria-pressed={selectedId === choice.id}
              onclick={() => (selectedId = choice.id)}
            >
              {#if choice.clock}
                <ClockIllustration
                  hour={choice.clock.hour}
                  minute={choice.clock.minute}
                  size={88}
                />
              {/if}

              <span lang="sk">{choice.label}</span>
            </button>
          {/each}
        </div>
      {:else if task.type === "build"}
        <div class="mt-6 grid gap-3">
          <div
            class="flex min-h-[calc(4rem+4px)] flex-wrap content-center gap-2 border border-slate-300 bg-slate-50 p-3"
            aria-live="polite"
          >
            {#if builtTiles.length}
              {#each builtTiles as tile, index (`${tile}-${index}`)}
                <button
                  class="border border-slate-300 bg-surface px-2.5 py-2 font-serif font-semibold leading-6 text-blue-800"
                  type="button"
                  disabled={submitted}
                  onclick={() => removeTile(index)}
                >
                  {tile}
                </button>
              {/each}
            {:else}
              <span
                class="border border-transparent px-2.5 py-2 font-serif text-sm font-semibold leading-6 text-slate-500"
              >
                Choose the words in order.
              </span>
            {/if}
          </div>

          <div class="flex flex-wrap gap-2">
            {#each task.tiles as tile, index (`${tile}-${index}`)}
              <button
                class="border border-slate-300 bg-surface px-3 py-2 font-serif font-semibold text-blue-800 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-40"
                type="button"
                disabled={submitted || isBankTileUsed(builtBankIndexes, index)}
                onclick={() => selectTile(index)}
              >
                {tile}
              </button>
            {/each}
          </div>
        </div>
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

              <button
                class="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-blue-800 hover:border-blue-600 hover:bg-blue-50"
                type="button"
                aria-expanded={hintOpen}
                onclick={() => (hintOpen = !hintOpen)}
              >
                {task.hint.chip}
              </button>
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

            {#if hintOpen && hintMode === "inline"}
              <ClozeHintPanel hint={task.hint} variant="inline" />
            {/if}
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
