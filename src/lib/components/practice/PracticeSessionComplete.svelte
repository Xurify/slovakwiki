<script lang="ts">
  import type { AnswerGrade } from "$lib/client/practice-state";
  import Button from "$lib/components/ui/Button.svelte";

  import PracticeExerciseCard from "$lib/components/practice/PracticeExerciseCard.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import {
    progressCorrectClass,
    progressMissedClass,
  } from "$lib/components/practice/practice-feedback-ui";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";

  export type SessionPhraseResult = {
    attempt?: string;
    english?: string;
    grade: AnswerGrade | "revealed";
    itemId: string;
    prompt: string;
    promptLang?: "en" | "sk";
    slovak: string;
    why?: string;
  };

  let {
    backHref,
    backLabel = "Practice",
    onRetry,
    onRetryMissed,
    results,
    sessionTitle,
  }: {
    backHref?: string;
    backLabel?: string;
    onRetry: () => void;
    onRetryMissed?: () => void;
    results: SessionPhraseResult[];
    sessionTitle: string;
  } = $props();

  function isCorrect(grade: SessionPhraseResult["grade"]): boolean {
    return grade === "correct" || grade === "accents";
  }

  function statusLabel(row: SessionPhraseResult): string {
    if (row.grade === "revealed") return "Revealed";
    if (row.grade === "accents") return "Almost correct";
    if (isCorrect(row.grade)) return "Correct";
    return "Missed";
  }

  const exerciseCount = $derived(results.length);
  const correctCount = $derived(results.filter((row) => isCorrect(row.grade)).length);
  const missedCount = $derived(exerciseCount - correctCount);
</script>

{#snippet resultIcon(row: SessionPhraseResult)}
  {@const missed = !isCorrect(row.grade)}
  {@const accents = row.grade === "accents"}
  <span
    class="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full {accents
      ? 'bg-blue-100 text-blue-700'
      : missed
        ? 'bg-rose-100 text-rose-700'
        : 'bg-emerald-100 text-emerald-700'}"
    aria-hidden="true"
  >
    {#if accents || isCorrect(row.grade)}
      <svg
        class="size-3 fill-none stroke-current"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    {:else}
      <svg
        class="size-3 fill-none stroke-current"
        viewBox="0 0 24 24"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    {/if}
  </span>
{/snippet}

{#snippet resultRow(row: SessionPhraseResult, index: number)}
  {@const missed = !isCorrect(row.grade)}
  {@const revealed = row.grade === "revealed"}

  <li
    class="grid grid-cols-[auto_1fr] gap-3 border-t border-slate-200 py-4 first:border-t-0"
  >
    <div class="flex items-start gap-2">
      {@render resultIcon(row)}

      <span class="mt-0.5 w-4 text-right text-xs font-medium tabular-nums text-slate-400">
        {index + 1}
      </span>
    </div>

    <div class="grid min-w-0 gap-1.5">
      <span class="sr-only">{statusLabel(row)}</span>

      <p
        class="m-0 text-sm font-medium leading-snug text-slate-700"
        lang={row.promptLang === "sk" ? "sk" : "en"}
      >
        {row.prompt}
      </p>

      {#if missed}
        <div class="mt-2">
          <PracticeExerciseFeedback
            attempt={row.attempt && !revealed ? row.attempt : undefined}
            correction={row.slovak}
            english={row.english}
            why={row.why}
            grade={row.grade === "accents" ? "accents" : "incorrect"}
            {revealed}
            showCorrection={true}
            correctionLabelTone="emerald"
          />
        </div>
      {:else}
        <p
          class="m-0 font-serif text-base font-semibold leading-snug text-slate-900"
          lang="sk"
        >
          {row.slovak}
        </p>

        {#if row.english}
          <p class="m-0 text-sm text-slate-500">{row.english}</p>
        {/if}
      {/if}
    </div>
  </li>
{/snippet}

{#snippet actions()}
  <div
    class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end"
  >
    {#if missedCount > 0 && onRetryMissed}
      <Button
        class="w-full sm:min-w-[11rem] sm:w-auto"
        type="button"
        variant="accent"
        onclick={onRetryMissed}
      >
        Try missed ({missedCount})
      </Button>

      <Button
        class="w-full sm:min-w-[11rem] sm:w-auto"
        type="button"
        variant="secondary"
        onclick={onRetry}
      >
        Run again
      </Button>
    {:else}
      <Button
        class="w-full sm:min-w-[11rem] sm:w-auto"
        type="button"
        variant="accent"
        onclick={onRetry}
      >
        Run again
      </Button>
    {/if}
  </div>
{/snippet}

<div class="mx-auto w-full max-w-[640px]" aria-labelledby="practice-complete-heading">
  <PracticeSessionChrome {backHref} {backLabel} complete total={exerciseCount} />

  <PracticeExerciseCard footer={actions}>
    <header class="mb-6">
      <h1
        id="practice-complete-heading"
        class="m-0 font-serif text-2xl font-semibold leading-tight text-slate-900"
      >
        {sessionTitle}
      </h1>

      <p class="m-0 mt-2 text-sm text-slate-600">
        <span class="font-bold tabular-nums text-slate-900"
          >{correctCount} of {exerciseCount}</span
        >
        correct
      </p>

      {#if results.length > 0}
        <div
          class="mt-3 flex h-1.5 gap-1"
          role="img"
          aria-label="{correctCount} of {exerciseCount} correct"
        >
          {#each results as row, index (`${row.itemId}-${index}`)}
            <div
              class="min-w-0 flex-1 rounded-full {isCorrect(row.grade)
                ? progressCorrectClass
                : progressMissedClass}"
            ></div>
          {/each}
        </div>
      {/if}
    </header>

    {#if results.length > 0}
      <section aria-label="Questions from this pass">
        <ol class="m-0 list-none p-0">
          {#each results as row, index (`${row.itemId}-${index}`)}
            {@render resultRow(row, index)}
          {/each}
        </ol>
      </section>
    {/if}
  </PracticeExerciseCard>
</div>
