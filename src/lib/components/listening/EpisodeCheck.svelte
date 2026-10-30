<script lang="ts">
  import { onMount, tick } from "svelte";

  import Button from "$lib/components/ui/Button.svelte";
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
  import type { SceneLine } from "$lib/stick-figure/scene-line";
  import { focusUnlessTyping } from "$lib/listening/focus";

  import EpisodeReplayButton from "./EpisodeReplayButton.svelte";
  import { episodeSpeakerName } from "./episode-speaker";

  let {
    check,
    doneLabel = "Read the text",
    questionNumber,
    onbeforereplay,
    onresolve,
    playReplay,
    replayLine,
    replaySrc,
    stopReplay,
    total,
  }: {
    check: ListeningCheck;
    /** The button after the last question. */
    doneLabel?: string;
    questionNumber: number;
    onbeforereplay?: () => void;
    onresolve: (correct: boolean) => void;
    /** Replays the line some other way than its clip alone, such as acted on a stage. */
    playReplay?: (onEnded: () => void) => void;
    /** Only who says it is shown; a stage line and a lesson turn both have that. */
    replayLine?: Pick<DialogueTurn, "speaker">;
    replaySrc?: string;
    stopReplay?: () => void;
    total: number;
  } = $props();

  let root: HTMLElement | undefined = $state();
  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let feedbackPanel: HTMLElement | null = $state(null);

  const correct = $derived(submitted && selectedId === check.answerId);
  const last = $derived(questionNumber === total);
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

  function ownsKeyboard(): boolean {
    const active = document.activeElement;
    const scope = root?.closest("[data-listen-stage]") ?? root;
    return active === document.body || Boolean(scope?.contains(active));
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!ownsKeyboard()) return;

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

  onMount(() => focusUnlessTyping(root));
</script>

<svelte:window onkeydown={onWindowKeydown} />

<section
  bind:this={root}
  class="animate-rise focus-visible:outline-none"
  aria-labelledby="{check.id}-prompt"
  tabindex="-1"
>
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p class="m-0 text-sm text-slate-500">Question {questionNumber} of {total}</p>

    {#if replayLine}
      <EpisodeReplayButton
        src={replaySrc}
        label="Hear {episodeSpeakerName(replayLine.speaker)} again"
        onbeforeplay={onbeforereplay}
        play={playReplay}
        stop={stopReplay}
      />
    {/if}
  </div>

  {#if check.gap}
    <p class="m-0 mt-4 font-serif text-lg text-slate-500" lang="sk">{check.gap}</p>
  {/if}

  <h3
    id="{check.id}-prompt"
    class="{sessionPromptClass} {check.gap ? 'mt-1' : 'mt-4'}"
    lang="sk"
  >
    {check.prompt}
  </h3>
  <p class="m-0 mt-1 text-base text-slate-600">{check.promptEnglish}</p>

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
        english={correct ? undefined : check.feedback.english}
        {why}
        grade={correct ? "correct" : "incorrect"}
        showCorrection={false}
        correctHeadline="You heard it"
        {otherChoices}
      />
    </div>

    <Button class="mt-5" type="button" onclick={resolve}>
      {last ? doneLabel : "Next question"}
    </Button>
  {:else}
    <Button
      class="mt-5"
      type="button"
      variant="accent"
      disabled={!selectedId}
      onclick={submit}
    >
      Check
    </Button>
  {/if}
</section>
