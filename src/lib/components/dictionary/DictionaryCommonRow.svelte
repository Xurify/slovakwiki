<script lang="ts">
  import { dictionaryPathForLiveLink } from "$lib/catalog/dictionary/live-links";
  import {
    commonListTrack,
    commonRowClass,
  } from "$lib/components/dictionary/common-list-ui";
  import type {
    CompactFrequencyEntry,
    LiveLink,
  } from "$lib/components/dictionary/common-client.svelte";
  import {
    dataGlossClass,
    dataMetaClass,
    dataStaticRowClass,
    dataWordClass,
  } from "$lib/components/ui/data-list-ui";

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

{#snippet count()}
  {#if entry.count !== undefined}
    <span class="text-right {dataMetaClass} max-sm:hidden" title={countTitle}>
      {entry.count.toLocaleString("en")}
    </span>
  {/if}
{/snippet}

<li>
  {#if href}
    <a class={commonRowClass} {href}>
      <span class="text-right {dataMetaClass}">{entry.rank}</span>

      <span class="min-w-0 truncate {dataWordClass}" lang="sk">{entry.lemma}</span>

      <span class="min-w-0 {dataGlossClass} max-sm:col-start-2">{live?.english}</span>

      {@render count()}
    </a>
  {:else}
    <div class="{dataStaticRowClass} {commonListTrack}">
      <span class="text-right {dataMetaClass}">{entry.rank}</span>

      <span
        class="min-w-0 truncate font-serif text-base leading-snug text-slate-700"
        lang="sk"
      >
        {entry.lemma}
      </span>

      <span class="min-w-0 text-sm leading-snug text-slate-400 max-sm:col-start-2">
        Not in the dictionary yet
      </span>

      {@render count()}
    </div>
  {/if}
</li>
