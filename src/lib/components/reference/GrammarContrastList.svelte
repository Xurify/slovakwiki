<script lang="ts">
  import { dataMoreRowClass, dataPanelClass } from "$lib/components/ui/data-list-ui";

  import TextLink from "$lib/components/ui/TextLink.svelte";
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarScene from "$lib/components/reference/GrammarScene.svelte";
  import GrammarSentence from "$lib/components/reference/GrammarSentence.svelte";
  import {
    grammarEndingClass,
    grammarMarkClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import type { GrammarContrast, GrammarContrastSet } from "$lib/catalog/types";
  import { markRoleClass, segmentsFromMarks } from "$lib/learning/marked-text";
  import { cx } from "$lib/ui/classes";

  let {
    contrasts,
    audioKeys = [],
  }: {
    contrasts: GrammarContrastSet;
    audioKeys?: string[];
  } = $props();

  const allFrames = $derived([...contrasts.frames, ...(contrasts.more ?? [])]);

  const key = $derived.by(() => {
    for (const choice of allFrames.flatMap((frame) => frame.choices)) {
      const { text, marks } = choice.slovak;
      const ending = marks.find((mark) => mark.role === "ending");
      const changing = marks.find(
        (mark) => mark.role !== "ending" && mark.role !== "owner",
      );
      if (!ending || !changing) continue;

      const stemStart = text.lastIndexOf(" ", ending.start - 1) + 1;
      return {
        word: text.slice(changing.start, changing.end),
        stem: text.slice(stemStart, ending.start),
        ending: text.slice(ending.start, ending.end),
      };
    }
    return null;
  });

  function caseTerms(terms: string): string {
    return terms.split(" · ").join(", ");
  }

  const labelled = $derived(allFrames.some((frame) => frame.label));
  const withScenes = $derived(allFrames.some((frame) => frame.scene));
</script>

{#snippet frames(list: GrammarContrast[], prefix: string)}
  {#each list as frame, frameIndex (frame.question + frameIndex)}
    {@const keys = frame.choices.map((_, index) => `${prefix}-${frameIndex}-${index}`)}
    {@const reserveAudio = keys.some((key) => audioKeys.includes(key))}

    <li class="border-t border-slate-200 first:border-t-0">
      <p
        class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:px-5"
      >
        <span class="text-sm font-semibold text-slate-900">{frame.question}</span>

        {#if frame.label}
          <span class="text-xs leading-snug sm:text-right">
            <span class="font-semibold text-slate-700" lang="sk">
              {caseTerms(frame.label.sk)}
            </span>
            <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
            <span class="text-slate-500">{caseTerms(frame.label.en)}</span>
          </span>
        {/if}
      </p>

      <!-- Rows, not columns: a frame's sentences stack, so the word that changes
           sits under the word it replaces, and every sentence starts on the
           same keyline whatever its situation says. -->
      <ol class="m-0 list-none p-0">
        {#each frame.choices as choice, choiceIndex (choice.slovak.text)}
          {@const audioKey = keys[choiceIndex]}

          <li
            class={cx(
              "grid gap-x-6 gap-y-2 border-t border-slate-200/70 px-4 py-3 first:border-t-0 sm:px-5",
              frame.scene ? "md:items-center" : "md:items-start",
              withScenes
                ? "md:grid-cols-[8rem_minmax(0,1fr)_minmax(0,10rem)]"
                : "md:grid-cols-[10rem_minmax(0,1fr)_minmax(0,10rem)]",
            )}
          >
            <div
              class="flex min-w-0 items-center gap-3 md:flex-col md:items-start md:gap-1"
            >
              {#if frame.scene}
                <GrammarScene kind={frame.scene} at={choice.at} object={frame.object} />
              {/if}

              <!-- Without a scene, the situation sits on the Slovak's baseline,
                   like an example's note. -->
              <span
                class={cx(
                  "min-w-0 text-sm leading-snug text-slate-600",
                  !frame.scene && "md:pt-1.5",
                )}
              >
                {choice.when}
              </span>
            </div>

            <GrammarSentence
              audioKey={audioKey && audioKeys.includes(audioKey) ? audioKey : undefined}
              {reserveAudio}
              english={choice.english}
            >
              {#each segmentsFromMarks(choice.slovak.text, choice.slovak.marks) as segment, index (index)}
                {#if segment.role}
                  <span class={grammarMarkClass(segment.role)}>{segment.text}</span>
                {:else}
                  {segment.text}
                {/if}
              {/each}
            </GrammarSentence>

            {#if choice.why}
              <p
                class={cx(
                  "m-0 min-w-0 text-sm leading-snug text-pretty text-slate-600 md:text-right",
                  !frame.scene && "md:pt-1.5",
                  reserveAudio && "pl-10 md:pl-0",
                )}
              >
                <GrammarRichText text={choice.why} />
              </p>
            {/if}
          </li>
        {/each}
      </ol>
    </li>
  {/each}
{/snippet}

{#if key || labelled}
  <p class="m-0 mb-3 max-w-[75ch] text-sm leading-relaxed text-slate-600">
    {#if key}
      In each sentence the word you pick is blue, like
      <span class="font-serif font-semibold {grammarEndingClass}" lang="sk"
        >{key.word}</span
      >, and the noun's case ending is boxed, like
      <span class="font-serif font-semibold text-slate-900" lang="sk"
        >{key.stem}<span class={markRoleClass("ending")}>{key.ending}</span></span
      >.
    {/if}
    {#if labelled}
      Each card names its case with the Slovak school term first:
      <span lang="sk">pád</span> (case), <span lang="sk">rod</span> (gender),
      <span lang="sk">životný</span> (animate), <span lang="sk">množné číslo</span>
      (plural), as in
      <TextLink
        href="https://www.juls.savba.sk/ediela/msj/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Morfológia slovenského jazyka ↗</TextLink
      >.
    {/if}
  </p>
{/if}

<div class={dataPanelClass}>
  <ol class="m-0 list-none p-0">
    {@render frames(contrasts.frames, "contrast")}
  </ol>

  {#if contrasts.more?.length}
    <details class="group">
      <summary
        class={cx(dataMoreRowClass, "list-none [&::-webkit-details-marker]:hidden")}
      >
        <span class="group-open:hidden">
          Show the same choice in {contrasts.more.length} more cases
        </span>

        <span class="hidden group-open:inline">Hide the other cases</span>

        <svg
          class="size-4 fill-none stroke-current transition-transform duration-150 ease-out group-open:rotate-180"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <ol class="m-0 list-none border-t border-slate-200 p-0">
        {@render frames(contrasts.more, "contrast-more")}
      </ol>
    </details>
  {/if}
</div>
