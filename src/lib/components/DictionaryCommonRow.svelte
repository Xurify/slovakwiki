<script lang="ts">
  import type {
    CompactFrequencyEntry,
    LiveLink,
  } from "$lib/dictionary/dictionary-common-client.svelte";

  let {
    entry,
    live,
    rowClass = "grid grid-cols-[3rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-slate-200 py-3 text-sm max-[560px]:grid-cols-[2.5rem_minmax(0,1fr)]",
  }: {
    entry: CompactFrequencyEntry;
    live?: LiveLink;
    rowClass?: string;
  } = $props();
</script>

<li class={rowClass}>
  <span class="tabular-nums text-slate-400">{entry.rank}</span>
  <div class="min-w-0">
    {#if live}
      <a
        class="font-serif text-base text-blue-800 underline decoration-slate-200 underline-offset-2 hover:decoration-blue-800"
        href={`/dictionary/${live.slug}${live.hash ? `#${live.hash}` : ""}`}
        lang="sk"
      >
        {entry.lemma}
      </a>
      <span class="mt-0.5 block text-sm text-slate-500">{live.english}</span>
    {:else}
      <span class="font-serif text-base text-slate-800" lang="sk">{entry.lemma}</span>
      <span class="mt-0.5 block text-xs text-slate-400">Not in dictionary yet</span>
    {/if}
  </div>
  {#if entry.count !== undefined}
    <span
      class="cursor-help tabular-nums text-xs text-slate-400 underline decoration-dotted decoration-slate-300 underline-offset-2 max-[560px]:hidden"
      title="How often this lemma appears in the Slovak National Corpus (prim-8.0-public-all)"
    >
      {entry.count.toLocaleString("en")}
    </span>
  {/if}
</li>
