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
    pickTrapFeedbackEnglish,
    PICK_TRAP_CORRECT_HEADLINE,
    PICK_TRAP_MISS_HEADLINE,
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
  import SfxMuteToggle from "$lib/components/chrome/SfxMuteToggle.svelte";

  let {
    canSubmit = $bindable(false),
    chrome = "card",
    exercise,
    ongraded,
    onresolve,
    sceneAudioSrcs = {},
    /** Parent bumps this to trigger Check / personal continue (player chrome). */
    submitNonce = 0,
  }: {
    canSubmit?: boolean;
    /** `plain` / `player` drop the outer border panel. `player` also defers footer actions. */
    chrome?: "card" | "plain" | "player";
    exercise: LessonExercise;
    /** Fired after Check with grade + why (player chrome). */
    ongraded?: (result: {
      correct: boolean;
      why: string;
      correction?: string;
      english?: string;
    }) => void;
    onresolve: () => void;
    sceneAudioSrcs?: Record<string, string>;
    submitNonce?: number;
  } = $props();

  let selectedId = $state<string | null>(null);
  let selectedIds = $state<Set<string>>(new Set());
  let hintOpen = $state(false);
  let builtBankIndexes = $state<number[]>([]);
  let input = $state("");
  let submitted = $state(false);
  let revealed = $state(false);
  let feedbackPanel = $state<HTMLElement | null>(null);

  const player = $derived(chrome === "player");
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
  const feedbackEnglish = $derived(
    isPickTrap
      ? pickTrapFeedbackEnglish(exercise.feedback.english)
      : exercise.feedback.english,
  );
  const canCheck = $derived.by(() => {
    if (!graded || submitted) return false;
    if (graded.type === "choice") return selectedId !== null;
    if (graded.type === "selectAll") return selectedIds.size > 0;
    if (graded.type === "build")
      return canCheckBuild(builtTiles.length, graded.answer.length);
    return input.trim().length > 0;
  });

  $effect(() => {
    if (!player) return;
    canSubmit = exercise.type === "personal" ? !submitted : canCheck;
  });

  let lastSubmitNonce = submitNonce;

  $effect(() => {
    if (!player || submitNonce === lastSubmitNonce) return;
    lastSubmitNonce = submitNonce;
    if (exercise.type === "personal") {
      onresolve();
      return;
    }
    void check();
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

    if (player && ongraded) {
      const isCorrect = kind === "correct";
      let why = exercise.feedback.why;
      if (!isCorrect) {
        if (graded.type === "selectAll") {
          why = selectAllFeedbackWhy(why, selectedIds, graded.choices);
        } else if (graded.type === "choice" && selectedId) {
          why =
            graded.choiceMode === "pickTrap"
              ? pickTrapFeedbackWhy(why, selectedId, graded.choices)
              : choiceFeedbackWhy(why, selectedId, graded.choices, graded.answerId);
        }
      }

      ongraded({
        correct: isCorrect,
        why,
        correction: exercise.feedback.correction,
        english: feedbackEnglish,
      });
      return;
    }

    await focusFeedback();
  }

  async function reveal(): Promise<void> {
    if (!graded || submitted) return;
    revealed = true;
    submitted = true;
    playAnswerSfx("incorrect");

    if (player && ongraded) {
      ongraded({
        correct: false,
        why: exercise.feedback.why,
        correction: exercise.feedback.correction,
        english: feedbackEnglish,
      });
      return;
    }

    await focusFeedback();
  }

  function continueLesson(): void {
    onresolve();
  }

  function onContinueKeydown(event: KeyboardEvent): void {
    if ((event.key !== "Enter" && event.key !== " ") || event.shiftKey || !submitted)
      return;
    if (player) return;
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
  class={chrome === "card"
    ? "border border-slate-200 bg-surface/90 px-7 py-8 max-[560px]:px-4 max-[560px]:py-6"
    : "bg-transparent"}
  aria-labelledby="interaction-heading"
>
  {#if exercise.type === "personal"}
    <h2
      id="interaction-heading"
      class="text-center font-serif text-xl font-semibold leading-snug text-pretty text-slate-900 sm:text-2xl"
    >
      {exercise.prompt}
    </h2>

    {#if exercise.example}
      <p
        class="mx-auto mt-5 max-w-xl rounded-(--frame-radius) bg-subtle px-4 py-3.5 text-center font-serif text-lg text-slate-900 shadow-(--shadow-border)"
        lang="sk"
      >
        {exercise.example}
      </p>
    {/if}

    {#if !player}
      <div class="mt-7 flex justify-center">
        <Button type="button" onclick={() => onresolve()}>I said it</Button>
      </div>
    {/if}
  {:else}
    {#if chrome === "card"}
      <div class="flex items-start justify-end">
        <SfxMuteToggle />
      </div>
    {/if}

    {#if hasContext}
      <div class={chrome === "card" ? "mt-4 grid gap-4" : "grid gap-4"}>
        {#each exercise.context ?? [] as line (line.id)}
          <PracticeDialogueBubble {line} audioSrcs={sceneAudioSrcs} />
        {/each}
      </div>
    {/if}

    <h2
      id="interaction-heading"
      class={[
        hasContext ? "mt-5" : chrome === "card" ? "mt-4" : "",
        player
          ? "m-0 text-center font-serif text-[clamp(1.3rem,2.9vw,1.75rem)] leading-snug tracking-tight text-pretty text-slate-900"
          : "m-0 font-serif text-xl font-semibold leading-snug text-pretty text-slate-900",
      ].join(" ")}
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
        variant={player ? "cards" : "default"}
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
      <label class="mx-auto mt-6 grid max-w-md gap-2 text-sm font-medium text-slate-600">
        <span>{exercise.inputLabel}</span>
        <input
          class="min-h-[50px] w-full rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          bind:value={input}
          disabled={submitted}
          autocomplete="off"
          autocapitalize="none"
          lang="sk"
        />
      </label>
    {/if}

    {#if !player && submitted}
      <div
        bind:this={feedbackPanel}
        class={`mt-6 max-w-2xl ${
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
          english={feedbackEnglish}
          why={feedbackWhy}
          grade={correct ? "correct" : "incorrect"}
          revealed={revealed || !correct}
          {showCorrection}
          density={correct ? "default" : "compact"}
          correctionLabelTone="emerald"
          correctHeadline={isPickTrap ? PICK_TRAP_CORRECT_HEADLINE : "Correct"}
          missHeadline={isPickTrap ? PICK_TRAP_MISS_HEADLINE : "Correct answer"}
        />
      </div>

      <Button class="mt-6" type="button" onclick={continueLesson}>Continue</Button>
    {:else if !player}
      <div
        class="mt-6 flex max-w-2xl flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
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
    {:else if exercise.type === "typed" && !submitted}
      <div class="mt-4 flex justify-center">
        <button
          class="border-0 bg-transparent py-1 text-sm font-semibold text-blue-800 underline underline-offset-2"
          type="button"
          onclick={reveal}
        >
          Reveal answer
        </button>
      </div>
    {/if}
  {/if}
</section>
