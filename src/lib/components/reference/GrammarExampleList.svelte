<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import { referenceCardClass } from "$lib/components/reference/reference-ui";
  import { practiceItemHref } from "$lib/catalog/practice";

  export type GrammarExampleRow = {
    english: string;
    /** "What this shows" teaching line. */
    note?: string;
    practiceItemId?: string;
    slovak: string;
  };

  let { examples }: { examples: readonly GrammarExampleRow[] } = $props();

  const practicePillClass =
    "inline-flex min-h-8 items-center gap-1.5 rounded-(--control-radius) bg-control px-3 text-xs font-bold text-blue-800 no-underline shadow-(--shadow-border) transition-[background-color,box-shadow] duration-150 hover:bg-control-hover hover:shadow-(--shadow-border-hover)";
</script>

<ol class="{referenceCardClass} m-0 list-none divide-y divide-slate-200/70 p-0">
  {#each examples as example, index (example.slovak)}
    {@const practiceHref = example.practiceItemId
      ? practiceItemHref(example.practiceItemId)
      : undefined}

    <li
      class="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 px-5 py-4 sm:grid-cols-[1.25rem_minmax(0,1fr)_auto] sm:items-start"
    >
      <span class="pt-1 text-xs font-semibold tabular-nums text-slate-400">
        {index + 1}
      </span>

      <div class="min-w-0">
        <p
          class="m-0 font-serif text-lg leading-snug font-semibold text-pretty text-slate-900"
          lang="sk"
        >
          {example.slovak}
        </p>

        <p class="m-0 mt-0.5 text-sm leading-snug text-pretty text-slate-600">
          {example.english}
        </p>

        {#if example.note}
          <p
            class="m-0 mt-2 max-w-[60ch] text-[0.82rem] leading-snug text-pretty text-slate-500"
          >
            <span class="font-semibold text-slate-700">What this shows:</span>
            {example.note}
          </p>
        {/if}
      </div>

      {#if practiceHref}
        <a
          class="{practicePillClass} col-start-2 mt-3 w-fit sm:col-start-3 sm:mt-0"
          href={practiceHref}
        >
          Practice
          <ArrowRight />
        </a>
      {/if}
    </li>
  {/each}
</ol>
