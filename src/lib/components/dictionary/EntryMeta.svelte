<script lang="ts">
  import { eyebrowClass } from "$lib/components/ui/system-ui";
  import { FREQUENCY_PART_OF_SPEECH_LABEL } from "$lib/catalog/frequency/types";
  import {
    DIALECT_CHIP_LABEL,
    REGISTER_CHIP_LABEL,
    nounGenderLabel,
    type ContentEntry,
  } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  /** The line under a headword: word class, gender, plural, frequency, register. */
  let {
    entry,
    plural,
    showCategory = true,
    class: className = "",
  }: {
    entry: ContentEntry;
    plural?: string;
    /** Off when a sense heading already names the word class. */
    showCategory?: boolean;
    class?: string;
  } = $props();

  const category = $derived(
    (entry.category === "Nouns"
      ? "noun"
      : entry.category.replace(/s$/, "")
    ).toLowerCase(),
  );

  const gender = $derived(
    entry.gender ? nounGenderLabel(entry.gender, entry.pluralOnlyGender) : undefined,
  );

  // Longman-style frequency dots: three for the top 500 of a word class.
  const frequencyDots = $derived(
    entry.frequency
      ? entry.frequency.rank <= 500
        ? 3
        : entry.frequency.rank <= 2000
          ? 2
          : 1
      : 0,
  );

  const chipClass = `${eyebrowClass} inline-flex items-center rounded-(--control-radius) bg-subtle px-1.5 py-0.5 text-slate-600`;
</script>

<p
  class={cx(
    "m-0 flex flex-wrap items-baseline gap-x-3 gap-y-1.5 text-sm text-slate-700",
    className,
  )}
>
  {#if showCategory}
    <span class="font-semibold text-slate-900 italic">{category}</span>
  {/if}

  {#if gender}
    <a
      class="text-slate-700 underline decoration-slate-300 decoration-dotted underline-offset-4 hover:text-slate-900 hover:decoration-slate-500"
      href="/grammar/grammatical-gender"
      title={`In Slovak: ${gender.slovak}`}
    >
      {gender.english}
    </a>
  {/if}

  {#if plural}
    <span>
      plural
      <span class="font-serif text-base font-semibold text-slate-900" lang="sk"
        >{plural}</span
      >
    </span>
  {/if}

  {#if entry.frequency}
    <a
      class="inline-flex items-center gap-1.5 text-slate-700 no-underline hover:text-slate-900"
      href={`/dictionary/common/${entry.frequency.partOfSpeech}`}
      title="Frequency in the Slovak National Corpus: ●●● top 500, ●●○ top 2,000, ●○○ less common"
    >
      <span class="inline-flex gap-0.5" aria-hidden="true">
        {#each [1, 2, 3] as dot (dot)}
          <span
            class={cx(
              "size-2 rounded-full",
              dot <= frequencyDots ? "bg-blue-600" : "border border-slate-300",
            )}
          ></span>
        {/each}
      </span>
      <span class="underline decoration-slate-300 decoration-dotted underline-offset-4">
        #{entry.frequency.rank} among {FREQUENCY_PART_OF_SPEECH_LABEL[
          entry.frequency.partOfSpeech
        ].toLowerCase()}
      </span>
    </a>
  {/if}

  {#if entry.register}
    <span class={chipClass}>{REGISTER_CHIP_LABEL[entry.register]}</span>
  {/if}

  {#if entry.dialect}
    <span class={chipClass}>{DIALECT_CHIP_LABEL}</span>
  {/if}
</p>
