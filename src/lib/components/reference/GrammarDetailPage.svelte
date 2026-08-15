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
  }: {
    data: {
      entry: GrammarTopic;
      relatedEntries: RelatedEntry[];
    };
    clockDrill?: Snippet;
  } = $props();
</script>

<GrammarTopicDetail
  topic={data.entry}
  relatedEntries={data.relatedEntries}
  {clockDrill}
/>
