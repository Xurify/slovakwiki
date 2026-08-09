<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";

  import { tick } from "svelte";
  import {
    canCheckBuild,
    gradeBuild,
    isBankTileUsed,
    resolveBuiltTiles,
  } from "$lib/client/build-tiles";
  import { answersMatch } from "$lib/client/practice-state";
  import { playAnswerSfx } from "$lib/client/sfx";
  import {
    ChoiceOptions,
    SelectAllOptions,
    choiceFeedbackWhy,
    gradeSelectAll,
    selectAllFeedbackWhy,
  } from "$lib/learning/exercises";
  import ClozeHintPanel from "$lib/components/practice/ClozeHintPanel.svelte";
  import GrammarHintToggle from "$lib/components/practice/GrammarHintToggle.svelte";
  import type { LessonExercise } from "$lib/learning/types";
  import PracticeDialogueBubble from "$lib/components/practice/PracticeDialogueBubble.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    feedbackPanelClass,
    feedbackToneFromGrade,
    shouldShowCorrection,
  } from "$lib/components/practice/practice-feedback-ui";
  import SfxMuteToggle from "$lib/components/SfxMuteToggle.svelte";

  let {
    exercise,
    onresolve,
    sceneAudioSrcs = {},
  }: {
    exercise: LessonExercise;
    onresolve: () => void;
    sceneAudioSrcs?: Record<string, string>;
  } = $props();

  let selectedId = $state<string | null>(null);
  let selectedIds = $state<Set<string>>(new Set());
  let hintOpen = $state(false);
  let builtBankIndexes = $state<number[]>([]);
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);

  const graded = $derived(exercise.type !== "personal" ? exercise : null);
  const hasContext = $derived(Boolean(exercise.context?.length));
  const builtTiles = $derived(
    graded?.type === "build" ? resolveBuiltTiles(graded.tiles, builtBankIndexes) : [],
  );
  const correct = $derived.by(() => {
    if (!graded || !submitted || revealed) return false;
    if (graded.type === "choice") return selectedId === graded.answerId;
    if (graded.type === "selectAll") return gradeSelectAll(selectedIds, graded.choices);
    if (graded.type === "build") return gradeBuild(builtTiles, graded.answer);
    return answersMatch(input, graded.answer, graded.acceptedAnswers);
  });
  const feedbackGrade = $derived.by(() => {
    if (!submitted || revealed) return null;
    return correct ? "correct" : "incorrect";
  });
  const showCorrection = $derived(
    shouldShowCorrection(submitted, feedbackGrade, revealed),
  );
  const feedbackWhy = $derived.by(() => {
    const baseWhy = exercise.feedback.why;
    if (!submitted || correct || revealed) return baseWhy;
    if (graded?.type === "selectAll") {
      return selectAllFeedbackWhy(baseWhy, selectedIds, graded.choices);
    }
    if (graded?.type === "choice" && selectedId) {
      return choiceFeedbackWhy(baseWhy, selectedId, graded.choices, graded.answerId);
    }
    return baseWhy;
  });
  const canCheck = $derived.by(() => {
    if (!graded || submitted) return false;
    if (graded.type === "choice") return selectedId !== null;
    if (graded.type === "selectAll") return selectedIds.size > 0;
    if (graded.type === "build")
      return canCheckBuild(builtTiles.length, graded.answer.length);
    return input.trim().length > 0;
  });

  async function focusFeedback(): Promise<void> {
    await tick();
    feedbackPanel?.focus();
  }

  async function check(): Promise<void> {
    if (!canCheck || !graded) return;

    let kind: "correct" | "incorrect" = "incorrect";

    if (graded.type === "choice") {
      kind = selectedId === graded.answerId ? "correct" : "incorrect";
    } else if (graded.type === "selectAll") {
      kind = gradeSelectAll(selectedIds, graded.choices) ? "correct" : "incorrect";
    } else if (graded.type === "build") {
      kind = gradeBuild(builtTiles, graded.answer) ? "correct" : "incorrect";
    } else {
      kind = answersMatch(input, graded.answer, graded.acceptedAnswers)
        ? "correct"
        : "incorrect";
    }

    submitted = true;
    playAnswerSfx(kind);
    await focusFeedback();
  }

  async function reveal(): Promise<void> {
    if (!graded || submitted) return;
    revealed = true;
    submitted = true;
    playAnswerSfx("incorrect");
    await focusFeedback();
  }

  function continueLesson(): void {
    onresolve();
  }

  function addTile(bankIndex: number): void {
    if (submitted || graded?.type !== "build") return;
    if (isBankTileUsed(builtBankIndexes, bankIndex)) return;
    if (builtBankIndexes.length >= graded.answer.length) return;
    builtBankIndexes = [...builtBankIndexes, bankIndex];
  }

  function removeTile(builtIndex: number): void {
    if (!submitted)
      builtBankIndexes = builtBankIndexes.filter((_, index) => index !== builtIndex);
  }

  function attemptForDisplay(): string | undefined {
    if (!graded || correct || revealed) return undefined;
    if (graded.type === "choice") {
      const choice = graded.choices.find((entry) => entry.id === selectedId);
      return choice?.label;
    }
    if (graded.type === "selectAll") {
      return graded.choices
        .filter((entry) => selectedIds.has(entry.id))
        .map((entry) => entry.label)
        .join("; ");
    }
    if (graded.type === "build") return builtTiles.join(" ");
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
</script>

<section
  class="border border-slate-200 bg-surface/90 px-7 py-8 max-[560px]:px-4 max-[560px]:py-6"
  aria-labelledby="interaction-heading"
>
  {#if exercise.type === "personal"}
    <h2
      id="interaction-heading"
      class="font-serif text-xl font-semibold leading-snug text-pretty text-slate-900"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.example}
      <p
        class="mt-5 rounded-(--control-radius) border border-slate-200 bg-slate-50/80 px-4 py-3.5 font-serif text-lg text-slate-900"
        lang="sk"
      >
        {exercise.example}
      </p>
    {/if}

    <Button class="mt-7" type="button" onclick={() => onresolve()}>I said it</Button>
  {:else}
    <div class="flex items-start justify-end">
      <SfxMuteToggle />
    </div>

    {#if hasContext}
      <div class="mt-4 grid gap-4">
        {#each exercise.context ?? [] as line (line.id)}
          <PracticeDialogueBubble {line} audioSrcs={sceneAudioSrcs} />
        {/each}
      </div>
    {/if}

    <h2
      id="interaction-heading"
      class="{hasContext
        ? 'mt-5'
        : 'mt-4'} m-0 font-serif text-xl font-semibold leading-snug text-pretty text-slate-900"
      lang={exercise.type !== "personal" && exercise.promptLang === "sk"
        ? "sk"
        : undefined}
    >
      {exercise.prompt}
    </h2>

    {#if exercise.type === "choice"}
      {#if exercise.hint}
        <div class="mt-4 grid gap-2">
          <GrammarHintToggle hint={exercise.hint} bind:open={hintOpen} />

          {#if hintOpen}
            <ClozeHintPanel hint={exercise.hint} variant="inline" />
          {/if}
        </div>
      {/if}

      <ChoiceOptions
        choices={exercise.choices}
        choiceStyle={exercise.choiceStyle}
        promptClock={exercise.clock}
        bind:selectedId
        {submitted}
      />
    {:else if exercise.type === "selectAll"}
      {#if exercise.hint}
        <div class="mt-4 grid gap-2">
          <GrammarHintToggle hint={exercise.hint} bind:open={hintOpen} />

          {#if hintOpen}
            <ClozeHintPanel hint={exercise.hint} variant="inline" />
          {/if}
        </div>
      {/if}

      <SelectAllOptions
        choices={exercise.choices}
        promptClock={exercise.clock}
        bind:selectedIds
        {submitted}
      />
    {:else if exercise.type === "build"}
      <div class="mt-6 grid gap-3" aria-label="Build the sentence">
        <div
          class="flex min-h-[calc(4.25rem+4px)] flex-wrap content-center gap-2 border border-slate-300 bg-slate-50 p-3.5"
          aria-live="polite"
        >
          {#if builtTiles.length}
            {#each builtTiles as tile, index (`${tile}-${index}`)}
              <button
                class="cursor-pointer border border-slate-300 bg-surface px-2.5 py-2 font-serif font-semibold leading-6 text-blue-800 disabled:cursor-default"
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
          {#each exercise.tiles as tile, index (`${tile}-${index}`)}
            <button
              class="cursor-pointer border border-slate-300 bg-surface px-3 py-2 font-serif font-semibold text-blue-800 hover:border-blue-600 hover:bg-blue-50 disabled:cursor-default disabled:opacity-40"
              type="button"
              disabled={submitted || isBankTileUsed(builtBankIndexes, index)}
              onclick={() => addTile(index)}
            >
              {tile}
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <label class="mt-6 grid gap-2 text-sm font-medium text-slate-600">
        <span>{exercise.inputLabel}</span>
        <input
          class="min-h-[50px] w-full rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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
        bind:this={feedbackPanel}
        class={`mt-6 ${feedbackPanelClass(feedbackToneFromGrade(feedbackGrade, revealed))}`}
        aria-live="polite"
        tabindex="-1"
      >
        <PracticeExerciseFeedback
          attempt={attemptForDisplay()}
          correction={exercise.feedback.correction}
          english={exercise.feedback.english}
          why={feedbackWhy}
          grade={correct ? "correct" : "incorrect"}
          revealed={revealed || !correct}
          {showCorrection}
          density={correct ? "default" : "compact"}
          correctionLabelTone="emerald"
        />
      </div>

      <Button class="mt-6" type="button" onclick={continueLesson}>Continue</Button>
    {:else}
      <div
        class="mt-6 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {#if exercise.type === "typed"}
          <button
            class="border-0 bg-transparent py-1 text-sm font-semibold text-blue-800 underline underline-offset-2"
            type="button"
            onclick={reveal}
          >
            Reveal answer
          </button>
        {:else}
          <span aria-hidden="true"></span>
        {/if}

        <Button
          class="w-full sm:min-w-36 sm:w-auto"
          type="button"
          variant="accent"
          disabled={!canCheck}
          onclick={check}
        >
          Check
        </Button>
      </div>
    {/if}
  {/if}
</section>
