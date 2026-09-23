<script lang="ts">
  import type { PracticeSessionContext } from "$lib/catalog/practice/hub";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import PracticeExerciseCard from "$lib/components/practice/PracticeExerciseCard.svelte";
  import PracticeExerciseFeedback from "$lib/components/practice/PracticeExerciseFeedback.svelte";
  import PracticeSessionChrome from "$lib/components/practice/PracticeSessionChrome.svelte";
  import {
    sessionKickerClass,
    sessionSubtitle,
  } from "$lib/components/practice/practice-session-ui";

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
    sessionContext,
    sessionTitle,
  }: {
    backHref?: string;
    backLabel?: string;
    onRetry: () => void;
    onRetryMissed?: () => void;
    results: SessionPhraseResult[];
    sessionContext?: PracticeSessionContext;
    sessionTitle: string;
  } = $props();

  type NumberedResult = SessionPhraseResult & { number: number };

  function isCorrect(grade: SessionPhraseResult["grade"]): boolean {
    return grade === "correct" || grade === "accents";
  }

  function normalizeGloss(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, " ").replace(/\.$/, "");
  }

  function showEnglishGloss(row: SessionPhraseResult): boolean {
    if (!row.english) return false;
    if (row.promptLang === "sk") return true;
    if (!row.prompt) return true;
    return normalizeGloss(row.english) !== normalizeGloss(row.prompt);
  }

  const numbered = $derived<NumberedResult[]>(
    results.map((row, index) => ({ ...row, number: index + 1 })),
  );
  const toReview = $derived(numbered.filter((row) => !isCorrect(row.grade)));
  const gotRight = $derived(numbered.filter((row) => isCorrect(row.grade)));

  const exerciseCount = $derived(results.length);
  const correctCount = $derived(gotRight.length);
  const accentsCount = $derived(gotRight.filter((row) => row.grade === "accents").length);
  const missedCount = $derived(toReview.length);
  const perfect = $derived(exerciseCount > 0 && missedCount === 0);

  const subtitle = $derived(sessionSubtitle(sessionContext));
  const nextSet = $derived(sessionContext?.nextSet ?? null);
  const lessonHref = $derived(sessionContext?.lessonHref ?? null);

  const headline = $derived(
    perfect
      ? `All ${exerciseCount} correct`
      : `${correctCount} of ${exerciseCount} correct`,
  );

  const subline = $derived.by(() => {
    if (perfect) {
      return nextSet ? "Nothing to review. On to the next set." : "Nothing to review.";
    }
    return missedCount === 1
      ? "Go over the one you missed below, then try it again."
      : `Go over the ${missedCount} you missed below, then try them again.`;
  });

  const eyebrowClass = "m-0 text-[0.64rem] font-bold tracking-[0.14em] uppercase";
</script>

