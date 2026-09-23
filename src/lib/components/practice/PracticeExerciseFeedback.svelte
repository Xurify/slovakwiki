<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { AnswerGrade } from "$lib/components/practice/practice-state";
  import { displayPracticeAnswer } from "$lib/components/practice/practice-state";
  import {
    feedbackSectionLabelClass,
    missCompareAttemptRowClass,
    missCompareClass,
    missCompareCorrectionRowClass,
    splitEmphasis,
  } from "$lib/components/practice/practice-feedback-ui";

  let {
    attempt = undefined,
    closeSuggestion = null,
    correction,
    english,
    why,
    newUse,
    grade = null,
    revealed = false,
    showCorrection = true,
    correctionLabelTone = "rose",
    density = "default",
    dictionaryHref,
    correctHeadline = "Correct",
    missHeadline = "Correct answer",
    status = false,
  }: {
    attempt?: string;
    closeSuggestion?: string | null;
    correction?: string;
    english?: string;
    why?: string;
    newUse?: string;
    grade?: AnswerGrade | null;
    revealed?: boolean;
    showCorrection?: boolean;
    correctionLabelTone?: "emerald" | "rose";
    density?: "compact" | "default";
    dictionaryHref?: string;
    correctHeadline?: string;
    missHeadline?: string;
    /** Lead with an icon + verdict row (live exercise footer). */
    status?: boolean;
  } = $props();

  const statusTone = $derived.by<"accents" | "correct" | "incorrect" | "revealed">(() => {
    if (revealed) return "revealed";
    if (grade === "accents") return "accents";
    if (grade === "correct") return "correct";
    return "incorrect";
  });

  const statusHeadline = $derived.by(() => {
    if (statusTone === "correct") return correctHeadline;
    if (statusTone === "accents") return "Almost — check the accents";
    if (statusTone === "revealed") return "Answer revealed";
    return "Not quite";
  });

  const statusIconClass = $derived.by(() => {
    if (statusTone === "correct") return "bg-emerald-600";
    if (statusTone === "accents") return "bg-blue-600";
    if (statusTone === "revealed") return "bg-slate-500";
    return "bg-rose-600";
  });

  const statusTextClass = $derived.by(() => {
    if (statusTone === "correct") return "text-emerald-800";
    if (statusTone === "accents") return "text-blue-800";
    if (statusTone === "revealed") return "text-slate-700";
    return "text-rose-800";
  });

  const isCompact = $derived(density === "compact");
  const isMiss = $derived(
    grade === "incorrect" || grade === "accents" || revealed === true,
  );
  const useCompare = $derived(isCompact && isMiss);

  const correctionLabelClass = $derived(
    correctionLabelTone === "emerald" ? "text-emerald-800" : "text-rose-900",
  );

  const whyParts = $derived(why ? splitEmphasis(why) : []);
  const showEnglish = $derived(Boolean(english));
  const showMissLabel = $derived(!useCompare && (revealed || grade === "incorrect"));
  const correctionClass = $derived(
    useCompare
      ? "m-0 font-serif text-[1.0625rem] font-semibold leading-snug text-slate-900"
      : "m-0 font-serif text-xl font-semibold text-slate-900",
  );
  const attemptClass = $derived(
    "m-0 font-serif text-[1.0625rem] font-semibold leading-snug text-slate-900",
  );
  const englishClass = $derived(
    useCompare ? "m-0 text-sm leading-snug text-slate-600" : "m-0 text-sm text-slate-600",
  );
  const displayedCorrection = $derived(
    correction ? displayPracticeAnswer(correction) : undefined,
  );
  const displayedCloseSuggestion = $derived(
    closeSuggestion ? displayPracticeAnswer(closeSuggestion) : null,
  );
</script>

