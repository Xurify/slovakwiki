<script lang="ts">
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import GrammarScale from "$lib/components/reference/GrammarScale.svelte";
  import {
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import type { GrammarContrast } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    pairs,
    audioKeys = [],
  }: {
    pairs: GrammarContrast[];
    /** `contrast-{pair}-{side}` keys that have a recorded clip. */
    audioKeys?: string[];
  } = $props();

  const choiceClass = "flex min-w-0 flex-col gap-3 px-4 py-4 sm:px-5";
</script>

<ol class={cx(dataPanelClass, "m-0 list-none p-0")}>
  {#each pairs as pair, pairIndex (pair.choices[0].slovak.text)}
    <li class="border-b border-slate-200 last:border-b-0">
      {#if pair.label}
        <p class={cx(eyebrowMutedClass, "px-4 pt-3.5 sm:px-5")}>{pair.label}</p>
      {/if}

      <div class="grid sm:grid-cols-2">
        {#each pair.choices as choice, side (side)}
          {@const audioKey = `contrast-${pairIndex}-${side}`}

          <div
            class={cx(
              choiceClass,
              side === 1 && "border-slate-200/70 max-sm:border-t sm:border-l",
            )}
          >
            {#if pair.scale}
              <GrammarScale stops={pair.scale} at={choice.at} />
            {/if}

            <div class="flex items-start gap-2.5">
              {#if audioKeys.includes(audioKey)}
                <span
                  class="mt-0.5 inline-flex size-7 shrink-0"
                  data-audio-mount={audioKey}
                ></span>
              {/if}

              <div class="min-w-0">
                <p class={cx(grammarFormClass, "m-0 text-lg")}>
                  <MarkedText text={choice.slovak.text} marks={choice.slovak.marks} />
                </p>

                <p class={cx(grammarGlossClass, "m-0 mt-0.5")}>{choice.english}</p>
              </div>
            </div>

            <p class="m-0 text-sm leading-snug text-pretty text-slate-600">
              If <GrammarRichText text={choice.when} />.
            </p>
          </div>
        {/each}
      </div>
    </li>
  {/each}
</ol>
