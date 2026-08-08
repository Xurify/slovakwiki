<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { AnswerGrade } from "$lib/client/practice-state";

  let {
    closeSuggestion = null,
    correction,
    english,
    why,
    newUse,
    grade = null,
    revealed = false,
    showCorrection = true,
    dictionaryHref,
  }: {
    closeSuggestion?: string | null;
    correction?: string;
    english?: string;
    why?: string;
    newUse?: string;
    grade?: AnswerGrade | null;
    revealed?: boolean;
    showCorrection?: boolean;
    dictionaryHref?: string;
  } = $props();
</script>

{#if grade === "accents"}
  <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
{:else if revealed || grade === "incorrect"}
  <p class="m-0 text-sm font-semibold text-rose-900">Correct answer</p>
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
  <p class="m-0 max-w-[65ch] text-sm leading-relaxed text-slate-700">{why}</p>
{/if}

{#if newUse}
  <p class="m-0 text-sm text-blue-900">{newUse}</p>
{/if}

{#if dictionaryHref}
  <TextLink class="text-sm" href={dictionaryHref}>Open in dictionary</TextLink>
{/if}
