<script lang="ts">
  import { onMount, tick } from "svelte";

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
  import { followFocus } from "$lib/listening/focus";

  import EpisodeReplayButton from "./EpisodeReplayButton.svelte";

  let {
    check,
    index,
    onbeforereplay,
    onresolve,
    replayLine,
    replaySrc,
    total,
  }: {
    check: ListeningCheck;
    /** 1-based position inside the chapter. */
    index: number;
    onbeforereplay?: () => void;
    onresolve: (correct: boolean) => void;
    replayLine?: DialogueTurn;
    replaySrc?: string;
    total: number;
  } = $props();

  let root: HTMLElement | undefined = $state();
  let selectedId = $state<string | null>(null);
  let submitted = $state(false);
  let feedbackPanel: HTMLElement | null = $state(null);

  const correct = $derived(submitted && selectedId === check.answerId);
  const last = $derived(index === total);
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

  /** Keys act while focus is in this dialogue (Listen again included) or nowhere. */
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

  onMount(() => followFocus(root));
</script>

<svelte:window onkeydown={onWindowKeydown} />

<section
  bind:this={root}
  class="animate-rise focus-visible:outline-none"
  aria-labelledby="{check.id}-prompt"
  tabindex="-1"
>
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <p class={eyebrowMutedClass}>Question {index} of {total}</p>

    {#if replayLine}
      <EpisodeReplayButton
        src={replaySrc}
        label="Hear {replayLine.speaker} again"
        onbeforeplay={onbeforereplay}
      />
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
        english={correct ? undefined : check.feedback.english}
        {why}
        grade={correct ? "correct" : "incorrect"}
        showCorrection={false}
        correctHeadline="You heard it"
        {otherChoices}
      />
    </div>

    <Button class="mt-5" type="button" onclick={resolve}>
      {last ? "Read the text" : "Next question"}
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
