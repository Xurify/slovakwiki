<script lang="ts">
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

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

  // Each choice keeps its sentence and situation together in the markup, so
  // below sm they stack as one block; from sm up the grid lines them up in rows.
  const sideColumn = ["sm:col-start-2", "sm:col-start-3"] as const;

  const cardClass = cx(
    dataPanelClass,
    "grid grid-cols-1",
    "sm:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)]",
  );

  const railClass = cx(
    eyebrowMutedClass,
    "bg-subtle/60 px-4 py-3.5 leading-snug max-sm:hidden sm:col-start-1",
  );

  const sayClass = "px-4 pt-3.5 pb-1.5 sm:row-start-1 sm:border-b sm:px-5 sm:pb-3.5";

  const whenClass = cx(
    "m-0 px-4 pb-3.5 text-[0.95rem] leading-snug text-pretty text-slate-700",
    "sm:row-start-2 sm:px-5 sm:pt-3",
  );

  const dividerClass = "border-slate-200/70";
</script>

<ol class="m-0 flex list-none flex-col gap-4 p-0">
  {#each pairs as pair, pairIndex (pair[0].slovak.text)}
    <li class={cardClass}>
      <span
        class={cx(railClass, "sm:row-start-1 sm:border-b", dividerClass)}
        aria-hidden="true"
      >
        You say…
      </span>

      <span class={cx(railClass, "sm:row-start-2")} aria-hidden="true">If…</span>

      {#each pair as choice, side (side)}
        {@const audioKey = `contrast-${pairIndex}-${side}`}

        <div
          class={cx(
            sayClass,
            sideColumn[side],
            dividerClass,
            side === 1 && "sm:border-l",
          )}
        >
          <div class="flex items-start gap-2.5">
            {#if audioKeys.includes(audioKey)}
              <span class="mt-0.5 inline-flex size-7 shrink-0" data-audio-mount={audioKey}
              ></span>
            {/if}

            <div class="min-w-0">
              <p class={cx(grammarFormClass, "m-0 text-lg")}>
                <MarkedText text={choice.slovak.text} marks={choice.slovak.marks} />
              </p>

              <p class={cx(grammarGlossClass, "m-0 mt-0.5")}>{choice.english}</p>
            </div>
          </div>
        </div>

        <p
          class={cx(
            whenClass,
            sideColumn[side],
            dividerClass,
            side === 0 && "max-sm:border-b",
            side === 1 && "sm:border-l",
          )}
        >
          <span class={cx(eyebrowMutedClass, "mr-1.5 inline sm:sr-only")}>If</span>
          {choice.when}
        </p>
      {/each}
    </li>
  {/each}
</ol>
