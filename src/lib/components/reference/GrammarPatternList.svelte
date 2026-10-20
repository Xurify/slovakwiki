<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { ClockIllustration } from "$lib/learning/time";

  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import {
    addedPrefix,
    isGrammarTable,
    namesHourAhead,
    patternView,
    type MarkedPhrase,
    type ParadigmCell,
  } from "$lib/catalog/reference/grammar-pattern";
  import type { Example, GrammarPattern } from "$lib/catalog/types";
  import { dataColumnHeadClass, dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { cx } from "$lib/ui/classes";

  let {
    pattern,
    examples = [],
    withClocks = false,
  }: {
    pattern: GrammarPattern;
    examples?: Example[];
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

  const view = $derived(withClocks ? undefined : patternView(pattern, examples));
  const time = $derived(
    withClocks && !isGrammarTable(pattern) ? splitTime(pattern.lines) : undefined,
  );

  // Same card as the lessons FormTable and the dictionary FormsTable.
  const listClass = "m-0 list-none p-0";

  /** Fixed tracks so the meaning column lines up no matter how long the form is. */
  const paradigmTrack = "gap-x-6 sm:grid-cols-[9.5rem_8rem_minmax(0,1fr)]";
  const tileTrack = "gap-x-6 sm:grid-cols-[9.5rem_13rem_minmax(0,1fr)]";

  const rowClass =
    "grid grid-cols-1 items-baseline gap-y-0.5 border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5";

  const subheadClass = `${eyebrowMutedClass} border-b border-slate-200 bg-subtle/60 px-4 pt-3 pb-1.5 sm:px-5`;

  const gridLabelCellClass = "py-2.5 pr-3 pl-4 text-left sm:pl-5";
  const gridFormCellClass = "px-3 py-2.5 align-baseline last:pr-4 sm:last:pr-5";
  /** Below sm the label sits on its own line, so the first form column takes the card's edge padding. */
  const gridLeadCellClass = "max-sm:pl-4";
  const gridRowLabelClass =
    "align-baseline text-sm leading-snug font-normal text-slate-500 max-sm:hidden";
  const gridMobileLabelClass =
    "px-4 pt-2.5 pb-0 text-left text-[0.8125rem] leading-snug font-normal text-slate-500";
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}<span class={grammarEndingClass}>{phrase.mark}</span>{phrase.after}
{/snippet}

{#snippet formCell(cell: ParadigmCell)}
  <li class={cx(rowClass, paradigmTrack)}>
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
  <div class={dataPanelClass}>
    <ol class={listClass} aria-label="Clock times">
      {#each time.rows as row (row.digital)}
        {@const ahead = namesHourAhead(row.minute)}

        <li
          class="grid grid-cols-[2.5rem_3.25rem_minmax(0,1fr)] items-center gap-x-3 border-b border-slate-200/70 px-4 py-2 last:border-b-0 sm:px-5 max-[480px]:grid-cols-[2.5rem_minmax(0,1fr)]"
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
      <ul class={listClass}>
        <li class={subheadClass}>Also</li>

        {#each time.extras as row (row.label)}
          <li
            class="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-slate-200/70 px-4 py-2 last:border-b-0 sm:px-5 max-[520px]:grid-cols-1"
          >
            <span class="text-sm text-slate-500">{row.label}</span>
            <span class="font-serif text-lg text-slate-900" lang="sk">{row.phrases}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{:else if view?.kind === "tiles"}
  <div class={dataPanelClass}>
    <div class={cx(dataColumnHeadClass, tileTrack)} aria-hidden="true">
      <span>Gender</span>
      <span>Example</span>
      <span>Meaning</span>
    </div>

    <ul class={listClass}>
      {#each view.tiles as tile (tile.label)}
        <li class={cx(rowClass, tileTrack)}>
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
  </div>
{:else if view?.kind === "grid"}
  <div class={dataPanelClass}>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
          <tr class="border-b border-slate-200 bg-subtle/60">
            <td class={cx(gridLabelCellClass, "max-sm:hidden")}></td>

            {#each view.columns as column, index (column)}
              <th
                scope="col"
                class={cx(
                  eyebrowMutedClass,
                  gridFormCellClass,
                  "py-2 text-left align-bottom",
                  view.columns.length > 3
                    ? "max-sm:w-1/4 sm:w-1/6"
                    : "max-sm:w-1/3 sm:w-1/4",
                  index === 0 && gridLeadCellClass,
                )}
              >
                {column}
              </th>
            {/each}
          </tr>
        </thead>

        {#each view.rows as row (row.label)}
          <tbody class="border-b border-slate-200/70 last:border-b-0">
            <tr class="sm:hidden">
              <th
                scope="rowgroup"
                colspan={view.columns.length}
                class={gridMobileLabelClass}
              >
                {row.label}
              </th>
            </tr>

            <tr>
              <th scope="row" class={cx(gridLabelCellClass, gridRowLabelClass)}>
                {row.label}
              </th>

              {#each row.cells as cell, index (index)}
                <td
                  class={cx(
                    grammarFormClass,
                    gridFormCellClass,
                    "whitespace-nowrap max-sm:pt-0.5",
                    index === 0 && gridLeadCellClass,
                  )}
                  lang="sk"
                >
                  {@render marked(cell)}
                </td>
              {/each}
            </tr>
          </tbody>
        {/each}
      </table>
    </div>
  </div>
{:else if view?.kind === "paradigm"}
  <div class={dataPanelClass}>
    <div class={cx(dataColumnHeadClass, paradigmTrack)} aria-hidden="true">
      <span>Person</span>
      <span>Form</span>
      <span>Meaning</span>
    </div>

    <ul class={listClass}>
      <li class={subheadClass}>Singular</li>

      {#each view.singular as cell (cell.pronoun)}
        {@render formCell(cell)}
      {/each}

      <li class={subheadClass}>Plural</li>

      {#each view.plural as cell (cell.pronoun)}
        {@render formCell(cell)}
      {/each}
    </ul>
  </div>
{:else if view?.kind === "rows"}
  <div class={dataPanelClass}>
    <ul class={listClass}>
      {#each view.rows as row, index (index)}
        {@const prefix = addedPrefix(row)}

        <li class={cx(rowClass, "gap-x-6 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]")}>
          <span
            class={cx(grammarFormClass, "text-lg")}
            lang={row.gloss || prefix ? "sk" : undefined}
          >
            {#if row.label}
              <span class="mr-3 font-sans text-sm font-normal text-slate-500">
                {row.label}
              </span>
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
  </div>
{/if}
