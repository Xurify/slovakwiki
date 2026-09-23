<script lang="ts">
  import ClockIllustration from "$lib/learning/time/ClockIllustration.svelte";
  import PromptClock from "$lib/learning/time/PromptClock.svelte";
  import type { ChoiceExercise } from "$lib/learning/types";
  import { formatClockFaceLabel } from "$lib/learning/time/clock";

  let {
    choices,
    choiceStyle = "text",
    promptClock,
    selectedId = $bindable(null),
    submitted,
    wrongChoiceId = null,
    correctIds = null,
    variant = "default",
  }: {
    choices: ChoiceExercise["choices"];
    choiceStyle?: ChoiceExercise["choiceStyle"];
    promptClock?: ChoiceExercise["clock"];
    selectedId?: string | null;
    submitted: boolean;
    wrongChoiceId?: string | null;
    /** After submit, mark these as right and a wrong pick as wrong (key-style only). */
    correctIds?: readonly string[] | null;
    variant?: "default" | "cards";
  } = $props();

  const showClockChoices = $derived(choiceStyle === "clock");
  const cards = $derived(variant === "cards" && !showClockChoices);
  const graded = $derived(submitted && !cards && correctIds !== null);

  type GradedState = "right" | "wrong" | "rest";

  function gradedState(choiceId: string, selected: boolean): GradedState | null {
    if (!graded || !correctIds) return null;
    if (correctIds.includes(choiceId)) return "right";
    return selected ? "wrong" : "rest";
  }

  function gradedClass(state: GradedState | null): string {
    const inset = showClockChoices ? "" : " pr-11";
    if (state === "right") {
      return `border-emerald-600 bg-emerald-50 text-emerald-800 shadow-[0_2px_0_0_var(--green)]${inset}`;
    }
    if (state === "wrong") {
      return `border-rose-600 bg-rose-50 text-rose-800 shadow-[0_2px_0_0_var(--action)]${inset}`;
    }
    if (state === "rest") return "opacity-55";
    return "";
  }

  function gradedLabel(state: GradedState | null): string {
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
    : cards
      ? "mt-6 grid gap-3"
      : "mt-6 grid gap-2.5"}
  aria-label="Answer choices"
>
  {#each choices as choice, index (choice.id)}
    {@const selected = selectedId === choice.id}
    {@const wrongPick = choice.id === wrongChoiceId}
    {@const state = gradedState(choice.id, selected)}

    <button
      class={showClockChoices
        ? `press-key relative grid min-h-14 w-full cursor-pointer justify-items-center gap-2 rounded-(--frame-radius) px-3 py-4 text-center font-serif text-sm font-semibold ${gradedClass(state)}`
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
          : `press-key relative min-h-14 w-full cursor-pointer rounded-(--control-radius) px-4 py-3.5 text-left font-serif text-base font-semibold ${gradedClass(state)}`}
      disabled={submitted}
      type="button"
      aria-pressed={selected}
      aria-label={(choice.clock ? formatClockFaceLabel(choice.clock) : choice.label) +
        (wrongPick ? ", incorrect" : "") +
        gradedLabel(state)}
      onclick={() => (selectedId = choice.id)}
    >
      {#if state === "right" || state === "wrong"}
        <span
          class="absolute right-3 grid size-6 place-items-center rounded-full text-paper {showClockChoices
            ? 'top-3'
            : 'top-1/2 -translate-y-1/2'} {state === 'right'
            ? 'bg-emerald-600'
            : 'bg-rose-600'}"
          aria-hidden="true"
        >
          <svg
            class="size-3.5 fill-none stroke-current"
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
      {/if}

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
