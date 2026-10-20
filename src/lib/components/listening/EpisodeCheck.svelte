<script lang="ts">
  import { tick } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    feedbackPanelClass,
    feedbackToneFromGrade,
  } from "$lib/components/practice/practice-feedback-ui";
  import { sessionPromptClass } from "$lib/components/practice/practice-session-ui";
  import { playAnswerSfx } from "$lib/audio/sfx";
  import type { ListeningCheck } from "$lib/catalog/listening/types";
  import {
    ChoiceOptions,
    choiceFeedbackWhy,
    choiceIndexFromKeyboardEvent,
    otherChoiceNotes,
  } from "$lib/learning/exercises";
  import type { DialogueTurn } from "$lib/learning/types";

  import EpisodeReplayButton from "./EpisodeReplayButton.svelte";

  let {
    check,
    index,
    last = false,
    onbeforereplay,
    onresolve,
    replayLine,
    replaySrc,
    total,
  }: {
    check: ListeningCheck;
    /** 1-based position inside the chapter. */
    index: number;
    last?: boolean;
    onbeforereplay?: () => void;
    onresolve: (correct: boolean) => void;
    replayLine?: DialogueTurn;
    replaySrc?: string;
    total: number;
  } = $props();

  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let feedbackPanel: HTMLElement | null = $state(null);

  const correct = $derived(submitted && selectedId === check.answerId);
  const why = $derived(
    submitted
      ? choiceFeedbackWhy(check.feedback.why, selectedId, check.choices, check.answerId)
      : check.feedback.why,
  );
  const otherChoices = $derived(
    submitted
      ? otherChoiceNotes(check.choices, new Set(selectedId ? [selectedId] : []), why)
      : [],
  );
  const attempt = $derived(
    submitted && !correct
      ? check.choices.find((choice) => choice.id === selectedId)?.label
      : undefined,
  );
  const correction = $derived(
    check.choices.find((choice) => choice.id === check.answerId)?.label,
  );

  async function submit(): Promise<void> {
    if (!selectedId || submitted) return;
    submitted = true;
    playAnswerSfx(selectedId === check.answerId ? "correct" : "incorrect");
    await tick();
    feedbackPanel?.focus();
  }

  function resolve(): void {
    onresolve(correct);
  }

  function isNativeTarget(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      target.closest("a, button, input, select, textarea, [contenteditable]") !== null
    );
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === "Enter") {
      if (event.repeat || event.isComposing || isNativeTarget(event.target)) return;
      event.preventDefault();
      if (submitted) resolve();
      else void submit();
      return;
    }

    if (submitted) return;
    const choiceIndex = choiceIndexFromKeyboardEvent(event);
    const choice = choiceIndex === null ? undefined : check.choices[choiceIndex];
    if (!choice) return;
    event.preventDefault();
    selectedId = choice.id;
  }
</script>

<svelte:window onkeydown={onWindowKeydown} />

<section class="animate-rise" aria-labelledby="{check.id}-prompt">
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p class={eyebrowMutedClass}>Question {index} of {total}</p>

    {#if replayLine}
      <div class="flex items-center gap-2.5">
        <span class="text-xs font-semibold text-slate-500">
          Listen again: {replayLine.speaker}
        </span>

        <EpisodeReplayButton
          src={replaySrc}
          label="Listen again: {replayLine.speaker}"
          onbeforeplay={onbeforereplay}
        />
      </div>
    {/if}
  </div>

  {#if check.promptSk}
    <p class="m-0 mt-4 font-serif text-lg text-slate-500" lang="sk">{check.promptSk}</p>
  {/if}

  <h3
    id="{check.id}-prompt"
    class="{sessionPromptClass} {check.promptSk ? 'mt-1' : 'mt-4'}"
  >
    {check.prompt}
  </h3>

  <ChoiceOptions
    choices={check.choices}
    bind:selectedId
    {submitted}
    correctIds={submitted ? [check.answerId] : null}
    variant="cards"
  />

  {#if submitted}
    <div
      bind:this={feedbackPanel}
      class="mt-5 {feedbackPanelClass(
        feedbackToneFromGrade(correct ? 'correct' : 'incorrect'),
      )}"
      aria-live="polite"
      tabindex="-1"
    >
      <PracticeExerciseFeedback
        status
        {attempt}
        {correction}
        english={check.feedback.english}
        {why}
        grade={correct ? "correct" : "incorrect"}
        showCorrection={!correct}
        density={correct ? "default" : "compact"}
        correctionLabelTone="emerald"
        correctHeadline="You heard it"
        missHeadline="What was said"
        {otherChoices}
      />
    </div>

    <Button class="mt-5" type="button" onclick={resolve}>
      {last ? "Finish chapter" : "Continue"}
    </Button>
  {:else}
    <div class="mt-5">
      <Button type="button" variant="accent" disabled={!selectedId} onclick={submit}>
        Check
      </Button>
    </div>
  {/if}
</section>
