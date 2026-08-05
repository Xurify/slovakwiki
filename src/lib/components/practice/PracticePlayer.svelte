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
  import SfxMuteToggle from "$lib/components/SfxMuteToggle.svelte";
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
  }: {
    items: PracticeItem[];
    hintMode?: "inline" | "rail";
    audioSrcs?: Record<string, string>;
    sectionTitle?: string;
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

  const correct = $derived(grade === "correct");

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

  function feedbackLabel(): string {
    if (revealed) return "Try this.";
    if (grade === "correct") return "That works.";
    if (grade === "accents") return "Almost — check the accents.";
    return "Try this.";
  }

  function feedbackToneClass(): string {
    if (revealed || grade === "incorrect" || grade === null)
      return "border-rose-600 bg-rose-50";
    if (grade === "accents") return "border-blue-600 bg-blue-50";
    return "border-emerald-600 bg-emerald-50";
  }
</script>

{#if finished}
  <section
    class="max-w-[590px] border-l-4 border-emerald-600 bg-emerald-50 px-5 py-5"
    aria-labelledby="practice-finished-heading"
  >
    <p class="m-0 text-xs font-semibold uppercase tracking-widest text-emerald-700">
      Finished
    </p>

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
  <section class="max-w-[720px]" aria-labelledby="practice-question">
    <div
      class="flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"
      aria-label={`Question ${activeIndex + 1} of ${items.length}, ${activeIndex} completed`}
    >
      <SfxMuteToggle />
      <span>{activeIndex + 1} of {items.length}</span>
    </div>

    <div class="mt-3 h-1 bg-slate-200" aria-hidden="true">
      <span
        class="block h-full bg-blue-600 transition-[width]"
        style:width={`${(activeIndex / items.length) * 100}%`}
      ></span>
    </div>

    {#if dialogueContext.length}
      <div class="mt-8 grid border-t border-slate-200">
        {#each dialogueContext as line (line.id)}
          <div
            class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-baseline gap-2.5 border-b border-slate-200 py-3 max-[540px]:grid-cols-[1fr_auto]"
          >
            <span class="text-xs font-bold uppercase text-blue-700">{line.speaker}</span>
            <strong class="font-serif text-base" lang="sk">{line.slovak}</strong>
            <AudioButton
              src={line.audio?.src}
              text={line.audio?.transcript ?? line.slovak}
            />
            <small class="col-start-2 text-xs text-slate-500 max-[540px]:col-span-2">
              {line.english}
            </small>
          </div>
        {/each}
      </div>
    {/if}

    {#if isRepair}
      <h1 id="practice-question" class="sr-only">{task.prompt}</h1>
    {:else}
      <h1
        id="practice-question"
        class="mt-8 text-base font-semibold leading-snug text-pretty text-slate-800"
      >
        {task.prompt}
      </h1>
    {/if}

    {#if repairLine}
      <div class="mt-8 border-l-4 border-slate-300 bg-slate-50 px-4 py-3" lang="sk">
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
          ? "mt-7 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
          : "mt-7 grid gap-2"}
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
      <div class="mt-7 grid gap-3">
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
          ? "mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]"
          : "mt-7 grid gap-4"}
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
      <label class="mt-7 grid gap-2 text-xs font-bold text-slate-600">
        <span>{task.inputLabel}</span>
        <input
          class="min-h-[52px] w-full border border-slate-300 bg-surface px-3 py-2 font-serif text-lg outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          bind:value={input}
          disabled={submitted}
          autocomplete="off"
          autocapitalize="none"
          lang="sk"
        />
      </label>
    {/if}

    {#if submitted}
      <div
        class={`mt-7 grid gap-1 border-l-4 p-[18px] ${feedbackToneClass()}`}
        bind:this={feedbackPanel}
        aria-live="polite"
        tabindex="-1"
      >
        {#if closeSuggestion}
          <p class="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
            Did you mean?
          </p>
          <strong class="mb-2 font-serif text-lg" lang="sk">{closeSuggestion}</strong>
        {/if}
        <p class="m-0 text-xs font-bold uppercase tracking-wide text-slate-600">
          {feedbackLabel()}
        </p>
        <strong class="font-serif text-lg" lang="sk">{current.feedback.correction}</strong
        >
        {#if current.feedback.english}
          <small class="text-slate-500">{current.feedback.english}</small>
        {/if}
        <span class="max-w-[65ch] font-serif leading-6 text-slate-700">
          {current.feedback.why}
        </span>
        {#if current.newUse}
          <em class="mt-1 font-serif not-italic text-blue-800">{current.newUse}</em>
        {/if}
        {#if task.type === "cloze" && task.lemmaId}
          <TextLink class="mt-1 text-xs" href={`/dictionary/${task.lemmaId}`}>
            Open in dictionary
          </TextLink>
        {/if}
      </div>

      <Button class="mt-5" type="button" onclick={next}>
        {activeIndex === items.length - 1 ? "Finish" : "Continue"}
      </Button>
    {:else}
      <div
        class="mt-6 flex items-center gap-4 max-[540px]:flex-col max-[540px]:items-stretch"
      >
        <Button
          class="mt-0 max-[540px]:w-full"
          type="button"
          disabled={!canCheck}
          onclick={check}
        >
          Check
        </Button>

        {#if task.type === "typed" || task.type === "cloze"}
          <button
            class="border-0 bg-transparent text-xs font-bold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={reveal}
          >
            Reveal answer
          </button>
        {/if}
      </div>
    {/if}
  </section>
{/if}
