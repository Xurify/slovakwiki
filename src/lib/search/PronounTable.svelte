<script lang="ts">
  import type { PronounLemma } from "$lib/catalog/search/pronouns";
  import { normalizeSearchText, sentenceCase } from "$lib/catalog/search/ui";
  import { cx } from "$lib/ui/classes";

  import { matchMarkClass } from "./search-results-ui";

  let {
    pronoun,
    typed = "",
  }: {
    pronoun: PronounLemma;
    /** The form the learner typed, marked wherever it appears. */
    typed?: string;
  } = $props();

  const typedKey = $derived(normalizeSearchText(typed));
  const gendered = $derived(pronoun.kind === "gendered");

  const cellClass = "px-3 py-2 align-baseline max-[600px]:px-1.5";

  const CASE_ABBREVIATIONS: Record<string, string> = {
    nominative: "Nom.",
    genitive: "Gen.",
    dative: "Dat.",
    accusative: "Acc.",
    locative: "Loc.",
    instrumental: "Ins.",
  };
</script>

<div class="overflow-x-auto rounded-(--control-radius) ring-1 ring-slate-200 ring-inset">
  <table
    class="w-full table-fixed border-collapse text-left text-sm max-[600px]:text-[0.85rem]"
  >
    {#if gendered}
      <colgroup>
        <col class="w-[22%] max-[600px]:w-[13%]" />
        <col class="w-[22%] max-[600px]:w-[25%]" />
        <col class="w-[17%] max-[600px]:w-[16%]" />
        <col class="w-[17%] max-[600px]:w-[20%]" />
        <col />
      </colgroup>
    {:else}
      <colgroup>
        <col class="w-[30%] max-[600px]:w-[18%]" />
        <col class="w-[35%] max-[600px]:w-[41%]" />
        <col />
      </colgroup>
    {/if}

    <caption class="sr-only">Forms of {pronoun.lemma} by case</caption>

    <thead class="bg-subtle text-xs font-semibold text-slate-600">
      <tr>
        <th class={cellClass} scope="col">
          <span class="max-[600px]:sr-only">Case</span>
        </th>

        {#each pronoun.columns as column (column.id)}
          <th class={cellClass} scope="col">
            <abbr
              class="no-underline min-[601px]:hidden"
              title={column.label}
              aria-label={column.label}
            >
              {column.shortLabel}
            </abbr>
            <span class="max-[600px]:hidden">{column.label}</span>
          </th>
        {/each}
      </tr>
    </thead>

    <tbody class="divide-y divide-slate-200">
      {#each pronoun.table as row (row.case)}
        <tr>
          <th class={cx(cellClass, "text-xs font-medium text-slate-600")} scope="row">
            <abbr
              class="no-underline min-[601px]:hidden"
              title={sentenceCase(row.case)}
              aria-label={sentenceCase(row.case)}
            >
              {CASE_ABBREVIATIONS[row.case]}
            </abbr>
            <span class="max-[600px]:hidden">{sentenceCase(row.case)}</span>
          </th>

          {#each pronoun.columns as column (column.id)}
            {@const forms = row.cells[column.id] ?? []}
            <td class={cx(cellClass, "font-serif text-slate-900")} lang="sk">
              {#if forms.length === 0}
                <span class="text-slate-400" aria-label="no form">—</span>
              {/if}

              {#each forms as form, index (form)}
                {#if index > 0}
                  <span class="text-slate-400">{gendered ? " / " : ", "}</span>
                {/if}

                {#if typedKey && normalizeSearchText(form) === typedKey}
                  <mark class={matchMarkClass}>{form}</mark>
                {:else}
                  {form}
                {/if}
              {/each}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
