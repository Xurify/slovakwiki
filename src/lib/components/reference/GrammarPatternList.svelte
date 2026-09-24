<script lang="ts">
  import { ClockIllustration } from "$lib/learning/time";

  import {
    grammarCardClass,
    grammarEndingClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { namesHourAhead, parsePattern } from "$lib/catalog/reference/grammar-pattern";
  import { cx } from "$lib/ui/classes";

  let {
    lines,
    withClocks = false,
  }: {
    lines: string[];
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

  const view = $derived(withClocks ? undefined : parsePattern(lines));
  const time = $derived(withClocks ? splitTime(lines) : undefined);

  const timeRowClass =
    "grid grid-cols-[2.5rem_3.25rem_minmax(0,1fr)] items-center gap-x-3 px-4 py-2.5 max-[420px]:grid-cols-[2.5rem_minmax(0,1fr)]";
</script>

{#if time}
  <div class={grammarCardClass}>
    <ul class={grammarRowsClass} aria-label="Clock times">
      {#each time.rows as row (row.digital)}
        {@const ahead = namesHourAhead(row.minute)}

        <li class={cx(timeRowClass, ahead && "bg-emerald-50/60")}>
          <ClockIllustration
            hour={row.hour}
            minute={row.minute}
            label={row.digital}
            size={36}
          />

          <span
            class="font-sans text-[0.8125rem] font-semibold text-slate-500 tabular-nums max-[420px]:hidden"
          >
            {row.digital}
          </span>

          <span class="min-w-0">
            <span
              class="block font-serif text-[1.05rem] leading-snug text-slate-900"
              lang="sk"
            >
              {row.slovak}
            </span>

            {#if ahead}
              <span class="mt-0.5 block text-xs text-emerald-800">
                Names the next hour
              </span>
            {/if}
          </span>
        </li>
      {/each}
    </ul>

    {#if time.extras.length > 0}
      <div class="border-t border-slate-200/70 bg-slate-50/60 px-4 pt-3 pb-1">
        <p class={grammarEyebrowClass}>Around the clock</p>
      </div>

      <ul class={cx(grammarRowsClass, "bg-slate-50/60")}>
        {#each time.extras as row (row.label)}
          <li
            class="grid grid-cols-[9rem_minmax(0,1fr)] items-baseline gap-x-4 px-4 py-2.5 max-[480px]:grid-cols-1 max-[480px]:gap-y-0.5"
          >
            <span class="text-sm text-slate-500">{row.label}</span>

            <span class="font-serif leading-snug text-slate-900" lang="sk">
              {row.phrases}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{:else if view?.kind === "paradigm"}
  <div class={grammarCardClass}>
    <div class="grid grid-cols-2 divide-x divide-slate-200/70">
      {#each [{ label: "Singular", cells: view.singular }, { label: "Plural", cells: view.plural }] as column (column.label)}
        <div class="min-w-0">
          <p class={cx(grammarEyebrowClass, "border-b border-slate-200/70 px-4 py-2.5")}>
            {column.label}
          </p>

          <ul class={grammarRowsClass}>
            {#each column.cells as cell (cell.pronoun)}
              <li class="flex flex-wrap items-baseline gap-x-2.5 px-4 py-3" lang="sk">
                <span class="text-sm text-slate-500">{cell.pronoun}</span>

                <span class="font-serif text-lg leading-snug text-slate-900">
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
  </div>
{:else if view?.kind === "rows"}
  <ul class={cx(grammarCardClass, grammarRowsClass)}>
    {#each view.rows as row, index (index)}
      <li
        class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 px-4 py-3"
      >
        {#if row.label}
          <span class="text-sm text-slate-600">{row.label}</span>

          <span class="font-serif text-lg font-semibold text-slate-900" lang="sk">
            {row.main}
          </span>
        {:else}
          <span
            class="flex min-w-0 flex-wrap items-baseline gap-x-2 font-serif text-[1.05rem] leading-snug text-slate-900"
            lang={row.gloss ? "sk" : undefined}
          >
            <span>{row.main}</span>

            {#if row.result}
              <span class="font-sans text-slate-400" aria-hidden="true">→</span>

              <span class="font-semibold">{row.result}</span>
            {/if}
          </span>

          {#if row.gloss}
            <span class="text-sm text-slate-500">{row.gloss}</span>
          {/if}
        {/if}
      </li>
    {/each}
  </ul>
{/if}
