<script lang="ts">
  import { dictionaryPathForLiveLink } from "$lib/catalog/dictionary/live-links";
  import type {
    CompactFrequencyEntry,
    LiveLink,
  } from "$lib/components/dictionary/common-client.svelte";

  let {
    entry,
    live,
  }: {
    entry: CompactFrequencyEntry;
    live?: LiveLink;
  } = $props();

  const href = $derived(live ? dictionaryPathForLiveLink(live) : null);

  const countTitle =
    "How often this lemma appears in the Slovak National Corpus (prim-8.0-public-all)";
</script>

<tr class="border-b border-slate-200/70">
  <td class="px-4 py-2.5 text-right text-sm text-slate-500 tabular-nums sm:px-5">
    {entry.rank}
  </td>

  <th class="px-2 py-2.5 text-left font-normal" scope="row">
    {#if href}
      <a
        class="font-serif text-base text-blue-800 no-underline hover:underline"
        {href}
        lang="sk"
      >
        {entry.lemma}
      </a>
    {:else}
      <span class="font-serif text-base text-slate-700" lang="sk">{entry.lemma}</span>
    {/if}
  </th>

  <td class="px-2 py-2.5 text-sm text-slate-600">
    {live?.english ?? "Not in the dictionary yet"}
  </td>

  <td
    class="px-4 py-2.5 text-right text-sm text-slate-500 tabular-nums max-sm:hidden sm:px-5"
    title={entry.count !== undefined ? countTitle : undefined}
  >
    {entry.count?.toLocaleString("en")}
  </td>
</tr>
