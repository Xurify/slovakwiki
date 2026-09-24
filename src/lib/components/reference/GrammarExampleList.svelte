<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import { grammarCardClass } from "$lib/components/reference/grammar-topic-ui";
  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let {
    examples,
    audioKeys = [],
  }: {
    examples: Example[];
    /** `ex-{index}` keys that have a recorded clip; buttons mount there after hydration. */
    audioKeys?: string[];
  } = $props();

  const rows = $derived(
    examples.map((example, index) => ({
      audioKey: audioKeys.includes(`ex-${index}`) ? `ex-${index}` : undefined,
      example,
      practiceHref: example.practiceItemId
        ? practiceItemHref(example.practiceItemId)
        : undefined,
    })),
  );
</script>

{#snippet practiceLink(href: string)}
  <a
    class="ml-auto inline-flex shrink-0 items-center gap-1 pt-1 text-sm font-bold text-blue-800 no-underline hover:underline"
    {href}
  >
    Practice this
    <ArrowRight />
  </a>
{/snippet}

<ol class="m-0 grid list-none gap-3 p-0">
  {#each rows as { audioKey, example, practiceHref } (example.slovak)}
    <li class={cx(grammarCardClass, "px-5 py-4 sm:px-6 sm:py-5")}>
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p
            class="m-0 font-serif text-[clamp(1.2rem,2.5vw,1.45rem)] leading-snug font-semibold text-slate-900"
            lang="sk"
          >
            {example.slovak}
          </p>

          <p class="m-0 mt-1 text-sm text-slate-600">{example.english}</p>
        </div>

        <div class="flex shrink-0 items-center gap-4">
          {#if practiceHref && !example.demonstrates}
            {@render practiceLink(practiceHref)}
          {/if}

          {#if audioKey}
            <span data-audio-mount={audioKey}></span>
          {/if}
        </div>
      </div>

      {#if example.demonstrates}
        <div
          class="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-slate-200/70 pt-3"
        >
          <p class="m-0 max-w-[60ch] text-sm leading-relaxed text-pretty text-slate-600">
            {example.demonstrates}
          </p>

          {#if practiceHref}
            {@render practiceLink(practiceHref)}
          {/if}
        </div>
      {/if}
    </li>
  {/each}
</ol>
