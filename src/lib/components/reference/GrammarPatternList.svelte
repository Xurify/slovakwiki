<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { ClockIllustration } from "$lib/learning/time";

  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import {
    grammarEndingClass,
    grammarFormClass,
    grammarGlossClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import {
    addedPrefix,
    isGrammarTable,
    markedPhrase,
    namesHourAhead,
    patternForms,
    patternView,
    plainCell,
    type AspectCueScene,
    type MarkedPhrase,
    type ParadigmCell,
  } from "$lib/catalog/reference/grammar-pattern";
  import type { Example, GrammarPattern } from "$lib/catalog/types";
  import { dataColumnHeadClass, dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { cx } from "$lib/ui/classes";

  let {
    pattern,
    examples = [],
    audioKeys = [],
    audioKeyPrefix,
    withClocks = false,
  }: {
    pattern: GrammarPattern;
    examples?: Example[];
    audioKeys?: string[];
    audioKeyPrefix?: string;
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

  const examplesInTiles = $derived(
    view?.kind === "tiles" && view.tiles.every((tile) => tile.example),
  );

  // Short noun/verb phrases fit a multi-column cell grid; full sentences take
  // ruled rows so they do not wrap mid-clause or leave blank trailing cells.
  const phrases = $derived(
    view?.kind === "rows" &&
      view.rows.length >= 3 &&
      view.rows.every(
        (row) =>
          row.gloss &&
          !row.result &&
          !row.label &&
          plainCell(row.main).length <= 22 &&
          !/[.?!…]$/u.test(row.main),
      ),
  );
  const time = $derived(
    withClocks && !isGrammarTable(pattern) ? splitTime(pattern.lines) : undefined,
  );

  // The card belongs to the table. Examples read as sentences, so they follow
  // it on the page rather than inside the box.
  const hasTable = $derived(Boolean(time || view));
</script>

{#snippet marked(phrase: MarkedPhrase)}
  {phrase.before}{#if phrase.mark}<span
      class={cx(grammarEndingClass, "rounded-sm bg-mark/60 px-px")}>{phrase.mark}</span
    >{/if}{phrase.after}
{/snippet}

{#snippet aspectTimeline(scene: AspectCueScene)}
  <svg
    class="h-7 w-28 shrink-0 overflow-visible"
    viewBox="0 2 120 32"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 18h108" class="text-slate-300" />

    {#if scene === "now"}
      <path d="M60 5v26" class="text-slate-400" stroke-dasharray="2.5 2.5" />
      <path
        d="M22 18c4.75-6.5 9.5-6.5 14.25 0s9.5 6.5 14.25 0 9.5-6.5 14.25 0 9.5 6.5 14.25 0 9.5-6.5 14.25 0"
        class="text-blue-700"
        stroke-width="2.2"
      />
      <circle
        cx="60"
        cy="18"
        r="3"
        class="text-blue-700"
        fill="currentColor"
        stroke="none"
      />
    {:else if scene === "habit"}
      {#each [18, 39, 60, 81, 102] as x (x)}
        <circle
          cx={x}
          cy="18"
          r="3.6"
          class="text-blue-700"
          fill="currentColor"
          stroke="none"
        />
      {/each}
    {:else if scene === "span"}
      <path d="M20 9v18M100 9v18" class="text-blue-700" stroke-width="2" />
      <path
        d="M24 18c4.5-6 9-6 13.5 0s9 6 13.5 0 9-6 13.5 0 9 6 13.5 0 9-6 13.5 0"
        class="text-blue-700"
        stroke-width="2.2"
      />
    {:else if scene === "done"}
      <path d="M20 11v14" class="text-emerald-700" stroke-width="2" />
      <path d="M20 18h62" class="text-emerald-700" stroke-width="2.4" />
      <circle
        cx="90"
        cy="18"
        r="7.5"
        class="text-emerald-700"
        fill="currentColor"
        stroke="none"
      />
      <path d="M86.5 18l2.5 2.5 4.5-5" class="text-paper" stroke-width="2" />
    {:else if scene === "sequence"}
      <path
        d="M29 18h20M45.5 14.5L49 18l-3.5 3.5M69 18h20M85.5 14.5L89 18l-3.5 3.5"
        class="text-emerald-700"
        stroke-width="1.8"
      />
      {#each [20, 60, 100] as x (x)}
        <circle
          cx={x}
          cy="18"
          r="5"
          class="text-emerald-700"
          fill="currentColor"
          stroke="none"
        />
      {/each}
    {:else if scene === "interrupt"}
      <path
        d="M14 18c4.25-6.5 8.5-6.5 12.75 0s8.5 6.5 12.75 0 8.5-6.5 12.75 0 8.5 6.5 12.75 0 8.5-6.5 12.75 0"
        class="text-blue-700"
        stroke-width="2.2"
      />
      <circle
        cx="92"
        cy="18"
        r="7.5"
        class="text-emerald-700"
        fill="currentColor"
        stroke="none"
      />
      <path d="M88.5 18l2.5 2.5 4.5-5" class="text-paper" stroke-width="2" />
    {/if}
  </svg>
{/snippet}

{#snippet formCell(cell: ParadigmCell)}
  <li
    class={cx(
      "grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5",
      "sm:grid-cols-[7rem_8rem_minmax(0,1fr)]",
    )}
  >
    <span class="text-sm text-slate-500" lang="sk">{cell.pronoun}</span>

    <span class={grammarFormClass} lang="sk">
      {#if cell.stem && cell.ending}
        {cell.stem}<span class={cx(grammarEndingClass, "rounded-sm bg-mark/60 px-px")}
          >{cell.ending}</span
        >
      {:else}
        {cell.form}
      {/if}
    </span>

    {#if cell.gloss}
      <span class={grammarGlossClass}>{cell.gloss}</span>
    {/if}
  </li>
{/snippet}

<div class={cx(hasTable && dataPanelClass)}>
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
  {:else if view?.kind === "aspect"}
    <ol class="m-0 list-none p-0" aria-label={pattern.label}>
      {#each view.groups as group (group.aspect)}
        <li class="border-t border-slate-200 first:border-t-0">
          <div
            class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-200 bg-subtle/60 px-4 py-2.5 sm:px-5"
          >
            <p class="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span class="text-sm font-semibold text-slate-900">{group.title}</span>
              <span class="text-xs text-slate-500">— {group.summary}</span>
            </p>

            <span
              class={cx(
                "font-serif text-sm font-semibold",
                group.aspect === "imperfective" && "text-blue-800",
                group.aspect === "perfective" && "text-emerald-800",
                group.aspect === "both" && "text-slate-700",
              )}
              lang="sk"
            >
              {#if group.aspect === "both"}
                <span class="text-blue-800">nedokonavý</span>
                <span class="mx-1 font-sans font-normal text-slate-400">+</span>
                <span class="text-emerald-800">dokonavý vid</span>
              {:else}
                {group.slovakTerm}
              {/if}
            </span>
          </div>

          <ul class="m-0 list-none p-0">
            {#each group.items as item (item.slovak)}
              <li
                class="grid gap-x-5 gap-y-2 border-b border-slate-200/70 px-4 py-3.5 last:border-b-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-center sm:px-5"
              >
                <div class="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-1">
                  {@render aspectTimeline(item.scene)}
                  <span class="text-xs leading-snug font-medium text-slate-600">
                    {item.when}
                  </span>
                </div>

                <div class="min-w-0">
                  <div
                    class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5"
                  >
                    <p
                      class="m-0 font-serif text-lg leading-snug font-semibold text-slate-900"
                      lang="sk"
                    >
                      {#each item.segments as segment, segIndex (segIndex)}
                        {#if segment.marked}
                          {@const isPerfective =
                            item.aspect === "perfective" ||
                            (item.aspect === "both" && segment.markIndex >= 1)}
                          <span
                            class={cx(
                              "rounded-sm px-1 font-semibold",
                              isPerfective
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-mark/60 text-blue-800",
                            )}
                          >
                            {segment.text}
                          </span>
                        {:else}
                          {segment.text}
                        {/if}
                      {/each}
                    </p>

                    {#if item.lemma && item.aspect !== "both"}
                      <span class="font-serif text-sm text-slate-500" lang="sk">
                        {item.lemma}
                      </span>
                    {/if}
                  </div>

                  {#if item.english}
                    <p class="m-0 mt-0.5 text-[0.95rem] leading-snug text-slate-600">
                      {item.english}
                    </p>
                  {/if}

                  {#if item.aspect === "both" && item.lemma}
                    {@const markedForms = item.segments
                      .filter((segment) => segment.marked)
                      .map((segment) => segment.text)}
                    {@const lemmas = item.lemma.split(" → ").map((part) => part.trim())}
                    {#if markedForms.length >= 2 && lemmas.length >= 2}
                      <p
                        class="m-0 mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-xs leading-snug text-slate-600"
                      >
                        <span class="inline-flex items-baseline gap-1.5">
                          <span
                            class="rounded-sm bg-mark/60 px-1 font-serif text-sm font-semibold text-blue-800"
                            lang="sk"
                          >
                            {markedForms[0]}
                          </span>
                          <span>
                            background (<span
                              class="font-serif font-medium text-slate-700"
                              lang="sk">{lemmas[0]}</span
                            >, imperfective)
                          </span>
                        </span>
                        <span class="text-slate-400" aria-hidden="true">→</span>
                        <span class="inline-flex items-baseline gap-1.5">
                          <span
                            class="rounded-sm bg-emerald-50 px-1 font-serif text-sm font-semibold text-emerald-800"
                            lang="sk"
                          >
                            {markedForms[1]}
                          </span>
                          <span>
                            interrupting event (<span
                              class="font-serif font-medium text-slate-700"
                              lang="sk">{lemmas[1]}</span
                            >, perfective)
                          </span>
                        </span>
                      </p>
                    {/if}
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>
  {:else if view?.kind === "tiles"}
    <div>
      <div
        class={cx(dataColumnHeadClass, "gap-x-6 sm:grid-cols-[8rem_11rem_minmax(0,1fr)]")}
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
              "sm:grid-cols-[8rem_11rem_minmax(0,1fr)]",
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
    {@const colCount = view.columns.length}
    <div>
      <!-- A table that scrolls sideways takes focus, so a keyboard can scroll it (WCAG 2.1.1). -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <div class="overflow-x-auto" role="region" aria-label={pattern.label} tabindex="0">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-slate-200 bg-subtle/60">
              <th
                scope="col"
                class={cx(
                  eyebrowMutedClass,
                  "py-2.5 pr-6 pl-4 text-left align-bottom whitespace-nowrap max-sm:hidden sm:pr-8 sm:pl-5",
                  colCount === 2 && "sm:w-[30%]",
                  colCount === 3 && "sm:w-[28%]",
                )}
              >
                {view.rowLabel}
              </th>

              {#each view.columns as column, index (column)}
                {@const [head, note] = column.split(" · ")}

                <th
                  scope="col"
                  class={cx(
                    eyebrowMutedClass,
                    "py-2.5 pr-6 pl-0 text-left align-bottom whitespace-nowrap last:pr-4 sm:pr-8 sm:last:pr-5",
                    index === 0 && "max-sm:pl-4",
                    colCount === 2 && "sm:w-[35%]",
                    colCount === 3 && "sm:w-[24%]",
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
                  class="px-4 pt-2.5 pb-0.5 text-left text-xs leading-snug font-normal text-slate-500"
                >
                  {row.label}
                </th>
              </tr>

              <tr>
                <th
                  scope="row"
                  class="py-2.5 pr-6 pl-4 text-left align-baseline text-sm leading-snug font-normal whitespace-nowrap text-slate-600 max-sm:hidden sm:pr-8 sm:pl-5"
                >
                  {row.label}
                </th>

                {#each row.cells as cell, index (index)}
                  <td
                    class={cx(
                      "font-serif text-lg leading-snug font-semibold text-slate-900",
                      "py-2.5 pr-6 pl-0 align-baseline whitespace-nowrap last:pr-4 max-sm:pt-0 sm:pr-8 sm:last:pr-5",
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
        class={cx(dataColumnHeadClass, "gap-x-6 sm:grid-cols-[7rem_8rem_minmax(0,1fr)]")}
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
        <li class="border-r border-b border-slate-200/70 px-4 py-2 sm:px-5">
          <span class={cx(grammarFormClass, "block")} lang="sk"
            >{@render marked(markedPhrase(row.main))}</span
          >
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
            <span class={grammarFormClass} lang={row.gloss || prefix ? "sk" : undefined}>
              {#if row.label}
                <span class="mr-3 font-sans text-sm font-normal text-slate-500">
                  {row.label}
                </span>
              {/if}

              <span class={cx(row.result && "font-normal text-slate-500")}
                >{@render marked(markedPhrase(row.main))}</span
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

{#if examples.length > 0 && !examplesInTiles}
  <div class={cx(hasTable && "mt-6")}>
    <GrammarExampleList
      {examples}
      {audioKeys}
      {audioKeyPrefix}
      highlight={patternForms(pattern)}
      label="Examples"
    />
  </div>
{/if}