{#snippet legendDot(tone: string)}
  <span class="size-2 shrink-0 rounded-full {tone}" aria-hidden="true"></span>
{/snippet}

{#snippet reviewRow(row: NumberedResult)}
  {@const revealed = row.grade === "revealed"}

  <li class="grid gap-2.5 border-t border-slate-200 py-4 first:border-t-0 first:pt-0">
    <div class="flex items-baseline gap-2.5">
      <span class="w-4 shrink-0 text-xs font-semibold tabular-nums text-slate-400">
        {row.number}
      </span>

      <p
        class="m-0 min-w-0 flex-1 text-sm font-medium leading-snug text-slate-700"
        lang={row.promptLang === "sk" ? "sk" : "en"}
      >
        {row.prompt}
      </p>

      {#if revealed}
        <span class="shrink-0 text-xs text-slate-500">Revealed</span>
      {/if}
    </div>

    <div class="sm:pl-6.5">
      <PracticeExerciseFeedback
        attempt={row.attempt && !revealed ? row.attempt : undefined}
        correction={row.slovak}
        english={row.english}
        why={row.why}
        grade="incorrect"
        {revealed}
        showCorrection={true}
        density="compact"
        correctionLabelTone="emerald"
      />
    </div>
  </li>
{/snippet}

{#snippet rightRow(row: NumberedResult)}
  <li
    class="flex items-baseline gap-2.5 border-t border-slate-200 py-3 first:border-t-0 first:pt-0"
  >
    <span class="w-4 shrink-0 text-xs font-semibold tabular-nums text-slate-400">
      {row.number}
    </span>

    <div class="grid min-w-0 flex-1 gap-0.5">
      <p
        class="m-0 font-serif text-base font-semibold leading-snug text-slate-900"
        lang="sk"
      >
        {row.slovak}
      </p>

      {#if showEnglishGloss(row)}
        <p class="m-0 text-sm leading-snug text-slate-500">{row.english}</p>
      {/if}

      {#if row.grade === "accents" && row.attempt}
        <p class="m-0 mt-1 text-xs leading-snug text-blue-800">
          Check the accents — you wrote
          <span class="font-serif text-sm font-semibold" lang="sk">{row.attempt}</span>
        </p>
      {/if}
    </div>
  </li>
{/snippet}

{#snippet nextSteps()}
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    {#if nextSet && !perfect}
      <a
        class="group inline-flex min-w-0 items-baseline gap-2 text-sm text-slate-600 no-underline"
        href={nextSet.href}
      >
        <span class="shrink-0">Up next:</span>

        <span class="min-w-0 truncate font-semibold text-blue-800 group-hover:underline">
          {nextSet.title}
        </span>

        <ArrowRight />
      </a>
    {:else}
      <span class="max-sm:hidden"></span>
    {/if}

    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      {#if lessonHref}
        <TextLink href={lessonHref}>Review the lesson</TextLink>
      {/if}

      {#if backHref}
        <TextLink href={backHref}>All practice sets</TextLink>
      {/if}
    </div>
  </div>
{/snippet}

<div class="mx-auto w-full max-w-[640px]" aria-labelledby="practice-complete-heading">
  <PracticeSessionChrome
    {backHref}
    {backLabel}
    complete
    results={results.map((row) => row.grade)}
    {subtitle}
    title={sessionTitle}
    total={exerciseCount}
  />

  <PracticeExerciseCard footer={nextSteps}>
    <header>
      <p class="{eyebrowClass} inline-flex items-center gap-1.5 text-emerald-700">
        <svg
          class="size-3.5 fill-none stroke-current"
          viewBox="0 0 24 24"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
        Set complete
      </p>

      <h1
        id="practice-complete-heading"
        class="m-0 mt-2 font-serif text-[clamp(1.6rem,4vw,2rem)] font-semibold leading-tight tracking-tight text-slate-900"
      >
        {headline}
      </h1>

      <p class="m-0 mt-2 max-w-[48ch] text-sm leading-relaxed text-pretty text-slate-600">
        {subline}
      </p>

      <ul
        class="m-0 mt-4 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-slate-600"
      >
        <li class="inline-flex items-center gap-1.5">
          {@render legendDot("bg-emerald-600")}
          <span class="font-semibold tabular-nums text-slate-900">
            {correctCount - accentsCount}
          </span>
          correct
        </li>

        {#if accentsCount > 0}
          <li class="inline-flex items-center gap-1.5">
            {@render legendDot("bg-emerald-400")}
            <span class="font-semibold tabular-nums text-slate-900">{accentsCount}</span>
            {accentsCount === 1 ? "accent slip" : "accent slips"}
          </li>
        {/if}

        {#if missedCount > 0}
          <li class="inline-flex items-center gap-1.5">
            {@render legendDot("bg-rose-400")}
            <span class="font-semibold tabular-nums text-slate-900">{missedCount}</span>
            to review
          </li>
        {/if}
      </ul>
    </header>

    <div class="mt-6 flex flex-col gap-3 sm:flex-row">
      {#if missedCount > 0 && onRetryMissed}
        <Button
          class="w-full sm:w-auto sm:min-w-[11rem]"
          variant="accent"
          onclick={onRetryMissed}
        >
          {missedCount === 1 ? "Retry the missed one" : `Retry the ${missedCount} missed`}
        </Button>

        <Button
          class="w-full sm:w-auto sm:min-w-[9rem]"
          variant="secondary"
          onclick={onRetry}
        >
          Run the set again
        </Button>
      {:else if nextSet}
        <Button
          class="w-full sm:w-auto sm:min-w-[11rem]"
          variant="accent"
          href={nextSet.href}
        >
          Next set
          <ArrowRight />
        </Button>

        <Button
          class="w-full sm:w-auto sm:min-w-[9rem]"
          variant="secondary"
          onclick={onRetry}
        >
          Run the set again
        </Button>
      {:else}
        <Button
          class="w-full sm:w-auto sm:min-w-[11rem]"
          variant="accent"
          onclick={onRetry}
        >
          Run the set again
        </Button>
      {/if}
    </div>

    {#if toReview.length > 0}
      <section
        class="mt-8 border-t border-slate-200 pt-6"
        aria-labelledby="practice-review-heading"
      >
        <h2 id="practice-review-heading" class={sessionKickerClass}>
          To review
          <span class="ml-1 tabular-nums text-slate-400">{toReview.length}</span>
        </h2>

        <ol class="m-0 mt-2 list-none p-0">
          {#each toReview as row (`${row.itemId}-${row.number}`)}
            {@render reviewRow(row)}
          {/each}
        </ol>
      </section>
    {/if}

    {#if gotRight.length > 0}
      <section
        class="mt-8 border-t border-slate-200 pt-6"
        aria-labelledby="practice-right-heading"
      >
        <h2 id="practice-right-heading" class={sessionKickerClass}>
          Correct
          <span class="ml-1 tabular-nums text-slate-400">{gotRight.length}</span>
        </h2>

        <ol class="m-0 mt-2 list-none p-0">
          {#each gotRight as row (`${row.itemId}-${row.number}`)}
            {@render rightRow(row)}
          {/each}
        </ol>
      </section>
    {/if}
  </PracticeExerciseCard>
</div>
