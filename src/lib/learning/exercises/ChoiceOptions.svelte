<script lang="ts">
  import ClockIllustration from "$lib/learning/time/ClockIllustration.svelte";
  import type { ChoiceExercise } from "$lib/learning/types";
  import { formatClockFaceLabel } from "$lib/learning/time/clock";

  let {
    choices,
    choiceStyle = "text",
    promptClock,
    selectedId = $bindable(null),
    submitted,
  }: {
    choices: ChoiceExercise["choices"];
    choiceStyle?: ChoiceExercise["choiceStyle"];
    promptClock?: ChoiceExercise["clock"];
    selectedId?: string | null;
    submitted: boolean;
  } = $props();

  const showClockChoices = $derived(choiceStyle === "clock");
</script>

{#if promptClock}
  <div class="mt-6 flex justify-center">
    <ClockIllustration hour={promptClock.hour} minute={promptClock.minute} size={120} />
  </div>
{/if}

<div
  class={showClockChoices
    ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
    : "mt-6 grid gap-2.5"}
  aria-label="Answer choices"
>
  {#each choices as choice (choice.id)}
    <button
      class={showClockChoices
        ? "press-key grid min-h-14 w-full cursor-pointer justify-items-center gap-2 rounded-(--control-radius) px-3 py-4 text-center font-serif text-sm font-semibold"
        : "press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3.5 text-left font-serif text-base font-semibold"}
      disabled={submitted}
      type="button"
      aria-pressed={selectedId === choice.id}
      aria-label={choice.clock ? formatClockFaceLabel(choice.clock) : choice.label}
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
        <span lang="sk">{choice.label}</span>
      {/if}
    </button>
  {/each}
</div>
