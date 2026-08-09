<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { AnswerGrade } from "$lib/client/practice-state";
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
  } = $props();

  const isCompact = $derived(density === "compact");
  const isMiss = $derived(
    grade === "incorrect" || grade === "accents" || revealed === true,
  );
  const useCompare = $derived(isCompact && isMiss);

  const correctionLabelClass = $derived(
    correctionLabelTone === "emerald" ? "text-emerald-800" : "text-rose-900",
  );

  const whyParts = $derived(why ? splitEmphasis(why) : []);
  const showEnglish = $derived(Boolean(english && !useCompare));
  const showMissLabel = $derived(!useCompare && (revealed || grade === "incorrect"));
  const correctionClass = $derived(
    useCompare
      ? "m-0 font-serif text-[1.0625rem] font-semibold leading-snug text-slate-900"
      : "m-0 font-serif text-xl font-semibold text-slate-900",
  );
  const attemptClass = $derived(
    grade === "accents"
      ? "m-0 font-serif text-[0.9375rem] leading-snug text-ink"
      : "m-0 font-serif text-[0.9375rem] leading-snug text-ink/90 line-through decoration-slate-300/80",
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

{#if useCompare}
  <div class="grid gap-2">
    {#if grade === "accents"}
      <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
    {/if}

    {#if attempt || (showCorrection && correction)}
      <div class={missCompareClass}>
        {#if attempt}
          <div class={missCompareAttemptRowClass}>
            <p class="{feedbackSectionLabelClass} text-rose-700/90">You wrote</p>

            <p class={attemptClass} lang="sk">{attempt}</p>
          </div>
        {/if}

        {#if showCorrection && correction}
          <div class={missCompareCorrectionRowClass}>
            <p class="{feedbackSectionLabelClass} text-emerald-800">Correct answer</p>

            <p class={correctionClass} lang="sk">{correction}</p>
          </div>
        {/if}
      </div>
    {/if}

    {@render whyLine()}

    {#if closeSuggestion}
      <p class="m-0 text-sm text-slate-700">
        Did you mean
        <strong class="font-serif text-base text-slate-900" lang="sk"
          >{closeSuggestion}</strong
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

    {#if grade === "accents"}
      <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
    {:else if grade === "correct"}
      <p class="m-0 text-sm font-semibold text-emerald-800">Correct</p>
    {:else if showMissLabel}
      <p class="m-0 text-sm font-semibold {correctionLabelClass}">Correct answer</p>
    {/if}

    {#if closeSuggestion}
      <p class="m-0 text-sm text-slate-700">
        Did you mean
        <strong class="font-serif text-base text-slate-900" lang="sk"
          >{closeSuggestion}</strong
        >?
      </p>
    {/if}

    {#if showCorrection && correction}
      <p class={correctionClass} lang="sk">{correction}</p>
    {/if}

    {#if showEnglish}
      <p class="m-0 text-sm text-slate-600">{english}</p>
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
