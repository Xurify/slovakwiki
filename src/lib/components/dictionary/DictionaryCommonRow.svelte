<script lang="ts">
  import { dictionaryPathForLiveLink } from "$lib/catalog/dictionary/live-links";
  import type {
    CompactFrequencyEntry,
    LiveLink,
  } from "$lib/components/dictionary/common-client.svelte";

  let {
    entry,
    live,
    rowClass = "grid grid-cols-[2.25rem_minmax(0,1fr)_4.75rem] items-center gap-3 border-b border-slate-200 px-4 py-3 text-sm transition-colors last:border-b-0 hover:bg-blue-50/50 max-[560px]:grid-cols-[2rem_minmax(0,1fr)]",
  }: {
    entry: CompactFrequencyEntry;
    live?: LiveLink;
    rowClass?: string;
  } = $props();

  const href = $derived(live ? dictionaryPathForLiveLink(live) : null);
</script>

<li>
  {#if href}
    <a class={rowClass} {href}>
      <span class="text-right text-xs tabular-nums text-slate-400">{entry.rank}</span>
      <div class="min-w-0">
        <span class="font-serif text-base text-blue-800" lang="sk">{entry.lemma}</span>
        <span class="mt-0.5 block text-sm text-slate-500">{live?.english}</span>
      </div>
      {#if entry.count !== undefined}
        <span
          class="cursor-help text-right text-xs tabular-nums text-slate-400 underline decoration-dotted decoration-slate-300 underline-offset-2 max-[560px]:hidden"
          title="How often this lemma appears in the Slovak National Corpus (prim-8.0-public-all)"
        >
          {entry.count.toLocaleString("en")}
        </span>
      {/if}
    </a>
  {:else}
    <div class={rowClass}>
      <span class="text-right text-xs tabular-nums text-slate-400">{entry.rank}</span>
      <div class="min-w-0">
        <span class="font-serif text-base text-slate-800" lang="sk">{entry.lemma}</span>
        <span class="mt-0.5 block text-xs text-slate-400">Not in dictionary yet</span>
      </div>
      {#if entry.count !== undefined}
        <span
          class="cursor-help text-right text-xs tabular-nums text-slate-400 underline decoration-dotted decoration-slate-300 underline-offset-2 max-[560px]:hidden"
          title="How often this lemma appears in the Slovak National Corpus (prim-8.0-public-all)"
        >
          {entry.count.toLocaleString("en")}
        </span>
      {/if}
    </div>
  {/if}
</li>
