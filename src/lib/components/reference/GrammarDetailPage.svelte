<script lang="ts">
  import type { Snippet } from "svelte";

  import GrammarTopicDetail from "$lib/components/reference/GrammarTopicDetail.svelte";
  import type { EntryKind, GrammarTopic } from "$lib/catalog/types";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    data,
    clockDrill,
    audioMount,
  }: {
    data: {
      entry: GrammarTopic;
      relatedEntries: RelatedEntry[];
      audioKeys: string[];
    };
    clockDrill?: Snippet;
    /** Client island that mounts AudioButtons into `[data-audio-mount]` hosts. */
    audioMount?: Snippet;
    /** Astro passes named slots as siblings; typed so multiple slot children check. */
    children?: Snippet;
  } = $props();
</script>

<GrammarTopicDetail
  topic={data.entry}
  relatedEntries={data.relatedEntries}
  audioKeys={data.audioKeys}
  {clockDrill}
/>

{#if audioMount}
  {@render audioMount()}
{/if}
