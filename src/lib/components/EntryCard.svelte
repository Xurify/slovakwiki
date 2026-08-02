<script lang="ts">
  import type { ContentEntry } from "$lib/content/types";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };
  const kindLabel = { grammar: "Grammar", pronunciation: "Pronunciation", word: "Word" };
</script>

<a
  class="group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-slate-200 -mx-4 px-4 py-5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)] max-[600px]:grid-cols-[1fr_auto]"
  href="/{routeBase[entry.kind]}/{entry.slug}"
>
  <div class="grid gap-1">
    <span class="text-[0.64rem] font-bold uppercase tracking-[0.1em] text-slate-500">
      {kindLabel[entry.kind]}
    </span>
    <strong class="font-serif text-lg text-blue-800" lang="sk">{entry.slovak}</strong>
    <span class="text-sm text-slate-600">{entry.english}</span>
    <p class="m-0 max-w-[56ch] text-sm leading-relaxed text-slate-500">{entry.summary}</p>
  </div>
  <ArrowRight class="mt-1 text-blue-800" />
</a>
