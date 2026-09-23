<script lang="ts">
  import { ClockIllustration } from "$lib/learning/time";
  import { referenceCardClass } from "$lib/components/reference/reference-ui";
  import {
    looksSlovak,
    parsePatternLines,
    type PatternRow,
  } from "$lib/catalog/reference/grammar-pattern";
  import { cx } from "$lib/ui/classes";

  let {
    lines,
    withClocks = false,
  }: {
    lines: string[];
    /** Show mini clock faces for `HH:MM → …` rows (telling-time). */
    withClocks?: boolean;
  } = $props();

  const rows = $derived(parsePatternLines(lines, { withClocks }));
  const firstExtraIndex = $derived.by(() => {
    const firstTime = rows.findIndex((row) => row.kind === "time");
    if (firstTime < 0) return -1;
    return rows.findIndex((row, index) => index > firstTime && row.kind !== "time");
  });
  const showsEndings = $derived(
    rows.some((row) => row.kind === "person" && row.stem.length > 0),
  );

  function rowClass(row: PatternRow): string {
    return cx(
      "px-5 py-3",
      row.kind === "time" &&
        "grid grid-cols-[2.5rem_3.5rem_minmax(0,1fr)] items-center gap-x-3 border-l-2 max-[420px]:grid-cols-[2.5rem_minmax(0,1fr)] max-[420px]:gap-x-2.5",
      row.kind === "time" &&
        (row.lookingAhead
          ? "border-l-emerald-600 bg-emerald-50/40"
          : "border-l-transparent"),
      row.kind === "person" &&
        "grid grid-cols-[7.5rem_minmax(0,1fr)] items-baseline gap-x-4",
      (row.kind === "label" || row.kind === "gloss") &&
        "grid items-baseline gap-x-4 gap-y-0.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]",
      row.kind === "gloss" && "sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
    );
  }

  const slovakClass =
    "m-0 min-w-0 font-serif text-[1.05rem] leading-snug font-semibold text-slate-900";
</script>

<div class={referenceCardClass}>
  <ul class="m-0 list-none divide-y divide-slate-200/70 p-0">
    {#each rows as row, index (index)}
      {#if index === firstExtraIndex}
        <li class="bg-slate-50/70 px-5 pt-3 pb-2" aria-hidden="true">
          <span
            class="text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase"
          >
            Also
          </span>
        </li>
      {/if}

      <li class={rowClass(row)}>
        {#if row.kind === "time"}
          <ClockIllustration
            hour={row.hour}
            minute={row.minute}
            label={row.digital}
            size={36}
          />

          <span
            class="text-[0.8125rem] font-semibold tabular-nums text-slate-500 max-[420px]:col-start-2"
          >
            {row.digital}
          </span>

          <p
            class="{slovakClass} max-[420px]:col-span-2 max-[420px]:col-start-2"
            lang="sk"
          >
            {row.slovak}
          </p>
        {:else if row.kind === "person"}
          <span class="text-sm text-slate-500" lang="sk">{row.pronoun}</span>

          <p class={slovakClass} lang="sk">
            {#if row.stem && row.ending}
              {row.stem}<span class="rounded-[3px] bg-blue-100 px-px text-blue-800"
                >{row.ending}</span
              >
            {:else}
              {row.form}
            {/if}
          </p>
        {:else if row.kind === "change"}
          <p class="m-0 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span
              class="font-serif text-[1.05rem] leading-snug text-slate-600"
              lang={looksSlovak(row.from) ? "sk" : undefined}
            >
              {row.from}
            </span>

            <span class="text-slate-400" aria-hidden="true">→</span>
            <span class="sr-only">becomes</span>

            <span
              class="font-serif text-[1.05rem] leading-snug font-semibold text-slate-900"
              lang={looksSlovak(row.to) ? "sk" : undefined}
            >
              {row.to}
            </span>

            {#if row.gloss}
              <span class="basis-full text-sm text-slate-500 sm:ml-auto sm:basis-auto">
                {row.gloss}
              </span>
            {/if}
          </p>
        {:else if row.kind === "gloss"}
          <p class={slovakClass} lang="sk">{row.slovak}</p>
          <span class="text-sm leading-snug text-slate-500">{row.english}</span>
        {:else if row.kind === "label"}
          <span class="text-sm leading-snug text-slate-500">{row.label}</span>

          <p class={slovakClass} lang={looksSlovak(row.value) ? "sk" : undefined}>
            {row.value}
          </p>
        {:else}
          <p class="m-0 font-serif text-[1.05rem] leading-snug text-slate-800">
            {row.text}
          </p>
        {/if}
      </li>
    {/each}
  </ul>

  {#if showsEndings}
    <p
      class="m-0 border-t border-slate-200/70 bg-slate-50/70 px-5 py-2.5 text-xs text-slate-500"
    >
      The
      <span class="rounded-[3px] bg-blue-100 px-px font-semibold text-blue-800"
        >highlighted</span
      >
      letters are the ending — they change with the person.
    </p>
  {/if}

  {#if withClocks}
    <p
      class="m-0 border-t border-slate-200/70 bg-slate-50/70 px-5 py-2.5 text-xs text-slate-500"
    >
      <span
        class="mr-1.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-emerald-600"
        aria-hidden="true"
      ></span>
      Green edge: the phrase names the hour ahead.
    </p>
  {/if}
</div>
