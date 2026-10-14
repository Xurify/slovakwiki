<script lang="ts">
  import type { DeclensionRow } from "$lib/catalog/dictionary/declension";
  import { sentenceCase } from "$lib/catalog/search/ui";

  /**
   * Six cases × singular / plural with the ending highlighted. Styled like the
   * lessons' FormTable; `flush` drops the card chrome for use inside a card.
   */
  let {
    lemma,
    rows,
    flush = false,
  }: {
    lemma: string;
    rows: DeclensionRow[];
    flush?: boolean;
  } = $props();

  /** Row headings line up with the card padding (px-4 / sm:px-6). */
  const edgeCellClass = "pr-2 pl-4 sm:pr-3 sm:pl-6";
  const cellPaddingClass = "px-2 sm:px-3";
  const headClass = "pb-2 align-bottom text-xs leading-snug font-semibold text-slate-700";
  const formCellClass =
    "py-2.5 align-baseline font-serif text-base whitespace-nowrap text-slate-900";
  const endingClass = "rounded-sm bg-mark px-px font-semibold";

  const pluralNominative = $derived(
    rows[0] ? `${rows[0].plural.stem}${rows[0].plural.ending}` : "",
  );

  // ľ before i / e is written as plain l: priateľ → priatelia.
  const softLNote = $derived(
    lemma.endsWith("ľ") && pluralNominative !== "" && !pluralNominative.includes("ľ"),
  );
</script>

{#snippet form(stem: string, ending: string)}
  {stem}{#if ending}<span class={endingClass}>{ending}</span>{/if}
{/snippet}

<figure
  class={flush
    ? "m-0 bg-subtle"
    : "m-0 overflow-hidden rounded-(--frame-radius) bg-subtle shadow-(--shadow-border)"}
>
  <figcaption class="px-4 pt-4 pb-3 sm:px-6">
    <h3 class="m-0 font-sans text-sm font-semibold tracking-normal text-slate-900">
      Forms of <span class="font-serif text-base" lang="sk">{lemma}</span>
    </h3>
  </figcaption>

  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b border-slate-200">
          <th scope="col" class="{edgeCellClass} {headClass}">Case</th>
          <th scope="col" class="{cellPaddingClass} {headClass}">Singular</th>
          <th scope="col" class="{cellPaddingClass} {headClass}">Plural</th>
        </tr>
      </thead>

      <tbody class="bg-surface/70">
        {#each rows as row (row.caseSlug)}
          <tr class="border-b border-slate-200/70 last:border-b-0">
            <th
              scope="row"
              class="{edgeCellClass} py-2.5 align-baseline text-xs leading-snug font-semibold text-slate-700"
            >
              <a
                class="text-blue-800 no-underline hover:underline"
                href="/grammar/cases/{row.caseSlug}"
              >
                {sentenceCase(row.caseName)}
              </a>
              <span class="block font-serif text-sm font-normal text-slate-500" lang="sk">
                {row.question}
              </span>
            </th>

            <td class="{cellPaddingClass} {formCellClass}" lang="sk">
              {@render form(row.singular.stem, row.singular.ending)}
            </td>

            <td class="{cellPaddingClass} {formCellClass}" lang="sk">
              {@render form(row.plural.stem, row.plural.ending)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if softLNote}
    <p
      class="m-0 border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-pretty text-slate-600 sm:px-6"
    >
      Before <span class="font-serif" lang="sk">i</span> and
      <span class="font-serif" lang="sk">e</span>,
      <span class="font-serif" lang="sk">ľ</span> is written plain
      <span class="font-serif" lang="sk">l</span> and still sounds soft:
      <span class="font-serif text-slate-900" lang="sk">{pluralNominative}</span>.
    </p>
  {/if}
</figure>
