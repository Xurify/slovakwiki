<script lang="ts">
  import PronunciationTopicDetail from "$lib/components/reference/PronunciationTopicDetail.svelte";
  import type { EntryKind, PronunciationTopic } from "$lib/catalog/types";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    data,
  }: {
    data: { entry: PronunciationTopic; relatedEntries: RelatedEntry[] };
  } = $props();
</script>

<PronunciationTopicDetail topic={data.entry} relatedEntries={data.relatedEntries} />
