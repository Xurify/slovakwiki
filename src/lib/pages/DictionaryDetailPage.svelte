<script lang="ts">
  import EntryDetail from "$lib/components/EntryDetail.svelte";
  import type { ContentEntry, EntryKind } from "$lib/content/types";

  interface RelatedEntry {
    english: string;
    kind: EntryKind;
    slug: string;
    slovak: string;
  }

  let {
    data,
  }: {
    data: { entry: ContentEntry; relatedEntries: RelatedEntry[] };
  } = $props();
</script>

<EntryDetail entry={data.entry} relatedEntries={data.relatedEntries} />
