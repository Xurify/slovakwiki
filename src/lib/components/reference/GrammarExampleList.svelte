<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  import { practiceItemHref } from "$lib/catalog/practice";
  import type { Example } from "$lib/catalog/types";

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

<ol class="m-0 list-none border-t border-slate-200 p-0">
  {#each rows as { audioKey, example, practiceHref } (example.slovak)}
    <li
      class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-3 border-b border-slate-200 py-6 max-[560px]:grid-cols-1"
    >
      <div class="min-w-0">
        <p
          class="m-0 font-serif text-[clamp(1.35rem,2.8vw,1.7rem)] leading-snug font-semibold tracking-[-0.025em] text-slate-900"
          lang="sk"
        >
          {example.slovak}
        </p>

        <p class="m-0 mt-1.5 font-serif text-[1.05rem] text-slate-600 italic">
          {example.english}
        </p>

        {#if example.demonstrates}
          <p class="m-0 mt-3 max-w-[60ch] text-[0.9rem] leading-relaxed text-slate-500">
            {example.demonstrates}
          </p>
        {/if}
      </div>

      {#if practiceHref || audioKey}
        <div class="flex items-center gap-4 pt-1.5">
          {#if audioKey}
            <span data-audio-mount={audioKey}></span>
          {/if}

          {#if practiceHref}
            <a
              class="inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-blue-800 no-underline hover:underline"
              href={practiceHref}
            >
              Practice
              <ArrowRight />
            </a>
          {/if}
        </div>
      {/if}
    </li>
  {/each}
</ol>
