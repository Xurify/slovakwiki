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

  const phrases = $derived(
    view?.kind === "rows" &&
      view.rows.every((row) => row.gloss && !row.result && !row.label),
  );
  const time = $derived(
    withClocks && !isGrammarTable(pattern) ? splitTime(pattern.lines) : undefined,
  );
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}<span class={grammarEndingClass}>{phrase.mark}</span>{phrase.after}
{/snippet}

{#snippet formCell(cell: ParadigmCell)}
  <li
    class={cx(
      "grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5",
      "sm:grid-cols-[9.5rem_8rem_minmax(0,1fr)]",
    )}
  >
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

<div class={dataPanelClass}>
  {#if time}
    <div>
      <ol class="m-0 list-none p-0" aria-label="Clock times">
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
        <ul class="m-0 list-none p-0">
          <li
            class={cx(
              eyebrowMutedClass,
              "border-b border-slate-200 bg-subtle/60 px-4 pt-3 pb-1.5 sm:px-5",
            )}
          >
            Also
          </li>

          {#each time.extras as row (row.label)}
            <li
              class="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-slate-200/70 px-4 py-2 last:border-b-0 sm:px-5 max-[520px]:grid-cols-1"
            >
              <span class="text-sm text-slate-500">{row.label}</span>
              <span class="font-serif text-lg text-slate-900" lang="sk"
                >{row.phrases}</span
              >
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else if view?.kind === "tiles"}
    <div>
      <div
        class={cx(
          dataColumnHeadClass,
          "gap-x-6 sm:grid-cols-[9.5rem_13rem_minmax(0,1fr)]",
        )}
        aria-hidden="true"
      >
        <span>Gender</span>
        <span>Example</span>
        <span>Meaning</span>
      </div>

      <ul class="m-0 list-none p-0">
        {#each view.tiles as tile (tile.label)}
          <li
            class={cx(
              "grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5",
              "sm:grid-cols-[9.5rem_13rem_minmax(0,1fr)]",
            )}
          >
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
    <div>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-subtle/60">
              <td class="py-2.5 pr-3 pl-4 text-left max-sm:hidden sm:pl-5"></td>

              {#each view.columns as column, index (column)}
                {@const [head, note] = column.split(" · ")}

                <th
                  scope="col"
                  class={cx(
                    eyebrowMutedClass,
                    "px-3 py-2 text-left align-bottom last:pr-4 sm:last:pr-5",
                    view.columns.length > 3 && "max-sm:w-1/4 sm:w-1/6",
                    view.columns.length === 3 && "max-sm:w-1/3 sm:w-1/4",
                    view.columns.length === 2 && "max-sm:w-1/2 sm:w-[38%]",
                    index === 0 && "max-sm:pl-4",
                  )}
                >
                  {#if note}
                    <span
                      class="block font-serif text-lg leading-snug font-semibold text-slate-900"
                      lang="sk"
                    >
                      {head}
                    </span>
                    <span class="block text-xs font-normal text-slate-500">
                      {note}
                    </span>
                  {:else}
                    {column}
                  {/if}
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
                  class="px-4 pt-2.5 pb-0 text-left text-[0.8125rem] leading-snug font-normal text-slate-500"
                >
                  {row.label}
                </th>
              </tr>

              <tr>
                <th
                  scope="row"
                  class="py-2.5 pr-3 pl-4 text-left align-baseline text-[0.95rem] leading-snug font-normal text-slate-600 max-sm:hidden sm:pl-5"
                >
                  {row.label}
                </th>

                {#each row.cells as cell, index (index)}
                  <td
                    class={cx(
                      grammarFormClass,
                      "px-3 py-2.5 align-baseline whitespace-nowrap last:pr-4 max-sm:pt-0.5 sm:last:pr-5",
                      index === 0 && "max-sm:pl-4",
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
    <div>
      <div
        class={cx(
          dataColumnHeadClass,
          "gap-x-6 sm:grid-cols-[9.5rem_8rem_minmax(0,1fr)]",
        )}
        aria-hidden="true"
      >
        <span>Person</span>
        <span>Form</span>
        <span>Meaning</span>
      </div>

      <ul class="m-0 list-none p-0">
        <li
          class={cx(
            eyebrowMutedClass,
            "border-b border-slate-200 bg-subtle/60 px-4 pt-3 pb-1.5 sm:px-5",
          )}
        >
          Singular
        </li>

        {#each view.singular as cell (cell.pronoun)}
          {@render formCell(cell)}
        {/each}

        <li
          class={cx(
            eyebrowMutedClass,
            "border-b border-slate-200 bg-subtle/60 px-4 pt-3 pb-1.5 sm:px-5",
          )}
        >
          Plural
        </li>

        {#each view.plural as cell (cell.pronoun)}
          {@render formCell(cell)}
        {/each}
      </ul>
    </div>
  {:else if view?.kind === "rows" && phrases}
    <ul
      class="m-0 -mr-px -mb-px grid list-none grid-cols-2 p-0 sm:grid-cols-3"
      aria-label={pattern.label}
    >
      {#each view.rows as row, index (index)}
        <li class="border-r border-b border-slate-200/70 px-4 py-3 sm:px-5">
          <span class={cx(grammarFormClass, "block text-lg")} lang="sk">{row.main}</span>
          <span class="mt-0.5 block text-sm leading-snug text-slate-500">{row.gloss}</span
          >
        </li>
      {/each}
    </ul>
  {:else if view?.kind === "rows"}
    <div>
      <ul class="m-0 list-none p-0">
        {#each view.rows as row, index (index)}
          {@const prefix = addedPrefix(row)}

          <li
            class={cx(
              "grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5",
              "sm:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]",
            )}
          >
            <span
              class={cx(grammarFormClass, "text-lg")}
              lang={row.gloss || prefix ? "sk" : undefined}
            >
              {#if row.label}
                <span class="mr-3 font-sans text-sm font-normal text-slate-500">
                  {row.label}
                </span>
              {/if}

              <span class={cx(row.result && "font-normal text-slate-500")}
                >{row.main}</span
              >

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
</div>
