<script lang="ts">
  import { onMount, tick } from "svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    shouldShowCorrection,
    splitEmphasis,
  } from "$lib/components/practice/practice-feedback-ui";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";

  let {
    attempt,
    correction,
    english,
    grade,
    markWords = false,
    missHeadline = "Correct answer",
    oncontinue,
    revealed = false,
    showCorrection: showCorrectionProp,
    why,
  }: {
    attempt?: string;
    correction?: string;
    english?: string;
    grade: AnswerGrade;
    markWords?: boolean;
    missHeadline?: string;
    oncontinue: () => void;
    revealed?: boolean;
    showCorrection?: boolean;
    why?: string;
  } = $props();

  let rootEl: HTMLDivElement | undefined = $state();

  const isMiss = $derived(grade === "incorrect" || grade === "accents" || revealed);
  const whyParts = $derived(why ? splitEmphasis(why) : []);
  const showCorrection = $derived(
    showCorrectionProp ?? (isMiss && shouldShowCorrection(true, grade, revealed)),
  );

  onMount(async () => {
    await tick();
    rootEl?.querySelector("button")?.focus({ preventScroll: true });
  });
</script>

<div
  bind:this={rootEl}
  class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5"
  role="status"
  aria-live="polite"
>
  <div
    class="mx-auto flex max-w-[640px] animate-rise flex-wrap justify-between gap-4 {isMiss
      ? 'items-start'
      : 'items-center'}"
  >
    <div class="min-w-0 flex-1">
      {#if isMiss}
        <PracticeExerciseFeedback
          {attempt}
          {correction}
          {english}
          {why}
          {grade}
          {revealed}
          {showCorrection}
          {missHeadline}
          {markWords}
          density="compact"
          correctionLabelTone="emerald"
        />
      {:else}
        <p
          class="m-0 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700"
        >
          <svg
            class="size-3.5 fill-none stroke-current"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
          Correct
        </p>

        {#if whyParts.length}
          <p
            class="m-0 mt-1 max-w-[65ch] text-sm leading-snug text-pretty text-slate-600"
          >
            {#each whyParts as part, index (`${part.type}-${index}`)}
              {#if part.type === "em" || part.type === "i"}
                <strong class="font-semibold text-slate-800">{part.value}</strong>
              {:else}
                {part.value}
              {/if}
            {/each}
          </p>
        {/if}
      {/if}
    </div>

    <Button
      class="min-w-36 shrink-0 px-6"
      type="button"
      variant="accent"
      onclick={oncontinue}
    >
      Continue
    </Button>
  </div>
</div>
