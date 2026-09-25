<script lang="ts">
  import { ClockIllustration } from "$lib/learning/time";

  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import {
    addedPrefix,
    namesHourAhead,
    parsePattern,
    type MarkedPhrase,
    type ParadigmCell,
  } from "$lib/catalog/reference/grammar-pattern";
  import type { Example } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    lines,
    examples = [],
    withClocks = false,
  }: {
    lines: string[];
    /** Paired with ending tiles when there is one example per line. */
    examples?: Example[];
    /** Show mini clock faces for `HH:MM → …` rows (telling-time). */
    withClocks?: boolean;
  } = $props();

  type TimeRow = {
    digital: string;
    hour: number;
    minute: number;
    slovak: string;
  };

  type TimeExtra = { label: string; phrases: string };

  function splitTime(allLines: readonly string[]): {
    rows: TimeRow[];
    extras: TimeExtra[];
  } {
    const rows: TimeRow[] = [];
    const extras: TimeExtra[] = [];

    for (const line of allLines) {
      const [left = "", right = ""] = line.split("→").map((part) => part.trim());
      const time = /^(\d{1,2}):(\d{2})$/.exec(left);

      if (time) {
        rows.push({
          digital: left,
          hour: Number(time[1]),
          minute: Number(time[2]),
          slovak: right,
        });
      } else {
        extras.push({ label: left, phrases: right });
      }
    }

    return { rows, extras };
  }

  const view = $derived(withClocks ? undefined : parsePattern(lines, examples));
  const time = $derived(withClocks ? splitTime(lines) : undefined);

  const studyListClass = "m-0 list-none border-t border-slate-200 p-0";

  /** Fixed tracks so the meaning column lines up no matter how long the form is. */
  const paradigmTrack = "sm:grid-cols-[9.5rem_8rem_minmax(0,1fr)]";
  const tileTrack = "sm:grid-cols-[9.5rem_13rem_minmax(0,1fr)]";

  const studyRowClass =
    "grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200 py-2.5";

  const columnHeadClass =
    "hidden border-b border-slate-200 py-2 font-sans text-[0.64rem] font-bold tracking-[0.12em] text-slate-500 uppercase sm:grid sm:gap-x-6";
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}<span class={grammarEndingClass}>{phrase.mark}</span>{phrase.after}
{/snippet}

{#snippet formCell(cell: ParadigmCell)}
  <li class={cx(studyRowClass, paradigmTrack)}>
    <span class="text-sm text-slate-500" lang="sk">{cell.pronoun}</span>

    <span class={grammarFormClass} lang="sk">
      {#if cell.stem && cell.ending}
        {cell.stem}<span class={grammarEndingClass}>{cell.ending}</span>
      {:else}
        {cell.form}
      {/if}
    </span>

    {#if cell.gloss}
      <span class={grammarGlossClass}>{cell.gloss}</span>
    {/if}
  </li>
{/snippet}

{#if time}
  <ol class="m-0 list-none border-t border-slate-200 p-0" aria-label="Clock times">
    {#each time.rows as row (row.digital)}
      {@const ahead = namesHourAhead(row.minute)}

      <li
        class="grid grid-cols-[2.5rem_3.25rem_minmax(0,1fr)] items-center gap-x-3 border-b border-slate-200 py-2 max-[480px]:grid-cols-[2.5rem_minmax(0,1fr)]"
      >
        <ClockIllustration
          hour={row.hour}
          minute={row.minute}
          label={row.digital}
          size={36}
        />

        <span
          class="text-[0.8125rem] font-semibold text-slate-500 tabular-nums max-[480px]:hidden"
        >
          {row.digital}
        </span>

        <span class="min-w-0">
          <span class="font-serif text-lg leading-snug text-slate-900" lang="sk">
            {row.slovak}
          </span>

          {#if ahead}
            <span class="ml-2 text-xs text-emerald-800">names the next hour</span>
          {/if}
        </span>
      </li>
    {/each}
  </ol>

  {#if time.extras.length > 0}
    <ul class="m-0 mt-4 list-none border-t border-slate-200 p-0">
      {#each time.extras as row (row.label)}
        <li
          class="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-slate-200 py-2 max-[520px]:grid-cols-1"
        >
          <span class="text-sm text-slate-500">{row.label}</span>
          <span class="font-serif text-lg text-slate-900" lang="sk">{row.phrases}</span>
        </li>
      {/each}
    </ul>
  {/if}
{:else if view?.kind === "tiles"}
  <ul class={studyListClass}>
    <li class={cx(columnHeadClass, tileTrack)}>
      <span>Gender</span>
      <span>Example</span>
      <span>Meaning</span>
    </li>

    {#each view.tiles as tile (tile.label)}
      <li class={cx(studyRowClass, tileTrack)}>
        <span class="text-sm text-slate-500">{tile.label}</span>

        <span class={grammarFormClass} lang="sk">
          {#if tile.example}
            {@render marked(tile.example.slovak)}
          {:else}
            <span class={grammarEndingClass}>{tile.ending}</span>
          {/if}
        </span>

        {#if tile.example}
          <span class={grammarGlossClass}>{tile.example.english}</span>
        {/if}
      </li>
    {/each}
  </ul>
{:else if view?.kind === "paradigm"}
  <ul class={studyListClass}>
    <li class={cx(columnHeadClass, paradigmTrack)}>
      <span>Person</span>
      <span>Form</span>
      <span>Meaning</span>
    </li>

    {#each view.singular as cell (cell.pronoun)}
      {@render formCell(cell)}
    {/each}

    <li
      class="border-b border-slate-200 pt-5 pb-2 font-sans text-[0.64rem] font-bold tracking-[0.12em] text-slate-500 uppercase"
    >
      Plural
    </li>

    {#each view.plural as cell (cell.pronoun)}
      {@render formCell(cell)}
    {/each}
  </ul>
{:else if view?.kind === "rows"}
  <ul class="m-0 list-none border-t border-slate-200 p-0">
    {#each view.rows as row, index (index)}
      {@const prefix = addedPrefix(row)}

      <li
        class="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200 py-2.5 max-[520px]:grid-cols-1"
      >
        <span
          class={cx(grammarFormClass, "text-lg")}
          lang={row.gloss || prefix ? "sk" : undefined}
        >
          {#if row.label}
            <span class="mr-3 font-sans text-sm font-normal text-slate-500"
              >{row.label}</span
            >
          {/if}

          <span class={cx(row.result && "font-normal text-slate-500")}>{row.main}</span>

          {#if row.result}
            <span
              class="mx-2 font-sans text-base font-normal text-slate-400"
              aria-hidden="true"
            >
              →
            </span>
            <span class="font-semibold">
              {#if prefix}
                {@render marked(prefix)}
              {:else}
                {row.result}
              {/if}
            </span>
          {/if}
        </span>

        {#if row.gloss}
          <span class={grammarGlossClass}>{row.gloss}</span>
        {/if}
      </li>
    {/each}
  </ul>
{/if}
