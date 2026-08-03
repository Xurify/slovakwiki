<script lang="ts">
  import EntryDetail from "$lib/components/EntryDetail.svelte";
  import type { ContentEntry, EntryKind } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  interface SenseView {
    entry: ContentEntry;
    exampleAudioSrcs: string[];
  }

  let {
    data,
  }: {
    data: {
      entry: ContentEntry;
      exampleAudioSrcs: string[];
      lemmaAudioSrc: string;
      relatedEntries: RelatedEntry[];
      senses: SenseView[];
    };
  } = $props();
</script>

<EntryDetail
  entry={data.entry}
  exampleAudioSrcs={data.exampleAudioSrcs}
  lemmaAudioSrc={data.lemmaAudioSrc}
  relatedEntries={data.relatedEntries}
  senses={data.senses}
/>
