<script lang="ts">
  import { ClockIllustration } from "$lib/learning/time";

  import {
    grammarEndingClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import {
    addedPrefix,
    namesHourAhead,
    parsePattern,
    type MarkedPhrase,
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

  const timeRowClass =
    "grid grid-cols-[2.75rem_3.25rem_minmax(0,1fr)] items-center gap-x-3 px-6 py-3 max-[480px]:grid-cols-[2.75rem_minmax(0,1fr)] max-[480px]:px-4";
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}<span class={grammarEndingClass}>{phrase.mark}</span>{phrase.after}
{/snippet}

{#if time}
  <ul class={grammarRowsClass} aria-label="Clock times">
    {#each time.rows as row (row.digital)}
      {@const ahead = namesHourAhead(row.minute)}

      <li class={cx(timeRowClass, ahead && "bg-emerald-50/60")}>
        <ClockIllustration
          hour={row.hour}
          minute={row.minute}
          label={row.digital}
          size={40}
        />

        <span
          class="font-sans text-[0.8125rem] font-semibold text-slate-500 tabular-nums max-[480px]:hidden"
        >
          {row.digital}
        </span>

        <span class="min-w-0">
          <span class="block font-serif text-lg leading-snug text-slate-900" lang="sk">
            {row.slovak}
          </span>

          {#if ahead}
            <span class="mt-0.5 block text-xs text-emerald-800">Names the next hour</span>
          {/if}
        </span>
      </li>
    {/each}
  </ul>

  {#if time.extras.length > 0}
    <div
      class="border-t border-slate-200/70 bg-subtle/50 px-6 pt-4 pb-1 max-[480px]:px-4"
    >
      <p class={grammarEyebrowClass}>Around the clock</p>
    </div>

    <ul class={cx(grammarRowsClass, "bg-subtle/50")}>
      {#each time.extras as row (row.label)}
        <li
          class="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-x-4 px-6 py-2.5 max-[480px]:grid-cols-1 max-[480px]:gap-y-0.5 max-[480px]:px-4"
        >
          <span class="text-sm text-slate-500">{row.label}</span>

          <span class="font-serif leading-snug text-slate-900" lang="sk">
            {row.phrases}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
{:else if view?.kind === "tiles"}
  <ul class="m-0 grid list-none grid-cols-3 divide-x divide-slate-200/70 p-0">
    {#each view.tiles as tile (tile.label)}
      <li
        class="flex min-w-0 flex-col items-center px-5 pt-6 pb-5 text-center max-sm:px-2 max-sm:pt-5"
      >
        <span class={grammarEyebrowClass}>{tile.label}</span>

        <span
          class="mt-2 font-serif text-4xl leading-none font-semibold text-blue-800 sm:text-5xl"
          lang="sk"
        >
          {tile.ending}
        </span>

        {#if tile.example}
          <span
            class="mt-5 font-serif text-base leading-snug text-slate-900 sm:text-xl"
            lang="sk"
          >
            {@render marked(tile.example.slovak)}
          </span>

          <span class="mt-1 text-xs text-slate-500 sm:text-sm"
            >{tile.example.english}</span
          >
        {/if}
      </li>
    {/each}
  </ul>
{:else if view?.kind === "paradigm"}
  <div class="grid grid-cols-2 divide-x divide-slate-200/70">
    {#each [{ label: "Singular", cells: view.singular }, { label: "Plural", cells: view.plural }] as column (column.label)}
      <div class="min-w-0">
        <p class={cx(grammarEyebrowClass, "px-6 pt-4 pb-1 max-[480px]:px-4")}>
          {column.label}
        </p>

        <ul class="m-0 list-none p-0 pb-3">
          {#each column.cells as cell (cell.pronoun)}
            <li
              class="flex flex-wrap items-baseline gap-x-3 px-6 py-2 max-[480px]:px-4"
              lang="sk"
            >
              <span class="w-14 shrink-0 text-sm text-slate-500 max-[480px]:w-auto">
                {cell.pronoun}
              </span>

              <span class="font-serif text-2xl leading-snug text-slate-900">
                {#if cell.stem && cell.ending}
                  {cell.stem}<span class={grammarEndingClass}>{cell.ending}</span>
                {:else}
                  {cell.form}
                {/if}
              </span>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
{:else if view?.kind === "rows"}
  <ul class={grammarRowsClass}>
    {#each view.rows as row, index (index)}
      {@const prefix = addedPrefix(row)}

      <li class="px-6 py-4 max-[480px]:px-4">
        {#if row.label}
          <span class="block text-sm text-slate-500">{row.label}</span>

          <span class="mt-0.5 block font-serif text-xl text-slate-900" lang="sk">
            {row.main}
          </span>
        {:else}
          <span
            class="flex flex-wrap items-baseline gap-x-3 font-serif text-xl leading-snug text-slate-900"
            lang={row.gloss || prefix ? "sk" : undefined}
          >
            <span class={cx(row.result && "text-slate-500")}>{row.main}</span>

            {#if row.result}
              <span class="font-sans text-base text-slate-400" aria-hidden="true">→</span>

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
            <span class="mt-1 block text-sm text-slate-500">{row.gloss}</span>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
{/if}
