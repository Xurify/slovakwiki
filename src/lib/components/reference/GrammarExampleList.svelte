<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import {
    grammarCardClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";

  let {
    examples,
    lookFor,
  }: {
    examples: Example[];
    lookFor?: string;
  } = $props();

  const rows = $derived(
    examples.map((example) => ({
      example,
      practiceHref: example.practiceItemId
        ? practiceItemHref(example.practiceItemId)
        : undefined,
    })),
  );
</script>

<div class={grammarCardClass}>
  {#if lookFor}
    <div class="border-b border-blue-100 bg-blue-50/70 px-5 py-3.5">
      <p class={grammarEyebrowClass}>Look for</p>

      <p class="m-0 mt-1 max-w-[62ch] text-sm leading-relaxed text-pretty text-slate-700">
        {lookFor}
      </p>
    </div>
  {/if}

  <ol class={grammarRowsClass}>
    {#each rows as { example, practiceHref } (example.slovak)}
      <li class="flex items-start justify-between gap-4 px-5 py-4 max-[480px]:flex-col">
        <div class="min-w-0">
          <p class="m-0 font-serif text-lg leading-snug text-slate-900" lang="sk">
            {example.slovak}
          </p>

          <p class="m-0 mt-0.5 text-sm text-slate-500">{example.english}</p>

          {#if example.demonstrates}
            <p class="m-0 mt-2 max-w-[60ch] text-sm leading-relaxed text-slate-700">
              {example.demonstrates}
            </p>
          {/if}
        </div>

        {#if practiceHref}
          <a
            class="inline-flex shrink-0 items-center gap-1 pt-1 text-sm font-bold text-blue-800 no-underline hover:underline"
            href={practiceHref}
          >
            Practice
            <ArrowRight />
          </a>
        {/if}
      </li>
    {/each}
  </ol>
</div>
