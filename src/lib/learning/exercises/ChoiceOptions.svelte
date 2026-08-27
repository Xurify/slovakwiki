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
    wrongChoiceId = null,
    variant = "default",
  }: {
    choices: ChoiceExercise["choices"];
    choiceStyle?: ChoiceExercise["choiceStyle"];
    promptClock?: ChoiceExercise["clock"];
    selectedId?: string | null;
    submitted: boolean;
    wrongChoiceId?: string | null;
    variant?: "default" | "cards";
  } = $props();

  const showClockChoices = $derived(choiceStyle === "clock");
  const cards = $derived(variant === "cards" && !showClockChoices);
</script>

{#if promptClock}
  <div class="mt-6 flex justify-center">
    <ClockIllustration hour={promptClock.hour} minute={promptClock.minute} size={120} />
  </div>
{/if}

<div
  class={showClockChoices
    ? "mt-6 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3"
    : cards
      ? "mt-6 grid gap-3"
      : "mt-6 grid gap-2.5"}
  aria-label="Answer choices"
>
  {#each choices as choice, index (choice.id)}
    {@const selected = selectedId === choice.id}
    {@const wrongPick = choice.id === wrongChoiceId}

    <button
      class={showClockChoices
        ? "press-key grid min-h-14 w-full cursor-pointer justify-items-center gap-2 rounded-(--frame-radius) px-3 py-4 text-center font-serif text-sm font-semibold"
        : cards
          ? [
              "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-(--frame-radius) border px-4 py-3.5 text-left transition-[border-color,background-color,box-shadow,transform] duration-150 active:scale-[0.99]",
              wrongPick
                ? "border-rose-600 bg-rose-50 shadow-[0_0_0_1px_var(--color-rose-600)]"
                : selected
                  ? "border-blue-600 bg-blue-50 shadow-[0_0_0_1px_var(--color-blue-600)]"
                  : "border-transparent bg-surface/80 shadow-(--shadow-border) hover:bg-surface hover:shadow-(--shadow-border-hover)",
              submitted ? "cursor-default" : "",
            ].join(" ")
          : "press-key min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3.5 text-left font-serif text-base font-semibold"}
      disabled={submitted}
      type="button"
      aria-pressed={selected}
      aria-label={(choice.clock ? formatClockFaceLabel(choice.clock) : choice.label) +
        (wrongPick ? ", incorrect" : "")}
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
        <span
          class={cards
            ? "min-w-0 flex-1 font-serif text-base font-semibold text-slate-900"
            : undefined}
          lang="sk"
        >
          {choice.label}
        </span>
      {/if}

      {#if cards}
        <span
          class="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-semibold tabular-nums text-slate-500"
          aria-hidden="true"
        >
          {index + 1}
        </span>
      {/if}
    </button>
  {/each}
</div>
