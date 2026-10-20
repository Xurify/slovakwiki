<script lang="ts">
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";

  import GrammarCueIcon from "$lib/components/reference/GrammarCueIcon.svelte";
  import GrammarRichText from "$lib/components/reference/GrammarRichText.svelte";
  import {
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import type {
    GrammarContrastSet,
    GrammarCue,
    GrammarSentence,
  } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    contrasts,
    audioKeys = [],
  }: {
    contrasts: GrammarContrastSet;
    /** `contrast-{pair}-{side}` / `contrast-form-{row}-{side}` keys with a recorded clip. */
    audioKeys?: string[];
  } = $props();

  const cueLabel: Record<GrammarCue, string> = {
    me: "near you",
    them: "near them",
    far: "over there",
    before: "in the past",
    now: "now",
    later: "later",
    own: "their own",
    other: "someone else's",
    friend: "a friend",
    formal: "formal / group",
  };

  const legendColumns: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
  };

  const sideClass = "border-slate-200/70 max-sm:border-t sm:border-l";
</script>

{#snippet spoken(sentence: GrammarSentence, audioKey: string, size: "lg" | "base")}
  <div class="flex items-start gap-2.5">
    {#if audioKeys.includes(audioKey)}
      <span class="mt-0.5 inline-flex size-7 shrink-0" data-audio-mount={audioKey}></span>
    {/if}

    <div class="min-w-0">
      <p class={cx(grammarFormClass, "m-0", size === "lg" ? "text-lg" : "text-base")}>
        <MarkedText text={sentence.slovak.text} marks={sentence.slovak.marks} />
      </p>

      <p class={cx(grammarGlossClass, "m-0 mt-0.5", size === "base" && "text-sm")}>
        {sentence.english}
      </p>
    </div>
  </div>
{/snippet}

{#if contrasts.legend}
  <ul
    class={cx(
      dataPanelClass,
      "m-0 grid list-none p-0",
      legendColumns[contrasts.legend.length],
    )}
  >
    {#each contrasts.legend as stop, index (stop.word)}
      <li
        class={cx("flex items-start gap-3 px-4 py-3.5 sm:px-5", index > 0 && sideClass)}
      >
        <span
          class="grid size-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-800"
        >
          <GrammarCueIcon cue={stop.cue} class="size-5" />
        </span>

        <span class="min-w-0">
          <span class="block font-serif text-lg font-semibold text-slate-900" lang="sk">
            {stop.word}
          </span>

          <span class="block text-sm leading-snug text-slate-600">{stop.note}</span>
        </span>
      </li>
    {/each}
  </ul>
{/if}

<ol class={cx(dataPanelClass, "m-0 list-none p-0", contrasts.legend && "mt-4")}>
  {#each contrasts.pairs as pair, pairIndex (pair.choices[0].slovak.text)}
    <li class="grid border-b border-slate-200 last:border-b-0 sm:grid-cols-2">
      {#each pair.choices as choice, side (side)}
        <div
          class={cx(
            "flex min-w-0 flex-col gap-2.5 px-4 py-4 sm:px-5",
            side === 1 && sideClass,
          )}
        >
          {#if choice.at}
            <span
              class="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"
            >
              <GrammarCueIcon cue={choice.at} class="size-3.5" />
              {cueLabel[choice.at]}
            </span>
          {/if}

          {@render spoken(choice, `contrast-${pairIndex}-${side}`, "lg")}

          <p class="m-0 text-sm leading-snug text-pretty text-slate-600">
            If <GrammarRichText text={choice.when} />.
          </p>
        </div>
      {/each}
    </li>
  {/each}
</ol>

{#if contrasts.forms}
  {@const forms = contrasts.forms}

  <h3 class="m-0 mt-6 font-serif text-lg text-slate-900">{forms.label}</h3>

  <div class={cx(dataPanelClass, "mt-3")}>
    <div
      class={cx(
        eyebrowMutedClass,
        "hidden border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:grid sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-5 sm:px-5",
      )}
      aria-hidden="true"
    >
      <span></span>
      <span>{forms.columns[0]}</span>
      <span>{forms.columns[1]}</span>
    </div>

    <ul class="m-0 list-none p-0">
      {#each forms.rows as row, rowIndex (row.label)}
        <li
          class="grid gap-x-5 gap-y-2 border-b border-slate-200/70 px-4 py-3 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)] sm:px-5"
        >
          <span class="text-sm leading-snug text-slate-500 sm:pt-1">{row.label}</span>

          {#each row.sentences as sentence, side (side)}
            {@render spoken(sentence, `contrast-form-${rowIndex}-${side}`, "base")}
          {/each}
        </li>
      {/each}
    </ul>
  </div>
{/if}
