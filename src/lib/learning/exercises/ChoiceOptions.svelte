<script lang="ts">
  import ClockIllustration from "$lib/learning/time/ClockIllustration.svelte";
  import PromptClock from "$lib/learning/time/PromptClock.svelte";
  import type { ChoiceExercise } from "$lib/learning/types";
  import { formatClockFaceLabel } from "$lib/learning/time/clock";
  import {
    choiceClockIdleClass,
    choiceRowIdleClass,
    optionGradedClass,
    optionKeyClass,
    type OptionGradeState,
  } from "./option-ui";

  let {
    choices,
    choiceStyle = "text",
    columns = 1,
    promptClock,
    selectedId = $bindable(null),
    submitted,
    wrongChoiceId = null,
    correctIds = null,
    variant = "default",
  }: {
    choices: ChoiceExercise["choices"];
    choiceStyle?: ChoiceExercise["choiceStyle"];
    /** Two columns of text choices, for a long list of short ones. */
    columns?: 1 | 2;
    promptClock?: ChoiceExercise["clock"];
    selectedId?: string | null;
    submitted: boolean;
    wrongChoiceId?: string | null;
    /** After submit, mark these as right and a wrong pick as wrong. */
    correctIds?: readonly string[] | null;
    /** `cards` adds the number keycap that selects each option. */
    variant?: "default" | "cards";
  } = $props();

  const showClockChoices = $derived(choiceStyle === "clock");
  const numbered = $derived(variant === "cards" && !showClockChoices);
  const graded = $derived(submitted && correctIds !== null);

  function gradedState(choiceId: string, selected: boolean): OptionGradeState | null {
    if (!graded || !correctIds) return null;
    if (correctIds.includes(choiceId)) return "right";
    return selected ? "wrong" : "rest";
  }

  function optionClass(state: OptionGradeState | null, wrongPick: boolean): string {
    const shape = showClockChoices ? "clock" : "row";
    if (state) return optionGradedClass(state, shape);
    if (wrongPick) return optionGradedClass("wrong", shape);
    return showClockChoices ? choiceClockIdleClass : choiceRowIdleClass;
  }

  function gradedLabel(state: OptionGradeState | null): string {
    if (state === "right") return ", correct answer";
    if (state === "wrong") return ", your pick, incorrect";
    return "";
  }
</script>

{#if promptClock}
  <PromptClock hour={promptClock.hour} minute={promptClock.minute} {submitted} />
{/if}

<div
  class={showClockChoices
    ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
    : columns === 2
      ? "mt-6 grid grid-cols-2 gap-2.5"
      : "mt-6 grid gap-2.5"}
  aria-label="Answer choices"
>
  {#each choices as choice, index (choice.id)}
    {@const selected = selectedId === choice.id}
    {@const wrongPick = choice.id === wrongChoiceId}
    {@const state = gradedState(choice.id, selected)}

    <button
      class={optionClass(state, wrongPick)}
      disabled={submitted}
      type="button"
      data-answer-option
      aria-pressed={selected}
      aria-label={(choice.clock ? formatClockFaceLabel(choice.clock) : choice.label) +
        (wrongPick ? ", incorrect" : "") +
        gradedLabel(state)}
      onclick={() => (selectedId = choice.id)}
    >
      {#if choice.clock}
        <ClockIllustration
          hour={choice.clock.hour}
          minute={choice.clock.minute}
          size={88}
        />
      {/if}

      {#if choice.label}
        <span class={showClockChoices ? undefined : "min-w-0 flex-1"} lang="sk">
          {choice.label}
        </span>
      {/if}

      {#if state === "right" || state === "wrong" || wrongPick}
        <span
          class="grid size-5 shrink-0 place-items-center rounded-full text-paper {showClockChoices
            ? 'absolute top-3 right-3'
            : ''} {state === 'right' ? 'bg-emerald-600' : 'bg-rose-600'}"
          aria-hidden="true"
        >
          <svg
            class="size-3 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            {#if state === "right"}
              <path d="M5 13l4 4L19 7" />
            {:else}
              <path d="M6 6l12 12M18 6L6 18" />
            {/if}
          </svg>
        </span>
      {:else if numbered && !submitted}
        <kbd class={optionKeyClass} aria-hidden="true">{index + 1}</kbd>
      {/if}
    </button>
  {/each}
</div>
