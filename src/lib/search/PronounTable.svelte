<script lang="ts">
  import { PRONOUN_COLUMNS, type PronounLemma } from "$lib/catalog/search/pronouns";
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

  const cellClass = "px-3 py-2 align-top max-[600px]:px-2";
</script>

<div class="overflow-x-auto rounded-(--control-radius) ring-1 ring-slate-200 ring-inset">
  <table class="w-full min-w-[26rem] border-collapse text-left text-sm">
    <caption class="sr-only">Forms of {pronoun.lemma} by case</caption>

    <thead class="bg-subtle text-xs font-semibold text-slate-600">
      <tr>
        <th class={cellClass} scope="col">Case</th>

        {#each PRONOUN_COLUMNS as column (column)}
          <th class={cellClass} scope="col">{sentenceCase(column)}</th>
        {/each}
      </tr>
    </thead>

    <tbody class="divide-y divide-slate-200">
      {#each pronoun.table as row (row.case)}
        <tr>
          <th class={cx(cellClass, "text-xs font-medium text-slate-600")} scope="row">
            {sentenceCase(row.case)}
          </th>

          {#each PRONOUN_COLUMNS as column (column)}
            <td class={cx(cellClass, "font-serif text-slate-900")} lang="sk">
              {#each row.cells[column] as form, index (form)}
                {#if index > 0}
                  <span class="text-slate-400">{" / "}</span>
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