{#snippet whyLine()}
  {#if why}
    <p class="m-0 max-w-[65ch] text-sm leading-snug text-slate-600">
      {#each whyParts as part, index (`${part.type}-${index}`)}
        {#if part.type === "em"}
          <strong class="font-semibold text-slate-800">{part.value}</strong>
        {:else if part.type === "i"}
          <em class="font-semibold not-italic text-slate-800">{part.value}</em>
        {:else}
          {part.value}
        {/if}
      {/each}
    </p>
  {/if}
{/snippet}

{#snippet body()}
  {#if useCompare}
    <div class="grid gap-2">
      {#if grade === "accents" && !status}
        <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
      {/if}

      {#if attempt || (showCorrection && correction)}
        <div class={missCompareClass}>
          {#if attempt}
            <div class={missCompareAttemptRowClass}>
              <p class="{feedbackSectionLabelClass} text-rose-800">You wrote</p>

              <p class={attemptClass} lang="sk">{attempt}</p>
            </div>
          {/if}

          {#if showCorrection && correction}
            <div class={missCompareCorrectionRowClass}>
              <p class="{feedbackSectionLabelClass} text-emerald-800">{missHeadline}</p>

              <p class={correctionClass} lang="sk">{displayedCorrection}</p>

              {#if showEnglish}
                <p class={englishClass}>{english}</p>
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      {@render whyLine()}

      {#if closeSuggestion}
        <p class="m-0 text-sm text-slate-700">
          Did you mean
          <strong class="font-serif text-base text-slate-900" lang="sk"
            >{displayedCloseSuggestion}</strong
          >?
        </p>
      {/if}

      {#if newUse}
        <p class="m-0 text-sm text-blue-900">{newUse}</p>
      {/if}

      {#if dictionaryHref}
        <TextLink class="text-sm" href={dictionaryHref}>Open in dictionary</TextLink>
      {/if}
    </div>
  {:else}
    <div class="grid gap-2">
      {#if attempt}
        <div>
          <p class="m-0 text-xs font-semibold text-rose-900">Your answer</p>

          <p class="m-0 mt-0.5 font-serif text-sm leading-snug text-ink" lang="sk">
            {attempt}
          </p>
        </div>
      {/if}

      {#if !status}
        {#if grade === "accents"}
          <p class="m-0 text-sm font-semibold text-blue-900">
            Almost — check the accents.
          </p>
        {:else if grade === "correct"}
          <p class="m-0 text-sm font-semibold text-emerald-800">{correctHeadline}</p>
        {:else if showMissLabel}
          <p class="m-0 text-sm font-semibold {correctionLabelClass}">{missHeadline}</p>
        {/if}
      {/if}

      {#if closeSuggestion}
        <p class="m-0 text-sm text-slate-700">
          Did you mean
          <strong class="font-serif text-base text-slate-900" lang="sk"
            >{displayedCloseSuggestion}</strong
          >?
        </p>
      {/if}

      {#if showCorrection && correction}
        <p class={correctionClass} lang="sk">{displayedCorrection}</p>
      {/if}

      {#if showEnglish}
        <p class={englishClass}>{english}</p>
      {/if}

      {@render whyLine()}

      {#if newUse}
        <p class="m-0 text-sm text-blue-900">{newUse}</p>
      {/if}

      {#if dictionaryHref}
        <TextLink class="text-sm" href={dictionaryHref}>Open in dictionary</TextLink>
      {/if}
    </div>
  {/if}
{/snippet}

{#if status}
  <div class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
    <span
      class="grid size-7 place-items-center rounded-full text-paper {statusIconClass}"
      aria-hidden="true"
    >
      <svg
        class="size-4 fill-none stroke-current"
        viewBox="0 0 24 24"
        stroke-width="2.75"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {#if statusTone === "correct" || statusTone === "accents"}
          <path d="M5 13l4 4L19 7" />
        {:else if statusTone === "revealed"}
          <path
            d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
          />
          <circle cx="12" cy="12" r="2.5" />
        {:else}
          <path d="M6 6l12 12M18 6L6 18" />
        {/if}
      </svg>
    </span>

    <p class="m-0 text-base font-semibold leading-snug {statusTextClass}">
      {statusHeadline}
    </p>

    <div class="col-span-2 sm:col-span-1 sm:col-start-2">
      {@render body()}
    </div>
  </div>
{:else}
  {@render body()}
{/if}
