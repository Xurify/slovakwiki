<script lang="ts">
  import type { DeclensionRow } from "$lib/catalog/dictionary/declension";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { cx } from "$lib/ui/classes";

  /**
   * Six cases × singular / plural with the ending highlighted. Styled like the
   * grammar pages' tables; the panel is only as wide as the forms.
   */
  let {
    lemma,
    rows,
  }: {
    lemma: string;
    rows: DeclensionRow[];
  } = $props();

  const pluralNominative = $derived(
    rows[0] ? `${rows[0].plural.stem}${rows[0].plural.ending}` : "",
  );

  // ľ before i / e is written as plain l: priateľ → priatelia.
  const softLNote = $derived(
    lemma.endsWith("ľ") && pluralNominative !== "" && !pluralNominative.includes("ľ"),
  );
</script>

{#snippet form(stem: string, ending: string)}
  {stem}{#if ending}<span class="rounded-sm bg-mark/60 px-px text-blue-800">{ending}</span
    >{/if}
{/snippet}

<div class={cx(dataPanelClass, "sm:w-fit sm:max-w-full")}>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-left">
      <caption class="sr-only">Forms of {lemma}</caption>

      <thead>
        <tr class="border-b border-slate-200 bg-subtle/60">
          <th
            scope="col"
            class={cx(eyebrowMutedClass, "w-px py-2.5 pr-8 pl-4 sm:pr-10 sm:pl-5")}
          >
            Case
          </th>

          <th scope="col" class={cx(eyebrowMutedClass, "w-px py-2.5 pr-8 sm:pr-10")}>
            Singular
          </th>

          <th scope="col" class={cx(eyebrowMutedClass, "py-2.5 pr-4 sm:pr-5")}>Plural</th>
        </tr>
      </thead>

      <tbody>
        {#each rows as row (row.caseSlug)}
          <tr class="border-b border-slate-200/70 last:border-b-0">
            <th
              scope="row"
              class="w-px py-2.5 pr-8 pl-4 align-baseline text-sm leading-snug font-normal whitespace-nowrap sm:pr-10 sm:pl-5"
            >
              <a
                class="font-semibold text-blue-800 no-underline hover:underline"
                href="/grammar/cases/{row.caseSlug}"
              >
                {sentenceCase(row.caseName)}
              </a>

              <span class="block font-serif text-slate-500 sm:ml-2 sm:inline" lang="sk">
                {row.question}
              </span>
            </th>

            <td
              class="w-px py-2.5 pr-8 align-baseline font-serif text-lg font-semibold whitespace-nowrap text-slate-900 sm:pr-10"
              lang="sk"
            >
              {@render form(row.singular.stem, row.singular.ending)}
            </td>

            <td
              class="py-2.5 pr-4 align-baseline font-serif text-lg font-semibold whitespace-nowrap text-slate-900 sm:pr-5"
              lang="sk"
            >
              {@render form(row.plural.stem, row.plural.ending)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  {#if softLNote}
    <p
      class="m-0 border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-pretty text-slate-600 sm:px-5"
    >
      Before <span class="font-serif" lang="sk">i</span> and
      <span class="font-serif" lang="sk">e</span>,
      <span class="font-serif" lang="sk">ľ</span> is written plain
      <span class="font-serif" lang="sk">l</span> and still sounds soft:
      <span class="font-serif text-slate-900" lang="sk">{pluralNominative}</span>.
    </p>
  {/if}
</div>
