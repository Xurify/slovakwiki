<script lang="ts">
  import type { AnswerGrade } from "$lib/client/practice-state";
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeExerciseCard from "$lib/components/practice/PracticeExerciseCard.svelte";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";

  export type SessionPhraseResult = {
    english?: string;
    grade: AnswerGrade | "revealed";
    itemId: string;
    slovak: string;
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

  const exerciseCount = $derived(results.length);
  const correctCount = $derived(results.filter((row) => isCorrect(row.grade)).length);
  const missedCount = $derived(exerciseCount - correctCount);
  const perfectRun = $derived(correctCount === exerciseCount && exerciseCount > 0);

  const missedPhrases = $derived(results.filter((row) => !isCorrect(row.grade)));
  const correctPhrases = $derived(results.filter((row) => isCorrect(row.grade)));

  const headline = $derived.by(() => {
    if (perfectRun) return "Clean run.";
    if (correctCount >= exerciseCount * 0.75) return "Mostly there.";
    if (correctCount >= exerciseCount * 0.5) return "Worth another pass.";
    return "Try the missed ones again.";
  });

  const splitResults = $derived(missedPhrases.length > 0 && correctPhrases.length > 0);

  const footerClass = $derived(
    perfectRun
      ? "border-t border-emerald-200 bg-emerald-50"
      : missedCount > 0
        ? "border-t border-rose-200 bg-rose-50/60"
        : "border-t border-slate-200 bg-paper/70",
  );
</script>

{#snippet phraseRow(row: SessionPhraseResult)}
  <li class="m-0 flex gap-3 py-3">
    <span
      class="mt-1.5 inline-grid size-5 shrink-0 place-items-center rounded-full {isCorrect(
        row.grade,
      )
        ? 'bg-emerald-100 text-emerald-800'
        : 'bg-rose-100 text-rose-800'}"
      aria-hidden="true"
    >
      {#if isCorrect(row.grade)}
        <svg
          class="size-3 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      {:else}
        <svg
          class="size-3 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke-linecap="round"
        >
          <path d="M6 12h12" />
        </svg>
      {/if}
    </span>

    <div class="min-w-0 grid gap-0.5">
      <p
        class="m-0 font-serif text-base font-semibold leading-snug text-slate-900"
        lang="sk"
      >
        {row.slovak}
      </p>

      {#if row.english}
        <p class="m-0 text-sm text-slate-500">{row.english}</p>
      {/if}
    </div>
  </li>
{/snippet}

{#snippet phraseBlock(rows: SessionPhraseResult[], label: string)}
  <div>
    <Eyebrow tone="muted" compact>{label}</Eyebrow>

    <ul class="m-0 list-none divide-y divide-slate-200 p-0">
      {#each rows as row (row.itemId)}
        {@render phraseRow(row)}
      {/each}
    </ul>
  </div>
{/snippet}

{#snippet actions()}
  <div class="grid gap-3">
    <Button
      class="!bg-blue-600 !text-white hover:!bg-blue-700 w-full"
      type="button"
      onclick={onRetry}
    >
      Run again
    </Button>

    <div
      class="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      {#if backHref}
        <TextLink href={backHref} class="justify-center sm:justify-start">
          Back to {backLabel}
        </TextLink>
      {:else}
        <span aria-hidden="true"></span>
      {/if}

      {#if missedCount > 0 && onRetryMissed}
        <Button
          class="w-full sm:min-w-[11rem] sm:w-auto"
          type="button"
          variant="secondary"
          onclick={onRetryMissed}
        >
          Try missed ({missedCount})
        </Button>
      {/if}
    </div>
  </div>
{/snippet}

<div class="mx-auto w-full max-w-[640px]" aria-labelledby="practice-complete-heading">
  <PracticeSessionChrome
    {backHref}
    {backLabel}
    complete
    {sessionTitle}
    total={exerciseCount}
  />

  <PracticeExerciseCard footer={actions} {footerClass}>
    <div
      class="-mx-7 -mt-8 mb-6 border-b border-slate-200 bg-slate-50 px-7 py-5 max-[560px]:-mx-4 max-[560px]:px-4 max-[560px]:py-4"
    >
      <div class="flex items-end justify-between gap-6">
        <div class="min-w-0">
          <Eyebrow tone="muted" compact>Session complete</Eyebrow>

          <h1
            id="practice-complete-heading"
            class="m-0 mt-2 font-serif text-[clamp(1.35rem,3.5vw,1.75rem)] font-semibold leading-snug text-pretty text-slate-900"
          >
            {headline}
          </h1>

          <p class="m-0 mt-1.5 text-sm text-slate-500">
            {correctCount} of {exerciseCount} answered correctly
          </p>
        </div>

        <p
          class="m-0 shrink-0 font-serif text-[clamp(2rem,6vw,2.75rem)] font-semibold leading-none tabular-nums text-slate-900"
          aria-label="{correctCount} of {exerciseCount} correct"
        >
          {correctCount}<span class="text-[0.55em] font-medium text-slate-400"
            >/{exerciseCount}</span
          >
        </p>
      </div>
    </div>

    <p class="m-0 mb-4 text-sm font-medium text-slate-500">{sessionTitle}</p>

    {#if results.length > 0}
      <section aria-label="Phrases from this pass">
        {#if splitResults}
          <div class="grid gap-6 sm:grid-cols-2">
            {@render phraseBlock(missedPhrases, "Missed")}
            {@render phraseBlock(correctPhrases, "Correct")}
          </div>
        {:else if missedPhrases.length > 0}
          {@render phraseBlock(missedPhrases, "Missed")}
        {:else}
          {@render phraseBlock(correctPhrases, "From this pass")}
        {/if}
      </section>
    {/if}
  </PracticeExerciseCard>
</div>
