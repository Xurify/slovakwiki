<script lang="ts">
  import { dataMoreRowClass, dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarScene from "$lib/components/reference/GrammarScene.svelte";
  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import type { GrammarContrast, GrammarContrastSet } from "$lib/catalog/types";
  import { markRoleClass, segmentsFromMarks } from "$lib/learning/marked-text";
  import { cx } from "$lib/ui/classes";

  let {
    contrasts,
    audioKeys = [],
  }: {
    contrasts: GrammarContrastSet;
    /** `contrast-{frame}-{choice}` and `contrast-more-{frame}-{choice}` keys with a clip. */
    audioKeys?: string[];
  } = $props();

  const questionRowClass =
    "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:px-5";

  const rowClass = cx(
    "grid grid-cols-1 gap-y-2 border-b border-slate-200/70 px-4 py-3 last:border-b-0",
    "sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center sm:gap-x-5 sm:px-5",
  );

  /** Scene and situation side by side on a phone, stacked in their own column from sm up. */
  const cueClass = "flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1";

  /** The changing word takes the page's ending colour; the owner and the noun ending keep their own. */
  function markClass(role: string): string {
    return role === "owner" || role === "ending"
      ? markRoleClass(role)
      : grammarEndingClass;
  }

  const allFrames = $derived([...contrasts.frames, ...(contrasts.more ?? [])]);

  const showsEndings = $derived(
    allFrames.some((frame) =>
      frame.choices.some((choice) =>
        choice.slovak.marks.some((mark) => mark.role === "ending"),
      ),
    ),
  );

  const labelled = $derived(allFrames.some((frame) => frame.label));
</script>

{#snippet swatch(className: string)}
  <span
    class="mr-1.5 inline-block size-2.5 rounded-full bg-current align-[-1px] {className}"
  ></span>
{/snippet}

{#snippet frames(list: GrammarContrast[], prefix: string)}
  {#each list as frame, frameIndex (frame.question + frameIndex)}
    <li class="border-t border-slate-200 first:border-t-0">
      <p class={questionRowClass}>
        <span class="text-sm font-semibold text-slate-900">{frame.question}</span>

        {#if frame.label}
          <span class={cx(eyebrowMutedClass, "text-right")}>
            {frame.label.en}
            <span
              class="font-normal normal-case tracking-normal text-slate-500"
              lang="sk"
            >
              · {frame.label.sk}
            </span>
          </span>
        {/if}
      </p>

      <ol class="m-0 list-none p-0">
        {#each frame.choices as choice, choiceIndex (choice.slovak.text)}
          {@const audioKey = `${prefix}-${frameIndex}-${choiceIndex}`}

          <li class={rowClass}>
            <div class={cueClass}>
              {#if frame.scene}
                <GrammarScene kind={frame.scene} at={choice.at} object={frame.object} />
              {/if}

              <span class="text-xs leading-snug text-slate-600">{choice.when}</span>
            </div>

            <div class="flex items-start gap-2.5">
              {#if audioKeys.includes(audioKey)}
                <span
                  class="mt-0.5 inline-flex size-7 shrink-0"
                  data-audio-mount={audioKey}
                ></span>
              {/if}

              <div class="min-w-0">
                <p class={cx(grammarFormClass, "m-0 text-lg")} lang="sk">
                  {#each segmentsFromMarks(choice.slovak.text, choice.slovak.marks) as segment, index (index)}
                    {#if segment.role}
                      <span class={markClass(segment.role)}>{segment.text}</span>
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

{#if showsEndings || labelled}
  <p class="m-0 mb-3 max-w-[62ch] text-sm leading-relaxed text-slate-600">
    {#if showsEndings}
      {@render swatch(grammarEndingClass)}The word that changes.
      {@render swatch(markRoleClass("ending"))}The noun's case ending, which it agrees
      with: the verb or preposition picks the case, the noun takes it, and the small word
      follows the noun.
    {/if}
    {#if labelled}
      Labels give the English term and the Slovak school term (<span lang="sk">pád</span>
      case,
      <span lang="sk">rod</span> gender, <span lang="sk">životný</span> animate,
      <span lang="sk">množné číslo</span> plural), as in
      <TextLink
        href="https://www.juls.savba.sk/ediela/msj/"
        rel="noopener noreferrer"
        target="_blank"
      >
        Morfológia slovenského jazyka ↗
      </TextLink>.
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
