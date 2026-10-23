<script lang="ts">
  import type { Snippet } from "svelte";

  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import {
    BuildSentenceOptions,
    ChoiceOptions,
    choiceIndexFromKeyboardEvent,
    isSayChoiceCorrect,
  } from "$lib/learning/exercises";
  import { gradeBuild, resolveBuiltTiles } from "$lib/learning/exercises/build-tiles";
  import type { DialogueSayChoices } from "$lib/learning/types";
  import { lineTiles, shuffledTiles } from "$lib/stick-figure/caption";

  let {
    aside,
    english,
    id,
    ondone,
    onmiss,
    sayChoices,
    slovak,
  }: {
    /** Beside the line to say: how to answer it. */
    aside?: Snippet;
    english: string;
    /** Seeds the tile order, so a retry is the same puzzle. */
    id: string;
    /** The right line is in: `firstTry` when nothing was missed on the way. */
    ondone: (firstTry: boolean) => void;
    /** A wrong line, for the stage to say in a bubble. */
    onmiss: (said: string) => void;
    sayChoices?: DialogueSayChoices;
    slovak: string;
  } = $props();

  let misses = $state(0);
  let selectedId = $state<string | null>(null);
  let whyWrong = $state<string>();
  let builtBankIndexes = $state<number[]>([]);
  let builtWrong = $state(false);

  const answer = $derived(lineTiles(slovak));
  const tiles = $derived(shuffledTiles(answer, id));
  const built = $derived(resolveBuiltTiles(tiles, builtBankIndexes));
  const wrongChoiceId = $derived(whyWrong ? selectedId : null);

  // A full tray is checked at once: right finishes the turn, wrong says it.
  $effect(() => {
    if (sayChoices || built.length !== answer.length || builtWrong) return;

    if (gradeBuild(built, answer)) {
      ondone(misses === 0);
      return;
    }

    misses += 1;
    builtWrong = true;
    onmiss(built.join(" "));
  });

  function choose(choiceId: string | null): void {
    selectedId = choiceId;
    if (!choiceId || !sayChoices) return;

    if (isSayChoiceCorrect(choiceId, sayChoices)) {
      ondone(misses === 0);
      return;
    }

    const picked = sayChoices.choices.find((choice) => choice.id === choiceId);
    misses += 1;
    whyWrong = picked?.whyWrong?.trim() || "Not that line. Pick the one that means it.";
    if (picked) onmiss(picked.label);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (!sayChoices) return;

    const index = choiceIndexFromKeyboardEvent(event);
    const choice = index === null ? undefined : sayChoices.choices[index];
    if (!choice) return;

    event.preventDefault();
    choose(choice.id);
  }

  function tryAgain(): void {
    builtBankIndexes = [];
    builtWrong = false;
  }

  function showLine(): void {
    misses += 1;
    builtWrong = false;
    builtBankIndexes = answer.map((word, index) => {
      const used = answer.slice(0, index).filter((earlier) => earlier === word).length;
      return tiles.reduce<number[]>(
        (found, tile, at) => (tile === word ? [...found, at] : found),
        [],
      )[used];
    });
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div class="animate-rise">
  <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
    <div class="min-w-0">
      <p class={eyebrowMutedClass}>Your line</p>
      <p class="m-0 mt-1 text-lg text-slate-900">{english}</p>
    </div>

    {@render aside?.()}
  </div>

  {#if sayChoices}
    <ChoiceOptions
      choices={sayChoices.choices}
      bind:selectedId={() => selectedId, choose}
      submitted={false}
      {wrongChoiceId}
      variant="cards"
    />

    {#if whyWrong}
      <p class="m-0 mt-3 text-sm leading-relaxed text-pretty text-rose-800" role="status">
        {#each splitEmphasis(whyWrong) as part, index (index)}
          {#if part.type === "em"}
            <strong class="font-semibold">{part.value}</strong>
          {:else if part.type === "i"}
            <em>{part.value}</em>
          {:else}
            {part.value}
          {/if}
        {/each}
      </p>
    {/if}
  {:else}
    <p class="m-0 mt-1 text-sm text-slate-500">Put the words in order.</p>

    <BuildSentenceOptions
      {tiles}
      answerLength={answer.length}
      bind:builtBankIndexes
      submitted={builtWrong}
    />

    <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
      {#if builtWrong}
        <p class="m-0 text-sm text-rose-800" role="status">
          Not quite. Try another order.
        </p>
        <TextLink onclick={tryAgain}>Try again</TextLink>
      {/if}

      <TextLink onclick={showLine}>Show me</TextLink>
    </div>
  {/if}
</div>
