<script lang="ts">
  import GrammarTopicDetail from "$lib/components/GrammarTopicDetail.svelte";
  import type { EntryKind, GrammarTopic } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    data,
  }: {
    data: { entry: GrammarTopic; relatedEntries: RelatedEntry[] };
  } = $props();
</script>

<GrammarTopicDetail topic={data.entry} relatedEntries={data.relatedEntries} />
