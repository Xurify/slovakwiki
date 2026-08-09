<script lang="ts">
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import type { AnswerGrade } from "$lib/client/practice-state";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";

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

  const correctionLabelClass = $derived(
    correctionLabelTone === "emerald" ? "text-emerald-800" : "text-rose-900",
  );

  const whyParts = $derived(why ? splitEmphasis(why) : []);
  const showEnglish = $derived(Boolean(english && !(isCompact && isMiss)));
  const showMissLabel = $derived(!isCompact && (revealed || grade === "incorrect"));
  const correctionClass = $derived(
    isCompact && isMiss
      ? "m-0 font-serif text-lg font-semibold text-emerald-900"
      : "m-0 font-serif text-xl font-semibold text-slate-900",
  );
</script>

<div class={isCompact && isMiss ? "grid gap-1.5" : "grid gap-2"}>
  {#if attempt}
    {#if isCompact}
      <p class="m-0 text-sm text-rose-900">
        You wrote
        <span class="font-serif text-rose-950" lang="sk">{attempt}</span>
      </p>
    {:else}
      <div>
        <p class="m-0 text-xs font-semibold text-rose-900">Your answer</p>

        <p class="m-0 mt-0.5 font-serif text-sm leading-snug text-rose-950" lang="sk">
          {attempt}
        </p>
      </div>
    {/if}
  {/if}

  {#if grade === "accents"}
    <p class="m-0 text-sm font-semibold text-blue-900">Almost — check the accents.</p>
  {:else if grade === "correct"}
    <p class="m-0 text-sm font-semibold text-emerald-800">Correct</p>
  {:else if showMissLabel}
    <p class="m-0 text-sm font-semibold {correctionLabelClass}">Correct answer</p>
  {:else if isCompact && isMiss && showCorrection && correction}
    <span class="sr-only">Correct answer</span>
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
    <p class={correctionClass} lang="sk">
      {#if isCompact && attempt}
        <span
          class="mr-1.5 font-sans text-sm font-normal text-slate-400"
          aria-hidden="true">→</span
        >
      {/if}
      {correction}
    </p>
  {/if}

  {#if showEnglish}
    <p class="m-0 text-sm text-slate-600">{english}</p>
  {/if}

  {#if why}
    <p class="m-0 max-w-[65ch] text-sm leading-snug text-slate-700">
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
</div>
