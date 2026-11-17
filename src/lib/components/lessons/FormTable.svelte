<script lang="ts">
  import type { FormTableHeading, FormTableVisual } from "$lib/learning/types";
  import MarkedNote from "./MarkedNote.svelte";

  let {
    slots = 0,
    table,
    titled = true,
  }: {
    /** Form columns the widest table on the step has; this one takes its share of them. */
    slots?: number;
    table: FormTableVisual;
    /** False where the title is already shown, as on the toggle that opens the table. */
    titled?: boolean;
  } = $props();

  const edgeCellClass = "pr-2 pl-0 sm:pr-3";
  const cellPaddingClass = "px-2 sm:px-3";
</script>

{#snippet heading(label: FormTableHeading, stacked = false)}
  <span class="block">{label.english}</span>

  {#if stacked}
    <!-- A narrow column heading: the term and its example each on a line, not broken mid-phrase. -->
    {#if label.slovak}
      <span class="block font-normal text-slate-500" lang="sk">{label.slovak}</span>
    {/if}

    {#if label.example}
      <span class="block font-serif font-normal text-slate-500 italic" lang="sk">
        {label.example}
      </span>
    {/if}
  {:else if label.slovak || label.example}
    <span class="block font-normal text-slate-500">
      {#if label.slovak}
        <span lang="sk">{label.slovak}</span>
      {/if}

      {#if label.slovak && label.example}
        <span aria-hidden="true">·</span>
      {/if}

      {#if label.example}
        <span class="font-serif italic" lang="sk">{label.example}</span>
      {/if}
    </span>
  {/if}
{/snippet}

{#if table.columns.length === 1 && table.sections.every((section) => !section.heading)}
  <!-- One column of forms reads better as lines than as a table with an empty corner. -->
  <figure class="m-0">
    {#if titled}
    <figcaption class="pb-2">
      <h3 class="m-0 font-sans text-sm font-semibold tracking-normal text-slate-900">
        <MarkedNote text={table.title} />
      </h3>
    </figcaption>
    {/if}

    {#if table.columns[0]}
      <p class="m-0 pb-2 text-sm text-slate-600">
        {table.columns[0].english}{#if table.columns[0].slovak}:
          <span class="font-serif text-slate-900" lang="sk">{table.columns[0].slovak}</span
          >{/if}
      </p>
    {/if}

    <ul class="m-0 list-none border-y border-slate-200 p-0">
      {#each table.sections.flatMap((section) => section.rows) as row (row.heading.english)}
        <li
          class="flex items-baseline gap-4 border-b border-slate-200/70 py-2.5 last:border-b-0"
        >
          <span class="w-16 shrink-0 font-serif text-lg text-slate-900" lang="sk">
            <MarkedNote text={row.cells[0] ?? ""} />
          </span>

          <span class="min-w-0 text-sm leading-snug">
            <span class="font-semibold text-slate-800">{row.heading.english}</span>

            {#if row.heading.slovak}
              <span class="text-slate-500" lang="sk"> · {row.heading.slovak}</span>
            {/if}

            {#if row.heading.example}
              <span class="font-serif text-slate-500 italic" lang="sk">
                · {row.heading.example}</span
              >
            {/if}
          </span>
        </li>
      {/each}
    </ul>

    {#if table.note}
      <p class="m-0 pt-3 text-sm leading-relaxed text-pretty text-slate-600">
        <MarkedNote text={table.note} />
      </p>
    {/if}
  </figure>
{:else}
<figure
  class="m-0 sm:w-(--table-width)"
  style:--table-width="calc(14rem + (100% - 14rem) * {table.columns.length} / {Math.max(slots, table.columns.length)})"
>
  {#if titled}
  <figcaption class="pb-2">
    <h3 class="m-0 font-sans text-sm font-semibold tracking-normal text-slate-900">
      <MarkedNote text={table.title} />
    </h3>
  </figcaption>
  {/if}

  <div class="overflow-x-auto">
    <!-- Fixed columns, so stacked tables on one step line their forms up. -->
    <table class="w-full border-collapse text-left text-sm sm:table-fixed">
      <thead>
        <tr class="border-b border-slate-200">
          <td class="{edgeCellClass} w-56 max-sm:hidden"></td>

          {#each table.columns as column, columnIndex (column.english)}
            <th
              scope="col"
              class={[
                cellPaddingClass,
                columnIndex === 0 && "max-sm:pl-0",
                "min-w-20 pb-2.5 align-top text-xs leading-snug font-semibold text-balance text-slate-700",
              ]}
            >
              {@render heading(column, true)}
            </th>
          {/each}
        </tr>
      </thead>

      {#each table.sections as section, sectionIndex (sectionIndex)}
        <tbody>
          {#if section.heading}
            <tr class="border-b border-slate-200">
              <th
                scope="colgroup"
                colspan={table.columns.length + 1}
                class="{edgeCellClass} pt-5 pb-1.5 text-xs font-semibold text-slate-700"
              >
                {section.heading.english}

                {#if section.heading.slovak}
                  <span class="font-normal text-slate-500" lang="sk">
                    · {section.heading.slovak}
                  </span>
                {/if}
              </th>
            </tr>
          {/if}

          {#each section.rows as row (row.heading.english)}
            <!-- On a phone the row's label goes above its forms, so the forms get the width and the label is not squeezed to a word a line. -->
            <tr class="sm:hidden">
              <th
                scope="row"
                colspan={table.columns.length}
                class="pt-3 text-xs leading-snug font-semibold text-slate-700"
              >
                {row.heading.english}
                {#if row.heading.slovak}
                  <span class="font-normal text-slate-500" lang="sk">· {row.heading.slovak}</span>
                {/if}
                {#if row.heading.example}
                  <span class="font-serif font-normal text-slate-500 italic" lang="sk"
                    >· {row.heading.example}</span
                  >
                {/if}
              </th>
            </tr>

            <tr class="border-b border-slate-200/70 last:border-b-0">
              <th
                scope="row"
                class="{edgeCellClass} py-2.5 text-xs leading-snug font-semibold text-slate-700 max-sm:hidden"
              >
                {@render heading(row.heading)}
              </th>

              {#each row.cells as cell, cellIndex (cellIndex)}
                <td
                  class={[
                    cellPaddingClass,
                    "py-2.5 font-serif text-base whitespace-nowrap text-slate-900 max-sm:pt-1 max-sm:first-of-type:pl-0",
                    cellIndex === row.cells.length - 1 && "pr-0",
                  ]}
                  lang="sk"
                >
                  <MarkedNote text={cell} />
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  </div>

  {#if table.note}
    <p
      class="m-0 border-t border-slate-200 pt-3 text-sm leading-relaxed text-pretty text-slate-600"
    >
      <MarkedNote text={table.note} />
    </p>
  {/if}
</figure>
{/if}
