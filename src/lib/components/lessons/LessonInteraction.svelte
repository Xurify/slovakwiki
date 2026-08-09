<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";

  import { tick } from "svelte";
  import { canCheckBuild, gradeBuild, resolveBuiltTiles } from "$lib/client/build-tiles";
  import { answersMatch } from "$lib/client/practice-state";
  import { playAnswerSfx } from "$lib/client/sfx";
  import {
    BuildSentenceOptions,
    ChoiceOptions,
    SelectAllOptions,
    choiceFeedbackWhy,
    gradeChoice,
    gradeSelectAll,
    pickTrapFeedbackWhy,
    selectAllFeedbackWhy,
  } from "$lib/learning/exercises";
  import GrammarHintAccordion from "$lib/components/practice/GrammarHintAccordion.svelte";
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
    if (graded.type === "choice") return gradeChoice(selectedId, graded);
    if (graded.type === "selectAll") return gradeSelectAll(selectedIds, graded.choices);
    if (graded.type === "build") return gradeBuild(builtTiles, graded.answer);
    return answersMatch(input, graded.answer, graded.acceptedAnswers);
  });
  const feedbackGrade = $derived.by(() => {
    if (!submitted || revealed) return null;
    return correct ? "correct" : "incorrect";
  });
  const showCorrection = $derived.by(() => {
    if (!shouldShowCorrection(submitted, feedbackGrade, revealed)) return false;
    if (graded?.type === "selectAll" && submitted && !correct && !revealed) return false;
    return true;
  });
  const feedbackWhy = $derived.by(() => {
    const baseWhy = exercise.feedback.why;
    if (!submitted || correct || revealed) return baseWhy;
    if (graded?.type === "selectAll") {
      return selectAllFeedbackWhy(baseWhy, selectedIds, graded.choices);
    }
    if (graded?.type === "choice" && selectedId) {
      if (graded.choiceMode === "pickTrap") {
        return pickTrapFeedbackWhy(baseWhy, selectedId, graded.choices);
      }
      return choiceFeedbackWhy(baseWhy, selectedId, graded.choices, graded.answerId);
    }
    return baseWhy;
  });
  const feedbackCorrection = $derived.by(() => {
    if (
      graded?.type === "choice" &&
      graded.choiceMode === "pickTrap" &&
      submitted &&
      correct &&
      selectedId
    ) {
      return (
        graded.choices.find((choice) => choice.id === selectedId)?.label ??
        exercise.feedback.correction
      );
    }
    return exercise.feedback.correction;
  });
  const isPickTrap = $derived(
    graded?.type === "choice" && graded.choiceMode === "pickTrap",
  );
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
      kind = gradeChoice(selectedId, graded) ? "correct" : "incorrect";
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

  function onContinueKeydown(event: KeyboardEvent): void {
    if ((event.key !== "Enter" && event.key !== " ") || event.shiftKey || !submitted)
      return;
    event.preventDefault();
    continueLesson();
  }

  function attemptForDisplay(): string | undefined {
    if (!graded || correct || revealed) return undefined;
    if (graded.type === "selectAll") return undefined;
    if (graded.type === "choice") {
      const choice = graded.choices.find((entry) => entry.id === selectedId);
      return choice?.label;
    }
    if (graded.type === "build") return builtTiles.join(" ");
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
</script>

<svelte:window onkeydown={onContinueKeydown} />

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
      <ChoiceOptions
        choices={exercise.choices}
        choiceStyle={exercise.choiceStyle}
        promptClock={exercise.clock}
        bind:selectedId
        {submitted}
      />

      {#if exercise.hint}
        <GrammarHintAccordion
          class="mt-6 border-t border-slate-200 pt-4"
          hint={exercise.hint}
          bind:open={hintOpen}
        />
      {/if}
    {:else if exercise.type === "selectAll"}
      <SelectAllOptions
        choices={exercise.choices}
        promptClock={exercise.clock}
        bind:selectedIds
        {submitted}
      />

      {#if exercise.hint}
        <GrammarHintAccordion
          class="mt-6 border-t border-slate-200 pt-4"
          hint={exercise.hint}
          bind:open={hintOpen}
        />
      {/if}
    {:else if exercise.type === "build"}
      <BuildSentenceOptions
        tiles={exercise.tiles}
        answerLength={exercise.answer.length}
        bind:builtBankIndexes
        {submitted}
      />
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
        class={`mt-6 ${
          correct
            ? feedbackPanelClass(feedbackToneFromGrade(feedbackGrade, revealed))
            : ""
        }`}
        aria-live="polite"
        tabindex="-1"
      >
        <PracticeExerciseFeedback
          attempt={attemptForDisplay()}
          correction={feedbackCorrection}
          english={exercise.feedback.english}
          why={feedbackWhy}
          grade={correct ? "correct" : "incorrect"}
          revealed={revealed || !correct}
          {showCorrection}
          density={correct ? "default" : "compact"}
          correctionLabelTone="emerald"
          correctHeadline={isPickTrap ? "That one doesn't fit." : "Correct"}
          missHeadline={isPickTrap ? "The odd one out" : "Correct answer"}
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
