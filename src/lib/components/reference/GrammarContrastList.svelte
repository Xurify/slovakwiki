<script lang="ts">
  import { dataMoreRowClass, dataPanelClass } from "$lib/components/ui/data-list-ui";

  import TextLink from "$lib/components/ui/TextLink.svelte";
  import GrammarScene from "$lib/components/reference/GrammarScene.svelte";
  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
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
</script>

{#snippet frames(list: GrammarContrast[], prefix: string)}
  {#each list as frame, frameIndex (frame.question + frameIndex)}
    <li class="border-t border-slate-200 first:border-t-0">
      <p
        class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:px-5"
      >
        <span class="text-sm font-semibold text-slate-900">{frame.question}</span>

        {#if frame.label}
          <span class="text-right text-xs leading-snug">
            <span class="font-semibold text-slate-700" lang="sk">
              {caseTerms(frame.label.sk)}
            </span>
            <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
            <span class="text-slate-500">{caseTerms(frame.label.en)}</span>
          </span>
        {/if}
      </p>

      <ol class="m-0 list-none p-0">
        {#each frame.choices as choice, choiceIndex (choice.slovak.text)}
          {@const audioKey = `${prefix}-${frameIndex}-${choiceIndex}`}

          <li
            class={cx(
              "grid grid-cols-1 gap-y-2 border-b border-slate-200/70 px-4 py-3 last:border-b-0",
              "sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-x-6 sm:px-5",
            )}
          >
            <div class="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1.5">
              {#if frame.scene}
                <GrammarScene kind={frame.scene} at={choice.at} object={frame.object} />
              {/if}

              <span class="text-xs leading-snug text-slate-600">{choice.when}</span>
            </div>

            <div class="flex items-start gap-2.5">
              {#if audioKeys.includes(audioKey)}
                <span
                  class="mt-0.5 inline-flex size-11 shrink-0"
                  data-audio-mount={audioKey}
                ></span>
              {/if}

              <div class="min-w-0">
                <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">
                  {#each segmentsFromMarks(choice.slovak.text, choice.slovak.marks) as segment, index (index)}
                    {#if segment.role}
                      <span class={grammarMarkClass(segment.role)}>{segment.text}</span>
                    {:else}
                      {segment.text}
                    {/if}
                  {/each}
                </p>

                <p class={cx(grammarGlossClass, "m-0 mt-0.5")}>{choice.english}</p>
              </div>
            </div>
          </li>
        {/each}
      </ol>
    </li>
  {/each}
{/snippet}

{#if key || labelled}
  <p class="m-0 mb-3 max-w-[62ch] text-sm leading-relaxed text-slate-600">
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
