<script lang="ts">
  import type { FormTableHeading, FormTableVisual } from "$lib/learning/types";
  import MarkedNote from "./MarkedNote.svelte";

  let { table }: { table: FormTableVisual } = $props();

  /** Row headings line up with the card padding (px-4 / sm:px-6). */
  const edgeCellClass = "pr-2 pl-4 sm:pr-3 sm:pl-6";
  const cellPaddingClass = "px-2 sm:px-3";
</script>

{#snippet heading(label: FormTableHeading)}
  <span class="block">{label.english}</span>

  {#if label.slovak}
    <span class="block font-normal text-slate-500" lang="sk">{label.slovak}</span>
  {/if}

  {#if label.example}
    <span
      class="mt-0.5 block font-serif text-sm font-normal text-slate-500 italic"
      lang="sk"
    >
      {label.example}
    </span>
  {/if}
{/snippet}

<figure
  class="m-0 overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)"
>
  <figcaption class="px-4 pt-4 pb-3 sm:px-6">
    <h3 class="m-0 font-sans text-sm font-semibold tracking-normal text-slate-900">
      <MarkedNote text={table.title} />
    </h3>
  </figcaption>

  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200">
          <td
            class={[
              edgeCellClass,
              table.columns.length === 2 && "sm:w-[30%]",
              table.columns.length === 3 && "sm:w-[28%]",
            ]}
          ></td>

          {#each table.columns as column (column.english)}
            <th
              scope="col"
              class={[
                cellPaddingClass,
                "pb-2.5 align-bottom text-xs leading-snug font-semibold whitespace-nowrap text-slate-700",
                table.columns.length === 2 && "sm:w-[35%]",
                table.columns.length === 3 && "sm:w-[24%]",
              ]}
            >
              {@render heading(column)}
            </th>
          {/each}
        </tr>
      </thead>

      {#each table.sections as section, sectionIndex (sectionIndex)}
        <tbody>
          {#if section.heading}
            <tr class="border-b border-slate-200 bg-subtle">
              <th
                scope="colgroup"
                colspan={table.columns.length + 1}
                class="{edgeCellClass} pt-3 pb-1.5 text-xs font-semibold text-slate-700"
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
            <tr class="border-b border-slate-200/70 last:border-b-0">
              <th
                scope="row"
                class="{edgeCellClass} max-w-56 py-2.5 text-xs leading-snug font-semibold text-slate-700 sm:min-w-36"
              >
                {@render heading(row.heading)}
              </th>

              {#each row.cells as cell, cellIndex (cellIndex)}
                <td
                  class={[
                    cellPaddingClass,
                    "py-2.5 font-serif text-base whitespace-nowrap text-slate-900",
                    cellIndex === row.cells.length - 1 && "sm:pr-6",
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
      class="m-0 border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-pretty text-slate-600 sm:px-6"
    >
      <MarkedNote text={table.note} />
    </p>
  {/if}
</figure>
