<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { AnswerGrade } from "$lib/client/practice-state";
  import {
    attemptBandClass,
    correctionBandClass,
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
    reviewBands = false,
    correctionLabelTone = "rose",
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
    reviewBands?: boolean;
    correctionLabelTone?: "emerald" | "rose";
    dictionaryHref?: string;
  } = $props();

  const correctionLabelClass = $derived(
    correctionLabelTone === "emerald" ? "text-emerald-800" : "text-rose-900",
  );

  const whyParts = $derived(why ? splitEmphasis(why) : []);
</script>

{#snippet feedbackBody()}
  {#if grade === "accents"}
    <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
  {:else if grade === "correct"}
    <p class="m-0 text-sm font-semibold text-emerald-800">Correct</p>
  {:else if revealed || grade === "incorrect"}
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
    <p class="m-0 font-serif text-xl font-semibold text-slate-900" lang="sk">
      {correction}
    </p>
  {/if}

  {#if english}
    <p class="m-0 text-sm text-slate-600">{english}</p>
  {/if}

  {#if why}
    <p class="m-0 max-w-[65ch] text-sm leading-relaxed text-slate-700">
      {#each whyParts as part, index (`${part.type}-${index}`)}
        {#if part.type === "em"}
          <strong class="font-semibold text-slate-900">{part.value}</strong>
        {:else}
          {part.value}
        {/if}
      {/each}
    </p>
  {/if}

  {#if newUse}
    <p class="m-0 text-sm text-blue-900">{newUse}</p>
  {/if}

  {#if dictionaryHref}
    <TextLink class="text-sm" href={dictionaryHref}>Open in dictionary</TextLink>
  {/if}
{/snippet}

{#if attempt}
  <div class={attemptBandClass}>
    <p class="m-0 text-xs font-semibold text-rose-900">Your answer</p>

    <p
      class="m-0 mt-0.5 font-serif text-sm leading-snug text-rose-950"
      lang="sk"
    >
      {attempt}
    </p>
  </div>
{/if}

{#if reviewBands}
  <div class={correctionBandClass}>
    {@render feedbackBody()}
  </div>
{:else}
  {@render feedbackBody()}
{/if}
