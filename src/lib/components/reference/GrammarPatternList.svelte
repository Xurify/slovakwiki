<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import { ClockIllustration } from "$lib/learning/time";

  import {
    grammarEndingClass,
    grammarLeaderClass,
    grammarTokenClass,
    grammarTokenGlossClass,
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

  const tokenGridClass = "m-0 grid list-none grid-cols-3 gap-x-8 p-0 max-[520px]:gap-x-4";
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}<span class={grammarEndingClass}>{phrase.mark}</span>{phrase.after}
{/snippet}

{#if time}
  <ol class="m-0 list-none border-t border-slate-200 p-0" aria-label="Clock times">
    {#each time.rows as row (row.digital)}
      {@const ahead = namesHourAhead(row.minute)}

      <li
        class="grid grid-cols-[2.5rem_3.25rem_minmax(0,1fr)_auto] items-center gap-x-4 border-b border-slate-200 py-2.5 max-[480px]:grid-cols-[2.5rem_minmax(0,1fr)]"
      >
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

        <span
          class="min-w-0 font-serif text-[1.25rem] leading-snug text-slate-900"
          lang="sk"
        >
          {row.slovak}
        </span>

        {#if ahead}
          <span
            class="font-sans text-[0.64rem] font-bold tracking-[0.12em] text-emerald-800 uppercase max-[480px]:col-start-2"
          >
            Next hour
          </span>
        {/if}
      </li>
    {/each}
  </ol>

  {#if time.extras.length > 0}
    <div class="mt-10">
      <Eyebrow tone="muted" compact>Around the clock</Eyebrow>

      <ul class="m-0 list-none p-0">
        {#each time.extras as row (row.label)}
          <li class="flex items-baseline gap-2 py-1.5 max-[560px]:flex-wrap">
            <span class="shrink-0 text-[0.85rem] text-slate-500">{row.label}</span>

            <span class={cx(grammarLeaderClass, "max-[560px]:hidden")} aria-hidden="true"
            ></span>

            <span
              class="font-serif text-[1.02rem] text-slate-900 max-[560px]:w-full"
              lang="sk"
            >
              {row.phrases}
            </span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
{:else if view?.kind === "tiles"}
  <ol class={tokenGridClass}>
    {#each view.tiles as tile (tile.label)}
      <li class="grid content-start gap-3">
        <span class="font-sans text-[0.8rem] text-slate-500">
          {tile.label}
          <span class="font-serif font-semibold text-blue-800" lang="sk"
            >{tile.ending}</span
          >
        </span>

        {#if tile.example}
          <span class={grammarTokenClass} lang="sk">
            {@render marked(tile.example.slovak)}
          </span>

          <span class={grammarTokenGlossClass}>{tile.example.english}</span>
        {:else}
          <span class={cx(grammarTokenClass, "text-blue-800")} lang="sk">
            {tile.ending}
          </span>
        {/if}
      </li>
    {/each}
  </ol>
{:else if view?.kind === "paradigm"}
  <div class="grid gap-12">
    {#each [{ label: "Singular", cells: view.singular }, { label: "Plural", cells: view.plural }] as column (column.label)}
      <div>
        <Eyebrow tone="muted" compact>{column.label}</Eyebrow>

        <ol class={cx(tokenGridClass, "mt-4")}>
          {#each column.cells as cell (cell.pronoun)}
            <li class="grid content-start gap-2.5">
              <span class="font-serif text-[0.95rem] text-slate-500 italic" lang="sk">
                {cell.pronoun}
              </span>

              <span class={grammarTokenClass} lang="sk">
                {#if cell.stem && cell.ending}
                  {cell.stem}<span class={grammarEndingClass}>{cell.ending}</span>
                {:else}
                  {cell.form}
                {/if}
              </span>

              {#if cell.gloss}
                <span class={grammarTokenGlossClass}>{cell.gloss}</span>
              {/if}
            </li>
          {/each}
        </ol>
      </div>
    {/each}
  </div>
{:else if view?.kind === "rows"}
  <ul class="m-0 list-none p-0">
    {#each view.rows as row, index (index)}
      {@const prefix = addedPrefix(row)}
      {@const slovak = Boolean(row.gloss || prefix || row.label)}

      <li
        class="flex items-baseline gap-3 py-2.5 max-[560px]:flex-wrap max-[560px]:gap-y-1"
      >
        {#if row.label}
          <span class="shrink-0 text-[0.85rem] text-slate-500">{row.label}</span>

          <span class={cx(grammarLeaderClass, "max-[560px]:hidden")} aria-hidden="true"
          ></span>

          <span class="font-serif text-[1.3rem] text-slate-900" lang="sk">{row.main}</span
          >
        {:else}
          <span
            class="flex flex-wrap items-baseline gap-x-3 font-serif text-[clamp(1.2rem,2.6vw,1.5rem)] leading-snug tracking-[-0.02em] text-slate-900"
            lang={slovak ? "sk" : undefined}
          >
            <span class={cx(row.result ? "text-slate-500" : "font-semibold")}>
              {row.main}
            </span>

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
            <span class={cx(grammarLeaderClass, "max-[560px]:hidden")} aria-hidden="true"
            ></span>

            <span
              class="text-right text-[0.85rem] text-slate-500 max-[560px]:w-full max-[560px]:text-left"
            >
              {row.gloss}
            </span>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
{/if}
