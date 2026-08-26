<script lang="ts">
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import { shouldShowCorrection } from "$lib/components/practice/practice-feedback-ui";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";

  let {
    attempt,
    correction,
    english,
    grade,
    missHeadline = "Correct answer",
    oncontinue,
    revealed = false,
    why,
  }: {
    attempt?: string;
    correction?: string;
    english?: string;
    grade: AnswerGrade;
    missHeadline?: string;
    oncontinue: () => void;
    revealed?: boolean;
    why?: string;
  } = $props();

  const incorrect = $derived(grade === "incorrect");
  const accents = $derived(grade === "accents");
  const isMiss = $derived(incorrect || accents || revealed);
  const showCorrection = $derived(
    isMiss && shouldShowCorrection(isMiss, grade, revealed),
  );
</script>

<div
  class="shrink-0 border-t border-slate-200 bg-paper px-4 py-4 sm:px-8 sm:py-5"
  role="status"
  aria-live="polite"
>
  <div class="mx-auto flex max-w-2xl flex-wrap items-start justify-between gap-4">
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
          Correct!
        </p>
      {/if}
    </div>

    <button
      type="button"
      class={[
        "inline-flex min-h-11 min-w-36 shrink-0 cursor-pointer items-center justify-center rounded-(--control-radius) px-6 font-sans text-sm font-bold text-white transition-[background-color,transform] duration-150 active:scale-[0.96]",
        incorrect
          ? "bg-rose-700 hover:bg-rose-800"
          : accents
            ? "bg-blue-700 hover:bg-blue-800"
            : "bg-emerald-600 hover:bg-emerald-700",
      ].join(" ")}
      onclick={oncontinue}
    >
      Continue
    </button>
  </div>
</div>
