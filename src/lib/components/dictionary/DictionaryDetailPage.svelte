<script lang="ts">
  import type { Snippet } from "svelte";

  import EntryDetail from "$lib/components/dictionary/EntryDetail.svelte";
  import type { NearbyEntry } from "$lib/catalog/dictionary/entries-near";
  import type { FrequencyNeighbor } from "$lib/catalog/dictionary/frequency-neighbors";
  import type { DictionaryImageView } from "$lib/catalog/dictionary/images";
  import type { ContentEntry, EntryKind } from "$lib/catalog/types";

  interface RelatedEntry {
    english: string;
    href: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  interface SenseView {
    entry: ContentEntry;
    exampleAudioSrcs: string[];
  }

  let {
    audioMount,
    data,
  }: {
    audioMount?: Snippet;
    data: {
      entry: ContentEntry;
      entriesNear: NearbyEntry[];
      exampleAudioSrcs: string[];
      frequencyNeighbors: FrequencyNeighbor[];
      image?: DictionaryImageView;
      lemmaAudioSrc: string;
      relatedEntries: RelatedEntry[];
      senses: SenseView[];
    };
  } = $props();
</script>

<EntryDetail
  {audioMount}
  entry={data.entry}
  entriesNear={data.entriesNear}
  exampleAudioSrcs={data.exampleAudioSrcs}
  frequencyNeighbors={data.frequencyNeighbors}
  image={data.image}
  lemmaAudioSrc={data.lemmaAudioSrc}
  relatedEntries={data.relatedEntries}
  senses={data.senses}
/>
