<script lang="ts">
  import type { Snippet } from "svelte";

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
    audioMount,
  }: {
    data: {
      entry: PronunciationTopic;
      relatedEntries: RelatedEntry[];
      audioKeys: string[];
    };
    audioMount?: Snippet;
  } = $props();
</script>

<PronunciationTopicDetail
  topic={data.entry}
  relatedEntries={data.relatedEntries}
  audioKeys={data.audioKeys}
  {audioMount}
/>
